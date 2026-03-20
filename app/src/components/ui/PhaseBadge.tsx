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
  const label = phaseConfig[phase].label.toUpperCase()

  if (variant === 'mini') {
    return (
      <span
        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {label}
      </span>
    )
  }

  return (
    <div
      className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-bold"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      {label}
    </div>
  )
}
