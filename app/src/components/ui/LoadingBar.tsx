import { useTheme } from '@/stores/theme'

interface Props {
  visible: boolean
}

export function LoadingBar({ visible }: Props) {
  const theme = useTheme((s) => s.theme)
  const accent = theme === 'dark' ? '#10b981' : '#059669'

  if (!visible) return null

  return (
    <div
      className="w-48 h-[3px] rounded-full overflow-hidden"
      style={{ backgroundColor: `${accent}20` }}
    >
      <div
        className="w-1/3 h-full rounded-full loading-bar"
        style={{ backgroundColor: accent }}
      />
    </div>
  )
}
