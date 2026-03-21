const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as Record<string, string>).error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface SessionMeta {
  id: string
  client: string
  industry: string
  phase: string
  date: string
  time: string
  updatedAt: string
}

export interface SessionFull extends SessionMeta {
  attendees: string
  transcript: string
  manualNotes: string
  quickTags: QuickTag[]
  structuredNotes: string
  aiQuestions: string
  privateSolutions: string
  aiSolutionFeedback: string
  createdAt: string
}

export interface QuickTag {
  id: string
  time: string
  label: string
  emoji: string
  note: string
}

export const api = {
  listSessions: () =>
    request<SessionMeta[]>('/api/sessions'),

  createSession: (data: { client: string; industry: string; phase: string; attendees?: string }) =>
    request<SessionFull>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSession: (id: string) =>
    request<SessionFull>(`/api/sessions/${id}`),

  updateSession: (id: string, data: Partial<SessionFull>) =>
    request<SessionFull>(`/api/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteSession: (id: string) =>
    request<{ success: boolean }>(`/api/sessions/${id}`, { method: 'DELETE' }),

  aiStructure: (sessionId: string) =>
    request<{ result: string }>('/api/ai/structure', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }),

  aiQuestions: (sessionId: string) =>
    request<{ result: string }>('/api/ai/questions', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }),

  aiDomain: (sessionId: string, term: string) =>
    request<{ result: string }>('/api/ai/domain', {
      method: 'POST',
      body: JSON.stringify({ sessionId, term }),
    }),

  aiSolutions: (sessionId: string) =>
    request<{ result: string }>('/api/ai/solutions', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }),

  exportWebhook: (sessionId: string) =>
    request<{ success: boolean }>('/api/export/webhook', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }),

  getExportUrl: (id: string, format: 'json' | 'markdown' | 'pdf') =>
    `${BASE}/api/export/${id}/${format}`,
};
