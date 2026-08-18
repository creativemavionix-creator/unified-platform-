# MaVionix Creative Backend

One entry point that starts every product API on its **own port**.

| Service | Port | Path |
|--------|------|------|
| Image / Photo Editor API | `8000` | `photo-editor-dashboard/api` |
| Presentation Builder API | `8001` | `ai-presentation-builder/api` |
| Gateway health | `8080` | `http://127.0.0.1:8080/health` |

## Start

From the project root:

```powershell
npm run backend
```

or:

```powershell
python backend/start.py
```

Stop with `Ctrl+C` — all child APIs shut down together.

## Requirements

Each API should have its own venv with dependencies installed:

```powershell
# Image API
cd photo-editor-dashboard\api
.\venv\Scripts\activate
pip install -r requirements.txt

# Presentation API
cd ..\..\ai-presentation-builder\api
py -3.11 -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

## Health check

```powershell
Invoke-RestMethod http://127.0.0.1:8080/health
```

## Adding another API later

Edit `backend/services.json` and add a service block with `cwd`, `module`, `port`, and `health`.
