import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useToast } from '@/stores/toast'
import { AIResultBox } from '@/components/ui/AIResultBox'
import { LoadingBar } from '@/components/ui/LoadingBar'

export function StructureTab() {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const toast = useToast((s) => s.show)
  const [loading, setLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const accent = isDark ? '#10b981' : '#059669'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  function handleGenerate() {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setShowResult(true)
      toast('AI analysis complete')
    }, 1800)
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-center py-2" style={{ color: textSoft }}>
        Synthesize your notes into a professional structure using AI.
      </p>

      <div
        className="flex flex-col items-center gap-4 py-10 rounded-[16px]"
        style={{
          backgroundColor: isDark ? '#18181b' : '#ffffff',
          border: `1px solid ${border}`,
        }}
      >
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
          Structure My Notes
        </button>
        <LoadingBar visible={loading} />
      </div>

      <AIResultBox title="AI Structural Synthesis" visible={showResult}>
        <div className="space-y-5">
          {[
            { num: '01', title: 'Technical Requirements', text: 'Redesign internal cooling channels to support high-load thermal profiles. Transition to titanium-grade alloys for critical stress points.' },
            { num: '02', title: 'Strategic Decisions', text: 'Bypass secondary systems to achieve 12% efficiency improvement and weight reduction targets.' },
            { num: '03', title: 'Action Items', text: 'Schedule follow-up engineering review within 2 weeks. Prepare prototype specifications for Q1 evaluation.' },
          ].map((item) => (
            <div key={item.num}>
              <h4 className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: textMuted }}>
                {item.num}. {item.title}
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: textSoft }}>{item.text}</p>
            </div>
          ))}
        </div>
      </AIResultBox>
    </div>
  )
}
