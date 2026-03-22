import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client                TEXT NOT NULL,
      industry              TEXT NOT NULL,
      phase                 TEXT NOT NULL CHECK (phase IN ('requirements','follow-up','demo','troubleshoot')),
      attendees             TEXT DEFAULT '',
      date                  DATE NOT NULL DEFAULT CURRENT_DATE,
      time                  TIME NOT NULL DEFAULT CURRENT_TIME,

      transcript            TEXT DEFAULT '',
      manual_notes          TEXT DEFAULT '',
      quick_tags            JSONB DEFAULT '[]'::jsonb,

      structured_notes      TEXT DEFAULT '',
      ai_questions          TEXT DEFAULT '',
      private_solutions     TEXT DEFAULT '',
      ai_solution_feedback  TEXT DEFAULT '',

      created_at            TIMESTAMPTZ DEFAULT NOW(),
      updated_at            TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key         TEXT PRIMARY KEY,
      value       JSONB NOT NULL,
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query(`
    ALTER TABLE sessions ADD COLUMN IF NOT EXISTS audio_data TEXT DEFAULT '';
  `);
  await pool.query(`
    ALTER TABLE sessions ADD COLUMN IF NOT EXISTS audio_mime TEXT DEFAULT '';
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audio_segments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      audio_data TEXT NOT NULL,
      audio_mime TEXT NOT NULL DEFAULT 'audio/webm',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query(`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS action_plan TEXT DEFAULT '';`);
  await pool.query(`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS plan_chat JSONB DEFAULT '[]'::jsonb;`);
  console.log('[db] migration complete');
}

export default pool;
