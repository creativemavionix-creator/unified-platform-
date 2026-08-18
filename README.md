# MaVionix Unified Platform

MaVionix is an AI-powered product suite in one workspace: creative generation, presentation building, CRM pipeline automation, development tools, automation flows, agent marketplace, and business operations — coordinated through a Next.js frontend with local FastAPI backends and Ollama for on-device LLM work.

This repository is the **main product workspace**. Standalone Vite dashboards and Python APIs live beside the Next app and are started through a shared backend launcher.

---

## What We Built

### Core platform (Next.js App Router)

| Suite | Route | What it does |
| --- | --- | --- |
| **Workstation** | `/dashboard` | Home hub — usage charts, copilot shell, suite entry points |
| **AI Creative** | `/creative` | Image editor/generator, video tools, logo generator, **AI Presentation Builder** |
| **AI Business** | `/business` | **CRM Pipeline** (Ollama AI SDR), HRMS/ERP/invoices shells |
| **AI Development** | `/dev` | Website/mobile builders, database designer (React Flow), kanban |
| **AI Automation** | `/automation` | Workflow canvas, integrations, activity logs |
| **AI Agents** | `/agents` | Agent gallery, detail specs, install/deploy flows |
| **Settings** | `/settings` | Profile, API credentials, session security |
| **Auth / onboarding** | `/signup` → `/plan` | Multi-step signup, org/workspace selection, plans |
| **Marketing** | `/`, `/pricing`, `/docs`, … | Landing, changelog, help, contact |
| **Share** | `/share/[slug]` | Public presentation share links |

### Flagship feature work (recent)

#### 1. CRM Pipeline + Ollama AI SDR

Full-screen CRM inside Business Ops (`?tool=crm`) with live store + real LLM endpoints:

- **Leads** — searchable pipeline, drawer with stage updates, scores, AI summary refresh
- **AI Assistant** — draft email / WhatsApp / call scripts, re-score leads, refresh recommendation queue, Ollama health badge
- **Workflows** — persist automations; “Write with AI” for descriptions
- **Dashboard & Analytics** — funnel, sources, AI performance, and activity feed derived from the live workspace store (not static mock-only UI)
- **Persistence** — `localStorage` key `mvx_crm_workspace_v1` (`lib/crm/store.ts`)

**CRM API (Next.js → Ollama):**

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/business/crm/health` | Ollama reachability + model |
| `POST` | `/api/business/crm/draft` | Email / WhatsApp / call draft |
| `POST` | `/api/business/crm/analyze` | Re-score + AI summary / next action |
| `POST` | `/api/business/crm/recommend` | Priority recommendation queue |
| `POST` | `/api/business/crm/call-script` | Discovery call script |
| `POST` | `/api/business/crm/workflow-describe` | Workflow description copy |

Defaults: `OLLAMA_URL=http://127.0.0.1:11434/api/generate`, `OLLAMA_MODEL=llama3:8b`.

#### 2. AI Presentation Builder

Integrated under Creative → Presentations:

- Ollama-first slide generation via the Presentation FastAPI (`:8001`)
- Brand kit apply-in-place (accent/theme without forced navigation)
- Deck store: create, rename, duplicate, delete, analytics
- Export: PPTX, HTML, PNG/JPG/PDF print helpers
- Public share links: `/share/[slug]`

Proxied from Next at `/api/creative/presentation/*` → `PRESENTATION_API_BACKEND_URL`.

#### 3. Creative backends + unified launcher

`npm run backend` starts every product API from `backend/services.json`:

| Service | Port | Codebase |
| --- | --- | --- |
| Image / Photo Editor API | `8000` | `photo-editor-dashboard/api` |
| Presentation Builder API | `8001` | `ai-presentation-builder/api` |
| Gateway health | `8080` | Aggregated `/health` |

Next also proxies image traffic at `/api/creative/image/*`.

#### 4. Standalone dashboards (optional)

Vite apps for focused product surfaces (can proxy CRM AI to the Next server):

- `lead-crm-dashboard/` — CRM UI (aliases `@` → monorepo root; `/api` → `localhost:3000`)
- `photo-editor-dashboard/` — image/photo editor + Python API
- `ai-presentation-builder/` — presentation UI + Python API
- `webdev-dashboard/`, `video-generator-dashboard-fixed/` — related product shells

---

## Technology Stack

| Layer | Choices |
| --- | --- |
| **App** | Next.js 14 (App Router), React 18, TypeScript |
| **UI** | Tailwind CSS 3, shadcn/ui, Lucide, Framer Motion, next-themes |
| **Graphs / charts** | React Flow, Recharts |
| **Forms** | React Hook Form + Zod |
| **Auth / data** | Supabase (`@supabase/ssr`) — optional; empty env = demo mode |
| **Local LLM** | Ollama (`llama3:8b` by default) for CRM + presentation generation |
| **Python APIs** | FastAPI (image + presentation), launched via `backend/start.py` |
| **Exports** | `pptxgenjs` (decks), print/HTML/image helpers for presentations |

---

## Repository Layout

```text
project/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Login, signup, org, plan, OTP…
│   ├── (dashboard)/              # Suite pages (business, creative, dev…)
│   ├── (marketing)/              # Landing + public pages
│   ├── api/
│   │   ├── business/crm/         # Ollama CRM AI routes
│   │   └── creative/             # Proxies + presentation export helpers
│   └── share/[slug]/            # Shared presentation viewer
├── components/
│   ├── business/lead-crm/        # CRM Pipeline workspace + tabs
│   ├── creative/                 # Image, video, logo, presentation UIs
│   ├── shared/                   # Sidebar, TopBar, BuilderShell, tables…
│   └── ui/                       # shadcn primitives
├── lib/
│   ├── crm/                      # Ollama helper, API client, store, metrics
│   ├── presentation-builder/     # Deck store, exports, API client
│   ├── image-generator/
│   └── supabase*.ts
├── hooks/use-crm-store.ts
├── backend/                      # Multi-API launcher + services.json
├── ai-presentation-builder/      # Presentation product + FastAPI
├── photo-editor-dashboard/       # Photo/image product + FastAPI
├── lead-crm-dashboard/           # Standalone CRM Vite app
├── webdev-dashboard/
├── video-generator-dashboard-fixed/
├── supabase/                     # Schema / migrations helpers
├── docs/
└── public/
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+ (for creative backends)
- **Ollama** (for CRM AI + local presentation generation)  
  - Install, then: `ollama pull llama3:8b` and `ollama serve`

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Environment

Copy `.env.example` → `.env` and adjust as needed:

```env
# Optional — leave empty for Demo Mode
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Creative suite backends
IMAGE_API_BACKEND_URL=http://localhost:8000
PRESENTATION_API_BACKEND_URL=http://localhost:8001

# Optional CRM Ollama overrides
# OLLAMA_URL=http://127.0.0.1:11434/api/generate
# OLLAMA_MODEL=llama3:8b
# CRM_OLLAMA_TIMEOUT_MS=90000
```

### 3. Install Python API dependencies (first time)

```powershell
# Image API
cd photo-editor-dashboard\api
py -3.11 -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Presentation API
cd ..\..\ai-presentation-builder\api
py -3.11 -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
cd ..\..
```

### 4. Run the stack

**Terminal A — creative backends**

```bash
npm run backend
```

Health: `http://127.0.0.1:8080/health`

**Terminal B — Ollama**

```bash
ollama serve
```

**Terminal C — Next.js**

```bash
npm run dev
```

Open **http://localhost:3000**

| Goal | Where to go |
| --- | --- |
| CRM + AI SDR | Business → CRM Pipeline (`/business?tool=crm`) |
| Presentations | Creative → Presentation builder |
| Image tools | Creative → Image / Photo |

### 5. Production build

```bash
npm run build
npm start
```

---

## CRM Pipeline — Deep Dive

**UI:** `components/business/lead-crm/`  
**Client:** `lib/crm/api.ts` · **Store:** `lib/crm/store.ts` · **Metrics:** `lib/crm/metrics.ts`  
**Server LLM:** `lib/crm/ollama.ts` + `app/api/business/crm/*`

### User flows that hit the backend

1. **Generate AI Draft** (Assistant or Lead drawer) → `/draft`
2. **Re-score / Refresh with Ollama** → `/analyze` (updates summary, scores, next action in store)
3. **AI Refresh recommendations** → `/recommend`
4. **AI call script** → `/call-script`
5. **Write with AI** on a new workflow → `/workflow-describe`
6. Header / Assistant show **Ollama ready | offline** from `/health`

If Ollama is down, routes return `503` with a clear message — start `ollama serve` and retry.

### Standalone CRM dashboard

```bash
cd lead-crm-dashboard
npm install
npm run dev
```

Requires the Next app on `:3000` for `/api/business/crm/*` (Vite proxy configured in `vite.config.ts`).

---

## Presentation Builder — Deep Dive

**UI:** `components/creative/presentation-builder/`  
**Client store/exports:** `lib/presentation-builder/`  
**API:** `ai-presentation-builder/api` on port `8001`  
**Next proxy:** `/api/creative/presentation/*`

Highlights:

- Batched slide generation through Ollama (strips meta filler copy)
- Brand kit accent applied in the editor without leaving the canvas
- Share slug resolution via deck store → `/share/[slug]`
- Multi-format export (PPTX + print/image/HTML helpers)

More launcher detail: [`backend/README.md`](backend/README.md).

---

## Route Map

| Section | Route | Notes |
| --- | --- | --- |
| Landing | `/` | Marketing landing |
| Onboarding | `/signup` … `/plan` | Zod-validated steps |
| Dashboard | `/dashboard` | Workstation |
| Development | `/dev` | Builders + React Flow DB designer |
| Automation | `/automation` | Node canvas workflows |
| Creative | `/creative` | Image, video, logo, presentations |
| Agents | `/agents` | Marketplace |
| Business | `/business` | CRM (`?tool=crm`), HRMS, ERP… |
| Settings | `/settings` | Profile & security |
| Share | `/share/[slug]` | Public deck view |
| 404 / 500 | `not-found` / `error` | Custom boundaries |

---

## Scripts

| Script | Command | Purpose |
| --- | --- | --- |
| Dev frontend | `npm run dev` | Next.js on `:3000` |
| Backends | `npm run backend` | Image `:8000` + Presentation `:8001` + gateway `:8080` |
| Build | `npm run build` | Production Next build |
| Start | `npm start` | Serve production build |
| Lint | `npm run lint` | ESLint |

---

## Design & Product Notes

- Theme tokens live in `app/globals.css` with light/dark via `next-themes`
- Shared chrome: `Sidebar`, `TopBar`, `BuilderShell`, data tables, detail drawers
- CRM and presentation work favor **real local AI** (Ollama) over canned placeholder copy
- Secrets and env files are gitignored; keep `.env.example` as the template

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| CRM shows “Ollama offline” | Run `ollama serve`; confirm `llama3:8b` is pulled |
| Draft / analyze 503 | Same as above; check `OLLAMA_URL` / firewall |
| Creative image/presentation fails | Run `npm run backend`; verify `:8000` / `:8001` health |
| Share link 404 | Deck must exist in presentation store with a valid share slug |
| Standalone CRM AI broken | Start Next on `:3000` so Vite’s `/api` proxy works |

---

## License / Status

Private product workspace (`mavionix-app` `0.1.0`). Demo mode works without Supabase; AI features need Ollama and (for creative) the Python backends.
