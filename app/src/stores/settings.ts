import { create } from 'zustand'
import { api } from '@/lib/api'
import type { AppSettings } from '@/lib/api'

const DEFAULTS: AppSettings = {
  ai_model: 'gpt-4o-mini',
  prompts: { structure: '', questions: '', domain: '', solutions: '' },
  industries: ['Renewable Energy', 'Cloud Infrastructure', 'Financial Services', 'Autonomous Logistics', 'Healthcare', 'Aerospace'],
  webhook_url: '',
  theme_default: 'dark',
  export_defaults: { format: 'markdown', includeSections: ['transcript', 'notes', 'structured', 'questions', 'solutions'] },
  speech_settings: { language: 'en-US', continuous: true },
}

interface SettingsStore {
  settings: AppSettings
  loaded: boolean
  saving: boolean
  loadSettings: () => Promise<void>
  updateSettings: (patch: Partial<AppSettings>) => void
  saveSettings: () => Promise<void>
}

export const useSettings = create<SettingsStore>((set, get) => ({
  settings: DEFAULTS,
  loaded: false,
  saving: false,

  loadSettings: async () => {
    try {
      const s = await api.getSettings()
      set({ settings: { ...DEFAULTS, ...s }, loaded: true })
    } catch (err) {
      console.error('Failed to load settings:', err)
      set({ loaded: true })
    }
  },

  updateSettings: (patch) => {
    set((state) => ({ settings: { ...state.settings, ...patch } }))
  },

  saveSettings: async () => {
    set({ saving: true })
    try {
      const result = await api.updateSettings(get().settings)
      set({ settings: { ...DEFAULTS, ...result }, saving: false })
    } catch (err) {
      console.error('Failed to save settings:', err)
      set({ saving: false })
      throw err
    }
  },
}))
