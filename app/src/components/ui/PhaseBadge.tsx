import { useTheme } from '@/stores/theme'
import { phaseConfig, getPhaseColor } from '@/lib/phase'
import type { Phase } from '@/stores/session'

interface Props {
  phase: Phase
  variant?: 'full' | 'mini'
}

export function PhaseBadge({ phase, variant = 'full' }: Props) {
  const theme = useTheme((s) => s.theme)
  const color = getPhaseColor(phase, theme)
  const label = phaseConfig[phase].label

  if (variant === 'mini') {
    return (
      <span
        className="px-2.5 py-1 rounded-[8px] text-[10px] font-semibold uppercase tracking-wider"
        style={{ backgroundColor: `${color}18`, color }}
      >
        {label}
      </span>
    )
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[11px] font-semibold"
      style={{ backgroundColor: `${color}15`, color }}
    >
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </div>
  )
}
