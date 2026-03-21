import { Router } from 'express';
import pool from '../db.js';

const router = Router();

const DEFAULTS: Record<string, unknown> = {
  ai_model: 'gpt-4o-mini',
  prompts: {
    structure: '',
    questions: '',
    domain: '',
    solutions: '',
  },
  industries: [
    'Renewable Energy',
    'Cloud Infrastructure',
    'Financial Services',
    'Autonomous Logistics',
    'Healthcare',
    'Aerospace',
  ],
  webhook_url: '',
  theme_default: 'dark',
  export_defaults: {
    format: 'markdown',
    includeSections: ['transcript', 'notes', 'structured', 'questions', 'solutions'],
  },
  speech_settings: {
    language: 'en-US',
    continuous: true,
  },
};

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT key, value FROM settings');
    const settings: Record<string, unknown> = { ...DEFAULTS };
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    if (!settings.ai_model || settings.ai_model === 'gpt-4o-mini') {
      settings.ai_model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    }
    res.json(settings);
  } catch (err) {
    console.error('[settings] get error:', err);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

router.put('/', async (req, res) => {
  try {
    const data = req.body as Record<string, unknown>;
    const validKeys = Object.keys(DEFAULTS);

    for (const [key, value] of Object.entries(data)) {
      if (!validKeys.includes(key)) continue;
      await pool.query(
        `INSERT INTO settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key)
         DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, JSON.stringify(value)]
      );
    }

    const { rows } = await pool.query('SELECT key, value FROM settings');
    const settings: Record<string, unknown> = { ...DEFAULTS };
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    res.json(settings);
  } catch (err) {
    console.error('[settings] put error:', err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

router.post('/test-webhook', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) { res.status(400).json({ error: 'URL is required' }); return; }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        test: true,
        source: 'TouchGrass',
        timestamp: new Date().toISOString(),
      }),
    });

    res.json({ success: response.ok, status: response.status });
  } catch (err) {
    console.error('[settings] webhook test error:', err);
    res.status(500).json({ error: 'Webhook test failed' });
  }
});

export default router;

export async function getSetting<T>(key: string): Promise<T | null> {
  try {
    const { rows } = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
    if (rows.length === 0) return null;
    return rows[0].value as T;
  } catch {
    return null;
  }
}
