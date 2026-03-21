import { useMemo } from 'react'
import { useTheme } from '@/stores/theme'

interface Props {
  data: { date: string; count: number }[]
}

export function ActivityHeatmap({ data }: Props) {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'

  const { weeks, months, maxCount } = useMemo(() => {
    const map = new Map<string, number>()
    data.forEach((d) => map.set(d.date, d.count))

    const end = new Date()
    const start = new Date(end)
    start.setDate(start.getDate() - 364)
    start.setDate(start.getDate() - start.getDay())

    const weeks: { date: Date; count: number }[][] = []
    let currentWeek: { date: Date; count: number }[] = []
    let maxCount = 0
    const months: { label: string; col: number }[] = []
    let lastMonth = -1

    const cursor = new Date(start)
    while (cursor <= end) {
      const key = cursor.toISOString().split('T')[0]
      const count = map.get(key) || 0
      if (count > maxCount) maxCount = count

      if (cursor.getMonth() !== lastMonth) {
        months.push({
          label: cursor.toLocaleDateString('en-US', { month: 'short' }),
          col: weeks.length,
        })
        lastMonth = cursor.getMonth()
      }

      currentWeek.push({ date: new Date(cursor), count })

      if (cursor.getDay() === 6) {
        weeks.push(currentWeek)
        currentWeek = []
      }

      cursor.setDate(cursor.getDate() + 1)
    }
    if (currentWeek.length) weeks.push(currentWeek)

    return { weeks, months, maxCount }
  }, [data])

  function getColor(count: number) {
    if (count === 0) return isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
    const intensity = maxCount > 0 ? count / maxCount : 0
    if (isDark) {
      if (intensity <= 0.25) return 'rgba(196,240,66,0.2)'
      if (intensity <= 0.5) return 'rgba(196,240,66,0.4)'
      if (intensity <= 0.75) return 'rgba(196,240,66,0.6)'
      return 'rgba(196,240,66,0.85)'
    }
    if (intensity <= 0.25) return 'rgba(163,204,41,0.25)'
    if (intensity <= 0.5) return 'rgba(163,204,41,0.45)'
    if (intensity <= 0.75) return 'rgba(163,204,41,0.65)'
    return 'rgba(163,204,41,0.9)'
  }

  const cellSize = 12
  const gap = 2

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Month labels */}
        <div className="flex mb-1 ml-[28px]">
          {months.map((m, i) => (
            <div
              key={i}
              className="text-[10px] font-mono"
              style={{
                color: isDark ? '#71717a' : '#a1a1aa',
                position: 'absolute',
                left: `${28 + m.col * (cellSize + gap)}px`,
              }}
            >
              {m.label}
            </div>
          ))}
        </div>

        <div className="relative mt-5">
          {/* Day labels */}
          <div className="absolute left-0 top-0 flex flex-col" style={{ gap: `${gap}px` }}>
            {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
              <div
                key={i}
                className="text-[9px] font-mono flex items-center"
                style={{ height: cellSize, color: isDark ? '#71717a' : '#a1a1aa' }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex ml-[28px]" style={{ gap: `${gap}px` }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: `${gap}px` }}>
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={`${day.date.toLocaleDateString()}: ${day.count} session${day.count !== 1 ? 's' : ''}`}
                    className="rounded-[2px] transition-all hover:ring-1 hover:ring-white/20"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: getColor(day.count),
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 ml-[28px]">
          <span className="text-[10px] font-mono" style={{ color: isDark ? '#71717a' : '#a1a1aa' }}>Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
            <div
              key={intensity}
              className="rounded-[2px]"
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: getColor(intensity * (maxCount || 1)),
              }}
            />
          ))}
          <span className="text-[10px] font-mono" style={{ color: isDark ? '#71717a' : '#a1a1aa' }}>More</span>
        </div>
      </div>
    </div>
  )
}
