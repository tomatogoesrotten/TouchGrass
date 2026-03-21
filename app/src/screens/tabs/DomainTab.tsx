import { useState } from 'react'
import { Globe, Search } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import { useToast } from '@/stores/toast'
import { AIResultBox } from '@/components/ui/AIResultBox'

export function DomainTab() {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const activeSession = useSession((s) => s.activeSession)
  const toast = useToast((s) => s.show)
  const [query, setQuery] = useState('')
  const [showResult, setShowResult] = useState(false)

  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  function handleLookup() {
    setTimeout(() => {
      setShowResult(true)
      toast('Domain intelligence loaded')
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <p className="text-sm" style={{ color: textSoft }}>
        Research domain intelligence for{' '}
        <strong style={{ color: textPrimary }}>{activeSession?.industry ?? 'your industry'}</strong>{' '}
        to prepare for your session.
      </p>

      <div className="flex gap-3">
        <div
          className="flex-1 rounded-[12px] flex items-center px-4"
          style={{
            backgroundColor: isDark ? '#18181b' : '#ffffff',
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
          />
        </div>
        <button
          className="px-5 py-2.5 rounded-[12px] font-semibold text-sm flex items-center gap-2 transition-all hover:brightness-110"
          style={{
            backgroundColor: isDark ? '#27272a' : '#f4f4f5',
            color: textPrimary,
            border: `1px solid ${border}`,
          }}
          onClick={handleLookup}
        >
          <Search size={14} />
          Look Up
        </button>
      </div>

      <AIResultBox title="Domain Intelligence" visible={showResult}>
        <div className="space-y-3 text-sm leading-relaxed" style={{ color: textSoft }}>
          <p>
            <strong style={{ color: textPrimary }}>{activeSession?.industry ?? 'Cloud Infrastructure'}</strong> market
            is projected to reach $1.2T by 2028. Key players include hyperscalers (AWS, Azure, GCP) and emerging
            multi-cloud orchestration platforms.
          </p>
          <p>
            Current trends: edge computing adoption, serverless architectures, AI-optimized infrastructure, and
            sustainability-driven data center innovations.
          </p>
        </div>
      </AIResultBox>
    </div>
  )
}
