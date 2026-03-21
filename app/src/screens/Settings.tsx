import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ChevronDown, Brain, MessageSquare, Factory,
  Webhook, Palette, Download, Mic, Plus, X, RotateCcw, Send,
  Check, Loader2,
} from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSettings } from '@/stores/settings'
import { useToast } from '@/stores/toast'
import { api } from '@/lib/api'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { GlassCard } from '@/components/ui/GlassCard'
import { PrimaryBtn } from '@/components/ui/PrimaryBtn'
import { Input } from '@/components/ui/Input'

const AI_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'o1-mini', 'o1-preview']

const SPEECH_LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'en-AU', label: 'English (AU)' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'ja-JP', label: 'Japanese' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
  { code: 'ko-KR', label: 'Korean' },
  { code: 'pt-BR', label: 'Portuguese (BR)' },
]

const EXPORT_SECTIONS = [
  { key: 'transcript', label: 'Transcript' },
  { key: 'notes', label: 'Manual Notes' },
  { key: 'structured', label: 'Structured Notes' },
  { key: 'questions', label: 'AI Questions' },
  { key: 'solutions', label: 'Solutions & Feedback' },
]

const DEFAULT_PROMPTS = {
  structure: `You are a professional note structurer for a SaaS engineer. The engineer just attended a client meeting.

Industry: "{industry}"
Meeting Phase: {phase}

Organize the raw meeting data into these sections using Markdown:
## Key Points
## Requirements / Issues
## Decisions Made
## Action Items
## Unclear / Needs Clarification

Flag any domain-specific terms and briefly explain them. Be concise and professional.`,
  questions: `You are a senior colleague helping a junior SaaS engineer prepare follow-up questions after a client meeting.

Industry: "{industry}"
Meeting Phase: {phase}

Generate 5-8 follow-up questions organized by priority:
### Critical
### Important
### Nice-to-have

For each question, include a brief rationale explaining why it matters. Use Markdown formatting.`,
  domain: `You are a domain knowledge assistant for a SaaS engineer working with clients in the "{industry}" industry.

When given a term or concept, provide:
1. A clear definition
2. Why it matters in this industry
3. Implications for software solutions

Keep it to 3-5 sentences. Be practical and relevant.`,
  solutions: `You are a senior software engineer privately reviewing a junior colleague's solution ideas after a client meeting. This review is NEVER shown to clients.

Industry: "{industry}"
Meeting Phase: {phase}

For each idea, assess:
- **Feasibility**: Can this be built? What's the effort?
- **Client-Facing Risk**: What could go wrong if this were promised?
- **Professional Framing**: How to present this idea safely
- **Alternatives**: Better approaches to consider

Be kind but direct. Use Markdown formatting.`,
}

export function Settings() {
  const navigate = useNavigate()
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const { settings, loaded, saving, loadSettings, updateSettings, saveSettings } = useSettings()
  const toast = useToast((s) => s.show)

  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['ai']))
  const [newIndustry, setNewIndustry] = useState('')
  const [webhookTesting, setWebhookTesting] = useState(false)

  useEffect(() => { if (!loaded) loadSettings() }, [loaded, loadSettings])

  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const accent = isDark ? '#c4f042' : '#a3cc29'

  function toggleSection(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSave() {
    try {
      await saveSettings()
      toast('Settings saved', 'success')
    } catch {
      toast('Failed to save settings', 'error')
    }
  }

  async function handleTestWebhook() {
    if (!settings.webhook_url) return
    setWebhookTesting(true)
    try {
      const result = await api.testWebhook(settings.webhook_url)
      toast(result.success ? `Webhook OK (${result.status})` : `Webhook failed (${result.status})`, result.success ? 'success' : 'error')
    } catch {
      toast('Webhook test failed', 'error')
    } finally {
      setWebhookTesting(false)
    }
  }

  function addIndustry() {
    const name = newIndustry.trim()
    if (!name || settings.industries.includes(name)) return
    updateSettings({ industries: [...settings.industries, name] })
    setNewIndustry('')
  }

  function removeIndustry(index: number) {
    updateSettings({ industries: settings.industries.filter((_, i) => i !== index) })
  }

  function moveIndustry(from: number, to: number) {
    if (to < 0 || to >= settings.industries.length) return
    const arr = [...settings.industries]
    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
    updateSettings({ industries: arr })
  }

  interface SectionConfig {
    id: string
    title: string
    icon: typeof Brain
    iconColor: string
  }

  const sections: SectionConfig[] = [
    { id: 'ai', title: 'AI Configuration', icon: Brain, iconColor: accent },
    { id: 'prompts', title: 'System Prompts', icon: MessageSquare, iconColor: isDark ? '#8b5cf6' : '#7c3aed' },
    { id: 'industries', title: 'Industry List', icon: Factory, iconColor: isDark ? '#ff8a00' : '#e67d00' },
    { id: 'webhook', title: 'Webhook Configuration', icon: Webhook, iconColor: isDark ? '#06b6d4' : '#0891b2' },
    { id: 'theme', title: 'Theme Preferences', icon: Palette, iconColor: isDark ? '#f43f5e' : '#e11d48' },
    { id: 'export', title: 'Export Defaults', icon: Download, iconColor: isDark ? '#22d3ee' : '#0ea5e9' },
    { id: 'speech', title: 'Speech Recognition', icon: Mic, iconColor: isDark ? '#a78bfa' : '#8b5cf6' },
  ]

  const selectStyle = {
    backgroundColor: isDark ? '#1e1e22' : '#f4f4f5',
    color: textPrimary,
  }

  return (
    <div className="min-h-screen relative" style={{ zIndex: 1 }}>
      <main className="max-w-[640px] mx-auto px-6 pt-12 pb-24">
        <header className="flex justify-between items-center mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 font-semibold text-sm hover:opacity-80 transition-opacity"
            style={{ color: accent }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <ThemeToggle />
        </header>

        <section className="mb-8">
          <h1 className="text-[28px] font-bold tracking-tight" style={{ color: textPrimary }}>
            Settings
          </h1>
          <p className="text-sm mt-1.5" style={{ color: textSoft }}>
            Configure your TouchGrass experience.
          </p>
        </section>

        <div className="space-y-3">
          {sections.map((section) => {
            const Icon = section.icon
            const isOpen = openSections.has(section.id)
            return (
              <GlassCard key={section.id}>
                <button
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${section.iconColor}15` }}
                    >
                      <Icon size={17} color={section.iconColor} />
                    </div>
                    <span className="text-[14px] font-semibold" style={{ color: textPrimary }}>
                      {section.title}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} color={textMuted} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 space-y-4" style={{ borderTop: `1px solid ${border}` }}>

                        {/* AI Configuration */}
                        {section.id === 'ai' && (
                          <div className="space-y-2 pt-3">
                            <label className="block text-[11px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
                              Model
                            </label>
                            <select
                              className="w-full h-11 border-none rounded-[12px] px-4 text-sm font-mono font-medium outline-none appearance-none cursor-pointer"
                              style={selectStyle}
                              value={settings.ai_model}
                              onChange={(e) => updateSettings({ ai_model: e.target.value })}
                            >
                              {AI_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <p className="text-[11px] mt-1" style={{ color: textMuted }}>
                              Used for all AI features (structure, questions, domain, solutions)
                            </p>
                          </div>
                        )}

                        {/* System Prompts */}
                        {section.id === 'prompts' && (
                          <div className="space-y-5 pt-3">
                            {(['structure', 'questions', 'domain', 'solutions'] as const).map((key) => (
                              <div key={key} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
                                    {key}
                                  </label>
                                  <button
                                    className="flex items-center gap-1 text-[10px] font-semibold transition-opacity hover:opacity-80"
                                    style={{ color: accent }}
                                    onClick={() => updateSettings({
                                      prompts: { ...settings.prompts, [key]: '' },
                                    })}
                                  >
                                    <RotateCcw size={10} /> Reset
                                  </button>
                                </div>
                                <textarea
                                  className="w-full min-h-[120px] border-none rounded-[12px] p-4 text-[12px] font-mono outline-none resize-y leading-relaxed"
                                  style={{
                                    backgroundColor: isDark ? '#1e1e22' : '#f4f4f5',
                                    color: textPrimary,
                                  }}
                                  value={settings.prompts[key]}
                                  onChange={(e) => updateSettings({
                                    prompts: { ...settings.prompts, [key]: e.target.value },
                                  })}
                                  placeholder={DEFAULT_PROMPTS[key]}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Industry List */}
                        {section.id === 'industries' && (
                          <div className="space-y-3 pt-3">
                            <div className="space-y-1">
                              {settings.industries.map((ind, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2 px-3 py-2 rounded-[10px] group transition-colors"
                                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                                >
                                  <div className="flex flex-col gap-0.5 mr-1">
                                    <button
                                      className="text-[10px] opacity-40 hover:opacity-100 transition-opacity"
                                      style={{ color: textSoft }}
                                      onClick={() => moveIndustry(i, i - 1)}
                                      disabled={i === 0}
                                    >
                                      ▲
                                    </button>
                                    <button
                                      className="text-[10px] opacity-40 hover:opacity-100 transition-opacity"
                                      style={{ color: textSoft }}
                                      onClick={() => moveIndustry(i, i + 1)}
                                      disabled={i === settings.industries.length - 1}
                                    >
                                      ▼
                                    </button>
                                  </div>
                                  <span className="flex-1 text-[13px] font-medium" style={{ color: textPrimary }}>
                                    {ind}
                                  </span>
                                  <button
                                    className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-[6px] flex items-center justify-center"
                                    style={{ color: isDark ? '#ff4d6a' : '#e5384b' }}
                                    onClick={() => removeIndustry(i)}
                                  >
                                    <X size={13} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add industry..."
                                value={newIndustry}
                                onChange={(e) => setNewIndustry(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addIndustry()}
                                className="flex-1"
                              />
                              <button
                                className="w-11 h-11 rounded-[12px] flex items-center justify-center transition-all hover:brightness-110 flex-shrink-0"
                                style={{ backgroundColor: `${accent}20`, color: accent }}
                                onClick={addIndustry}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Webhook */}
                        {section.id === 'webhook' && (
                          <div className="space-y-3 pt-3">
                            <div className="space-y-2">
                              <label className="block text-[11px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
                                n8n Webhook URL
                              </label>
                              <Input
                                placeholder="https://your-n8n.com/webhook/..."
                                value={settings.webhook_url}
                                onChange={(e) => updateSettings({ webhook_url: e.target.value })}
                              />
                            </div>
                            <button
                              className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[12px] font-semibold transition-all hover:brightness-110 disabled:opacity-40"
                              style={{
                                backgroundColor: isDark ? 'rgba(6,182,212,0.1)' : 'rgba(8,145,178,0.1)',
                                color: isDark ? '#06b6d4' : '#0891b2',
                              }}
                              onClick={handleTestWebhook}
                              disabled={!settings.webhook_url || webhookTesting}
                            >
                              {webhookTesting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                              Test Webhook
                            </button>
                          </div>
                        )}

                        {/* Theme */}
                        {section.id === 'theme' && (
                          <div className="space-y-3 pt-3">
                            <label className="block text-[11px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
                              Default Theme
                            </label>
                            <div className="flex gap-3">
                              {(['dark', 'light'] as const).map((t) => (
                                <button
                                  key={t}
                                  className="flex-1 py-3 rounded-[12px] text-[13px] font-semibold transition-all"
                                  style={{
                                    backgroundColor: settings.theme_default === t
                                      ? `${accent}18` : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                                    border: `1px solid ${settings.theme_default === t ? `${accent}40` : border}`,
                                    color: settings.theme_default === t ? accent : textSoft,
                                  }}
                                  onClick={() => updateSettings({ theme_default: t })}
                                >
                                  {settings.theme_default === t && <Check size={13} className="inline mr-1.5" />}
                                  {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Export Defaults */}
                        {section.id === 'export' && (
                          <div className="space-y-4 pt-3">
                            <div className="space-y-2">
                              <label className="block text-[11px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
                                Default Format
                              </label>
                              <select
                                className="w-full h-11 border-none rounded-[12px] px-4 text-sm font-medium outline-none appearance-none cursor-pointer"
                                style={selectStyle}
                                value={settings.export_defaults.format}
                                onChange={(e) => updateSettings({
                                  export_defaults: { ...settings.export_defaults, format: e.target.value },
                                })}
                              >
                                <option value="markdown">Markdown</option>
                                <option value="json">JSON</option>
                                <option value="pdf">PDF</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-[11px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
                                Include Sections
                              </label>
                              <div className="space-y-1.5">
                                {EXPORT_SECTIONS.map((sec) => {
                                  const checked = settings.export_defaults.includeSections.includes(sec.key)
                                  return (
                                    <label
                                      key={sec.key}
                                      className="flex items-center gap-3 px-3 py-2 rounded-[10px] cursor-pointer transition-colors"
                                      style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                                    >
                                      <div
                                        className="w-5 h-5 rounded-[6px] flex items-center justify-center transition-all flex-shrink-0"
                                        style={{
                                          backgroundColor: checked ? accent : (isDark ? '#27272a' : '#e4e4e7'),
                                          border: checked ? 'none' : `1px solid ${border}`,
                                        }}
                                      >
                                        {checked && <Check size={12} color={isDark ? '#000' : '#fff'} strokeWidth={3} />}
                                      </div>
                                      <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={checked}
                                        onChange={(e) => {
                                          const secs = e.target.checked
                                            ? [...settings.export_defaults.includeSections, sec.key]
                                            : settings.export_defaults.includeSections.filter((s) => s !== sec.key)
                                          updateSettings({
                                            export_defaults: { ...settings.export_defaults, includeSections: secs },
                                          })
                                        }}
                                      />
                                      <span className="text-[13px] font-medium" style={{ color: textPrimary }}>
                                        {sec.label}
                                      </span>
                                    </label>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Speech */}
                        {section.id === 'speech' && (
                          <div className="space-y-4 pt-3">
                            <div className="space-y-2">
                              <label className="block text-[11px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
                                Language
                              </label>
                              <select
                                className="w-full h-11 border-none rounded-[12px] px-4 text-sm font-medium outline-none appearance-none cursor-pointer"
                                style={selectStyle}
                                value={settings.speech_settings.language}
                                onChange={(e) => updateSettings({
                                  speech_settings: { ...settings.speech_settings, language: e.target.value },
                                })}
                              >
                                {SPEECH_LANGUAGES.map((l) => (
                                  <option key={l.code} value={l.code}>{l.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-[11px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
                                Continuous Mode
                              </label>
                              <button
                                className="relative w-12 h-7 rounded-full transition-all"
                                style={{
                                  backgroundColor: settings.speech_settings.continuous
                                    ? accent : (isDark ? '#27272a' : '#d4d4d8'),
                                }}
                                onClick={() => updateSettings({
                                  speech_settings: { ...settings.speech_settings, continuous: !settings.speech_settings.continuous },
                                })}
                              >
                                <motion.div
                                  className="absolute top-0.5 w-6 h-6 rounded-full"
                                  style={{ backgroundColor: isDark ? '#0a0a0a' : '#ffffff' }}
                                  animate={{ left: settings.speech_settings.continuous ? 22 : 2 }}
                                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                />
                              </button>
                              <p className="text-[11px]" style={{ color: textMuted }}>
                                Keep recording until manually stopped
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            )
          })}
        </div>

        <div className="mt-8">
          <PrimaryBtn
            className="w-full h-[48px] text-sm font-bold"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={16} />
                Save Settings
              </>
            )}
          </PrimaryBtn>
        </div>
      </main>
    </div>
  )
}
