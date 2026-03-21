import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/summary', async (req, res) => {
  try {
    const range = (req.query.range as string) || 'all';
    let dateFilter = '';
    if (range === '7d') dateFilter = "AND created_at >= NOW() - INTERVAL '7 days'";
    else if (range === '30d') dateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
    else if (range === '90d') dateFilter = "AND created_at >= NOW() - INTERVAL '90 days'";

    const [
      phaseResult,
      industryResult,
      timelineResult,
      heatmapResult,
      tagResult,
      aiResult,
      funnelResult,
      totalsResult,
    ] = await Promise.all([
      pool.query(`
        SELECT phase, COUNT(*)::int AS count
        FROM sessions WHERE 1=1 ${dateFilter}
        GROUP BY phase ORDER BY count DESC
      `),
      pool.query(`
        SELECT industry, COUNT(*)::int AS count
        FROM sessions WHERE 1=1 ${dateFilter}
        GROUP BY industry ORDER BY count DESC
      `),
      pool.query(`
        SELECT DATE_TRUNC('week', created_at)::date AS date, COUNT(*)::int AS count
        FROM sessions WHERE 1=1 ${dateFilter}
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY date
      `),
      pool.query(`
        SELECT created_at::date AS date, COUNT(*)::int AS count
        FROM sessions
        WHERE created_at >= NOW() - INTERVAL '365 days'
        GROUP BY created_at::date ORDER BY date
      `),
      pool.query(`
        SELECT tag->>'label' AS label, tag->>'emoji' AS emoji, COUNT(*)::int AS count
        FROM sessions, jsonb_array_elements(quick_tags) AS tag
        WHERE 1=1 ${dateFilter}
        GROUP BY tag->>'label', tag->>'emoji'
        ORDER BY count DESC LIMIT 30
      `),
      pool.query(`
        SELECT
          SUM(CASE WHEN structured_notes != '' THEN 1 ELSE 0 END)::int AS structure,
          SUM(CASE WHEN ai_questions != '' THEN 1 ELSE 0 END)::int AS questions,
          SUM(CASE WHEN ai_solution_feedback != '' THEN 1 ELSE 0 END)::int AS solutions,
          COUNT(*)::int AS total
        FROM sessions WHERE 1=1 ${dateFilter}
      `),
      pool.query(`
        SELECT phase, COUNT(DISTINCT client)::int AS client_count
        FROM sessions WHERE 1=1 ${dateFilter}
        GROUP BY phase
        ORDER BY
          CASE phase
            WHEN 'requirements' THEN 1
            WHEN 'follow-up' THEN 2
            WHEN 'demo' THEN 3
            WHEN 'troubleshoot' THEN 4
          END
      `),
      pool.query(`
        SELECT
          COUNT(*)::int AS total_sessions,
          COUNT(DISTINCT client)::int AS active_clients,
          COALESCE(
            AVG(jsonb_array_length(quick_tags))::numeric(10,1), 0
          ) AS avg_tags
        FROM sessions WHERE 1=1 ${dateFilter}
      `),
    ]);

    const ai = aiResult.rows[0] || { structure: 0, questions: 0, solutions: 0, total: 0 };
    const totals = totalsResult.rows[0] || { total_sessions: 0, active_clients: 0, avg_tags: 0 };
    const aiUtilization = ai.total > 0
      ? Math.round(((ai.structure + ai.questions + ai.solutions) / (ai.total * 3)) * 100)
      : 0;

    res.json({
      phaseDistribution: phaseResult.rows,
      industryDistribution: industryResult.rows,
      sessionsOverTime: timelineResult.rows,
      activityHeatmap: heatmapResult.rows,
      tagDistribution: tagResult.rows,
      aiUsage: [
        { feature: 'Structure', count: ai.structure },
        { feature: 'Questions', count: ai.questions },
        { feature: 'Solutions', count: ai.solutions },
      ],
      engagementFunnel: funnelResult.rows,
      totals: {
        totalSessions: totals.total_sessions,
        activeClients: totals.active_clients,
        aiUtilization,
        avgTags: Number(totals.avg_tags),
      },
    });
  } catch (err) {
    console.error('[analytics] summary error:', err);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

export default router;
