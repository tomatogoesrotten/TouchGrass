import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useToast } from '@/stores/toast'
import { GlassCard } from '@/components/ui/GlassCard'
import { AIResultBox } from '@/components/ui/AIResultBox'

const starters = [
  { cat: 'Discovery', color: { dark: '#10b981', light: '#059669' }, q: 'What are the primary KPIs for this initiative?' },
  { cat: 'Constraint', color: { dark: '#f59e0b', light: '#d97706' }, q: 'Are there regulatory hurdles before launch?' },
  { cat: 'Future State', color: { dark: '#8b5cf6', light: '#7c3aed' }, q: 'How does the team define success in 3 years?' },
  { cat: 'Risk', color: { dark: '#ef4444', light: '#dc2626' }, q: 'What happens if the timeline slips by a quarter?' },
]

export function QuestionsTab() {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const toast = useToast((s) => s.show)
  const [showResult, setShowResult] = useState(false)

  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const accent = isDark ? '#10b981' : '#059669'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  function handleGenerate() {
    setTimeout(() => {
      setShowResult(true)
      toast('AI analysis complete')
    }, 1200)
  }

  return (
    <div className="space-y-6">
      {/* Starter Questions */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
          Starter Questions
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {starters.map(({ cat, color, q }) => {
            const c = isDark ? color.dark : color.light
            return (
              <GlassCard key={cat} className="p-5 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full rounded-r-full" style={{ backgroundColor: `${c}50` }} />
                <div className="flex items-center gap-2">
                  <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: c }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: c }}>{cat}</span>
                </div>
                <p className="text-sm font-medium leading-snug" style={{ color: textPrimary }}>{q}</p>
              </GlassCard>
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${border}` }} />

      {/* Generate */}
      <div className="flex flex-col items-center gap-4 py-4">
        <button
          onClick={handleGenerate}
          className="px-5 py-2.5 rounded-[12px] font-semibold text-sm flex items-center gap-2.5 transition-all hover:brightness-110"
          style={{
            backgroundColor: isDark ? '#27272a' : '#f4f4f5',
            color: textPrimary,
            border: `1px solid ${border}`,
          }}
        >
          <Sparkles size={16} color={accent} />
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
              <span className="mt-0.5 font-mono text-xs font-medium" style={{ color: accent }}>{i + 1}.</span> {q}
            </li>
          ))}
        </ul>
      </AIResultBox>
    </div>
  )
}
