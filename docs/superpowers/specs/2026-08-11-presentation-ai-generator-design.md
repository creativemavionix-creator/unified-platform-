# AI Presentation Builder — AI Generator (outline + slides)

## Goal
Make the AI Generator tab fully working: Ollama `llama3:8b` for outline/slide copy, existing image API for slide thumbnails, shared MaVionix creative token balance.

## Architecture
- **Backend:** `ai-presentation-builder/api` FastAPI on port **8001**
- **Frontend (suite):** `components/creative/presentation-builder` via `/api/creative/presentation/*`
- **Frontend (standalone):** Vite app calling `http://localhost:8001`
- **Tokens:** Same `deductServerTokens` / `mvx_creative_tokens` pool as image generator

## Endpoints
- `POST /api/outline` — source + input → editable outline slides
- `POST /api/generate-slides` — outline → full slides (title, bullets, notes, layout, image_prompt)
- `GET /api/health`

## Token costs
- `presentation/outline`: 20
- `presentation/generate-slides`: 40
- Per-slide images via existing `generate` (50 each) from the frontend

## Flow
1. User picks source + input → Generate Outline (Ollama)
2. Edit outline → Generate N Slides (Ollama)
3. Frontend generates hero images via image API
4. Hand off deck into Editor tab
