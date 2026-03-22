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
      date: formatDate(r.date),
      time: formatTime(r.time),
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

// Audio segments — POST adds a new segment
router.post('/:id/audio', async (req, res) => {
  try {
    const { audio, mimeType } = req.body;
    if (!audio) {
      res.status(400).json({ error: 'audio data is required' });
      return;
    }
    // Verify session exists
    const { rows: sessionRows } = await pool.query('SELECT id FROM sessions WHERE id = $1', [req.params.id]);
    if (sessionRows.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    const { rows } = await pool.query(
      `INSERT INTO audio_segments (session_id, audio_data, audio_mime)
       VALUES ($1, $2, $3) RETURNING id, created_at`,
      [req.params.id, audio, mimeType || 'audio/webm']
    );
    await pool.query('UPDATE sessions SET updated_at = NOW() WHERE id = $1', [req.params.id]);
    res.status(201).json({ id: rows[0].id, createdAt: rows[0].created_at });
  } catch (err) {
    console.error('[sessions] audio segment upload error:', err);
    res.status(500).json({ error: 'Failed to upload audio segment' });
  }
});

// Audio segments — GET returns all segments (with backward compat for legacy audio_data)
router.get('/:id/audio', async (req, res) => {
  try {
    // Check new segments table first
    const { rows } = await pool.query(
      'SELECT id, audio_data, audio_mime, created_at FROM audio_segments WHERE session_id = $1 ORDER BY created_at',
      [req.params.id]
    );
    if (rows.length > 0) {
      res.json(rows.map((r) => ({
        id: r.id,
        audio: r.audio_data,
        mimeType: r.audio_mime,
        createdAt: r.created_at,
      })));
      return;
    }
    // Fall back to legacy audio_data column
    const { rows: sessionRows } = await pool.query(
      'SELECT audio_data, audio_mime FROM sessions WHERE id = $1',
      [req.params.id]
    );
    if (sessionRows.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    if (sessionRows[0].audio_data) {
      res.json([{
        id: 'legacy',
        audio: sessionRows[0].audio_data,
        mimeType: sessionRows[0].audio_mime || 'audio/webm',
        createdAt: null,
      }]);
      return;
    }
    res.json([]);
  } catch (err) {
    console.error('[sessions] audio segments fetch error:', err);
    res.status(500).json({ error: 'Failed to get audio segments' });
  }
});

// Audio segments — DELETE one segment
router.delete('/:id/audio/:segmentId', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM audio_segments WHERE id = $1 AND session_id = $2',
      [req.params.segmentId, req.params.id]
    );
    if (rowCount === 0) {
      res.status(404).json({ error: 'Segment not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[sessions] audio segment delete error:', err);
    res.status(500).json({ error: 'Failed to delete audio segment' });
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

function formatDate(val: unknown): string {
  if (!val) return '';
  const d = val instanceof Date ? val : new Date(String(val));
  if (isNaN(d.getTime())) return String(val);
  return d.toISOString().slice(0, 10); // "2026-03-21"
}

function formatTime(val: unknown): string {
  if (!val) return '';
  const str = String(val);
  // PostgreSQL TIME comes as "HH:MM:SS.microseconds" — trim to HH:MM
  const match = str.match(/^(\d{2}:\d{2})/);
  return match ? match[1] : str;
}

function formatSession(row: Record<string, unknown>) {
  return {
    id: row.id,
    client: row.client,
    industry: row.industry,
    phase: row.phase,
    attendees: row.attendees,
    date: formatDate(row.date),
    time: formatTime(row.time),
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
