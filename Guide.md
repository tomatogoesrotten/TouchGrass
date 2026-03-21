# Field Visit Companion — Implementation & Automation Guide

**Version:** 1.0  
**Audience:** Developer (you) setting up and extending the tool  
**Companion doc:** See `PRD.md` for full product spec and data model

---

## 1. How to Use the App (Workflow)

### 1.1 Before the Meeting (2 min)

1. Open Field Companion, click **+ New Session**
2. Fill in **Client name** and **Industry** (be specific — these feed into all AI prompts, e.g. "Automotive Parts Manufacturing" not just "Manufacturing")
3. Select the **Meeting Phase** — determines starter questions and AI framing
4. Add **Attendees** — helps reference who said what later
5. Click **Start Session**

### 1.2 During the Meeting

**Primary: Record Tab**
1. Hit **Start Recording** (Chrome/Edge + mic permission required)
2. Speak naturally — transcription is real-time via Web Speech API
3. Tap **Quick Tags** to bookmark moments without typing:
   - ⚠️ Important — hard requirement stated
   - ❓ Question — needs follow-up
   - ✅ Decision — agreement reached
   - 📌 Action Item — task assigned
   - 🤔 Unclear — jargon or confusing concept
4. Tags are timestamped relative to recording start for cross-referencing

**Fallback: Notes Tab**
- If you can't record (wrong browser, noisy room, no consent), type freely
- Don't worry about structure — AI organizes it later

**Mid-meeting assists:**
- **Domain Tab** — hear an unknown term? Type it, get 3-5 sentences in context of the client's industry. Discreet enough to use live
- **Questions Tab (starters)** — phase-specific prompts if conversation stalls

### 1.3 After the Meeting (5-10 min)

**Step 1: Structure (Structure Tab)**
- Click "Structure My Notes" → AI produces organized markdown: Key Points, Requirements/Issues, Decisions, Action Items, Unclear areas
- Domain terms get flagged and explained
- Review output; edit notes and re-run if needed

**Step 2: Questions (Questions Tab)**
- Click "Generate Follow-up Questions" → 5-8 questions ranked Critical / Important / Nice-to-have with rationale
- Best done AFTER structuring (structured notes improve AI context)

**Step 3: Solutions (Solutions Tab — Private 🔒)**
- Write solution ideas you were thinking during the meeting
- Click "Review My Ideas" → AI assesses feasibility, flags client-facing risks, suggests professional framing, and offers alternatives
- Never seen by clients — your private sandbox

**Step 4: Export**
- Click **Export ↓** → downloads complete `.md` with metadata, transcript, notes, tags, all AI outputs, and private solutions
- This file feeds into your automation pipeline or gets shared with your team

### 1.4 Revisiting Sessions

Sessions auto-save and persist. On the dashboard you can search by client/industry, filter by phase, open any session to review/edit/re-run AI, or delete with confirmation.

---

## 2. Code Architecture

### 2.1 File Structure (Single-File React App)

```
field-visit-companion.jsx
├── Theme System         — themes object, ThemeCtx, useTheme hook
├── Constants            — PHASES, Q_TPL (question templates)
├── Session Factory      — mkS() creates empty session
├── Storage Layer (DB)   — idx(), get(), put(), del(), getTheme(), setTheme()
├── Reusable Components  — ThemeToggle, GlassCard, Btn, LoadBar, AIBox
├── Main App Component   — state, effects, handlers, view routing
│   ├── Dashboard View   — stats, search, filters, cards, delete modal
│   ├── Setup View       — form, phase selector
│   └── Session View     — header, tabs, 6 content panels
└── Styles + CSS         — theme-aware inline styles, injected keyframes
```

### 2.2 Key Patterns

**Auto-save flow:**
```
User edits → upd({field: value})
  → setCs merges into session → save(session)
    → 1000ms debounce → DB.put(session) writes to storage
      → Toast "Auto-saved"
```

**AI call pattern:**
```
Button click → setLd({key: true})
  → callAI(systemPrompt, userInput)
    → POST to Anthropic API → extract .content[0].text
  → upd({field: result}) → setLd({key: false})
```

**Speech lifecycle:**
```
startRec() → create SpeechRecognition (continuous, interimResults)
  → onresult: append isFinal text to transcript
  → onend: auto-restart if ref active
  → start 1s interval timer
stopRec() → stop recognition, null ref, clear timer
```

### 2.3 Storage Layer

| Method | Key | Notes |
|--------|-----|-------|
| `DB.idx()` | `fc3-idx` | Session metadata array |
| `DB.get(id)` | `fc3:{id}` | Full session |
| `DB.put(s)` | `fc3:{id}` + index | Dual-write: session + index entry |
| `DB.del(id)` | `fc3:{id}` + index | Remove from both |
| `DB.getTheme()` | `fc3-theme` | "dark" or "light" |
| `DB.setTheme(v)` | `fc3-theme` | Persist preference |

All wrapped in try/catch with sensible defaults on failure.

---

## 3. n8n Automation Setup

### 3.1 Architecture

```
Field Companion App
        │
        ▼ (Export triggers webhook)
   n8n Workflow Engine
        │
   ┌────┼────────────┬─────────────┬──────────┐
   ▼    ▼            ▼             ▼          ▼
Notion  Google     Slack/       Todoist/    Any API
        Sheets     Telegram     Asana
```

### 3.2 Option A: Webhook (Recommended)

**n8n side:**
1. Create workflow → add **Webhook** trigger node
2. Method: POST, Path: `/field-companion`
3. Copy the webhook URL

**App side — add to the `doExp` function after the Blob download:**

```javascript
const webhookUrl = "https://your-n8n.com/webhook/field-companion";
try {
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client: cs.client,
      industry: cs.industry,
      phase: cs.phase,
      date: cs.date,
      attendees: cs.attendees,
      transcript: cs.transcript,
      manualNotes: cs.manualNotes,
      quickTags: cs.quickTags,
      structuredNotes: cs.structuredNotes,
      aiQuestions: cs.aiQuestions,
      // CAUTION: exclude private fields if downstream is shared
      // privateSolutions: cs.privateSolutions,
      // aiSolutionFeedback: cs.aiSolutionFeedback,
      exportedAt: new Date().toISOString(),
    }),
  });
  showToast("Exported + synced");
} catch { showToast("Exported (sync failed)"); }
```

### 3.3 Option B: File Watch (No Code Changes)

1. Export sessions manually (downloads `.md`)
2. n8n: **Local File Trigger** watching Downloads for `visit-*.md`
3. **Read File** node → **Code** node to parse sections:
```javascript
const content = $input.first().binary.data.toString();
const sections = {};
content.split(/^## /m).forEach(part => {
  const lines = part.split('\n');
  const title = lines[0]?.trim();
  if (title) sections[title] = lines.slice(1).join('\n').trim();
});
return [{ json: sections }];
```

### 3.4 Workflow Recipes

#### Recipe 1: Session → Notion Database

Maintain a searchable database of all visits.

**Nodes:** Webhook → **Notion: Create Database Item**

Mapping:
- Title → `{client} — {date}`
- Select "Phase" → `{phase}`
- Text "Industry" → `{industry}`
- Text "Structured Notes" → `{structuredNotes}`
- Text "Questions" → `{aiQuestions}`

Pre-create Notion DB columns: Name (title), Date, Phase (select), Industry, Attendees, Structured Notes, Action Items, Questions, Status (select: Needs Review / Done).

#### Recipe 2: Action Items → Task Manager

Auto-create tasks from meeting action items.

**Nodes:** Webhook → **Code** (extract items) → **Todoist/Asana/Linear: Create Task** (loop)

```javascript
// Code node: extract action items
const notes = $json.structuredNotes || "";
const section = notes.split("Action Items")[1]?.split("##")[0] || "";
const items = section.match(/^- .+$/gm) || [];
return items.map(item => ({
  json: {
    task: item.replace(/^- /, ""),
    client: $json.client,
    date: $json.date
  }
}));
```

Task title: `[{client}] {task}`, due in 3 days, tag: `client-visit`.

#### Recipe 3: Summary → Slack

Post a brief meeting summary to your team channel.

**Nodes:** Webhook → **Code** (format) → **Slack: Send Message**

```javascript
const s = $json;
return [{ json: { text:
  `*📋 Field Visit: ${s.client}*\n` +
  `${s.industry} | ${s.phase} | ${s.date}\n` +
  `Attendees: ${s.attendees}\n\n` +
  `*Notes:*\n${(s.structuredNotes || "N/A").substring(0, 1500)}...\n\n` +
  `*Questions:*\n${(s.aiQuestions || "N/A").substring(0, 800)}`
}}];
```

Channel: `#client-visits` or project-specific.

#### Recipe 4: Domain Knowledge Accumulator

Build a personal glossary from domain lookups over time.

**App modification — add to `doDom` after successful lookup:**
```javascript
fetch("https://your-n8n.com/webhook/domain-lookup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    term: dq, industry: cs.industry,
    explanation: res, client: cs.client, date: cs.date,
  }),
}).catch(() => {});
```

**n8n:** Webhook → **Google Sheets: Append Row** to a "Domain Glossary" sheet (columns: Term, Industry, Explanation, Client, Date).

Review before future visits to the same industry.

#### Recipe 5: Weekly Visit Report

**Nodes:** Schedule Trigger (Friday 5pm) → **Notion: Query** (this week) → **Code** (compile) → **Email/Slack**

---

## 4. Extending the App

### 4.1 Add a New Meeting Phase

```javascript
// 1. Add to PHASES:
{ id: "training", label: "Training", icon: "🎓", hue: "#38bdf8", hueL: "#0284c7" }

// 2. Add to Q_TPL:
training: ["What's the team's current skill level?", "What tools are they using?", ...]
```
Phase flows through all AI prompts automatically — no other changes.

### 4.2 Add a New Quick Tag

Add to the tag button array in Record tab JSX. Tags are just strings — no schema change.

### 4.3 Add a New AI Feature Tab

1. Add to `TABS`: `{ id: "newtab", l: "Label", ic: "🆕" }`
2. Add AI function following the `doStruct` pattern
3. Add field to `mkS()`: `newOutput: ""`
4. Add tab content panel in session JSX

### 4.4 Upgrade to Whisper Transcription

Replace Web Speech API with record-then-transcribe:

1. `navigator.mediaDevices.getUserMedia({ audio: true })` for audio stream
2. `MediaRecorder` API to capture chunks
3. On stop: combine into Blob → send to Whisper API
4. Set returned text as `session.transcript`

Trade-off: no live transcript, but much higher accuracy. Can combine both — Speech API live, Whisper post-meeting.

---

## 5. Deployment

### 5.1 Claude Artifact (Current — Zero Setup)

Works as-is with `window.storage`. Just use it in Claude.

### 5.2 Standalone React App

1. `npx create-react-app field-companion`
2. Copy JSX into `src/App.jsx`
3. Replace `window.storage` with localStorage / Supabase / Firebase
4. Add Anthropic API key to env vars
5. Update `callAI` with auth header:
   ```javascript
   headers: {
     "Content-Type": "application/json",
     "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY,
     "anthropic-version": "2023-06-01",
   }
   ```
6. Deploy to Vercel / Netlify / Cloudflare Pages

### 5.3 Mobile PWA

1. Deploy as standalone (5.2)
2. Add `manifest.json` (name, display: standalone, theme_color)
3. Add service worker for offline notes
4. Install to home screen on iPhone/Android

---

## 6. Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| "Speech Recognition unavailable" | Unsupported browser | Use Chrome or Edge |
| Recording stops after ~60s | Browser timeout | `onend` auto-restarts; check mic permissions |
| AI returns "No response" | Rate limit or network | Wait, retry |
| Gibberish transcript | Background noise | Move closer to mic; use Notes as backup |
| Session data missing | Storage write failed | Check storage quota; clear old sessions |
| Theme resets | `fc3-theme` not persisting | Check storage API availability |
| Export file empty | No content in session | Add notes or transcript first |
| Wrong tag times | Timer is relative | Times are from recording start, not wall clock (by design) |
