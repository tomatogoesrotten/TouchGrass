# Field Visit Companion — Product Requirements Document

**Version:** 1.0  
**Last Updated:** March 2026  
**Status:** MVP Complete — v2 Planned

---

## 1. Executive Summary

Field Companion is a web application for junior software engineers at horizontal SaaS companies who conduct client field visits. It addresses five pain points: slow note-taking, messy disorganized notes, inability to form good questions in real-time, risky premature solution-sharing, and unfamiliar domain knowledge. The tool covers the full lifecycle of a meeting — pre-meeting setup, live capture, and post-meeting AI-powered structuring.

### 1.1 Target User

Junior software engineer at a horizontal SaaS company serving clients across many industries. Attends meetings on-site or virtually, usually alongside a senior colleague. Uses a mix of iPhone, Samsung, and laptop. Familiar with Notion, n8n, and the Anthropic API.

### 1.2 Problem-Solution Mapping

| # | Problem | Impact | Solution Module |
|---|---------|--------|-----------------|
| P1 | Takes notes too slowly, misses crucial points | Incomplete records | Record Tab — live speech-to-text |
| P2 | Notes scattered across devices, no structure | Post-meeting chaos | Structure Tab — AI organizes notes |
| P3 | Can't ask good questions on the spot | Appears unprepared | Questions Tab — templates + AI follow-ups |
| P4 | Saying solutions aloud creates false commitments | Scope creep, misaligned expectations | Solutions Tab — private AI-reviewed brainstorming |
| P5 | Unfamiliar with client industry jargon | Confusion, missed requirements | Domain Tab — contextual term lookup |

---

## 2. Architecture

### 2.1 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React (JSX, hooks) | UI rendering |
| AI | Anthropic Messages API (`claude-sonnet-4-20250514`) | All AI features |
| Speech | Web Speech API (`SpeechRecognition`) | Live transcription |
| Storage | `window.storage` (artifact persistent KV) | Session persistence |
| Export | Blob API + anchor download | Markdown export |
| Styling | Inline JS + injected CSS | Theme system, glass morphism |

### 2.2 View State Machine

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────────────────┐
│  Dashboard   │────▶│    Setup     │────▶│   Session                       │
│  (view:dash) │     │ (view:setup) │     │ (view:session)                  │
│              │◀────│              │     │                                 │
│              │     └─────────────┘     │  ┌────────┬───────┬──────────┐  │
│              │◀────────────────────────│  │Record  │Notes  │Structure │  │
│              │     goHome (save+exit)  │  │Questions│Domain │Solutions │  │
└──────────────┘                         │  └────────┴───────┴──────────┘  │
                                         └─────────────────────────────────┘
```

---

## 3. Data Model

### 3.1 Session Object

```
Session {
  id:                 string     "s_{timestamp}" unique ID
  client:             string     Company name (required)
  industry:           string     Client industry (required)
  phase:              PhaseId    "requirements"|"followup"|"demo"|"troubleshoot"
  attendees:          string     Free-text list of people
  date:               string     ISO "YYYY-MM-DD"
  createdAt:          number     Unix ms
  updatedAt:          number     Unix ms — updated every save

  transcript:         string     Accumulated speech-to-text
  manualNotes:        string     Free-form typed notes
  quickTags:          QuickTag[] Timestamped bookmarks

  structuredNotes:    string     AI output — organized notes (Markdown)
  aiQuestions:        string     AI output — follow-up questions (Markdown)
  privateSolutions:   string     User's raw solution ideas
  aiSolutionFeedback: string     AI output — solution review (Markdown)
}

QuickTag {
  id:   number   Date.now() at creation
  tag:  string   e.g. "⚠️ Important"
  time: string   "MM:SS" relative to recording start
}
```

### 3.2 Meeting Phases

| Phase | Icon | Dark Color | Light Color | Starter Qs |
|-------|------|-----------|-------------|------------|
| Requirements | 📋 | #00e5a0 | #00b37e | 5 |
| Follow-up | 🔄 | #a78bfa | #7c5ccf | 4 |
| Demo | 🖥️ | #fbbf24 | #d99a00 | 4 |
| Troubleshoot | 🔧 | #f87171 | #dc3545 | 4 |

### 3.3 Storage Schema

| Key | Value | Purpose |
|-----|-------|---------|
| `fc3-idx` | JSON array of SessionMeta | Dashboard listing (lightweight, no full content) |
| `fc3:{session_id}` | JSON Session | Full session data |
| `fc3-theme` | `"dark"` or `"light"` | Theme preference |

**SessionMeta** contains only: `id`, `client`, `industry`, `phase`, `date`, `updatedAt`.

**Write strategy:** Dual-write on every save — update both the full session record and its index entry. Index entries are replaced in-place if existing, or prepended if new.

**Auto-save:** 1000ms debounce after any content change (transcript, notes, tags, AI results). Prevents excessive writes while ensuring no data loss.

---

## 4. Feature Specifications

### 4.1 Dashboard

**Stats (computed on render):**
- Total Sessions: `sessions.length`
- This Week: sessions where `now - updatedAt < 7 days`
- Industries: unique count of `session.industry`

**Search:** Case-insensitive substring match on `client` or `industry`.
**Filter:** Phase pills toggle `filterPhase`. Cards show if `session.phase === filterPhase` or "all".
**Sort:** `updatedAt` descending.
**Delete:** Card ✕ → modal confirmation → `DB.del(id)` → removes from storage + index → reloads.
**Animation:** Staggered fade-up, 40ms delay per card, triggered via double-`requestAnimationFrame`.

### 4.2 Session Setup

Required: `client` and `industry` (button disabled at 35% opacity otherwise).
On confirm: session persisted, index reloaded, transitions to Session → Record tab.

### 4.3 Record Tab

**Speech Recognition config:**
- `continuous: true` — stays on until manually stopped
- `interimResults: true` — partial results shown but only `isFinal` persisted
- `lang: "en-US"`
- Auto-restart: `onend` re-calls `start()` if ref active (handles browser timeouts)
- Error: suppresses `no-speech`, surfaces others via toast

**Transcript accumulation:** Final chunks appended with trailing space. Auto-saved.

**Timer:** `setInterval(1000ms)` counting seconds, displayed `MM:SS`.

**Quick Tags (5 types):**

| Tag | Purpose |
|-----|---------|
| ⚠️ Important | Key point, critical requirement |
| ❓ Question | Needs follow-up |
| ✅ Decision | Agreement made |
| 📌 Action Item | Task assigned |
| 🤔 Unclear | Confusing, ambiguous |

Each captures current recording timestamp + unique ID. Individually removable.

**Fallback:** If Speech API unavailable, shows warning directing to Notes tab. Works in Chrome/Edge.

### 4.4 Notes Tab

Free-form textarea (user-resizable, min 200px). Word count + transcript status displayed. All changes auto-saved.

### 4.5 Structure Tab

**Input assembled from:**
```
TRANSCRIPT: {transcript}
NOTES: {manualNotes}
TAGS: [{time}] {tag} per line
```

**System prompt:** `"Structure meeting notes for SaaS engineer. Industry: "{industry}". Phase: {phase}. Sections: Key Points, Requirements/Issues, Decisions, Action Items, Unclear. Flag domain terms. Markdown."`

Output stored in `structuredNotes`. Re-runnable ("Re-structure Notes").
Disabled if both transcript and notes are empty.

### 4.6 Questions Tab

**Layer 1 — Static Starter Templates:** Pre-built questions per phase in glass cards, available immediately (no AI call). For use during the meeting.

**Layer 2 — AI Follow-ups:**
System prompt: `"Help junior engineer with follow-up questions. Industry: "{industry}". Phase: {phase}. 5-8 questions by priority. Why each matters. Markdown."`

Input: transcript + notes + structured notes (if generated).
Output: questions organized as Critical / Important / Nice-to-have with rationale.

### 4.7 Domain Tab

User enters a term. System prompt: `"Domain assistant for SaaS engineer. Industry: "{industry}". Explain: definition, industry relevance, software implications. 3-5 sentences."`

Designed for discreet mid-meeting use. Quick input → quick output.

### 4.8 Solutions Tab (Private)

Visually differentiated: warning-colored card, 🔒 icon, "Private" badge on tab.

System prompt: `"Senior engineer reviewing ideas PRIVATELY. For each: feasibility, client-facing risks, better framing, alternatives. Kind but direct. Markdown."`

Context: industry, phase, meeting transcript/notes, user's raw ideas.
Output per idea: feasibility, risk of telling client, professional framing, alternatives.

### 4.9 Export

**Format:** Markdown (.md)
**Filename:** `visit-{client-slug}-{YYYY-MM-DD}.md`
**Sections:** Header (client/date/industry/phase/attendees), Transcript, Notes, Tags, Structured Notes, Follow-up Questions, Private Solutions (marked INTERNAL), AI Review.
**Mechanism:** Blob → createObjectURL → anchor click → revokeObjectURL.

### 4.10 Theme System

Two full palettes (30+ tokens each) in a `themes` object. Active palette via React Context.
Persisted to `fc3-theme` storage key. Toggle available on every view.
Gradient mesh: 3 fixed radial gradients (teal, purple, amber) behind all content, opacities adjust per theme.

---

## 5. AI Integration

### 5.1 Configuration

| Parameter | Value |
|-----------|-------|
| Endpoint | `https://api.anthropic.com/v1/messages` |
| Model | `claude-sonnet-4-20250514` |
| Max tokens | 1000 |
| Auth | Handled by artifact runtime |

### 5.2 Prompt Pattern

All calls follow: system prompt (role + industry + phase + format) + user message (assembled meeting data). Output is always Markdown.

### 5.3 Error Handling

All calls wrapped in try/catch. Failure surfaces "AI connection error. Please try again." Loading states cleared in both paths.

### 5.4 AI Function Summary

| Function | Trigger | System Role | Input | Output |
|----------|---------|-------------|-------|--------|
| `doStruct` | Structure tab button | Note structurer | transcript + notes + tags | 5-section Markdown |
| `doQs` | Questions tab button | Senior colleague | transcript + notes + structured | Priority-tiered questions |
| `doDom` | Domain tab lookup | Domain assistant | single term | 3-5 sentence explanation |
| `doSol` | Solutions tab button | Senior reviewer | transcript/notes + ideas | Feasibility + risk analysis |

---

## 6. Markdown Renderer

Lightweight custom parser (no library dependency):

| Pattern | Element | Styling |
|---------|---------|---------|
| `# text` | h2 | 17px bold, primary |
| `## text` | h3 | 15px bold, accent |
| `### text` | h4 | 13.5px bold, primary |
| `- **bold**: text` | styled p | accent left-border, bold label |
| `- text` | p | subtle left-border |
| `---` | hr | 1px border |
| empty | div | 5px spacer |
| other | p | 13.5px, soft color |

---

## 7. Performance

| Area | Strategy |
|------|----------|
| Auto-save | 1000ms debounce |
| Dashboard index | Lightweight metadata only |
| Speech | Only isFinal persisted |
| Timer | Single setInterval, cleaned on unmount |
| Theme CSS | Regenerated on toggle only |
| Animations | requestAnimationFrame for paint-before-transition |

---

## 8. Limitations & Roadmap

### 8.1 Current Limitations

| Limitation | Workaround |
|-----------|-----------|
| Speech API: Chrome/Edge only | Manual notes fallback |
| English only (en-US) | Manual notes for other languages |
| No audio recording/playback | Use phone recorder separately |
| No multi-user sharing | Export and share markdown |
| 1000 max_tokens may truncate | Re-run with focused input |
| Requires internet for AI | Manual notes work offline |

### 8.2 v2 Roadmap

| Feature | Priority | Description |
|---------|----------|-------------|
| n8n webhook export | High | POST session JSON to n8n on export/close |
| Whisper transcription | High | Upload audio for higher accuracy |
| Session duplication | Medium | Clone for recurring client meetings |
| Custom quick tags | Medium | User-defined tag types |
| Session templates | Medium | Pre-built per client/industry |
| Client knowledge base | Low | Accumulate domain lookups into glossary |

---

## 9. Acceptance Criteria

| Flow | Expected |
|------|----------|
| Create session (client + industry) | Appears in dashboard, opens Record tab |
| Record in Chrome | Transcript accumulates, auto-saves |
| Quick tags during recording | Correct timestamp, persist on reload |
| Manual notes | Auto-save, word count updates |
| Structure notes | AI returns 5-section markdown |
| Generate questions | Priority-tiered questions with rationale |
| Domain lookup | 3-5 sentences contextualized to industry |
| Review solutions | Feasibility + risk per idea |
| Export | .md file downloads, all sections present |
| Theme toggle | Colors update, persists on reload |
| Delete session | Modal → removed from dashboard + storage |
| Revisit session | All content loads, editable |
| Reopen app | Dashboard shows all sessions, theme preserved |
