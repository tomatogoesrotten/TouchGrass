import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { useTheme } from '@/stores/theme'

interface Props {
  data: { date: string; count: number }[]
}

export function TimelineBar({ data }: Props) {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'

  const accent = isDark ? '#c4f042' : '#a3cc29'
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sessions: d.count,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: isDark ? '#71717a' : '#a1a1aa', fontFamily: 'JetBrains Mono, monospace' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: isDark ? '#71717a' : '#a1a1aa', fontFamily: 'JetBrains Mono, monospace' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 12,
            fontSize: 12,
            color: isDark ? '#fafafa' : '#09090b',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
          cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
        />
        <Bar dataKey="sessions" fill={accent} radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
