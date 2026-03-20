import { useState } from 'react'
import { Shield } from 'lucide-react'
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

  const textPrimary = isDark ? '#f0f1f4' : '#111318'
  const textSoft = isDark ? '#a0a5b8' : '#5a5f72'
  const textMuted = isDark ? '#5c6178' : '#5a5f72'
  const warnColor = isDark ? '#ffb347' : '#e68a00'
  const accent = isDark ? '#00e5a0' : '#00b37e'

  function handleReview() {
    setTimeout(() => {
      setShowResult(true)
      toast('AI analysis complete')
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Private Card */}
      <GlassCard className="p-6" style={{ borderLeft: `4px solid ${warnColor}` }}>
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} color={warnColor} />
          <span className="font-bold text-sm" style={{ color: warnColor }}>
            🔒 Private — Never shown to clients
          </span>
        </div>
        <textarea
          className="w-full bg-transparent border-none outline-none font-headline text-[15px] leading-[1.7] min-h-[200px] p-0 resize-y"
          style={{ color: textPrimary }}
          placeholder="Draft your solution hypothesis here... The AI will help refine these into professional deliverables."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex justify-end mt-4">
          <PrimaryBtn className="px-6 py-2.5 text-sm" onClick={handleReview}>
            Review My Ideas
          </PrimaryBtn>
        </div>
      </GlassCard>

      {/* AI Result */}
      <AIResultBox title="AI Analysis & Refinement" visible={showResult}>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { num: '01', text: 'Map technical requirements to existing infrastructure to reduce friction in Phase 2.' },
            { num: '02', text: "Budget allocation aligns with client's fiscal Q3 constraints identified in notes." },
          ].map((item) => (
            <div
              key={item.num}
              className="p-4 rounded-[10px]"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              }}
            >
              <span className="font-mono text-[10px] font-bold" style={{ color: accent }}>
                Optimization {item.num}
              </span>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: textSoft }}>{item.text}</p>
            </div>
          ))}
        </div>
      </AIResultBox>
    </div>
  )
}
