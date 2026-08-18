# AI Core

## 1. Virtual environment

```powershell
python -m venv venv
venv\Scripts\activate
python -m pip install --upgrade pip
```

## 2. PyTorch with CUDA (match your driver — 4060 supports CUDA 12.1+)

```powershell
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

Verify CUDA is actually visible before installing anything else:

```powershell
python -c "import torch; print(torch.cuda.is_available(), torch.cuda.get_device_name(0))"
```

If this prints `False`, stop and fix your NVIDIA driver / CUDA toolkit first — nothing below will use your GPU otherwise and everything will silently fall back to CPU (unusably slow for diffusion models).

## 3. Core generation + editing stack

```powershell
pip install diffusers transformers accelerate safetensors
pip install xformers
pip install pillow numpy
```

## 4. Background removal

```powershell
pip install rembg onnxruntime-gpu
```

## 5. 

```powershell
pip install fastapi uvicorn python-multipart
pip install realesrgan gfpgan   # upscaling + face restoration
```