import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'
import { useTheme } from '@/stores/theme'

interface Props {
  data: { industry: string; count: number }[]
}

const COLORS_DARK = ['#c4f042', '#8b5cf6', '#ff8a00', '#ff4d6a', '#06b6d4', '#22d3ee', '#a78bfa', '#f472b6']
const COLORS_LIGHT = ['#a3cc29', '#7c3aed', '#e67d00', '#e5384b', '#0891b2', '#0ea5e9', '#8b5cf6', '#ec4899']

interface ContentProps {
  x: number; y: number; width: number; height: number;
  name: string; fill: string;
}

function TreemapContent({ x, y, width, height, name, fill }: ContentProps) {
  if (width < 40 || height < 30) return null
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={6} ry={6} fill={fill} fillOpacity={0.8} stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
      <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="central" fontSize={width < 80 ? 9 : 11} fontWeight={600} fill="#fff">
        {name.length > 12 ? name.slice(0, 10) + '...' : name}
      </text>
    </g>
  )
}

export function IndustryTreemap({ data }: Props) {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const colors = isDark ? COLORS_DARK : COLORS_LIGHT

  const treemapData = data.map((d, i) => ({
    name: d.industry,
    size: d.count,
    fill: colors[i % colors.length],
  }))

  if (!treemapData.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="text-[12px]" style={{ color: isDark ? '#71717a' : '#a1a1aa' }}>
          No industry data
        </span>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={treemapData}
        dataKey="size"
        aspectRatio={4 / 3}
        content={<TreemapContent x={0} y={0} width={0} height={0} name="" fill="" />}
      >
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 12,
            fontSize: 12,
            color: isDark ? '#fafafa' : '#09090b',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
          formatter={(value: number) => [`${value} sessions`, 'Count']}
        />
      </Treemap>
    </ResponsiveContainer>
  )
}
