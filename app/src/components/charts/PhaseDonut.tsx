import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useTheme } from '@/stores/theme'
import { phaseConfig } from '@/lib/phase'
import type { Phase } from '@/stores/session'

interface Props {
  data: { phase: string; count: number }[]
}

export function PhaseDonut({ data }: Props) {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'

  const chartData = data.map((d) => ({
    name: phaseConfig[d.phase as Phase]?.label ?? d.phase,
    value: d.count,
    color: isDark
      ? phaseConfig[d.phase as Phase]?.darkColor ?? '#71717a'
      : phaseConfig[d.phase as Phase]?.lightColor ?? '#a1a1aa',
  }))

  const total = chartData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="relative w-full h-full min-h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 12,
              fontSize: 12,
              color: isDark ? '#fafafa' : '#09090b',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="font-mono text-[28px] font-bold tracking-tight" style={{ color: isDark ? '#fafafa' : '#09090b' }}>
            {total}
          </div>
          <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: isDark ? '#71717a' : '#a1a1aa' }}>
            Total
          </div>
        </div>
      </div>
    </div>
  )
}
