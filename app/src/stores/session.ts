import { create } from 'zustand'
import { api } from '@/lib/api'
import type { SessionFull, SessionMeta, QuickTag } from '@/lib/api'

export type Phase = 'requirements' | 'follow-up' | 'demo' | 'troubleshoot'

export interface Session {
  id: string
  client: string
  industry: string
  phase: Phase
  date: string
  time: string
  attendees: string
  transcript: string
  manualNotes: string
  quickTags: QuickTag[]
  structuredNotes: string
  aiQuestions: string
  privateSolutions: string
  aiSolutionFeedback: string
  createdAt?: string
  updatedAt?: string
}

export type { QuickTag }

interface SessionStore {
  sessions: SessionMeta[]
  activeSession: Session | null
  isRecording: boolean
  isPaused: boolean
  recSeconds: number
  activeTab: string
  deleteTarget: SessionMeta | null
  loading: boolean

  loadSessions: () => Promise<void>
  addSession: (s: { client: string; industry: string; phase: string; attendees?: string }) => Promise<Session>
  removeSession: (id: string) => Promise<void>
  setActiveSession: (s: SessionMeta | null) => void
  loadFullSession: (id: string) => Promise<void>
  updateActiveSession: (fields: Partial<Session>) => void
  saveActiveSession: () => Promise<void>
  addTag: (label: string, emoji: string) => void
  removeTag: (id: string) => void
  setRecording: (v: boolean) => void
  setRecPaused: (v: boolean) => void
  setRecSeconds: (v: number) => void
  setActiveTab: (tab: string) => void
  setDeleteTarget: (s: SessionMeta | null) => void
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

function toSession(data: SessionFull): Session {
  return {
    id: data.id,
    client: data.client,
    industry: data.industry,
    phase: data.phase as Phase,
    date: data.date,
    time: data.time,
    attendees: data.attendees ?? '',
    transcript: data.transcript ?? '',
    manualNotes: data.manualNotes ?? '',
    quickTags: data.quickTags ?? [],
    structuredNotes: data.structuredNotes ?? '',
    aiQuestions: data.aiQuestions ?? '',
    privateSolutions: data.privateSolutions ?? '',
    aiSolutionFeedback: data.aiSolutionFeedback ?? '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

export const useSession = create<SessionStore>((set, get) => ({
  sessions: [],
  activeSession: null,
  isRecording: false,
  isPaused: false,
  recSeconds: 0,
  activeTab: 'record',
  deleteTarget: null,
  loading: false,

  loadSessions: async () => {
    set({ loading: true })
    try {
      const sessions = await api.listSessions()
      set({ sessions, loading: false })
    } catch (err) {
      console.error('Failed to load sessions:', err)
      set({ loading: false })
    }
  },

  addSession: async (s) => {
    const data = await api.createSession(s)
    const session = toSession(data)
    set((state) => ({
      sessions: [
        { id: session.id, client: session.client, industry: session.industry, phase: session.phase, date: session.date, time: session.time, updatedAt: session.updatedAt ?? '' },
        ...state.sessions,
      ],
    }))
    return session
  },

  removeSession: async (id) => {
    await api.deleteSession(id)
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      deleteTarget: null,
    }))
  },

  setActiveSession: (s) => {
    if (!s) {
      set({ activeSession: null, activeTab: 'record' })
      return
    }
    set({ activeTab: 'record' })
  },

  loadFullSession: async (id) => {
    try {
      const data = await api.getSession(id)
      set({ activeSession: toSession(data), activeTab: 'record' })
    } catch (err) {
      console.error('Failed to load session:', err)
    }
  },

  updateActiveSession: (fields) => {
    const current = get().activeSession
    if (!current) return
    set({ activeSession: { ...current, ...fields } })

    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      get().saveActiveSession()
    }, 1000)
  },

  saveActiveSession: async () => {
    const session = get().activeSession
    if (!session) return
    try {
      await api.updateSession(session.id, {
        transcript: session.transcript,
        manualNotes: session.manualNotes,
        quickTags: session.quickTags,
        structuredNotes: session.structuredNotes,
        aiQuestions: session.aiQuestions,
        privateSolutions: session.privateSolutions,
        aiSolutionFeedback: session.aiSolutionFeedback,
      } as Partial<Session>)
    } catch (err) {
      console.error('Auto-save failed:', err)
    }
  },

  addTag: (label, emoji) => {
    const session = get().activeSession
    if (!session) return
    const secs = get().recSeconds
    const m = String(Math.floor(secs / 60)).padStart(2, '0')
    const s = String(secs % 60).padStart(2, '0')
    const tag: QuickTag = {
      id: `t${Date.now()}`,
      time: get().isRecording ? `${m}:${s}` : '--:--',
      label,
      emoji,
      note: 'Tagged moment',
    }
    const quickTags = [tag, ...session.quickTags]
    get().updateActiveSession({ quickTags })
  },

  removeTag: (id) => {
    const session = get().activeSession
    if (!session) return
    get().updateActiveSession({
      quickTags: session.quickTags.filter((t) => t.id !== id),
    })
  },

  setRecording: (v) => set({ isRecording: v, ...(!v ? { isPaused: false } : {}) }),
  setRecPaused: (v) => set({ isPaused: v }),
  setRecSeconds: (v) => set({ recSeconds: v }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setDeleteTarget: (s) => set({ deleteTarget: s }),
}))
