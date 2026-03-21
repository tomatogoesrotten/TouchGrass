import { useState } from 'react'
import { Sparkles, HelpCircle } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useToast } from '@/stores/toast'
import { GlassCard } from '@/components/ui/GlassCard'
import { AIResultBox } from '@/components/ui/AIResultBox'

const starters = [
  { cat: 'Discovery', color: { dark: '#c4f042', light: '#a3cc29' }, q: 'What are the primary KPIs for this initiative?' },
  { cat: 'Constraint', color: { dark: '#ff8a00', light: '#e67d00' }, q: 'Are there regulatory hurdles before launch?' },
  { cat: 'Future State', color: { dark: '#8b5cf6', light: '#7c3aed' }, q: 'How does the team define success in 3 years?' },
  { cat: 'Risk', color: { dark: '#ff4d6a', light: '#e5384b' }, q: 'What happens if the timeline slips by a quarter?' },
]

export function QuestionsTab() {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const toast = useToast((s) => s.show)
  const [showResult, setShowResult] = useState(false)

  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  function handleGenerate() {
    setTimeout(() => {
      setShowResult(true)
      toast('AI analysis complete')
    }, 1200)
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
        {/* Starter Questions */}
        <div className="space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
            Starter Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {starters.map(({ cat, color, q }) => {
              const c = isDark ? color.dark : color.light
              return (
                <div key={cat} className="p-4 space-y-3 relative overflow-hidden rounded-[14px]" style={{
                  backgroundColor: isDark ? 'var(--color-surface-high)' : 'var(--color-surface-light-mid)',
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

        {/* Divider */}
        <div style={{ borderTop: `1px solid ${border}` }} />

        {/* Generate */}
        <div className="flex flex-col items-center gap-4 py-2">
          <button
            onClick={handleGenerate}
            className="px-5 py-2.5 rounded-[12px] font-semibold text-sm flex items-center gap-2.5 transition-all hover:brightness-110"
            style={{
              backgroundColor: isDark ? 'var(--color-surface-high)' : '#f4f4f5',
              color: textPrimary,
              border: `1px solid ${border}`,
            }}
          >
            <Sparkles size={16} color="var(--color-accent-dark)" />
            Generate AI Questions
          </button>
        </div>

        <AIResultBox title="AI-Generated Questions" visible={showResult}>
          <ul className="space-y-3 text-sm leading-relaxed" style={{ color: textSoft }}>
            {[
              'What existing infrastructure will this solution need to integrate with?',
              'Who are the primary stakeholders for sign-off at each phase?',
              'What is the allocated budget range for this engagement?',
            ].map((q, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 font-mono text-xs font-medium" style={{ color: 'var(--color-accent-dark)' }}>{i + 1}.</span> {q}
              </li>
            ))}
          </ul>
        </AIResultBox>
      </div>
    </GlassCard>
  )
}
