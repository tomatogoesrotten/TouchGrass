import { create } from 'zustand'

export type Phase = 'requirements' | 'follow-up' | 'demo' | 'troubleshoot'

export interface Session {
  id: string
  client: string
  industry: string
  phase: Phase
  date: string
  time: string
  attendees?: string
}

export interface Tag {
  id: string
  time: string
  label: string
  emoji: string
  note: string
}

interface SessionStore {
  sessions: Session[]
  activeSession: Session | null
  tags: Tag[]
  isRecording: boolean
  recSeconds: number
  activeTab: string
  deleteTarget: Session | null
  addSession: (s: Omit<Session, 'id' | 'date' | 'time'>) => void
  removeSession: (id: string) => void
  setActiveSession: (s: Session | null) => void
  addTag: (label: string, emoji: string) => void
  removeTag: (id: string) => void
  setRecording: (v: boolean) => void
  setRecSeconds: (v: number) => void
  setActiveTab: (tab: string) => void
  setDeleteTarget: (s: Session | null) => void
}

const defaultSessions: Session[] = [
  { id: '1', client: 'Aether Dynamics', industry: 'Cloud Infrastructure', phase: 'requirements', date: '2025.10.24', time: '14:20' },
  { id: '2', client: 'Luminal Systems', industry: 'Autonomous Logistics', phase: 'demo', date: '2025.10.23', time: '09:15' },
  { id: '3', client: 'Vertex Global', industry: 'Financial Services', phase: 'follow-up', date: '2025.10.22', time: '16:45' },
  { id: '4', client: 'Nexus Data', industry: 'Infrastructure', phase: 'troubleshoot', date: '2025.10.21', time: '11:30' },
  { id: '5', client: 'Horizon Fintech', industry: 'Banking Solutions', phase: 'requirements', date: '2025.10.19', time: '08:00' },
]

const defaultTags: Tag[] = [
  { id: 't1', time: '04:02', label: 'Important', emoji: '⚠️', note: 'Thermal tolerance for core assembly' },
  { id: 't2', time: '03:45', label: 'Decision', emoji: '✅', note: 'Switch to titanium alloy outer ring' },
]

let tagCounter = 3

export const useSession = create<SessionStore>((set, get) => ({
  sessions: defaultSessions,
  activeSession: null,
  tags: defaultTags,
  isRecording: false,
  recSeconds: 0,
  activeTab: 'record',
  deleteTarget: null,

  addSession: (s) => {
    const now = new Date()
    const date = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const session: Session = { ...s, id: crypto.randomUUID(), date, time }
    set((state) => ({ sessions: [session, ...state.sessions] }))
  },

  removeSession: (id) =>
    set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id), deleteTarget: null })),

  setActiveSession: (s) => set({ activeSession: s, activeTab: 'record' }),

  addTag: (label, emoji) => {
    const secs = get().recSeconds
    const m = String(Math.floor(secs / 60)).padStart(2, '0')
    const s = String(secs % 60).padStart(2, '0')
    const tag: Tag = {
      id: `t${tagCounter++}`,
      time: get().isRecording ? `${m}:${s}` : '--:--',
      label,
      emoji,
      note: 'Tagged moment',
    }
    set((state) => ({ tags: [tag, ...state.tags] }))
  },

  removeTag: (id) => set((state) => ({ tags: state.tags.filter((t) => t.id !== id) })),
  setRecording: (v) => set({ isRecording: v }),
  setRecSeconds: (v) => set({ recSeconds: v }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setDeleteTarget: (s) => set({ deleteTarget: s }),
}))
