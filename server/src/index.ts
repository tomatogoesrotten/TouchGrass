import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { migrate } from './db.js';
import sessionsRouter from './routes/sessions.js';
import aiRouter from './routes/ai.js';
import exportRouter from './routes/export.js';
import analyticsRouter from './routes/analytics.js';
import settingsRouter from './routes/settings.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/sessions', sessionsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/export', exportRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/settings', settingsRouter);

async function start() {
  await migrate();
  app.listen(port, '0.0.0.0', () => {
    console.log(`[server] listening on port ${port}`);
  });
}

start().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
