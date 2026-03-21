import { useState } from 'react'
import { Globe, Search, BookOpen } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import { useToast } from '@/stores/toast'
import { api } from '@/lib/api'
import { AIResultBox } from '@/components/ui/AIResultBox'
import { LoadingBar } from '@/components/ui/LoadingBar'
import { GlassCard } from '@/components/ui/GlassCard'

export function DomainTab() {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const activeSession = useSession((s) => s.activeSession)
  const toast = useToast((s) => s.show)
  const [query, setQuery] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  async function handleLookup() {
    if (!activeSession || !query.trim()) return
    setLoading(true)
    try {
      const data = await api.aiDomain(activeSession.id, query.trim())
      setResult(data.result)
      toast('Domain intelligence loaded')
    } catch {
      toast('Lookup failed — try again', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassCard className="h-full flex flex-col p-5 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          <BookOpen size={16} color={textPrimary} />
        </div>
        <h2 className="text-[16px] font-bold tracking-tight" style={{ color: textPrimary }}>Domain</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: `${textMuted} transparent` }}>
        <p className="text-sm" style={{ color: textSoft }}>
          Research domain intelligence for{' '}
          <strong style={{ color: textPrimary }}>{activeSession?.industry ?? 'your industry'}</strong>{' '}
          to prepare for your session.
        </p>

        <div className="flex gap-3">
          <div
            className="flex-1 rounded-[12px] flex items-center px-4"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${border}`,
            }}
          >
            <Globe size={16} className="mr-3 flex-shrink-0" color={textMuted} />
            <input
              className="w-full bg-transparent border-none outline-none text-sm py-2.5"
              style={{ color: textPrimary }}
              placeholder="Enter industry term or topic..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            />
          </div>
          <button
            className="px-5 py-2.5 rounded-[12px] font-semibold text-sm flex items-center gap-2 transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDark ? 'var(--color-surface-highest)' : '#f4f4f5',
              color: textPrimary,
              border: `1px solid ${border}`,
            }}
            onClick={handleLookup}
            disabled={loading || !query.trim()}
          >
            <Search size={14} />
            Look Up
          </button>
        </div>

        <LoadingBar visible={loading} />

        {result && (
          <AIResultBox title="Domain Intelligence" visible>
            <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: textSoft }}>
              {result}
            </div>
          </AIResultBox>
        )}
      </div>
    </GlassCard>
  )
}
