import { Router } from 'express';
import OpenAI from 'openai';
import pool from '../db.js';
import {
  structurePrompt,
  questionsPrompt,
  domainPrompt,
  solutionsPrompt,
  planPrompt,
  planChatPrompt,
} from '../prompts.js';
import { getSetting } from './settings.js';

const router = Router();

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function getModel() {
  const override = await getSetting<string>('ai_model');
  return override || process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

async function getSession(id: string) {
  const { rows } = await pool.query('SELECT * FROM sessions WHERE id = $1', [id]);
  return rows[0] ?? null;
}

function buildContext(session: Record<string, unknown>): string {
  const parts: string[] = [];
  if (session.transcript) parts.push(`TRANSCRIPT:\n${session.transcript}`);
  if (session.manual_notes) parts.push(`NOTES:\n${session.manual_notes}`);
  if (session.quick_tags && Array.isArray(session.quick_tags)) {
    const tagLines = (session.quick_tags as Array<Record<string, string>>)
      .map((t) => `[${t.time}] ${t.emoji} ${t.label} — ${t.note}`)
      .join('\n');
    if (tagLines) parts.push(`TAGS:\n${tagLines}`);
  }
  return parts.join('\n\n');
}

router.post('/structure', async (req, res) => {
  try {
    const session = await getSession(req.body.sessionId);
    if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

    const context = buildContext(session);
    if (!context.trim()) {
      res.status(400).json({ error: 'No transcript or notes to structure' });
      return;
    }

    const openai = getClient();
    const [model, prompt] = await Promise.all([
      getModel(),
      structurePrompt(session.industry as string, session.phase as string),
    ]);
    const completion = await openai.chat.completions.create({
      model,
      max_tokens: 1500,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: context },
      ],
    });

    const result = completion.choices[0]?.message?.content ?? '';
    await pool.query(
      `UPDATE sessions SET structured_notes = $1, updated_at = NOW() WHERE id = $2`,
      [result, session.id]
    );

    res.json({ result });
  } catch (err) {
    console.error('[ai] structure error:', err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

router.post('/questions', async (req, res) => {
  try {
    const session = await getSession(req.body.sessionId);
    if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

    let context = buildContext(session);
    if (session.structured_notes) {
      context += `\n\nSTRUCTURED NOTES:\n${session.structured_notes}`;
    }

    const openai = getClient();
    const [model, prompt] = await Promise.all([
      getModel(),
      questionsPrompt(session.industry as string, session.phase as string),
    ]);
    const completion = await openai.chat.completions.create({
      model,
      max_tokens: 1500,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: context || 'No meeting data available yet. Generate general questions for this phase.' },
      ],
    });

    const result = completion.choices[0]?.message?.content ?? '';
    await pool.query(
      `UPDATE sessions SET ai_questions = $1, updated_at = NOW() WHERE id = $2`,
      [result, session.id]
    );

    res.json({ result });
  } catch (err) {
    console.error('[ai] questions error:', err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

router.post('/domain', async (req, res) => {
  try {
    const { sessionId, term } = req.body;
    if (!term) { res.status(400).json({ error: 'term is required' }); return; }

    const session = await getSession(sessionId);
    if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

    const openai = getClient();
    const [model, prompt] = await Promise.all([
      getModel(),
      domainPrompt(session.industry as string),
    ]);
    const completion = await openai.chat.completions.create({
      model,
      max_tokens: 500,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Explain: ${term}` },
      ],
    });

    const result = completion.choices[0]?.message?.content ?? '';
    res.json({ result });
  } catch (err) {
    console.error('[ai] domain error:', err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

router.post('/solutions', async (req, res) => {
  try {
    const session = await getSession(req.body.sessionId);
    if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

    if (!session.private_solutions) {
      res.status(400).json({ error: 'No solution ideas to review' });
      return;
    }

    let context = buildContext(session);
    context += `\n\nMY SOLUTION IDEAS:\n${session.private_solutions}`;

    const openai = getClient();
    const [model, prompt] = await Promise.all([
      getModel(),
      solutionsPrompt(session.industry as string, session.phase as string),
    ]);
    const completion = await openai.chat.completions.create({
      model,
      max_tokens: 1500,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: context },
      ],
    });

    const result = completion.choices[0]?.message?.content ?? '';
    await pool.query(
      `UPDATE sessions SET ai_solution_feedback = $1, updated_at = NOW() WHERE id = $2`,
      [result, session.id]
    );

    res.json({ result });
  } catch (err) {
    console.error('[ai] solutions error:', err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

router.post('/plan', async (req, res) => {
  try {
    const session = await getSession(req.body.sessionId);
    if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

    let context = buildContext(session);
    if (session.structured_notes) context += `\n\nSTRUCTURED NOTES:\n${session.structured_notes}`;
    if (session.ai_questions) context += `\n\nAI QUESTIONS:\n${session.ai_questions}`;
    if (session.private_solutions) context += `\n\nSOLUTION IDEAS:\n${session.private_solutions}`;
    if (session.ai_solution_feedback) context += `\n\nSOLUTION FEEDBACK:\n${session.ai_solution_feedback}`;

    if (!context.trim()) {
      res.status(400).json({ error: 'No session data to generate a plan from' });
      return;
    }

    const openai = getClient();
    const model = await getModel();
    const prompt = planPrompt(session.industry as string, session.phase as string);

    const completion = await openai.chat.completions.create({
      model,
      max_tokens: 3000,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: context },
      ],
    });

    const result = completion.choices[0]?.message?.content ?? '';
    await pool.query(
      `UPDATE sessions SET action_plan = $1, plan_chat = '[]'::jsonb, updated_at = NOW() WHERE id = $2`,
      [result, session.id]
    );

    res.json({ result });
  } catch (err) {
    console.error('[ai] plan error:', err);
    res.status(500).json({ error: 'Plan generation failed' });
  }
});

router.post('/plan/chat', async (req, res) => {
  try {
    const { sessionId, messages, currentPlan } = req.body;
    if (!sessionId || !messages || !currentPlan) {
      res.status(400).json({ error: 'sessionId, messages, and currentPlan are required' });
      return;
    }

    const session = await getSession(sessionId);
    if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

    let context = buildContext(session);
    if (session.structured_notes) context += `\n\nSTRUCTURED NOTES:\n${session.structured_notes}`;

    const openai = getClient();
    const model = await getModel();
    const systemPrompt = planChatPrompt(session.industry as string, currentPlan);

    const chatMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt + `\n\nMeeting context:\n${context}` },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
      messages: chatMessages,
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    let parsed: { plan?: string | null; message?: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { plan: null, message: raw };
    }

    const updatedPlan = parsed.plan || currentPlan;
    const reply = parsed.message || 'Done.';

    // Save updated plan and chat history
    const allMessages = [...messages, { role: 'assistant', content: reply }];
    await pool.query(
      `UPDATE sessions SET action_plan = $1, plan_chat = $2::jsonb, updated_at = NOW() WHERE id = $3`,
      [updatedPlan, JSON.stringify(allMessages), session.id]
    );

    res.json({ message: reply, plan: updatedPlan });
  } catch (err) {
    console.error('[ai] plan chat error:', err);
    res.status(500).json({ error: 'Plan chat failed' });
  }
});

router.post('/transcribe', async (req, res) => {
  try {
    const { audio, mimeType, sessionId } = req.body;
    if (!audio) {
      res.status(400).json({ error: 'audio data is required' });
      return;
    }

    const ext = mimeType?.includes('mp4') ? 'mp4'
      : mimeType?.includes('ogg') ? 'ogg'
      : 'webm';

    const buffer = Buffer.from(audio, 'base64');
    const file = new File([buffer], `recording.${ext}`, { type: mimeType || 'audio/webm' });

    const openai = getClient();
    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file,
    });

    const rawText = transcription.text || '';
    if (!rawText.trim()) {
      res.json({ result: '' });
      return;
    }

    // Speaker diarization via GPT
    let attendees = '';
    let industry = '';
    if (sessionId) {
      const session = await getSession(sessionId);
      if (session) {
        attendees = (session.attendees as string) || '';
        industry = (session.industry as string) || '';
      }
    }

    const model = await getModel();
    const diarizePrompt = `You are a meeting transcript formatter. Identify distinct speakers in this raw transcript and label them.

Rules:
- Detect speaker changes based on topic shifts, question-answer patterns, and conversational flow
- Label speakers as "Person 1", "Person 2", etc.${attendees ? `\n- Known attendees: ${attendees}. If you can match speakers to names, use the actual names` : ''}
- Format each speaker turn on its own line: "Person 1: their exact words"
- Keep the original words verbatim — only add speaker labels and line breaks between turns
- If it's clearly a single speaker (monologue), label everything under "Person 1:"
- Do NOT add commentary, summaries, or analysis — only the labeled transcript
${industry ? `\nMeeting context: ${industry} industry` : ''}`;

    try {
      const completion = await openai.chat.completions.create({
        model,
        max_tokens: 2000,
        messages: [
          { role: 'system', content: diarizePrompt },
          { role: 'user', content: rawText },
        ],
      });
      const diarized = completion.choices[0]?.message?.content || rawText;
      res.json({ result: diarized });
    } catch (diarizeErr) {
      // If diarization fails, return raw transcript
      console.error('[ai] diarization failed, returning raw:', diarizeErr);
      res.json({ result: rawText });
    }
  } catch (err) {
    console.error('[ai] transcribe error:', err);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

export default router;
