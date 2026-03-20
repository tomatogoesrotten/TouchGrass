import { useTheme } from '@/stores/theme'

interface Props {
  visible: boolean
}

export function LoadingBar({ visible }: Props) {
  const theme = useTheme((s) => s.theme)
  const accent = theme === 'dark' ? '#00e5a0' : '#00b37e'

  if (!visible) return null

  return (
    <div
      className="w-48 h-[2px] rounded-full overflow-hidden"
      style={{ backgroundColor: `${accent}33` }}
    >
      <div
        className="w-1/3 h-full rounded-full loading-bar"
        style={{ backgroundColor: accent }}
      />
    </div>
  )
}
