import { useState } from 'react'
import { Shield, Lock } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import { useToast } from '@/stores/toast'
import { api } from '@/lib/api'
import { GlassCard } from '@/components/ui/GlassCard'
import { PrimaryBtn } from '@/components/ui/PrimaryBtn'
import { AIResultBox } from '@/components/ui/AIResultBox'
import { LoadingBar } from '@/components/ui/LoadingBar'

export function SolutionsTab() {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const { activeSession, updateActiveSession } = useSession()
  const toast = useToast((s) => s.show)
  const [loading, setLoading] = useState(false)

  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const warnColor = isDark ? 'var(--color-warn-dark)' : 'var(--color-warn-light)'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  const text = activeSession?.privateSolutions ?? ''
  const feedback = activeSession?.aiSolutionFeedback ?? ''

  async function handleReview() {
    if (!activeSession) return
    setLoading(true)
    try {
      const { result } = await api.aiSolutions(activeSession.id)
      updateActiveSession({ aiSolutionFeedback: result })
      toast('AI analysis complete')
    } catch {
      toast('AI request failed — try again', 'error')
    } finally {
      setLoading(false)
    }
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
        <div className="p-5 rounded-[16px] overflow-hidden" style={{ 
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
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
            onChange={(e) => updateActiveSession({ privateSolutions: e.target.value })}
          />
          <div className="flex items-center justify-end gap-3 mt-4">
            <LoadingBar visible={loading} />
            <PrimaryBtn
              className="px-5 py-2.5 text-sm"
              onClick={handleReview}
              disabled={loading || !text.trim()}
            >
              Review My Ideas
            </PrimaryBtn>
          </div>
        </div>

        {feedback && (
          <AIResultBox title="AI Analysis & Refinement" visible>
            <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: textSoft }}>
              {feedback}
            </div>
          </AIResultBox>
        )}
      </div>
    </GlassCard>
  )
}
