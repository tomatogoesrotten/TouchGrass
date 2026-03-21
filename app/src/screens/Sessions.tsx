import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, X, Table2, LayoutGrid, Calendar,
  ArrowUpDown, ChevronLeft, ChevronRight,
  TrendingUp, Users, Activity, Clock,
} from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import type { Phase } from '@/stores/session'
import { NavBar } from '@/components/ui/NavBar'
import { GlassCard } from '@/components/ui/GlassCard'
import { PhaseBadge } from '@/components/ui/PhaseBadge'
import { phaseConfig, getPhaseColor } from '@/lib/phase'
import type { SessionMeta } from '@/lib/api'

type Filter = 'all' | Phase
type ViewMode = 'table' | 'card' | 'calendar'
type SortKey = 'client' | 'industry' | 'phase' | 'date' | 'updatedAt'
type SortDir = 'asc' | 'desc'

export function Sessions() {
  const navigate = useNavigate()
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const { sessions, loadSessions, setDeleteTarget, loadFullSession } = useSession()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [view, setView] = useState<ViewMode>('table')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  useEffect(() => { loadSessions() }, [loadSessions])

  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const accent = isDark ? '#c4f042' : '#a3cc29'

  const filtered = useMemo(() => {
    let list = sessions.filter((s) => {
      if (filter !== 'all' && s.phase !== filter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!s.client.toLowerCase().includes(q) && !s.industry.toLowerCase().includes(q)) return false
      }
      return true
    })
    list = [...list].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [sessions, filter, search, sortKey, sortDir])

  const now = Date.now()
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const thisWeek = sessions.filter((s) => {
    const updated = s.updatedAt ? new Date(s.updatedAt).getTime() : 0
    return now - updated < weekMs
  }).length

  const clientCounts = useMemo(() => {
    const m = new Map<string, number>()
    sessions.forEach((s) => m.set(s.client, (m.get(s.client) || 0) + 1))
    return m
  }, [sessions])

  const topClient = useMemo(() => {
    let best = '—'
    let max = 0
    clientCounts.forEach((c, k) => { if (c > max) { max = c; best = k } })
    return best
  }, [clientCounts])

  const topPhase = useMemo(() => {
    const m = new Map<string, number>()
    sessions.forEach((s) => m.set(s.phase, (m.get(s.phase) || 0) + 1))
    let best = '—'
    let max = 0
    m.forEach((c, k) => { if (c > max) { max = c; best = k } })
    return best
  }, [sessions])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function openSession(s: SessionMeta) {
    loadFullSession(s.id)
    navigate('/session')
  }

  function formatDate(d: string) {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
    } catch { return d }
  }

  function formatTime(t: string) {
    return t?.slice(0, 5) ?? t
  }

  // Calendar helpers
  const calDays = useMemo(() => {
    const year = calMonth.getFullYear()
    const month = calMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }, [calMonth])

  const calSessions = useMemo(() => {
    const m = new Map<number, SessionMeta[]>()
    const year = calMonth.getFullYear()
    const month = calMonth.getMonth()
    filtered.forEach((s) => {
      const d = new Date(s.date)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        if (!m.has(day)) m.set(day, [])
        m.get(day)!.push(s)
      }
    })
    return m
  }, [filtered, calMonth])

  const stats = [
    { label: 'Total Sessions', value: sessions.length.toString(), icon: Activity, color: accent },
    { label: 'This Week', value: thisWeek.toString(), icon: Clock, color: isDark ? '#ff8a00' : '#e67d00' },
    { label: 'Top Client', value: topClient.length > 16 ? topClient.slice(0, 14) + '...' : topClient, icon: Users, color: isDark ? '#8b5cf6' : '#7c3aed' },
    { label: 'Top Phase', value: topPhase !== '—' && phaseConfig[topPhase as Phase] ? phaseConfig[topPhase as Phase].label : '—', icon: TrendingUp, color: isDark ? '#ff4d6a' : '#e5384b' },
  ]

  const viewIcons: { mode: ViewMode; Icon: typeof Table2 }[] = [
    { mode: 'table', Icon: Table2 },
    { mode: 'card', Icon: LayoutGrid },
    { mode: 'calendar', Icon: Calendar },
  ]

  const columns: { key: SortKey; label: string; width: string }[] = [
    { key: 'client', label: 'CLIENT', width: 'flex-[2]' },
    { key: 'industry', label: 'INDUSTRY', width: 'flex-[1.5]' },
    { key: 'phase', label: 'PHASE', width: 'flex-1' },
    { key: 'date', label: 'DATE', width: 'flex-1' },
    { key: 'updatedAt', label: 'UPDATED', width: 'flex-1' },
  ]

  return (
    <div className="min-h-screen relative" style={{ zIndex: 1 }}>
      <NavBar />
      <main className="max-w-[1400px] mx-auto px-6 pt-8 pb-20">
        {/* Stats Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <GlassCard key={stat.label} className="p-4 flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon size={18} color={stat.color} />
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[20px] font-bold tracking-tight leading-none truncate" style={{ color: textPrimary }}>
                    {stat.value}
                  </div>
                  <div className="text-[11px] font-medium mt-1" style={{ color: textMuted }}>
                    {stat.label}
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>

        <GlassCard className="p-6 min-h-[600px] flex flex-col">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 mb-5">
            <div
              className="relative flex-1 rounded-[12px] flex items-center"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: `1px solid ${border}` }}
            >
              <Search size={16} className="absolute left-4" color={textMuted} />
              <input
                className="w-full bg-transparent border-none rounded-[12px] pl-11 pr-4 py-2.5 text-sm outline-none"
                style={{ color: textPrimary }}
                placeholder="Search clients, industries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-1.5 flex-wrap">
                <button
                  className="px-3 py-1.5 rounded-[100px] text-[11px] font-semibold transition-all"
                  style={{
                    backgroundColor: filter === 'all' ? (isDark ? '#262626' : '#ffffff') : 'transparent',
                    color: filter === 'all' ? textPrimary : textMuted,
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
                      className="px-3 py-1.5 rounded-[100px] text-[11px] font-semibold transition-all flex items-center gap-1.5"
                      style={{
                        backgroundColor: isActive ? `${color}18` : 'transparent',
                        color: isActive ? color : textMuted,
                        border: `1px solid ${isActive ? `${color}40` : border}`,
                      }}
                      onClick={() => setFilter(isActive ? 'all' : phase)}
                    >
                      <div className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: color }} />
                      {phaseConfig[phase].label}
                    </button>
                  )
                })}
              </div>

              <div
                className="flex items-center gap-0.5 rounded-[10px] p-1"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: `1px solid ${border}` }}
              >
                {viewIcons.map(({ mode, Icon }) => (
                  <button
                    key={mode}
                    className="w-8 h-7 rounded-[8px] flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: view === mode ? (isDark ? '#27272a' : '#e4e4e7') : 'transparent',
                      color: view === mode ? textPrimary : textMuted,
                    }}
                    onClick={() => setView(mode)}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table View */}
          {view === 'table' && (
            <div className="flex-1 overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Header */}
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] mb-1"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                >
                  {columns.map((col) => (
                    <button
                      key={col.key}
                      className={`${col.width} flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] uppercase cursor-pointer transition-colors hover:opacity-80`}
                      style={{ color: sortKey === col.key ? accent : textMuted }}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      <ArrowUpDown size={10} style={{ opacity: sortKey === col.key ? 1 : 0.3 }} />
                    </button>
                  ))}
                  <div className="w-8" />
                </div>
                {/* Rows */}
                <div className="space-y-0.5">
                  {filtered.map((session, i) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.2 }}
                      className="group flex items-center gap-2 px-4 py-3 rounded-[10px] cursor-pointer transition-all"
                      style={{
                        backgroundColor: i % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.01)'),
                      }}
                      onClick={() => openSession(session)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.01)')
                      }}
                    >
                      <div className="flex-[2] font-semibold text-[13px] truncate" style={{ color: textPrimary }}>
                        {session.client}
                      </div>
                      <div className="flex-[1.5] font-mono text-[12px] truncate" style={{ color: textSoft }}>
                        {session.industry}
                      </div>
                      <div className="flex-1">
                        <PhaseBadge phase={session.phase as Phase} />
                      </div>
                      <div className="flex-1 font-mono text-[11px]" style={{ color: textMuted }}>
                        {formatDate(session.date)}
                      </div>
                      <div className="flex-1 font-mono text-[11px]" style={{ color: textMuted }}>
                        {session.updatedAt ? formatDate(session.updatedAt) : '—'}
                      </div>
                      <button
                        className="w-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        style={{ color: isDark ? '#ff4d6a' : '#e5384b' }}
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(session) }}
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
              {filtered.length === 0 && (
                <div className="flex items-center justify-center py-20" style={{ color: textMuted }}>
                  <span className="text-sm">No sessions match your criteria.</span>
                </div>
              )}
            </div>
          )}

          {/* Card View */}
          {view === 'card' && (
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-4">
                {filtered.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="group relative rounded-[20px] cursor-pointer backdrop-blur-xl transition-all duration-300"
                    style={{
                      backgroundColor: isDark ? 'rgba(26,26,26,0.5)' : 'rgba(255,255,255,0.5)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'}`,
                      boxShadow: isDark ? '0 4px 20px -4px rgba(0,0,0,0.4)' : '0 4px 20px -4px rgba(0,0,0,0.06)',
                    }}
                    onClick={() => openSession(session)}
                  >
                    <button
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all w-7 h-7 rounded-[8px] flex items-center justify-center z-10"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,77,106,0.1)' : 'rgba(229,56,75,0.08)',
                        color: isDark ? '#ff4d6a' : '#e5384b',
                      }}
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(session) }}
                    >
                      <X size={14} />
                    </button>
                    <div className="p-6">
                      <div className="flex items-center mb-5">
                        <PhaseBadge phase={session.phase as Phase} />
                      </div>
                      <h3 className="text-[16px] font-bold tracking-tight mb-1" style={{ color: textPrimary }}>
                        {session.client}
                      </h3>
                      <p className="text-[13px] mb-6" style={{ color: textSoft }}>
                        {session.industry}
                      </p>
                      <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${border}` }}>
                        <span className="font-mono text-[11px]" style={{ color: textMuted }}>
                          {formatDate(session.date)}
                        </span>
                        <span className="font-mono text-[11px]" style={{ color: textMuted }}>
                          {formatTime(session.time)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-full flex items-center justify-center py-20" style={{ color: textMuted }}>
                    <span className="text-sm">No sessions match your criteria.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Calendar View */}
          {view === 'calendar' && (
            <div className="flex-1">
              <div className="flex items-center justify-between mb-5">
                <button
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-all hover:brightness-110"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: `1px solid ${border}` }}
                  onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}
                >
                  <ChevronLeft size={16} color={textSoft} />
                </button>
                <span className="font-semibold text-[15px] tracking-tight" style={{ color: textPrimary }}>
                  {calMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-all hover:brightness-110"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: `1px solid ${border}` }}
                  onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}
                >
                  <ChevronRight size={16} color={textSoft} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-px mb-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold tracking-wider uppercase py-2" style={{ color: textMuted }}>
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-px">
                {calDays.map((day, idx) => {
                  const daySessions = day ? (calSessions.get(day) || []) : []
                  return (
                    <div
                      key={idx}
                      className="min-h-[90px] rounded-[8px] p-2 transition-all"
                      style={{
                        backgroundColor: day ? (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)') : 'transparent',
                        border: day ? `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` : 'none',
                      }}
                    >
                      {day && (
                        <>
                          <div className="text-[11px] font-mono font-medium mb-1.5" style={{ color: textMuted }}>
                            {day}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {daySessions.map((s) => (
                              <div
                                key={s.id}
                                className="w-full rounded-[4px] px-1.5 py-0.5 text-[9px] font-medium truncate cursor-pointer transition-all hover:brightness-110"
                                style={{
                                  backgroundColor: `${getPhaseColor(s.phase as Phase, theme)}20`,
                                  color: getPhaseColor(s.phase as Phase, theme),
                                  borderLeft: `2px solid ${getPhaseColor(s.phase as Phase, theme)}`,
                                }}
                                onClick={() => openSession(s)}
                                title={s.client}
                              >
                                {s.client}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Footer count */}
          <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: `1px solid ${border}` }}>
            <span className="font-mono text-[11px]" style={{ color: textMuted }}>
              {filtered.length} of {sessions.length} sessions
            </span>
            <span className="font-mono text-[11px]" style={{ color: textMuted }}>
              {new Set(filtered.map(s => s.client)).size} unique clients
            </span>
          </div>
        </GlassCard>
      </main>
    </div>
  )
}
