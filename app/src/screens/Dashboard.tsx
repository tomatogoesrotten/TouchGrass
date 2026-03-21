import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, X, Zap, BarChart3, Globe2, CalendarDays, ArrowUpRight } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import type { Phase } from '@/stores/session'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { GlassCard } from '@/components/ui/GlassCard'
import { PrimaryBtn } from '@/components/ui/PrimaryBtn'
import { PhaseBadge } from '@/components/ui/PhaseBadge'
import { phaseConfig, getPhaseColor } from '@/lib/phase'

type Filter = 'all' | Phase

export function Dashboard() {
  const navigate = useNavigate()
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const { sessions, setActiveSession, setDeleteTarget } = useSession()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const filtered = sessions.filter((s) => {
    if (filter !== 'all' && s.phase !== filter) return false
    if (search && !s.client.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const accent = isDark ? '#10b981' : '#059669'
  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const surface = isDark ? '#18181b' : '#ffffff'
  const surfaceLow = isDark ? '#111113' : '#f4f4f5'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  return (
    <div className="min-h-screen">
      {/* Top Navigation Bar */}
      <header
        className="sticky top-0 z-50 backdrop-blur-[20px]"
        style={{
          backgroundColor: isDark ? 'rgba(9,9,11,0.85)' : 'rgba(245,245,247,0.85)',
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center"
              style={{ backgroundColor: accent }}
            >
              <Zap size={18} color="#fff" fill="#fff" />
            </div>
            <span className="text-[17px] font-bold tracking-tight" style={{ color: textPrimary }}>
              Field Companion
            </span>
          </div>

          {/* Center Pill Nav */}
          <nav
            className="hidden md:flex items-center gap-1 rounded-[100px] p-1"
            style={{ backgroundColor: isDark ? '#18181b' : '#ffffff', border: `1px solid ${border}` }}
          >
            {['Dashboard', 'Sessions', 'Analytics'].map((item, i) => (
              <button
                key={item}
                className="px-5 py-2 rounded-[100px] text-[13px] font-semibold transition-all"
                style={{
                  backgroundColor: i === 0 ? (isDark ? '#27272a' : '#f4f4f5') : 'transparent',
                  color: i === 0 ? textPrimary : textMuted,
                }}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <PrimaryBtn className="px-4 py-2 h-9 text-[13px]" onClick={() => navigate('/setup')}>
              <Plus size={15} strokeWidth={2.5} />
              New Session
            </PrimaryBtn>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 pt-8 pb-20">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold tracking-tight" style={{ color: textPrimary }}>
            Overview
          </h1>
          <p className="text-sm mt-1" style={{ color: textSoft }}>
            Track and manage your client visit sessions
          </p>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            {
              label: 'Total Sessions',
              value: sessions.length.toString(),
              change: '+12.5%',
              changeColor: accent,
              icon: BarChart3,
              iconBg: `${accent}15`,
            },
            {
              label: 'This Week',
              value: '42',
              change: 'Trending up',
              changeColor: isDark ? '#f59e0b' : '#d97706',
              icon: CalendarDays,
              iconBg: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(217,119,6,0.1)',
            },
            {
              label: 'Industries',
              value: '18',
              change: 'Global coverage',
              changeColor: textSoft,
              icon: Globe2,
              iconBg: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(124,58,237,0.1)',
            },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <GlassCard key={stat.label} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] font-medium" style={{ color: textSoft }}>
                    {stat.label}
                  </span>
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                    style={{ backgroundColor: stat.iconBg }}
                  >
                    <Icon size={17} color={stat.changeColor === textSoft ? (isDark ? '#8b5cf6' : '#7c3aed') : stat.changeColor} />
                  </div>
                </div>
                <div className="text-[32px] font-bold tracking-tight leading-none" style={{ color: textPrimary }}>
                  {stat.value}
                </div>
                <span className="text-xs font-medium mt-2 inline-block" style={{ color: stat.changeColor }}>
                  {stat.change}
                </span>
              </GlassCard>
            )
          })}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
          <div
            className="relative w-full md:w-80 rounded-[12px] flex items-center"
            style={{ backgroundColor: isDark ? '#18181b' : '#ffffff', border: `1px solid ${border}` }}
          >
            <Search size={16} className="absolute left-4" color={textMuted} />
            <input
              className="w-full bg-transparent border-none rounded-[12px] pl-11 pr-4 py-2.5 text-sm outline-none"
              style={{ color: textPrimary }}
              placeholder="Search sessions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <button
              className="px-4 py-[7px] rounded-[100px] text-[12px] font-semibold transition-all"
              style={{
                backgroundColor: filter === 'all' ? (isDark ? '#27272a' : '#09090b') : 'transparent',
                color: filter === 'all' ? (isDark ? '#fafafa' : '#ffffff') : textMuted,
                border: filter === 'all' ? 'none' : `1px solid ${border}`,
              }}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            {(Object.keys(phaseConfig) as Phase[]).map((phase) => {
              const color = getPhaseColor(phase, theme)
              const isActive = filter === phase
              return (
                <button
                  key={phase}
                  className="px-4 py-[7px] rounded-[100px] text-[12px] font-semibold transition-all flex items-center gap-1.5"
                  style={{
                    border: `1px solid ${isActive ? `${color}66` : border}`,
                    color: isActive ? color : textMuted,
                    backgroundColor: isActive ? `${color}12` : 'transparent',
                  }}
                  onClick={() => setFilter(isActive ? 'all' : phase)}
                >
                  <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: color }} />
                  {phaseConfig[phase].label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Session Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((session, i) => {
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="group relative rounded-[20px] overflow-hidden cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor: surface,
                  border: `1px solid ${border}`,
                }}
                onClick={() => {
                  setActiveSession(session)
                  navigate('/session')
                }}
                whileHover={{
                  y: -3,
                  boxShadow: isDark
                    ? '0 16px 40px rgba(0,0,0,0.3)'
                    : '0 12px 32px rgba(0,0,0,0.06)',
                }}
              >
                {/* Delete button */}
                <button
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all w-7 h-7 rounded-[8px] flex items-center justify-center"
                  style={{
                    backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(220,38,38,0.08)',
                    color: isDark ? '#ef4444' : '#dc2626',
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget(session)
                  }}
                >
                  <X size={14} />
                </button>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <PhaseBadge phase={session.phase} />
                    <ArrowUpRight size={16} color={textMuted} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3
                    className="text-[16px] font-bold tracking-tight mb-1"
                    style={{ color: textPrimary }}
                  >
                    {session.client}
                  </h3>
                  <p className="text-[13px] mb-6" style={{ color: textSoft }}>
                    {session.industry}
                  </p>
                  <div
                    className="flex items-center justify-between pt-4"
                    style={{ borderTop: `1px solid ${border}` }}
                  >
                    <span className="font-mono text-[11px]" style={{ color: textMuted }}>
                      {session.date}
                    </span>
                    <span className="font-mono text-[11px]" style={{ color: textMuted }}>
                      {session.time}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* Empty State */}
          {filtered.length === 0 && (
            <div
              className="rounded-[20px] flex flex-col items-center justify-center p-12 min-h-[280px] col-span-full"
              style={{
                backgroundColor: surfaceLow,
                border: `1px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              }}
            >
              <div
                className="w-14 h-14 rounded-[16px] flex items-center justify-center mb-5"
                style={{ backgroundColor: `${accent}12` }}
              >
                <BarChart3 size={24} color={accent} />
              </div>
              <p className="text-lg font-bold text-center mb-1" style={{ color: textPrimary }}>
                No sessions yet
              </p>
              <p className="text-sm text-center mb-6" style={{ color: textMuted }}>
                Start your first client visit session
              </p>
              <PrimaryBtn className="px-5 py-2.5" onClick={() => navigate('/setup')}>
                <Plus size={15} />
                Create Session
              </PrimaryBtn>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
