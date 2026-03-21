import { Router } from 'express';
import OpenAI from 'openai';
import pool from '../db.js';
import {
  structurePrompt,
  questionsPrompt,
  domainPrompt,
  solutionsPrompt,
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

export default router;
