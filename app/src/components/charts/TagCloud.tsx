import { useTheme } from '@/stores/theme'

interface Props {
  data: { label: string; emoji: string; count: number }[]
}

export function TagCloud({ data }: Props) {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'

  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="text-[12px]" style={{ color: isDark ? '#71717a' : '#a1a1aa' }}>
          No tags recorded yet
        </span>
      </div>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const accent = isDark ? '#c4f042' : '#a3cc29'

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center p-2">
      {data.map((tag, i) => {
        const scale = 0.6 + (tag.count / maxCount) * 0.4
        const opacity = 0.5 + (tag.count / maxCount) * 0.5
        return (
          <div
            key={i}
            className="px-3 py-1.5 rounded-[100px] transition-all hover:scale-105 cursor-default"
            style={{
              backgroundColor: `${accent}${Math.round(opacity * 25).toString(16).padStart(2, '0')}`,
              border: `1px solid ${accent}${Math.round(opacity * 40).toString(16).padStart(2, '0')}`,
              fontSize: `${Math.round(11 * scale + 2)}px`,
              color: isDark ? `rgba(250,250,250,${opacity})` : `rgba(9,9,11,${opacity})`,
            }}
          >
            <span className="mr-1">{tag.emoji}</span>
            <span className="font-medium">{tag.label}</span>
            <span className="ml-1.5 font-mono text-[10px] opacity-60">{tag.count}</span>
          </div>
        )
      })}
    </div>
  )
}
