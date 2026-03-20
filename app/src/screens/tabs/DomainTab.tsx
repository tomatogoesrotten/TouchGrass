import { useState } from 'react'
import { Globe } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import { useToast } from '@/stores/toast'
import { Glass } from '@/components/ui/Glass'
import { AIResultBox } from '@/components/ui/AIResultBox'

export function DomainTab() {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const activeSession = useSession((s) => s.activeSession)
  const toast = useToast((s) => s.show)
  const [query, setQuery] = useState('')
  const [showResult, setShowResult] = useState(false)

  const textPrimary = isDark ? '#f0f1f4' : '#111318'
  const textSoft = isDark ? '#a0a5b8' : '#5a5f72'
  const textMuted = isDark ? '#5c6178' : '#5a5f72'

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
        <Glass className="flex-1 rounded-[10px] flex items-center px-4 py-1">
          <Globe size={18} className="mr-3" color={textMuted} />
          <input
            className="w-full bg-transparent border-none outline-none text-sm font-medium"
            style={{ color: textPrimary }}
            placeholder="Enter industry term or topic..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Glass>
        <Glass
          className="px-6 py-2.5 rounded-[10px] font-bold text-sm cursor-pointer transition-all hover:opacity-80"
          style={{ color: textPrimary }}
          onClick={handleLookup}
        >
          Look Up
        </Glass>
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
