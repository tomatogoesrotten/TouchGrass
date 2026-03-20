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

  const textSoft = isDark ? '#a0a5b8' : '#5a5f72'
  const textMuted = isDark ? '#5c6178' : '#5a5f72'
  const textPrimary = isDark ? '#f0f1f4' : '#111318'
  const accent = isDark ? '#00e5a0' : '#00b37e'

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
        className="flex flex-col items-center gap-4 py-8 rounded-[14px]"
        style={{ backgroundColor: isDark ? '#1a1b20' : '#f1f3f9' }}
      >
        <button
          onClick={handleGenerate}
          className="group relative px-6 py-3 rounded-[10px] font-bold text-sm flex items-center gap-3 transition-all"
          style={{
            backgroundColor: isDark ? '#343439' : '#ffffff',
            color: textPrimary,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          }}
        >
          <Sparkles size={18} color={accent} />
          Structure My Notes
        </button>
        <LoadingBar visible={loading} />
      </div>

      <AIResultBox title="AI Structural Synthesis" visible={showResult}>
        <div className="space-y-4">
          {[
            { num: '01', title: 'Technical Requirements', text: 'Redesign internal cooling channels to support high-load thermal profiles. Transition to titanium-grade alloys for critical stress points.' },
            { num: '02', title: 'Strategic Decisions', text: 'Bypass secondary systems to achieve 12% efficiency improvement and weight reduction targets.' },
            { num: '03', title: 'Action Items', text: 'Schedule follow-up engineering review within 2 weeks. Prepare prototype specifications for Q1 evaluation.' },
          ].map((item) => (
            <div key={item.num}>
              <h4 className="text-xs font-[900] uppercase tracking-widest mb-2" style={{ color: textMuted }}>
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
