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

export interface AudioSegment {
  id: string
  audio: string
  mimeType: string
  createdAt: string | null
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

  addAudioSegment: (sessionId: string, audio: string, mimeType: string) =>
    request<{ id: string; createdAt: string }>(`/api/sessions/${sessionId}/audio`, {
      method: 'POST',
      body: JSON.stringify({ audio, mimeType }),
    }),

  getAudioSegments: (sessionId: string) =>
    request<AudioSegment[]>(`/api/sessions/${sessionId}/audio`),

  deleteAudioSegment: (sessionId: string, segmentId: string) =>
    request<{ success: boolean }>(`/api/sessions/${sessionId}/audio/${segmentId}`, {
      method: 'DELETE',
    }),

  transcribeAudio: (audio: string, mimeType: string, sessionId?: string) =>
    request<{ result: string }>('/api/ai/transcribe', {
      method: 'POST',
      body: JSON.stringify({ audio, mimeType, sessionId }),
    }),

  getAnalyticsSummary: (range?: string) =>
    request<AnalyticsSummary>(`/api/analytics/summary${range ? `?range=${range}` : ''}`),

  getSettings: () =>
    request<AppSettings>('/api/settings'),

  updateSettings: (data: Partial<AppSettings>) =>
    request<AppSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  testWebhook: (url: string) =>
    request<{ success: boolean; status: number }>('/api/settings/test-webhook', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),
};

export interface AnalyticsSummary {
  phaseDistribution: { phase: string; count: number }[]
  industryDistribution: { industry: string; count: number }[]
  sessionsOverTime: { date: string; count: number }[]
  activityHeatmap: { date: string; count: number }[]
  tagDistribution: { label: string; emoji: string; count: number }[]
  aiUsage: { feature: string; count: number }[]
  engagementFunnel: { phase: string; client_count: number }[]
  totals: {
    totalSessions: number
    activeClients: number
    aiUtilization: number
    avgTags: number
  }
}

export interface AppSettings {
  ai_model: string
  prompts: {
    structure: string
    questions: string
    domain: string
    solutions: string
  }
  industries: string[]
  webhook_url: string
  theme_default: string
  export_defaults: {
    format: string
    includeSections: string[]
  }
  speech_settings: {
    language: string
    continuous: boolean
  }
}
