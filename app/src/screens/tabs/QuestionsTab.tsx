import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useToast } from '@/stores/toast'
import { GlassCard } from '@/components/ui/GlassCard'
import { AIResultBox } from '@/components/ui/AIResultBox'

const starters = [
  { cat: 'Discovery', color: { dark: '#00e5a0', light: '#00b37e' }, q: 'What are the primary KPIs for this initiative?' },
  { cat: 'Constraint', color: { dark: '#fbbf24', light: '#d99a00' }, q: 'Are there regulatory hurdles before launch?' },
  { cat: 'Future State', color: { dark: '#a78bfa', light: '#7c5ccf' }, q: 'How does the team define success in 3 years?' },
  { cat: 'Risk', color: { dark: '#f87171', light: '#dc3545' }, q: 'What happens if the timeline slips by a quarter?' },
]

export function QuestionsTab() {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const toast = useToast((s) => s.show)
  const [showResult, setShowResult] = useState(false)

  const textPrimary = isDark ? '#f0f1f4' : '#111318'
  const textMuted = isDark ? '#5c6178' : '#5a5f72'
  const textSoft = isDark ? '#a0a5b8' : '#5a5f72'
  const accent = isDark ? '#00e5a0' : '#00b37e'

  function handleGenerate() {
    setTimeout(() => {
      setShowResult(true)
      toast('AI analysis complete')
    }, 1200)
  }

  return (
    <div className="space-y-6">
      {/* Starter Questions */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: textMuted }}>
          Starter Questions — Requirements Phase
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {starters.map(({ cat, color, q }) => {
            const c = isDark ? color.dark : color.light
            return (
              <GlassCard key={cat} className="p-5 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: `${c}66` }} />
                <span className="text-[10px] font-bold uppercase" style={{ color: c }}>{cat}</span>
                <p className="text-sm font-semibold leading-snug" style={{ color: textPrimary }}>{q}</p>
              </GlassCard>
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }} />

      {/* Generate */}
      <div className="flex flex-col items-center gap-4 py-4">
        <button
          onClick={handleGenerate}
          className="px-6 py-3 rounded-[10px] font-bold text-sm flex items-center gap-3 transition-all"
          style={{
            backgroundColor: isDark ? '#343439' : '#ffffff',
            color: textPrimary,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          }}
        >
          <Sparkles size={18} color={accent} />
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
              <span className="mt-0.5" style={{ color: accent }}>{i + 1}.</span> {q}
            </li>
          ))}
        </ul>
      </AIResultBox>
    </div>
  )
}
