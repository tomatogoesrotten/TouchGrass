import { useState } from 'react'
import { Shield, Lock } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useToast } from '@/stores/toast'
import { GlassCard } from '@/components/ui/GlassCard'
import { PrimaryBtn } from '@/components/ui/PrimaryBtn'
import { AIResultBox } from '@/components/ui/AIResultBox'

export function SolutionsTab() {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const toast = useToast((s) => s.show)
  const [text, setText] = useState('')
  const [showResult, setShowResult] = useState(false)

  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const warnColor = isDark ? 'var(--color-warn-dark)' : 'var(--color-warn-light)'
  const accent = isDark ? 'var(--color-accent-dark)' : 'var(--color-accent-light)'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  function handleReview() {
    setTimeout(() => {
      setShowResult(true)
      toast('AI analysis complete')
    }, 1500)
  }

  return (
    <GlassCard className="h-full flex flex-col p-5 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          <Lock size={16} color={textPrimary} />
        </div>
        <h2 className="text-[16px] font-bold tracking-tight" style={{ color: textPrimary }}>Solutions</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: `${textMuted} transparent` }}>
        {/* Private Card */}
        <div className="p-5 rounded-[16px] overflow-hidden" style={{ 
          backgroundColor: isDark ? 'var(--color-surface-high)' : 'var(--color-surface-light-mid)',
          border: `1px solid ${border}`,
          borderLeft: `3px solid ${warnColor}` 
        }}>
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-7 h-7 rounded-[8px] flex items-center justify-center"
              style={{ backgroundColor: isDark ? 'rgba(255,138,0,0.15)' : 'rgba(230,125,0,0.15)' }}
            >
              <Shield size={14} color={warnColor} />
            </div>
            <span className="font-semibold text-[13px]" style={{ color: warnColor }}>
              Private — Never shown to clients
            </span>
          </div>
          <textarea
            className="w-full bg-transparent border-none outline-none text-[14px] leading-[1.8] min-h-[120px] p-0 resize-none"
            style={{ color: textPrimary }}
            placeholder="Draft your solution hypothesis here... The AI will help refine these into professional deliverables."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex justify-end mt-4">
            <PrimaryBtn className="px-5 py-2.5 text-sm" onClick={handleReview}>
              Review My Ideas
            </PrimaryBtn>
          </div>
        </div>

        {/* AI Result */}
        <AIResultBox title="AI Analysis & Refinement" visible={showResult}>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { num: '01', text: 'Map technical requirements to existing infrastructure to reduce friction in Phase 2.' },
              { num: '02', text: "Budget allocation aligns with client's fiscal Q3 constraints identified in notes." },
            ].map((item) => (
              <div
                key={item.num}
                className="p-4 rounded-[14px]"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${border}`,
                }}
              >
                <span className="font-mono text-[10px] font-semibold" style={{ color: accent }}>
                  Optimization {item.num}
                </span>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: textSoft }}>{item.text}</p>
              </div>
            ))}
          </div>
        </AIResultBox>
      </div>
    </GlassCard>
  )
}
