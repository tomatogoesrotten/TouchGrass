import { useState } from 'react'
import { Sparkles, Network } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import { useToast } from '@/stores/toast'
import { api } from '@/lib/api'
import { AIResultBox } from '@/components/ui/AIResultBox'
import { LoadingBar } from '@/components/ui/LoadingBar'
import { GlassCard } from '@/components/ui/GlassCard'

export function StructureTab() {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const { activeSession, updateActiveSession } = useSession()
  const toast = useToast((s) => s.show)
  const [loading, setLoading] = useState(false)

  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  const result = activeSession?.structuredNotes ?? ''
  const hasContent = !!(activeSession?.transcript || activeSession?.manualNotes)

  async function handleGenerate() {
    if (!activeSession) return
    setLoading(true)
    try {
      const { result } = await api.aiStructure(activeSession.id)
      updateActiveSession({ structuredNotes: result })
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
          <Network size={16} color={textPrimary} />
        </div>
        <h2 className="text-[16px] font-bold tracking-tight" style={{ color: textPrimary }}>Structure</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: `${textMuted} transparent` }}>
        <p className="text-sm text-center py-2" style={{ color: textSoft }}>
          Synthesize your notes into a professional structure using AI.
        </p>

        <div
          className="flex flex-col items-center gap-4 py-8 rounded-[16px]"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${border}`,
          }}
        >
          <button
            onClick={handleGenerate}
            disabled={loading || !hasContent}
            className="px-5 py-2.5 rounded-[12px] font-semibold text-sm flex items-center gap-2.5 transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDark ? 'var(--color-surface-highest)' : '#ffffff',
              color: textPrimary,
              border: `1px solid ${border}`,
            }}
          >
            <Sparkles size={16} color="var(--color-accent-dark)" />
            {result ? 'Re-structure Notes' : 'Structure My Notes'}
          </button>
          <LoadingBar visible={loading} />
          {!hasContent && (
            <p className="text-xs" style={{ color: textMuted }}>Add notes or record first</p>
          )}
        </div>

        {result && (
          <AIResultBox title="AI Structural Synthesis" visible>
            <div className="prose-sm text-sm leading-relaxed whitespace-pre-wrap" style={{ color: textSoft }}>
              {result}
            </div>
          </AIResultBox>
        )}
      </div>
    </GlassCard>
  )
}
