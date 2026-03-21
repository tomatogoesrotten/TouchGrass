import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { useTheme } from '@/stores/theme'

interface Props {
  data: { feature: string; count: number }[]
  total: number
}

export function AIUsageStats({ data, total }: Props) {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'

  const colors = isDark
    ? ['#c4f042', '#8b5cf6', '#ff8a00']
    : ['#a3cc29', '#7c3aed', '#e67d00']

  const chartData = data.map((d) => ({
    ...d,
    pct: total > 0 ? Math.round((d.count / total) * 100) : 0,
  }))

  return (
    <div className="h-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
          <XAxis
            dataKey="feature"
            tick={{ fontSize: 11, fill: isDark ? '#a1a1aa' : '#52525b' }}
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
            formatter={(value, _name, props) => {
              const pct = (props.payload as { pct: number }).pct
              return [`${value} (${pct}%)`, 'Sessions']
            }}
            cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
