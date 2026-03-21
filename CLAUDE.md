# Field Companion — Client Visit Intelligence

## Project Overview
Premium dark SaaS app for client visit intelligence. Design language: Linear/Vercel/Raycast — minimal, glassmorphism, gradient mesh backgrounds. Supports both dark and light mode.

## Tech Stack
- **Frontend:** Vite + React 19 + TypeScript (strict)
- **Backend:** Node.js + Express 5 + TypeScript
- **Database:** PostgreSQL (Zeabur Marketplace)
- **AI:** OpenAI SDK (model configurable via `OPENAI_MODEL` env var)
- **Styling:** Tailwind CSS v4 (uses `@theme` directive, NOT tailwind.config.js)
- **State:** Zustand (stores in `app/src/stores/`)
- **Animation:** Framer Motion
- **Icons:** Lucide React (NOT Material Symbols)
- **Routing:** React Router DOM v7
- **Path alias:** `@/` → `app/src/`

## Project Structure
Frontend is in `/app`. Backend is in `/server`. The root `/stitch` folder contains design reference screenshots/HTML — do NOT modify those.

```
app/
├── src/
│   ├── main.tsx                # Entry point, BrowserRouter wrapper
│   ├── App.tsx                 # Routes + global overlays (Toast, DeleteModal)
│   ├── index.css               # Tailwind v4 @theme tokens, mesh backgrounds, animations
│   ├── speech.d.ts             # Web Speech API type declarations
│   ├── lib/
│   │   ├── phase.ts            # Phase color config (requirements/follow-up/demo/troubleshoot)
│   │   └── api.ts              # Typed fetch wrappers for all backend endpoints
│   ├── stores/
│   │   ├── theme.ts            # Dark/light toggle
│   │   ├── session.ts          # Sessions CRUD (API-backed), tags, recording state, auto-save
│   │   └── toast.ts            # Toast notifications
│   ├── hooks/
│   │   ├── useThemeClass.ts    # Syncs theme to body class (dark-mesh/light-mesh)
│   │   └── useRecordingTimer.ts
│   ├── components/ui/          # Reusable design system primitives
│   │   ├── Glass.tsx, GlassCard.tsx   # Glassmorphism containers
│   │   ├── PrimaryBtn, SecondaryBtn, DangerBtn
│   │   ├── ThemeToggle, PhaseBadge, Input
│   │   ├── AIResultBox, LoadingBar, Toast, DeleteModal
│   │   └── ExportModal.tsx     # Multi-format export modal (MD, JSON, PDF, n8n, Notion)
│   ├── screens/
│   │   ├── Dashboard.tsx       # Main grid view with real stats, search, filter pills
│   │   ├── Setup.tsx           # New session form + phase selector (creates via API)
│   │   └── Session.tsx         # Session header + tab content + export modal trigger
│   └── screens/tabs/           # 6 tab content components
│       ├── RecordTab.tsx       # Web Speech API recording, quick tags, live transcript
│       ├── NotesTab.tsx        # Textarea + word count (auto-saved to DB)
│       ├── StructureTab.tsx    # AI structure synthesis via backend
│       ├── QuestionsTab.tsx    # Starter questions + AI generation via backend
│       ├── DomainTab.tsx       # Domain intelligence lookup via backend
│       └── SolutionsTab.tsx    # Private solutions + AI review via backend

server/
├── src/
│   ├── index.ts                # Express app entry, CORS, routes
│   ├── db.ts                   # PostgreSQL pool + auto-migration
│   ├── prompts.ts              # System prompts for all AI features
│   └── routes/
│       ├── sessions.ts         # CRUD: GET list, POST create, GET/:id, PATCH/:id, DELETE/:id
│       ├── ai.ts               # OpenAI proxy: structure, questions, domain, solutions
│       └── export.ts           # Export: JSON, Markdown, PDF download + n8n webhook POST
├── package.json
├── tsconfig.json
├── Dockerfile                  # Node 20 Alpine multi-stage build
└── .env.example
```

## Routes (Frontend)
- `/` — Dashboard
- `/setup` — New Session form
- `/session` — Active session (requires activeSession in store)

## API Routes (Backend)
- `GET    /health` — Health check
- `GET    /api/sessions` — List sessions (lightweight meta)
- `POST   /api/sessions` — Create session
- `GET    /api/sessions/:id` — Get full session
- `PATCH  /api/sessions/:id` — Partial update (auto-save)
- `DELETE /api/sessions/:id` — Delete session
- `POST   /api/ai/structure` — AI-powered note structuring
- `POST   /api/ai/questions` — AI-generated follow-up questions
- `POST   /api/ai/domain` — Domain term lookup
- `POST   /api/ai/solutions` — Private solution review
- `GET    /api/export/:id/json` — Download session as JSON
- `GET    /api/export/:id/markdown` — Download session as Markdown
- `GET    /api/export/:id/pdf` — Download session as PDF
- `POST   /api/export/webhook` — Send session to n8n webhook

## Design Tokens (defined in index.css @theme)
- **Fonts:** Inter (headings + body), JetBrains Mono (data)
- **Dark:** bg `#0a0a0a`, surface `#121212`, text `#fafafa`, accent `#c4f042`, danger `#ff4d6a`, warn `#ff8a00`
- **Light:** bg `#f5f5f7`, surface `#ffffff`, text `#09090b`, accent `#a3cc29`, danger `#e5384b`, warn `#e67d00`
- **Phase colors:** Requirements `#c4f042/#a3cc29`, Follow-up `#8b5cf6/#7c3aed`, Demo `#ff8a00/#e67d00`, Troubleshoot `#ff4d6a/#e5384b`
- **Radii:** cards 24px, buttons 12px, pills 100px, inputs 12px, record 100px
- **Background mesh:** 3 radial gradients behind all content

## Commands
```bash
# Frontend
cd app
npm run dev          # Vite dev server
npm run build        # tsc -b && vite build
npm run preview      # Preview production build

# Backend
cd server
npm run dev          # tsx watch (hot reload)
npm run build        # tsc
npm start            # node dist/index.js
```

## Environment Variables

### Frontend (`app/.env`)
```
VITE_API_URL=http://localhost:3000
```

### Backend (`server/.env`)
```
DATABASE_URL=postgresql://user:password@localhost:5432/touchgrass
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/field-companion
PORT=3000
```

## Deployment (Zeabur — 3 Managed Services)

All three services live in the same Zeabur project for internal networking.

### 1. PostgreSQL
- Add via Zeabur Marketplace → Databases → PostgreSQL
- Copy the **private** connection string

### 2. Backend
- Deploy from GitHub → Root Directory: `/server`
- Zeabur detects Dockerfile and builds automatically
- Set environment variables:
  - `DATABASE_URL` = PostgreSQL private connection string
  - `OPENAI_API_KEY` = your OpenAI key
  - `OPENAI_MODEL` = `gpt-4o-mini` (or preferred model)
  - `N8N_WEBHOOK_URL` = your n8n endpoint (optional)
  - `PORT` = `3000`

### 3. Frontend
- Deploy from GitHub → Root Directory: `/app`
- Zeabur auto-detects Vite and serves `dist/`
- Set environment variable:
  - `VITE_API_URL` = backend's public domain URL (e.g. `https://touchgrass-api.zeabur.app`)

## Important Notes
- Theme is applied via body classes `dark-mesh`/`light-mesh` (NOT Tailwind's `dark:` prefix). Components read theme from Zustand and apply inline styles.
- TypeScript strict mode is ON with `noUnusedLocals` — don't leave unused variables.
- The `stitch/` folder at repo root has design reference HTML files.
- Sessions are persisted in PostgreSQL. The Zustand store acts as a client-side cache with 1000ms debounced auto-save to the backend.
- All AI calls go through the backend (`/api/ai/*`) to keep API keys server-side. The model is configurable via the `OPENAI_MODEL` env var.
- Export supports 5 formats: Markdown download, JSON download, PDF download, n8n webhook POST, and Notion (placeholder for future).
