import { Router } from 'express';
import PDFDocument from 'pdfkit';
import pool from '../db.js';

const router = Router();

async function getSession(id: string) {
  const { rows } = await pool.query('SELECT * FROM sessions WHERE id = $1', [id]);
  return rows[0] ?? null;
}

function toMarkdown(s: Record<string, unknown>): string {
  const lines: string[] = [
    `# Visit Report — ${s.client}`,
    '',
    `**Date:** ${s.date}  `,
    `**Industry:** ${s.industry}  `,
    `**Phase:** ${s.phase}  `,
    `**Attendees:** ${s.attendees || 'N/A'}  `,
    '',
    '---',
    '',
  ];

  if (s.transcript) {
    lines.push('## Transcript', '', s.transcript as string, '', '---', '');
  }
  if (s.manual_notes) {
    lines.push('## Notes', '', s.manual_notes as string, '', '---', '');
  }
  if (s.quick_tags && Array.isArray(s.quick_tags) && (s.quick_tags as unknown[]).length > 0) {
    lines.push('## Quick Tags', '');
    for (const t of s.quick_tags as Array<Record<string, string>>) {
      lines.push(`- [${t.time}] ${t.emoji} ${t.label} — ${t.note}`);
    }
    lines.push('', '---', '');
  }
  if (s.structured_notes) {
    lines.push('## Structured Notes', '', s.structured_notes as string, '', '---', '');
  }
  if (s.ai_questions) {
    lines.push('## Follow-up Questions', '', s.ai_questions as string, '', '---', '');
  }
  if (s.private_solutions) {
    lines.push('## Private Solutions (INTERNAL)', '', s.private_solutions as string, '', '---', '');
  }
  if (s.ai_solution_feedback) {
    lines.push('## AI Solution Review (INTERNAL)', '', s.ai_solution_feedback as string, '');
  }

  return lines.join('\n');
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

router.get('/:id/json', async (req, res) => {
  try {
    const session = await getSession(req.params.id);
    if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

    const filename = `visit-${slugify(session.client as string)}-${session.date}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json({
      id: session.id,
      client: session.client,
      industry: session.industry,
      phase: session.phase,
      attendees: session.attendees,
      date: session.date,
      time: session.time,
      transcript: session.transcript,
      manualNotes: session.manual_notes,
      quickTags: session.quick_tags,
      structuredNotes: session.structured_notes,
      aiQuestions: session.ai_questions,
      privateSolutions: session.private_solutions,
      aiSolutionFeedback: session.ai_solution_feedback,
      exportedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[export] json error:', err);
    res.status(500).json({ error: 'Export failed' });
  }
});

router.get('/:id/markdown', async (req, res) => {
  try {
    const session = await getSession(req.params.id);
    if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

    const md = toMarkdown(session);
    const filename = `visit-${slugify(session.client as string)}-${session.date}.md`;
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(md);
  } catch (err) {
    console.error('[export] markdown error:', err);
    res.status(500).json({ error: 'Export failed' });
  }
});

router.get('/:id/pdf', async (req, res) => {
  try {
    const session = await getSession(req.params.id);
    if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

    const filename = `visit-${slugify(session.client as string)}-${session.date}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    doc.fontSize(22).font('Helvetica-Bold')
      .text(`Visit Report — ${session.client}`, { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica')
      .text(`Date: ${session.date}  |  Industry: ${session.industry}  |  Phase: ${session.phase}`);
    if (session.attendees) doc.text(`Attendees: ${session.attendees}`);
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e0e0e0');
    doc.moveDown();

    const addSection = (title: string, content: string) => {
      if (!content) return;
      doc.fontSize(14).font('Helvetica-Bold').text(title);
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica').text(content, { lineGap: 3 });
      doc.moveDown();
    };

    addSection('Transcript', session.transcript as string);
    addSection('Notes', session.manual_notes as string);

    if (session.quick_tags && Array.isArray(session.quick_tags) && (session.quick_tags as unknown[]).length > 0) {
      const tagText = (session.quick_tags as Array<Record<string, string>>)
        .map((t) => `[${t.time}] ${t.label} — ${t.note}`)
        .join('\n');
      addSection('Quick Tags', tagText);
    }

    addSection('Structured Notes', session.structured_notes as string);
    addSection('Follow-up Questions', session.ai_questions as string);
    addSection('Private Solutions (INTERNAL)', session.private_solutions as string);
    addSection('AI Solution Review (INTERNAL)', session.ai_solution_feedback as string);

    doc.end();
  } catch (err) {
    console.error('[export] pdf error:', err);
    res.status(500).json({ error: 'Export failed' });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      res.status(400).json({ error: 'N8N_WEBHOOK_URL not configured' });
      return;
    }

    const session = await getSession(req.body.sessionId);
    if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: session.client,
        industry: session.industry,
        phase: session.phase,
        date: session.date,
        attendees: session.attendees,
        transcript: session.transcript,
        manualNotes: session.manual_notes,
        quickTags: session.quick_tags,
        structuredNotes: session.structured_notes,
        aiQuestions: session.ai_questions,
        exportedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      res.status(502).json({ error: 'Webhook delivery failed' });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[export] webhook error:', err);
    res.status(500).json({ error: 'Webhook delivery failed' });
  }
});

export default router;
