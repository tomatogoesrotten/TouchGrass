import { getSetting } from './routes/settings.js';

interface PromptOverrides {
  structure: string;
  questions: string;
  domain: string;
  solutions: string;
}

let cachedOverrides: PromptOverrides | null = null;
let cacheTime = 0;
const CACHE_TTL = 30_000;

async function getOverrides(): Promise<PromptOverrides> {
  if (cachedOverrides && Date.now() - cacheTime < CACHE_TTL) return cachedOverrides;
  const overrides = await getSetting<PromptOverrides>('prompts');
  cachedOverrides = overrides || { structure: '', questions: '', domain: '', solutions: '' };
  cacheTime = Date.now();
  return cachedOverrides;
}

const defaultStructure = (industry: string, phase: string) =>
  `You are a professional note structurer for a SaaS engineer. The engineer just attended a client meeting.

Industry: "${industry}"
Meeting Phase: ${phase}

Organize the raw meeting data into these sections using Markdown:
## Key Points
## Requirements / Issues
## Decisions Made
## Action Items
## Unclear / Needs Clarification

Flag any domain-specific terms and briefly explain them. Be concise and professional.`;

const defaultQuestions = (industry: string, phase: string) =>
  `You are a senior colleague helping a junior SaaS engineer prepare follow-up questions after a client meeting.

Industry: "${industry}"
Meeting Phase: ${phase}

Generate 5-8 follow-up questions organized by priority:
### Critical
### Important
### Nice-to-have

For each question, include a brief rationale explaining why it matters. Use Markdown formatting.`;

const defaultDomain = (industry: string) =>
  `You are a domain knowledge assistant for a SaaS engineer working with clients in the "${industry}" industry.

When given a term or concept, provide:
1. A clear definition
2. Why it matters in this industry
3. Implications for software solutions

Keep it to 3-5 sentences. Be practical and relevant.`;

const defaultSolutions = (industry: string, phase: string) =>
  `You are a senior software engineer privately reviewing a junior colleague's solution ideas after a client meeting. This review is NEVER shown to clients.

Industry: "${industry}"
Meeting Phase: ${phase}

For each idea, assess:
- **Feasibility**: Can this be built? What's the effort?
- **Client-Facing Risk**: What could go wrong if this were promised?
- **Professional Framing**: How to present this idea safely
- **Alternatives**: Better approaches to consider

Be kind but direct. Use Markdown formatting.`;

export async function structurePrompt(industry: string, phase: string) {
  const o = await getOverrides();
  return o.structure || defaultStructure(industry, phase);
}

export async function questionsPrompt(industry: string, phase: string) {
  const o = await getOverrides();
  return o.questions || defaultQuestions(industry, phase);
}

export async function domainPrompt(industry: string) {
  const o = await getOverrides();
  return o.domain || defaultDomain(industry);
}

export async function solutionsPrompt(industry: string, phase: string) {
  const o = await getOverrides();
  return o.solutions || defaultSolutions(industry, phase);
}

export function planPrompt(industry: string, phase: string) {
  return `You are a senior software architect creating an implementation plan from client meeting data. Generate a practical, copy-pasteable PRD optimized for AI-assisted development ("vibe coding").

Industry: "${industry}"
Meeting Phase: ${phase}

Create a comprehensive plan in Markdown with these sections:

# Implementation Plan: [Brief Descriptive Title]

## Problem Statement
2-3 sentence summary of what the client needs built or solved.

## Requirements
### Must-Have
- Numbered, specific requirements
### Nice-to-Have
- Stretch goals

## Technical Approach
Architecture decisions, key patterns, and technology choices with brief rationale.

## Implementation Steps
Ordered phases with concrete steps:
### Phase 1: Core
1. **Step name** — Description (Complexity: Low/Medium/High)
### Phase 2: Enhancements
...

## Data Model
Key entities, their fields, and relationships. Use code blocks if helpful.

## API Design
Key endpoints: method, path, request/response shape.

## UI/UX Components
Key screens and components needed.

## Edge Cases & Risks
Potential issues and mitigations.

## Acceptance Criteria
Bullet list of how to verify the implementation is complete.

Be specific and actionable — every section should be detailed enough to paste directly into an AI coding assistant and start building.`;
}

export function planChatPrompt(industry: string, currentPlan: string) {
  return `You are a senior software architect helping refine an implementation plan through conversation. You have the meeting context and the current plan.

Industry: "${industry}"

When the user asks for changes to the plan, respond with a JSON object containing two fields:
- "plan": the FULL updated plan in markdown (include ALL sections, not just changed parts)
- "message": a brief conversational explanation of what you changed and why

When the user asks a question that does NOT require plan changes, respond with:
- "plan": null
- "message": your conversational answer

IMPORTANT: Your entire response must be valid JSON. Nothing outside the JSON object.

Current plan:
${currentPlan}`;
}

export { defaultStructure, defaultQuestions, defaultDomain, defaultSolutions };

