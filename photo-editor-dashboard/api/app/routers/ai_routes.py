from __future__ import annotations

import io
import json
import os
import threading
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request as UrlRequest, urlopen

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from PIL import Image, UnidentifiedImageError

from app.ai.ai_core import (
    DEVICE,
    STYLE_PRESETS,
    apply_style,
    enhance_face,
    generate_image,
    generate_variations,
    inpaint_image,
    outpaint_image,
    remove_background,
    replace_background,
    upscale_image,
)
from app.schemas import (
    GeneratedImageRecord,
    HealthResponse,
    ImageResponse,
    PromptEnhanceRequest,
    PromptEnhanceResponse,
    BrandKitSuggestRequest,
    BrandKitSuggestResponse,
    BrandKitSaveRequest,
    BrandKitResponse,
)

router = APIRouter()
MODEL_LOCK = threading.Lock()
OUTPUT_DIR = Path(__file__).resolve().parents[2] / "static" / "outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
MANIFEST_PATH = OUTPUT_DIR / "manifest.json"
MANIFEST_LOCK = threading.Lock()
BRAND_KIT_PATH = OUTPUT_DIR / "brand_kit.json"
BRAND_KIT_LOCK = threading.Lock()

DEFAULT_GENERATION_NEGATIVE = "blurry, low quality, distorted, watermark"
DEFAULT_EDIT_NEGATIVE = "blurry, low quality, distorted"
DEFAULT_OUTPAINT_NEGATIVE = "blurry, seam, border, frame, low quality"


def _build_output_url(request: Request, filename: str) -> str:
    return f"{str(request.base_url).rstrip('/')}/static/outputs/{filename}"


def _read_manifest() -> list[dict[str, object]]:
    try:
        with MANIFEST_PATH.open("r", encoding="utf-8") as manifest_file:
            data = json.load(manifest_file)
        return data if isinstance(data, list) else []
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return []


def _write_manifest(records: list[dict[str, object]]) -> None:
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=OUTPUT_DIR, delete=False) as temp_file:
        json.dump(records, temp_file, ensure_ascii=False)
        temp_path = Path(temp_file.name)
    os.replace(temp_path, MANIFEST_PATH)


def _save_output_image(image: Image.Image, request: Request, operation: str, prompt: str) -> ImageResponse:
    filename = f"{uuid.uuid4().hex}.png"
    path = OUTPUT_DIR / filename
    image.save(path, format="PNG")
    record = {
        "filename": filename,
        "operation": operation,
        "prompt": prompt,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "width": image.width,
        "height": image.height,
    }
    with MANIFEST_LOCK:
        records = _read_manifest()
        records.append(record)
        _write_manifest(records)
    return ImageResponse(url=_build_output_url(request, filename), filename=filename)


def _load_image_from_upload(upload: UploadFile, field_name: str) -> Image.Image:
    if upload.content_type and not upload.content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail=f"{field_name} must be an image upload.")

    try:
        data = upload.file.read()
        if not data:
            raise HTTPException(status_code=422, detail=f"{field_name} is empty.")
        with Image.open(io.BytesIO(data)) as image:
            image.load()
            return image.copy()
    except HTTPException:
        raise
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=422, detail=f"{field_name} is not a valid image.") from exc
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not read {field_name}: {exc}") from exc


def _require_prompt(prompt: str | None, field_name: str = "prompt") -> str:
    value = (prompt or "").strip()
    if not value:
        raise HTTPException(status_code=422, detail=f"{field_name} is required and cannot be empty.")
    return value


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", device=DEVICE)


@router.get("/images", response_model=list[GeneratedImageRecord])
def list_images(request: Request) -> list[GeneratedImageRecord]:
    with MANIFEST_LOCK:
        records = _read_manifest()
    return [
        GeneratedImageRecord(
            filename=str(record["filename"]),
            url=_build_output_url(request, str(record["filename"])),
            operation=str(record.get("operation", "generate")),
            prompt=str(record.get("prompt", "")),
            created_at=str(record.get("created_at", "")),
            width=int(record.get("width", 0)),
            height=int(record.get("height", 0)),
        )
        for record in reversed(records)
        if isinstance(record, dict) and record.get("filename")
    ]


@router.post("/prompt-enhance", response_model=PromptEnhanceResponse)
def prompt_enhance(payload: PromptEnhanceRequest) -> PromptEnhanceResponse:
    prompt = _require_prompt(payload.prompt)
    body = json.dumps({
        "model": "llama3:8b",
        "prompt": f"Improve this image-generation prompt. Return only the improved prompt, no explanation:\n{prompt}",
        "stream": False,
    }).encode("utf-8")
    request = UrlRequest("http://127.0.0.1:11434/api/generate", data=body, headers={"Content-Type": "application/json"})
    try:
        with urlopen(request, timeout=20) as response:
            result = json.loads(response.read().decode("utf-8"))
        enhanced = str(result.get("response", "")).strip()
        if not enhanced:
            raise ValueError("Ollama returned no enhanced prompt.")
        return PromptEnhanceResponse(prompt=enhanced)
    except (URLError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=503, detail=f"Prompt enhancement is unavailable: {exc}") from exc


@router.post("/generate", response_model=ImageResponse)
def generate(
    request: Request,
    prompt: str = Form(...),
    negative_prompt: str = Form(DEFAULT_GENERATION_NEGATIVE),
    width: int = Form(512),
    height: int = Form(512),
    steps: int = Form(25),
    seed: int | None = Form(None),
) -> ImageResponse:
    prompt_text = _require_prompt(prompt)

    try:
        with MODEL_LOCK:
            result = generate_image(
                prompt=prompt_text,
                negative_prompt=(negative_prompt or DEFAULT_GENERATION_NEGATIVE).strip() or DEFAULT_GENERATION_NEGATIVE,
                width=width,
                height=height,
                steps=steps,
                seed=seed,
            )
        return _save_output_image(result, request, "generate", prompt_text)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {exc}") from exc


@router.post("/inpaint", response_model=ImageResponse)
def inpaint(
    request: Request,
    image: UploadFile = File(...),
    mask: UploadFile = File(...),
    prompt: str = Form(...),
    negative_prompt: str = Form(DEFAULT_EDIT_NEGATIVE),
    steps: int = Form(30),
    guidance_scale: float = Form(12.0),
) -> ImageResponse:
    prompt_text = _require_prompt(prompt)
    image_input = _load_image_from_upload(image, "image")
    mask_input = _load_image_from_upload(mask, "mask")

    try:
        with MODEL_LOCK:
            result = inpaint_image(
                image=image_input,
                mask=mask_input,
                prompt=prompt_text,
                negative_prompt=(negative_prompt or DEFAULT_EDIT_NEGATIVE).strip() or DEFAULT_EDIT_NEGATIVE,
                steps=steps,
                guidance_scale=guidance_scale,
            )
        return _save_output_image(result, request, "inpaint", prompt_text)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inpainting failed: {exc}") from exc


@router.post("/outpaint", response_model=ImageResponse)
def outpaint(
    request: Request,
    image: UploadFile = File(...),
    expand_px: int = Form(128),
    prompt: str | None = Form(None),
    negative_prompt: str = Form(DEFAULT_OUTPAINT_NEGATIVE),
    steps: int = Form(30),
) -> ImageResponse:
    image_input = _load_image_from_upload(image, "image")
    prompt_text = (prompt or "").strip() or "seamless continuation of the scene, natural extension"

    try:
        with MODEL_LOCK:
            result = outpaint_image(
                image=image_input,
                expand_px=expand_px,
                prompt=prompt_text,
                negative_prompt=(negative_prompt or DEFAULT_OUTPAINT_NEGATIVE).strip() or DEFAULT_OUTPAINT_NEGATIVE,
                steps=steps,
            )
        return _save_output_image(result, request, "outpaint", prompt_text)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Outpainting failed: {exc}") from exc


@router.post("/remove-background", response_model=ImageResponse)
def remove_background_route(
    request: Request,
    image: UploadFile = File(...),
) -> ImageResponse:
    image_input = _load_image_from_upload(image, "image")

    try:
        with MODEL_LOCK:
            result = remove_background(image_input)
        return _save_output_image(result, request, "remove-background", "Background removal")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Background removal failed: {exc}") from exc


@router.post("/background-replace", response_model=ImageResponse)
def background_replace(
    request: Request,
    image: UploadFile = File(...),
    mode: str = Form(...),
    background_color: str | None = Form(None),
    background_image: UploadFile | None = File(None),
) -> ImageResponse:
    image_input = _load_image_from_upload(image, "image")
    mode_value = (mode or "").strip().lower()
    if mode_value not in {"color", "image"}:
        raise HTTPException(status_code=422, detail="mode must be either 'color' or 'image'.")
    if mode_value == "color" and not (background_color or "").strip():
        raise HTTPException(status_code=422, detail="background_color is required when mode is 'color'.")
    if mode_value == "image" and background_image is None:
        raise HTTPException(status_code=422, detail="background_image is required when mode is 'image'.")
    background_input = _load_image_from_upload(background_image, "background_image") if background_image else None

    try:
        with MODEL_LOCK:
            result = replace_background(image_input, mode_value, (background_color or "").strip() or None, background_input)
        return _save_output_image(result, request, "background-replace", "Background replacement")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Background replacement failed: {exc}") from exc


@router.post("/face-enhance", response_model=ImageResponse)
def face_enhance(request: Request, image: UploadFile = File(...)) -> ImageResponse:
    image_input = _load_image_from_upload(image, "image")

    try:
        with MODEL_LOCK:
            result = enhance_face(image_input)
        return _save_output_image(result, request, "face-enhance", "Face enhancement")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Face enhancement failed: {exc}") from exc


@router.post("/upscale", response_model=ImageResponse)
def upscale(request: Request, image: UploadFile = File(...), scale: int = Form(4)) -> ImageResponse:
    image_input = _load_image_from_upload(image, "image")

    try:
        with MODEL_LOCK:
            result = upscale_image(image_input, scale=scale)
        return _save_output_image(result, request, "upscale", "Upscaling")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Upscaling failed: {exc}") from exc


@router.post("/magic-eraser", response_model=ImageResponse)
def magic_eraser(
    request: Request,
    image: UploadFile = File(...),
    mask: UploadFile = File(...),
) -> ImageResponse:
    image_input = _load_image_from_upload(image, "image")
    mask_input = _load_image_from_upload(mask, "mask")

    try:
        with MODEL_LOCK:
            result = inpaint_image(
                image=image_input,
                mask=mask_input,
                prompt="seamless background, empty space, natural continuation, high quality",
                negative_prompt="object, artifact, blurry, distorted",
            )
        return _save_output_image(result, request, "magic-eraser", "Magic eraser")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Magic eraser failed: {exc}") from exc


@router.post("/style-transfer", response_model=ImageResponse)
def style_transfer(
    request: Request,
    image: UploadFile = File(...),
    style: str = Form(...),
    strength: float = Form(0.6),
) -> ImageResponse:
    image_input = _load_image_from_upload(image, "image")
    style_value = (style or "").strip()
    if style_value not in STYLE_PRESETS:
        raise HTTPException(status_code=422, detail=f"style must be one of: {', '.join(STYLE_PRESETS)}.")

    try:
        with MODEL_LOCK:
            result = apply_style(image_input, style=style_value, strength=strength)
        return _save_output_image(result, request, "style-transfer", style_value)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Style transfer failed: {exc}") from exc


@router.post("/image-variations", response_model=list[ImageResponse])
def image_variations(
    request: Request,
    image: UploadFile = File(...),
    count: int = Form(4),
    strength: float = Form(0.6),
) -> list[ImageResponse]:
    image_input = _load_image_from_upload(image, "image")

    try:
        with MODEL_LOCK:
            results = generate_variations(image_input, count=min(max(count, 1), 4), strength=strength)
        return [_save_output_image(result, request, "image-variations", "Image variation") for result in results]
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Image variations failed: {exc}") from exc


def _clean_json_response(text: str) -> dict:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    return json.loads(text)


@router.get("/brandkit", response_model=BrandKitResponse)
def get_brand_kit() -> BrandKitResponse:
    with BRAND_KIT_LOCK:
        try:
            if BRAND_KIT_PATH.exists():
                with BRAND_KIT_PATH.open("r", encoding="utf-8") as f:
                    data = json.load(f)
                return BrandKitResponse(
                    colors=data.get("colors", ["#C800FF", "#7C3AED", "#4C1D95", "#0F172A", "#FFFFFF"]),
                    fonts=data.get("fonts", ["Inter", "Poppins", "Sora"]),
                    logos=data.get("logos", []),
                    assets=data.get("assets", []),
                )
        except Exception:
            pass
    return BrandKitResponse(
        colors=["#C800FF", "#7C3AED", "#4C1D95", "#0F172A", "#FFFFFF"],
        fonts=["Inter", "Poppins", "Sora"],
        logos=[],
        assets=[],
    )


@router.post("/brandkit", response_model=BrandKitResponse)
def save_brand_kit(payload: BrandKitSaveRequest) -> BrandKitResponse:
    with BRAND_KIT_LOCK:
        data = {
            "colors": payload.colors,
            "fonts": payload.fonts,
            "logos": payload.logos,
            "assets": payload.assets,
        }
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=OUTPUT_DIR, delete=False) as temp_file:
            json.dump(data, temp_file, ensure_ascii=False)
            temp_path = Path(temp_file.name)
        os.replace(temp_path, BRAND_KIT_PATH)
    return BrandKitResponse(
        colors=payload.colors,
        fonts=payload.fonts,
        logos=payload.logos,
        assets=payload.assets,
    )


@router.post("/brandkit/suggest", response_model=BrandKitSuggestResponse)
def suggest_brand_kit(payload: BrandKitSuggestRequest) -> BrandKitSuggestResponse:
    brand_type_lower = payload.brand_type.lower()
    brand_name = payload.brand_name
    desc = payload.description or ""

    system_prompt = (
        "You are an expert brand designer. Generate a brand kit for a brand based on user input. "
        "Return ONLY a JSON object and nothing else. Do not use markdown code blocks. The JSON must have these exact keys:\n"
        "- colors: list of 5 hex color codes (primary, secondary, accent, dark background, light background) that harmonize perfectly\n"
        "- fonts: list of 3 Google Fonts suited for the brand (heading, body, accent)\n"
        "- logo_prompt: a Stable Diffusion prompt to generate a clean, flat vector logo for the brand. Keep it minimal, simple, on a white background, no text or words in the logo icon\n"
        "- asset_prompts: a list of 3 Stable Diffusion prompts to generate brand assets/backgrounds/product patterns matching the style\n"
    )
    user_prompt = f"Brand Name: {brand_name}\nBrand Type: {payload.brand_type}\nDescription: {desc}"

    body = json.dumps({
        "model": "llama3:8b",
        "prompt": f"{system_prompt}\n\n{user_prompt}",
        "stream": False,
    }).encode("utf-8")

    request = UrlRequest("http://127.0.0.1:11434/api/generate", data=body, headers={"Content-Type": "application/json"})
    try:
        with urlopen(request, timeout=2) as response:
            result = json.loads(response.read().decode("utf-8"))
        raw_text = str(result.get("response", "")).strip()

        parsed = _clean_json_response(raw_text)
        return BrandKitSuggestResponse(
            colors=parsed["colors"][:5],
            fonts=parsed["fonts"][:3],
            logo_prompt=parsed["logo_prompt"],
            asset_prompts=parsed["asset_prompts"][:3]
        )
    except Exception as exc:
        print(f"Ollama suggestion failed or returned invalid JSON: {exc}. Using smart heuristics fallback.")

    # Heuristics Fallback based on brand_type
    # Check playful before eco so "Playful / Food / Fun" does not match the eco "food" keyword.
    if any(k in brand_type_lower for k in ["tech", "saas", "software", "startup", "app", "digital"]):
        colors = ["#6366F1", "#3B82F6", "#10B981", "#0F172A", "#F8FAFC"]
        fonts = ["Inter", "Sora", "Outfit"]
        logo_prompt = f"minimalist vector logo for a tech startup named '{brand_name}', modern geometric icon, gradient colors, flat, clean white background, high quality"
        asset_prompts = [
            "futuristic AI computer workspace, isometric digital illustration, high quality",
            "abstract high-tech data visualization pattern, light purple and blue colors, vector graphic",
            "marketing banner background with glowing geometric lines, modern abstract tech graphic"
        ]
    elif any(k in brand_type_lower for k in ["play", "creative", "art", "kid", "game", "toy", "fun"]):
        colors = ["#F43F5E", "#F59E0B", "#10B981", "#1E293B", "#FFF1F2"]
        fonts = ["Fredoka", "Quicksand", "Nunito"]
        logo_prompt = f"playful cute character mascot logo for brand '{brand_name}', vibrant colors, friendly icon, flat vector, white background, high quality"
        asset_prompts = [
            "colorful vibrant craft studio background, creative toys and tools, high quality",
            "cute hand-drawn seamless pattern, stars and bubbles, pastel colors, vector graphic",
            "bright sunny playroom background, happy playful child aesthetic"
        ]
    elif any(k in brand_type_lower for k in ["eco", "organic", "nature", "green", "clean", "plant"]):
        colors = ["#065F46", "#10B981", "#F5F5F4", "#78716C", "#E7E5E4"]
        fonts = ["Playfair Display", "Lora", "Nunito"]
        logo_prompt = f"organic leaf minimal vector logo for brand '{brand_name}', eco friendly, natural green and beige colors, clean white background, high quality"
        asset_prompts = [
            "premium eco-friendly packaging mockup, natural leaf shadows, photorealistic",
            "abstract green leaves seamless pattern, watercolor style, flat design",
            "natural wooden table with green plants and soft morning light background"
        ]
    elif any(k in brand_type_lower for k in ["luxury", "fashion", "cosmetic", "beauty", "jewelry", "premium"]):
        colors = ["#1E1B4B", "#D97706", "#FDF2E9", "#111827", "#FFFFFF"]
        fonts = ["Cinzel", "Montserrat", "Playfair Display"]
        logo_prompt = f"sophisticated elegant lettermark logo for brand '{brand_name}', luxury gold foil, flat vector, white background, high quality"
        asset_prompts = [
            "luxury cosmetic bottle on a stone pedestal, beige cream background, studio lighting, photorealistic",
            "minimalist elegant gold patterns on dark indigo silk background",
            "premium editorial fashion photography background, soft shadows, luxury aesthetic"
        ]
    elif any(k in brand_type_lower for k in ["corp", "finance", "money", "bank", "trust", "invest", "law", "business"]):
        colors = ["#1E3A8A", "#2563EB", "#64748B", "#0F172A", "#F1F5F9"]
        fonts = ["Inter", "Sora", "Outfit"]
        logo_prompt = f"professional abstract geometric symbol logo for finance company '{brand_name}', deep blue colors, flat vector, white background, high quality"
        asset_prompts = [
            "modern corporate office skyscraper, blue glass facade, professional photography, high quality",
            "abstract geometric financial chart background, vector grid design, blue and gray colors",
            "professional team meeting office space, glass and steel background, high quality"
        ]
    else:
        colors = ["#7C3AED", "#EC4899", "#3B82F6", "#0F172A", "#F8FAFC"]
        fonts = ["Inter", "Poppins", "Sora"]
        logo_prompt = f"creative modern vector logo icon for brand '{brand_name}', flat design, vibrant colors, white background, high quality"
        asset_prompts = [
            "creative abstract office workspace, modern design style, high quality",
            "abstract vibrant color splash gradient background, modern design",
            "conceptual startup illustration, flat design vector graphic"
        ]

    return BrandKitSuggestResponse(
        colors=colors,
        fonts=fonts,
        logo_prompt=logo_prompt,
        asset_prompts=asset_prompts
    )

