import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { useTheme } from '@/stores/theme'

interface Props {
  data: { industry: string; count: number }[]
}

const COLORS_DARK = ['#c4f042', '#8b5cf6', '#ff8a00', '#ff4d6a', '#06b6d4', '#f43f5e', '#22d3ee', '#a78bfa']
const COLORS_LIGHT = ['#a3cc29', '#7c3aed', '#e67d00', '#e5384b', '#0891b2', '#e11d48', '#0ea5e9', '#8b5cf6']

export function IndustryBreakdown({ data }: Props) {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const colors = isDark ? COLORS_DARK : COLORS_LIGHT

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: isDark ? '#71717a' : '#a1a1aa', fontFamily: 'JetBrains Mono, monospace' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="industry"
          tick={{ fontSize: 11, fill: isDark ? '#a1a1aa' : '#52525b' }}
          axisLine={false}
          tickLine={false}
          width={120}
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
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
