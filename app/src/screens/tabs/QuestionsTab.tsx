import { useState } from 'react'
import { Sparkles, HelpCircle } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import { useToast } from '@/stores/toast'
import { api } from '@/lib/api'
import { GlassCard } from '@/components/ui/GlassCard'
import { AIResultBox } from '@/components/ui/AIResultBox'
import { LoadingBar } from '@/components/ui/LoadingBar'

const starters = [
  { cat: 'Discovery', color: { dark: '#c4f042', light: '#a3cc29' }, q: 'What are the primary KPIs for this initiative?' },
  { cat: 'Constraint', color: { dark: '#ff8a00', light: '#e67d00' }, q: 'Are there regulatory hurdles before launch?' },
  { cat: 'Future State', color: { dark: '#8b5cf6', light: '#7c3aed' }, q: 'How does the team define success in 3 years?' },
  { cat: 'Risk', color: { dark: '#ff4d6a', light: '#e5384b' }, q: 'What happens if the timeline slips by a quarter?' },
]

export function QuestionsTab() {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const { activeSession, updateActiveSession } = useSession()
  const toast = useToast((s) => s.show)
  const [loading, setLoading] = useState(false)

  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  const result = activeSession?.aiQuestions ?? ''

  async function handleGenerate() {
    if (!activeSession) return
    setLoading(true)
    try {
      const { result } = await api.aiQuestions(activeSession.id)
      updateActiveSession({ aiQuestions: result })
      toast('AI analysis complete')
    } catch {
      toast('AI request failed — try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassCard className="h-full flex flex-col p-5 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          <HelpCircle size={16} color={textPrimary} />
        </div>
        <h2 className="text-[16px] font-bold tracking-tight" style={{ color: textPrimary }}>Questions</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: `${textMuted} transparent` }}>
        <div className="space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
            Starter Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {starters.map(({ cat, color, q }) => {
              const c = isDark ? color.dark : color.light
              return (
                <div key={cat} className="p-4 space-y-3 relative overflow-hidden rounded-[14px]" style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${border}`
                }}>
                  <div className="absolute top-0 left-0 w-1 h-full rounded-r-full" style={{ backgroundColor: c }} />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: c }}>{cat}</span>
                  </div>
                  <p className="text-sm font-medium leading-snug" style={{ color: textPrimary }}>{q}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${border}` }} />

        <div className="flex flex-col items-center gap-4 py-2">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-5 py-2.5 rounded-[12px] font-semibold text-sm flex items-center gap-2.5 transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              color: textPrimary,
              border: `1px solid ${border}`,
            }}
          >
            <Sparkles size={16} color="var(--color-accent-dark)" />
            {result ? 'Regenerate Questions' : 'Generate AI Questions'}
          </button>
          <LoadingBar visible={loading} />
        </div>

        {result && (
          <AIResultBox title="AI-Generated Questions" visible>
            <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: textSoft }}>
              {result}
            </div>
          </AIResultBox>
        )}
      </div>
    </GlassCard>
  )
}
