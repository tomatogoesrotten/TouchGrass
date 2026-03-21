import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, X, Zap, BarChart3, Globe2, CalendarDays } from 'lucide-react'
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Welcome & Stats */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <GlassCard className="p-8 flex flex-col justify-center min-h-[180px]" style={{
              backgroundImage: isDark ? 'linear-gradient(135deg, rgba(196,240,66,0.1) 0%, transparent 100%)' : 'linear-gradient(135deg, rgba(163,204,41,0.1) 0%, transparent 100%)'
            }}>
              <h1 className="text-[28px] font-bold tracking-tight mb-2" style={{ color: textPrimary }}>
                Overview
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: textSoft }}>
                Track and manage your client visit sessions. You have {sessions.length} active sessions.
              </p>
            </GlassCard>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: 'Total Sessions',
                  value: sessions.length.toString(),
                  change: '+12.5%',
                  changeColor: accent,
                  icon: BarChart3,
                  iconBg: isDark ? 'rgba(196,240,66,0.15)' : 'rgba(163,204,41,0.15)',
                },
                {
                  label: 'This Week',
                  value: '42',
                  change: 'Trending up',
                  changeColor: isDark ? '#ff8a00' : '#e67d00',
                  icon: CalendarDays,
                  iconBg: isDark ? 'rgba(255,138,0,0.12)' : 'rgba(230,125,0,0.1)',
                }
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <GlassCard key={stat.label} className="p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                        style={{ backgroundColor: stat.iconBg }}
                      >
                        <Icon size={17} color={stat.changeColor} />
                      </div>
                    </div>
                    <div className="text-[28px] font-bold tracking-tight leading-none mb-2" style={{ color: textPrimary }}>
                      {stat.value}
                    </div>
                    <span className="text-[12px] font-medium" style={{ color: textSoft }}>
                      {stat.label}
                    </span>
                  </GlassCard>
                )
              })}
            </div>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-medium" style={{ color: textSoft }}>
                  Industries
                </span>
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                  style={{ backgroundColor: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(124,58,237,0.1)' }}
                >
                  <Globe2 size={17} color={isDark ? '#8b5cf6' : '#7c3aed'} />
                </div>
              </div>
              <div className="text-[32px] font-bold tracking-tight leading-none" style={{ color: textPrimary }}>
                18
              </div>
              <span className="text-xs font-medium mt-2 inline-block" style={{ color: textSoft }}>
                Global coverage
              </span>
            </GlassCard>
          </div>

          {/* Right Column: Sessions Bento */}
          <div className="lg:col-span-8 flex flex-col">
            <GlassCard className="p-6 h-full min-h-[600px] flex flex-col">
              {/* Search & Filters */}
              <div className="flex flex-col gap-4 mb-6">
                <div
                  className="relative w-full rounded-[12px] flex items-center"
                  style={{ backgroundColor: isDark ? 'var(--color-surface-mid)' : 'var(--color-surface-light-mid)', border: `1px solid ${border}` }}
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
                    className={`px-4 py-1.5 rounded-[100px] text-[12px] font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 ${filter !== 'all' ? 'hover:bg-black/5 dark:hover:bg-white/5' : ''}`}
                    style={{
                      backgroundColor: filter === 'all' ? (isDark ? '#262626' : '#ffffff') : undefined,
                      color: filter === 'all' ? (isDark ? '#fafafa' : '#09090b') : textMuted,
                      border: `1px solid ${filter === 'all' ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') : border}`,
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
                        className={`px-4 py-1.5 rounded-[100px] text-[12px] font-semibold transition-all duration-200 flex items-center gap-1.5 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 ${!isActive ? 'hover:bg-black/5 dark:hover:bg-white/5' : ''}`}
                        style={{
                          backgroundColor: isActive ? `${color}18` : undefined,
                          color: isActive ? color : textMuted,
                          border: `1px solid ${isActive ? `${color}40` : border}`,
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
              <div className="flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: `${textMuted} transparent` }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                  {filtered.map((session, i) => {
                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        className="group relative rounded-[20px] overflow-hidden cursor-pointer transition-all duration-200"
                        style={{
                          backgroundColor: isDark ? 'var(--color-surface-mid)' : 'var(--color-surface-light-mid)',
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
                        {/* Delete button — only on hover */}
                        <button
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all w-7 h-7 rounded-[8px] flex items-center justify-center z-10"
                          style={{
                            backgroundColor: isDark ? 'rgba(255,77,106,0.1)' : 'rgba(229,56,75,0.08)',
                            color: isDark ? 'var(--color-danger-dark)' : 'var(--color-danger-light)',
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget(session)
                          }}
                        >
                          <X size={14} />
                        </button>

                        <div className="p-6">
                          <div className="flex items-center mb-5">
                            <PhaseBadge phase={session.phase} />
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
                        backgroundColor: isDark ? 'var(--color-surface-mid)' : 'var(--color-surface-light-mid)',
                        border: `1px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-[16px] flex items-center justify-center mb-5"
                        style={{ backgroundColor: isDark ? 'rgba(196,240,66,0.12)' : 'rgba(163,204,41,0.12)' }}
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
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
