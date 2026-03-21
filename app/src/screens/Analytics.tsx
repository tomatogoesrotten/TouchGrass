import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Users, Brain, Tag } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { NavBar } from '@/components/ui/NavBar'
import { GlassCard } from '@/components/ui/GlassCard'
import { PhaseDonut } from '@/components/charts/PhaseDonut'
import { TimelineBar } from '@/components/charts/TimelineBar'
import { IndustryBreakdown } from '@/components/charts/IndustryBreakdown'
import { ActivityHeatmap } from '@/components/charts/ActivityHeatmap'
import { EngagementFunnel } from '@/components/charts/EngagementFunnel'
import { TagCloud } from '@/components/charts/TagCloud'
import { AIUsageStats } from '@/components/charts/AIUsageStats'
import { IndustryTreemap } from '@/components/charts/IndustryTreemap'
import { api } from '@/lib/api'
import type { AnalyticsSummary } from '@/lib/api'

type Range = '7d' | '30d' | '90d' | 'all'

export function Analytics() {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const [range, setRange] = useState<Range>('all')
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getAnalyticsSummary(range === 'all' ? undefined : range)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [range])

  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const accent = isDark ? '#c4f042' : '#a3cc29'

  const ranges: { value: Range; label: string }[] = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: 'all', label: 'All' },
  ]

  const statCards = data ? [
    { label: 'Total Sessions', value: data.totals.totalSessions.toString(), icon: Activity, color: accent },
    { label: 'Active Clients', value: data.totals.activeClients.toString(), icon: Users, color: isDark ? '#8b5cf6' : '#7c3aed' },
    { label: 'AI Utilization', value: `${data.totals.aiUtilization}%`, icon: Brain, color: isDark ? '#ff8a00' : '#e67d00' },
    { label: 'Avg Tags/Session', value: data.totals.avgTags.toFixed(1), icon: Tag, color: isDark ? '#ff4d6a' : '#e5384b' },
  ] : []

  const fadeIn = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  }

  return (
    <div className="min-h-screen relative" style={{ zIndex: 1 }}>
      <NavBar />
      <main className="max-w-[1400px] mx-auto px-6 pt-8 pb-20">
        {/* Header + Range Selector */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-bold tracking-tight" style={{ color: textPrimary }}>
              Analytics
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: textSoft }}>
              Session intelligence and engagement metrics
            </p>
          </div>
          <div
            className="flex items-center gap-0.5 rounded-[100px] p-1"
            style={{ backgroundColor: isDark ? '#18181b' : '#ffffff', border: `1px solid ${border}` }}
          >
            {ranges.map((r) => (
              <button
                key={r.value}
                className="px-4 py-1.5 rounded-[100px] text-[11px] font-bold font-mono transition-all"
                style={{
                  backgroundColor: range === r.value ? (isDark ? '#27272a' : '#f4f4f5') : 'transparent',
                  color: range === r.value ? textPrimary : textMuted,
                }}
                onClick={() => setRange(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {loading && !data ? (
          <div className="flex items-center justify-center py-40">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${accent} transparent transparent transparent` }} />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Stats Ribbon */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <motion.div key={stat.label} {...fadeIn} transition={{ ...fadeIn.transition, delay: i * 0.05 }}>
                    <GlassCard className="p-5 flex items-center gap-4" hoverable>
                      <div
                        className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${stat.color}15` }}
                      >
                        <Icon size={20} color={stat.color} />
                      </div>
                      <div>
                        <div className="font-mono text-[24px] font-bold tracking-tight leading-none" style={{ color: textPrimary }}>
                          {stat.value}
                        </div>
                        <div className="text-[11px] font-medium mt-1" style={{ color: textMuted }}>
                          {stat.label}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )
              })}
            </div>

            {/* Row 1: Phase Donut + Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <motion.div className="lg:col-span-4" {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.2 }}>
                <GlassCard className="p-6 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] font-semibold" style={{ color: textPrimary }}>Phase Distribution</span>
                  </div>
                  <div className="h-[240px]">
                    <PhaseDonut data={data.phaseDistribution} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {data.phaseDistribution.map((d) => (
                      <div key={d.phase} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{
                          backgroundColor: isDark
                            ? ({ requirements: '#c4f042', 'follow-up': '#8b5cf6', demo: '#ff8a00', troubleshoot: '#ff4d6a' }[d.phase] || '#71717a')
                            : ({ requirements: '#a3cc29', 'follow-up': '#7c3aed', demo: '#e67d00', troubleshoot: '#e5384b' }[d.phase] || '#a1a1aa')
                        }} />
                        <span className="text-[11px] font-mono" style={{ color: textSoft }}>
                          {d.phase} ({d.count})
                        </span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div className="lg:col-span-8" {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.25 }}>
                <GlassCard className="p-6 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] font-semibold" style={{ color: textPrimary }}>Sessions Over Time</span>
                    <span className="text-[11px] font-mono" style={{ color: textMuted }}>by week</span>
                  </div>
                  <div className="h-[280px]">
                    <TimelineBar data={data.sessionsOverTime} />
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            {/* Row 2: Treemap + Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.3 }}>
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] font-semibold" style={{ color: textPrimary }}>Industry Map</span>
                    <span className="text-[11px] font-mono" style={{ color: textMuted }}>by session count</span>
                  </div>
                  <div className="h-[240px]">
                    <IndustryTreemap data={data.industryDistribution} />
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.35 }}>
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] font-semibold" style={{ color: textPrimary }}>Engagement Funnel</span>
                    <span className="text-[11px] font-mono" style={{ color: textMuted }}>unique clients</span>
                  </div>
                  <div className="h-[240px]">
                    <EngagementFunnel data={data.engagementFunnel} />
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            {/* Row 3: Activity Heatmap */}
            <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.4 }}>
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] font-semibold" style={{ color: textPrimary }}>Activity</span>
                  <span className="text-[11px] font-mono" style={{ color: textMuted }}>past 12 months</span>
                </div>
                <ActivityHeatmap data={data.activityHeatmap} />
              </GlassCard>
            </motion.div>

            {/* Row 4: Tag Cloud, Industry Breakdown, AI Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.45 }}>
                <GlassCard className="p-6 h-full">
                  <div className="mb-4">
                    <span className="text-[13px] font-semibold" style={{ color: textPrimary }}>Quick Tags</span>
                  </div>
                  <div className="h-[200px] overflow-hidden">
                    <TagCloud data={data.tagDistribution} />
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.5 }}>
                <GlassCard className="p-6 h-full">
                  <div className="mb-4">
                    <span className="text-[13px] font-semibold" style={{ color: textPrimary }}>Industries</span>
                  </div>
                  <div className="h-[200px]">
                    <IndustryBreakdown data={data.industryDistribution} />
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.55 }}>
                <GlassCard className="p-6 h-full">
                  <div className="mb-4">
                    <span className="text-[13px] font-semibold" style={{ color: textPrimary }}>AI Usage</span>
                  </div>
                  <div className="h-[200px]">
                    <AIUsageStats data={data.aiUsage} total={data.totals.totalSessions} />
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-40">
            <span className="text-sm" style={{ color: textMuted }}>Failed to load analytics</span>
          </div>
        )}
      </main>
    </div>
  )
}
