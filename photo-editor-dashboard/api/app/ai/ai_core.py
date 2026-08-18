"""
ai_core.py

Covers:
    - Text-to-image generation      (Stable Diffusion 1.5)
    - Inpainting / object removal   (Stable Diffusion 2 inpainting checkpoint)
    - Outpainting (image expansion) (same inpaint model on a padded canvas)
    - Background removal            (rembg / U2Net)

Design notes:
    - Models are loaded lazily and cached at module level so repeated
      calls (e.g. from a future API layer) don't reload weights each time.
    - Everything runs fp16 on CUDA with attention/VAE slicing enabled —
      required to stay inside 8GB VRAM comfortably.
    - Each function is self-contained and returns a PIL.Image, so they
      can be dropped straight into FastAPI route handlers tomorrow
      without any changes to this file.
    - use_safetensors=True is set on every pipeline load. This avoids a
      hard failure introduced by transformers 5.x, which now refuses to
      torch.load() legacy .bin weights unless torch>=2.6 (CVE-2025-32434).
      We're pinned to torch 2.5.1+cu121 for CUDA compatibility, so every
      model used here must ship proper .safetensors weights.
"""

import sys
from torchvision.transforms import functional as _tv_functional
sys.modules["torchvision.transforms.functional_tensor"] = _tv_functional

import os
import secrets
from pathlib import Path
from urllib.request import urlretrieve

import numpy as np
import torch
from PIL import Image, ImageColor, ImageOps
from diffusers import StableDiffusionImg2ImgPipeline, StableDiffusionInpaintPipeline, StableDiffusionPipeline

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
DTYPE = torch.float16 if DEVICE == "cuda" else torch.float32

if DEVICE == "cpu":
    print("WARNING: CUDA not available — falling back to CPU. "
          "Generation will be extremely slow. Check your torch/CUDA install.")

# ---------------------------------------------------------------------------
# Model cache (loaded once, reused across calls)
# ---------------------------------------------------------------------------

_txt2img_pipe = None
_inpaint_pipe = None
_img2img_pipe = None
_gfpgan_enhancer = None
_realesrgan_upsampler = None

WEIGHTS_DIR = Path(__file__).resolve().parent / "weights"
GFPGAN_WEIGHTS_URL = "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth"
GFPGAN_WEIGHTS_PATH = WEIGHTS_DIR / "GFPGANv1.4.pth"
REALESRGAN_WEIGHTS_URL = "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth"
REALESRGAN_WEIGHTS_PATH = WEIGHTS_DIR / "realesr-general-x4v3.pth"

STYLE_PRESETS = {
    "oil_painting": "oil painting, thick brush strokes, canvas texture, fine art",
    "watercolor": "watercolor painting, soft edges, flowing pigment",
    "pencil_sketch": "detailed pencil sketch, graphite, cross-hatching, black and white",
    "cartoon": "cartoon style, bold outlines, flat colors, animated",
    "anime": "anime style illustration, cel shaded, vibrant",
}


# ---------------------------------------------------------------------------
# Helper: pick a safe working resolution instead of hardcoding 512x512.
# SD1.5-based models want dimensions that are multiples of 8. We also cap
# the longest side at 768px — comfortably fits 8GB VRAM with slicing enabled,
# while still letting outpainted (expanded) canvases stay genuinely expanded
# instead of being squashed back down to the original size.
# ---------------------------------------------------------------------------

def _safe_size(width: int, height: int, max_side: int = 768, multiple: int = 8) -> tuple[int, int]:
    scale = min(1.0, max_side / max(width, height))
    w = max(multiple, round(width * scale / multiple) * multiple)
    h = max(multiple, round(height * scale / multiple) * multiple)
    return w, h


def _load_txt2img():
    global _txt2img_pipe
    if _txt2img_pipe is None:
        _txt2img_pipe = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            torch_dtype=DTYPE,
            safety_checker=None,  # remove if the internship wants the built-in NSFW filter kept
            use_safetensors=True,
        ).to(DEVICE)
        _txt2img_pipe.enable_attention_slicing()
        if DEVICE == "cuda":
            _txt2img_pipe.enable_vae_slicing()
    return _txt2img_pipe


def _load_inpaint():
    global _inpaint_pipe
    if _inpaint_pipe is None:
        # NOTE: stabilityai/stable-diffusion-2-inpainting is now a GATED repo
        # on Hugging Face (requires login + accepting a license), so it 404s
        # for anonymous downloads. The original runwayml SD1.5 inpainting
        # model was moved to this new org (sd-legacy team) and DOES publish
        # proper .safetensors weights — public, no auth needed.
        _inpaint_pipe = StableDiffusionInpaintPipeline.from_pretrained(
            "stable-diffusion-v1-5/stable-diffusion-inpainting",
            torch_dtype=DTYPE,
            safety_checker=None,
            use_safetensors=True,
            variant="fp16",
        ).to(DEVICE)
        _inpaint_pipe.enable_attention_slicing()
        if DEVICE == "cuda":
            _inpaint_pipe.enable_vae_slicing()
    return _inpaint_pipe


def _load_img2img():
    global _img2img_pipe
    if _img2img_pipe is None:
        _img2img_pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            torch_dtype=DTYPE,
            safety_checker=None,
            use_safetensors=True,
        ).to(DEVICE)
        _img2img_pipe.enable_attention_slicing()
        if DEVICE == "cuda":
            _img2img_pipe.enable_vae_slicing()
    return _img2img_pipe


def _download_weight(url: str, path: Path) -> Path:
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        urlretrieve(url, path)
    return path


def _load_gfpgan():
    global _gfpgan_enhancer
    if _gfpgan_enhancer is None:
        from gfpgan import GFPGANer

        _gfpgan_enhancer = GFPGANer(
            model_path=str(_download_weight(GFPGAN_WEIGHTS_URL, GFPGAN_WEIGHTS_PATH)),
            upscale=1,
            arch="clean",
            channel_multiplier=2,
            bg_upsampler=None,
        )
    return _gfpgan_enhancer


def _load_realesrgan():
    global _realesrgan_upsampler
    if _realesrgan_upsampler is None:
        from realesrgan import RealESRGANer
        from realesrgan.archs.srvgg_arch import SRVGGNetCompact

        model = SRVGGNetCompact(
            num_in_ch=3,
            num_out_ch=3,
            num_feat=64,
            num_conv=32,
            upscale=4,
            act_type="prelu",
        )
        _realesrgan_upsampler = RealESRGANer(
            scale=4,
            model_path=str(_download_weight(REALESRGAN_WEIGHTS_URL, REALESRGAN_WEIGHTS_PATH)),
            model=model,
            tile=400,
            tile_pad=10,
            pre_pad=0,
            half=DEVICE == "cuda",
        )
    return _realesrgan_upsampler


# ---------------------------------------------------------------------------
# 1. Text-to-image generation
# ---------------------------------------------------------------------------

def generate_image(
    prompt: str,
    negative_prompt: str = "blurry, low quality, distorted, watermark",
    width: int = 512,
    height: int = 512,
    steps: int = 25,
    guidance_scale: float = 7.5,
    seed: int | None = None,
) -> Image.Image:
    """Prompt-based image generation. This is the 'AI Image Generation' feature."""
    pipe = _load_txt2img()
    generator = None
    if seed is not None:
        generator = torch.Generator(device=DEVICE).manual_seed(seed)

    result = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt,
        width=width,
        height=height,
        num_inference_steps=steps,
        guidance_scale=guidance_scale,
        generator=generator,
    )
    return result.images[0]


# ---------------------------------------------------------------------------
# 2. Inpainting — used for both "object removal" and "prompt-based editing"
# ---------------------------------------------------------------------------

def inpaint_image(
    image: Image.Image,
    mask: Image.Image,
    prompt: str,
    negative_prompt: str = "blurry, low quality, distorted",
    steps: int = 30,
    guidance_scale: float = 12.0,
) -> Image.Image:
    """
    image: the original photo (RGB)
    mask:  white = area to regenerate, black = area to keep untouched
    prompt:
        - For OBJECT REMOVAL: describe what should fill the gap
          (e.g. "empty grass field, seamless background")
        - For PROMPT-BASED EDITING: describe the new content
          (e.g. "a red sports car")

    Note: guidance_scale default was raised from 7.5 -> 12.0. At 7.5, the
    model tends to lean on surrounding context and can largely ignore the
    prompt when the requested content doesn't naturally belong in the scene
    (e.g. asking for a boat in the middle of a cabin photo). 12.0 forces
    much stronger prompt adherence at a small cost to overall smoothness.
    """
    pipe = _load_inpaint()

    # Preserve the actual input resolution (rounded to a safe working size)
    # instead of forcing everything down to 512x512 — this is what was
    # silently destroying outpaint's canvas expansion.
    target_w, target_h = _safe_size(*image.size)
    image = image.convert("RGB").resize((target_w, target_h))
    mask = mask.convert("L").resize((target_w, target_h))

    result = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt,
        image=image,
        mask_image=mask,
        width=target_w,
        height=target_h,
        num_inference_steps=steps,
        guidance_scale=guidance_scale,
    )
    return result.images[0]


# ---------------------------------------------------------------------------
# 3. Outpainting — expand the canvas, then inpaint the new blank border
# ---------------------------------------------------------------------------

def outpaint_image(
    image: Image.Image,
    expand_px: int = 128,
    prompt: str = "seamless continuation of the scene, natural extension",
    negative_prompt: str = "blurry, seam, border, frame, low quality",
    steps: int = 30,
) -> Image.Image:
    """
    Pads the image on all sides with blank canvas, builds a mask that marks
    only the new padding as 'to generate', and runs it through inpainting.
    This is a standard, well-understood approach to outpainting with SD1.5/SD2.
    """
    original = image.convert("RGB")
    w, h = original.size

    padded = ImageOps.expand(original, border=expand_px, fill=(127, 127, 127))

    mask = Image.new("L", padded.size, 0)          # start fully black (keep)
    mask.paste(255, (0, 0, padded.width, padded.height))   # mark everything white
    inner_black = Image.new("L", (w, h), 0)
    mask.paste(inner_black, (expand_px, expand_px))         # punch out the original as black (keep)

    return inpaint_image(padded, mask, prompt=prompt, negative_prompt=negative_prompt, steps=steps)


# ---------------------------------------------------------------------------
# 4. Background removal
# ---------------------------------------------------------------------------

def remove_background(image: Image.Image) -> Image.Image:
    """Returns an RGBA image with the background removed. Uses rembg/U2Net —
    not a diffusion model, runs in under a second even on modest hardware."""
    from rembg import remove
    return remove(image.convert("RGBA"))


# ---------------------------------------------------------------------------
# Demo — proves the pipeline end-to-end. Run: python ai_core.py
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# 5. Additional editor tools
# ---------------------------------------------------------------------------

def upscale_image(image: Image.Image, scale: int = 4) -> Image.Image:
    """Upscale an image with tiled Real-ESRGAN inference."""
    if scale < 1 or scale > 4:
        raise ValueError("scale must be between 1 and 4")
    output, _ = _load_realesrgan().enhance(np.array(image.convert("RGB")), outscale=scale)
    return Image.fromarray(output)


def enhance_face(image: Image.Image) -> Image.Image:
    """Restore faces with GFPGAN without upscaling the background."""
    bgr_input = np.array(image.convert("RGB"))[:, :, ::-1]
    _, _, restored = _load_gfpgan().enhance(
        bgr_input,
        has_aligned=False,
        only_center_face=False,
        paste_back=True,
    )
    if restored is None:
        raise RuntimeError("GFPGAN did not return an enhanced image")
    return Image.fromarray(restored[:, :, ::-1])


def apply_style(image: Image.Image, style: str, strength: float = 0.6) -> Image.Image:
    """Apply one of the supported Stable Diffusion img2img style presets."""
    if style not in STYLE_PRESETS:
        raise ValueError(f"Unknown style: {style}")
    if not 0 < strength <= 1:
        raise ValueError("strength must be greater than 0 and at most 1")
    width, height = _safe_size(*image.size)
    result = _load_img2img()(
        prompt=STYLE_PRESETS[style],
        negative_prompt="blurry, low quality, distorted, watermark",
        image=image.convert("RGB").resize((width, height)),
        strength=strength,
        num_inference_steps=30,
        guidance_scale=7.5,
    )
    return result.images[0]


def generate_variations(image: Image.Image, count: int = 4, strength: float = 0.6) -> list[Image.Image]:
    """Generate sequential img2img variations using distinct random seeds."""
    if count < 1:
        raise ValueError("count must be at least 1")
    if not 0 < strength <= 1:
        raise ValueError("strength must be greater than 0 and at most 1")
    width, height = _safe_size(*image.size)
    source = image.convert("RGB").resize((width, height))
    pipe = _load_img2img()
    return [
        pipe(
            prompt="high quality photo",
            negative_prompt="blurry, low quality, distorted, watermark",
            image=source,
            strength=strength,
            num_inference_steps=30,
            guidance_scale=7.5,
            generator=torch.Generator(device=DEVICE).manual_seed(secrets.randbits(63)),
        ).images[0]
        for _ in range(count)
    ]


def replace_background(
    image: Image.Image,
    mode: str,
    background_color: str | None = None,
    background_image: Image.Image | None = None,
) -> Image.Image:
    """Composite a background-removed subject onto a color or image background."""
    subject = remove_background(image).convert("RGBA")
    if mode == "color":
        if not background_color:
            raise ValueError("background_color is required for color mode")
        try:
            background = Image.new("RGB", subject.size, ImageColor.getrgb(background_color))
        except ValueError as exc:
            raise ValueError("background_color must be a valid hex color") from exc
    elif mode == "image":
        if background_image is None:
            raise ValueError("background_image is required for image mode")
        background = ImageOps.fit(background_image.convert("RGB"), subject.size, method=Image.Resampling.LANCZOS)
    else:
        raise ValueError("mode must be either 'color' or 'image'")
    background.paste(subject, (0, 0), subject)
    return background


if __name__ == "__main__":
    out_dir = "demo_output"
    os.makedirs(out_dir, exist_ok=True)

    print(f"Device: {DEVICE}")

    print("\n[1/4] Generating image from prompt...")
    img = generate_image(
        prompt="a cozy mountain cabin at sunset, photorealistic, 8k",
        seed=42,
    )
    img.save(f"{out_dir}/01_generated.png")
    print(f"Saved -> {out_dir}/01_generated.png")

    print("\n[2/4] Inpainting a region (prompt-based edit)...")
    mask = Image.new("L", img.size, 0)
    box = (img.width // 4, img.height // 4, img.width // 4 * 3, img.height // 4 * 3)
    mask.paste(255, box)
    edited = inpaint_image(img, mask, prompt="a small red boat on a lake")
    edited.save(f"{out_dir}/02_inpainted.png")
    print(f"Saved -> {out_dir}/02_inpainted.png")

    print("\n[3/4] Outpainting (expanding the canvas)...")
    expanded = outpaint_image(img, expand_px=100)
    expanded.save(f"{out_dir}/03_outpainted.png")
    print(f"Saved -> {out_dir}/03_outpainted.png")

    print("\n[4/4] Removing background...")
    bg_removed = remove_background(img)
    bg_removed.save(f"{out_dir}/04_bg_removed.png")
    print(f"Saved -> {out_dir}/04_bg_removed.png")

    print("\nAll pipeline stages ran successfully. Check ./demo_output/")
