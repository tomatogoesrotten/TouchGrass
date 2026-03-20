# Field Companion — Client Visit Intelligence

## Project Overview
Premium dark SaaS app for client visit intelligence. Design language: Linear/Vercel/Raycast — minimal, glassmorphism, gradient mesh backgrounds. Supports both dark and light mode.

## Tech Stack
- **Framework:** Vite + React 19 + TypeScript (strict)
- **Styling:** Tailwind CSS v4 (uses `@theme` directive, NOT tailwind.config.js)
- **State:** Zustand (stores in `src/stores/`)
- **Animation:** Framer Motion
- **Icons:** Lucide React (NOT Material Symbols)
- **Routing:** React Router DOM v7
- **Path alias:** `@/` → `src/`

## Project Structure
All source code is in `/app`. The root `/stitch` folder contains design reference screenshots/HTML — do NOT modify those.

```
app/
├── src/
│   ├── main.tsx                # Entry point, BrowserRouter wrapper
│   ├── App.tsx                 # Routes + global overlays (Toast, DeleteModal)
│   ├── index.css               # Tailwind v4 @theme tokens, mesh backgrounds, animations
│   ├── lib/phase.ts            # Phase color config (requirements/follow-up/demo/troubleshoot)
│   ├── stores/
│   │   ├── theme.ts            # Dark/light toggle
│   │   ├── session.ts          # Sessions CRUD, tags, recording state, active tab
│   │   └── toast.ts            # Toast notifications
│   ├── hooks/
│   │   ├── useThemeClass.ts    # Syncs theme to body class (dark-mesh/light-mesh)
│   │   └── useRecordingTimer.ts
│   ├── components/ui/          # Reusable design system primitives
│   │   ├── Glass.tsx, GlassCard.tsx   # Glassmorphism containers
│   │   ├── PrimaryBtn, SecondaryBtn, DangerBtn
│   │   ├── ThemeToggle, PhaseBadge, Input
│   │   ├── AIResultBox, LoadingBar, Toast, DeleteModal
│   ├── screens/
│   │   ├── Dashboard.tsx       # Main grid view with stats, search, filter pills
│   │   ├── Setup.tsx           # New session form + phase selector
│   │   └── Session.tsx         # Session header + tab bar + tab content router
│   └── screens/tabs/           # 6 tab content components
│       ├── RecordTab.tsx       # Recording button, quick tags, transcript
│       ├── NotesTab.tsx        # Textarea + word count
│       ├── StructureTab.tsx    # AI structure synthesis
│       ├── QuestionsTab.tsx    # Starter questions + AI generation
│       ├── DomainTab.tsx       # Domain intelligence lookup
│       └── SolutionsTab.tsx    # Private solutions + AI review
```

## Routes
- `/` — Dashboard
- `/setup` — New Session form
- `/session` — Active session (requires activeSession in store)

## Design Tokens (defined in index.css @theme)
- **Fonts:** Outfit (headings 700-900), Plus Jakarta Sans (body 500-700), JetBrains Mono (data)
- **Dark:** bg `#0a0b0f`, glass `rgba(18,21,30,.72)`, text `#f0f1f4`, accent `#00e5a0`, danger `#ff4d6a`, warn `#ffb347`
- **Light:** bg `#f8f9fc`, glass `rgba(255,255,255,.65)`, text `#111318`, accent `#00b37e`, danger `#e5384b`, warn `#e68a00`
- **Phase colors:** Requirements `#00e5a0/#00b37e`, Follow-up `#a78bfa/#7c5ccf`, Demo `#fbbf24/#d99a00`, Troubleshoot `#f87171/#dc3545`
- **Radii:** cards 14px, buttons 10px, pills 20px, inputs 10px, record 50px
- **Background mesh:** 3 radial gradients (teal top-left 7%, purple bottom-right 6%, amber top-center 4%)

## Commands
```bash
cd app
npm run dev      # Dev server
npm run build    # tsc -b && vite build
npm run preview  # Preview production build
```

## Deployment
- **Platform:** Zeabur
- **Root Directory:** `/app`
- No environment variables needed
- Zeabur auto-detects Vite and serves `dist/`

## Important Notes
- Theme is applied via body classes `dark-mesh`/`light-mesh` (NOT Tailwind's `dark:` prefix). Components read theme from Zustand and apply inline styles.
- TypeScript strict mode is ON with `noUnusedLocals` — don't leave unused variables.
- The `stitch/` folder at repo root has design reference HTML files. Use `stitch/lumina_obsidian/DESIGN.md` for the full design system spec.
