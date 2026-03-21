import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, client, industry, phase, date, time, updated_at
       FROM sessions ORDER BY updated_at DESC`
    );
    const sessions = rows.map((r) => ({
      id: r.id,
      client: r.client,
      industry: r.industry,
      phase: r.phase,
      date: r.date,
      time: r.time,
      updatedAt: r.updated_at,
    }));
    res.json(sessions);
  } catch (err) {
    console.error('[sessions] list error:', err);
    res.status(500).json({ error: 'Failed to list sessions' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { client, industry, phase, attendees } = req.body;
    if (!client || !industry || !phase) {
      res.status(400).json({ error: 'client, industry, and phase are required' });
      return;
    }
    const { rows } = await pool.query(
      `INSERT INTO sessions (client, industry, phase, attendees)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [client, industry, phase, attendees ?? '']
    );
    res.status(201).json(formatSession(rows[0]));
  } catch (err) {
    console.error('[sessions] create error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM sessions WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.json(formatSession(rows[0]));
  } catch (err) {
    console.error('[sessions] get error:', err);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const allowed = [
      'client', 'industry', 'phase', 'attendees',
      'transcript', 'manual_notes', 'quick_tags',
      'structured_notes', 'ai_questions',
      'private_solutions', 'ai_solution_feedback',
    ];
    const camelToSnake: Record<string, string> = {
      manualNotes: 'manual_notes',
      quickTags: 'quick_tags',
      structuredNotes: 'structured_notes',
      aiQuestions: 'ai_questions',
      privateSolutions: 'private_solutions',
      aiSolutionFeedback: 'ai_solution_feedback',
    };

    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(req.body)) {
      const col = camelToSnake[key] ?? key;
      if (!allowed.includes(col)) continue;
      if (col === 'quick_tags') {
        sets.push(`${col} = $${idx}::jsonb`);
      } else {
        sets.push(`${col} = $${idx}`);
      }
      values.push(col === 'quick_tags' ? JSON.stringify(value) : value);
      idx++;
    }

    if (sets.length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    sets.push(`updated_at = NOW()`);
    values.push(req.params.id);

    const { rows } = await pool.query(
      `UPDATE sessions SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.json(formatSession(rows[0]));
  } catch (err) {
    console.error('[sessions] update error:', err);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM sessions WHERE id = $1', [req.params.id]);
    if (rowCount === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[sessions] delete error:', err);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

function formatSession(row: Record<string, unknown>) {
  return {
    id: row.id,
    client: row.client,
    industry: row.industry,
    phase: row.phase,
    attendees: row.attendees,
    date: row.date,
    time: row.time,
    transcript: row.transcript,
    manualNotes: row.manual_notes,
    quickTags: row.quick_tags,
    structuredNotes: row.structured_notes,
    aiQuestions: row.ai_questions,
    privateSolutions: row.private_solutions,
    aiSolutionFeedback: row.ai_solution_feedback,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default router;
