import { useTheme } from '@/stores/theme'
import { phaseConfig } from '@/lib/phase'
import type { Phase } from '@/stores/session'

interface Props {
  data: { phase: string; client_count: number }[]
}

const PHASE_ORDER: Phase[] = ['requirements', 'follow-up', 'demo', 'troubleshoot']

export function EngagementFunnel({ data }: Props) {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'

  const ordered = PHASE_ORDER.map((phase) => {
    const found = data.find((d) => d.phase === phase)
    return {
      phase,
      label: phaseConfig[phase].label,
      count: found?.client_count ?? 0,
      color: isDark ? phaseConfig[phase].darkColor : phaseConfig[phase].lightColor,
    }
  })

  const maxCount = Math.max(...ordered.map((d) => d.count), 1)

  return (
    <div className="flex flex-col gap-3 h-full justify-center px-2">
      {ordered.map((item, i) => {
        const widthPct = Math.max((item.count / maxCount) * 100, 12)
        return (
          <div key={item.phase} className="flex items-center gap-3">
            <div className="w-[90px] flex-shrink-0 text-right">
              <span className="text-[11px] font-semibold" style={{ color: item.color }}>
                {item.label}
              </span>
            </div>
            <div className="flex-1 relative">
              <div
                className="h-9 rounded-[8px] flex items-center px-3 transition-all duration-500"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: `${item.color}20`,
                  borderLeft: `3px solid ${item.color}`,
                }}
              >
                <span className="font-mono text-[13px] font-bold" style={{ color: item.color }}>
                  {item.count}
                </span>
              </div>
              {i < ordered.length - 1 && item.count > 0 && ordered[i + 1].count > 0 && (
                <div
                  className="absolute -bottom-2.5 left-[45px] text-[9px] font-mono"
                  style={{ color: isDark ? '#71717a' : '#a1a1aa' }}
                >
                  {Math.round((ordered[i + 1].count / item.count) * 100)}% conv.
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
