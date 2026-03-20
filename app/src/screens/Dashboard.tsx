import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, TrendingUp, X, Zap, ClipboardList } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import type { Phase } from '@/stores/session'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { GlassCard } from '@/components/ui/GlassCard'
import { PrimaryBtn } from '@/components/ui/PrimaryBtn'
import { PhaseBadge } from '@/components/ui/PhaseBadge'
import { Glass } from '@/components/ui/Glass'
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

  const accent = isDark ? '#00e5a0' : '#00b37e'
  const textPrimary = isDark ? '#f0f1f4' : '#111318'
  const textSoft = isDark ? '#a0a5b8' : '#5a5f72'
  const textMuted = isDark ? '#5c6178' : '#5a5f72'

  return (
    <div>
      {/* Top Bar */}
      <Glass className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 rounded-none">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div
            className="w-[42px] h-[42px] rounded-lg p-[1px]"
            style={{
              background: isDark ? 'linear-gradient(45deg,#6effc0,#00e5a0)' : 'linear-gradient(45deg,#00b37e,#00e5a0)',
              boxShadow: `0 0 20px ${accent}40`,
            }}
          >
            <div
              className="w-full h-full rounded-[7px] flex items-center justify-center"
              style={{ backgroundColor: isDark ? '#121317' : '#ffffff' }}
            >
              <Zap size={22} color={accent} fill={accent} />
            </div>
          </div>
          <div>
            <h1 className="text-[21px] font-[800] tracking-tight font-headline leading-none" style={{ color: textPrimary }}>
              Field Companion
            </h1>
            <p className="text-[11.5px] font-medium mt-0.5 uppercase tracking-wider" style={{ color: textMuted }}>
              Client Visit Intelligence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <ThemeToggle />
          <PrimaryBtn className="px-5 py-2.5" onClick={() => navigate('/setup')}>
            <Plus size={16} />
            New Session
          </PrimaryBtn>
        </div>
      </Glass>

      <main className="pt-28 pb-16 px-6 max-w-7xl mx-auto">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Sessions', value: sessions.length.toLocaleString(), sub: '+12.5%', subColor: accent },
            { label: 'This Week', value: '42', sub: 'Trending', subColor: isDark ? '#fbbf24' : '#d99a00', icon: true },
            { label: 'Industries', value: '18', sub: 'Global Coverage', subColor: textSoft },
          ].map((stat) => (
            <GlassCard key={stat.label} className="p-6">
              <span className="text-[11px] font-bold uppercase tracking-widest mb-2 block font-headline" style={{ color: textMuted }}>
                {stat.label}
              </span>
              <div className="text-[34px] font-[900] font-headline" style={{ color: textPrimary }}>
                {stat.value}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-mono" style={{ color: stat.subColor }}>{stat.sub}</span>
                {stat.icon && <TrendingUp size={14} color={stat.subColor} />}
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
              color={textMuted}
            />
            <input
              className="w-full border-none rounded-[10px] pl-12 pr-4 py-3 text-sm outline-none transition-all"
              style={{
                backgroundColor: isDark ? '#1a1b20' : '#ffffff',
                color: textPrimary,
              }}
              placeholder="Search sessions or clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <button
              className="px-5 py-2 rounded-[20px] text-xs font-bold transition-colors"
              style={{
                backgroundColor: filter === 'all' ? (isDark ? '#1f1f24' : '#111318') : 'transparent',
                color: filter === 'all' ? (isDark ? '#f0f1f4' : '#ffffff') : textSoft,
                border: filter === 'all' ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
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
                  className="px-5 py-2 rounded-[20px] text-xs font-bold transition-colors flex items-center gap-2"
                  style={{
                    border: `1px solid ${color}4d`,
                    color,
                    backgroundColor: isActive ? `${color}1a` : 'transparent',
                  }}
                  onClick={() => setFilter(isActive ? 'all' : phase)}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {phaseConfig[phase].label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Session Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((session, i) => {
            const color = getPhaseColor(session.phase, theme)
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="group relative rounded-[14px] overflow-hidden transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: isDark ? '#1a1b20' : '#ffffff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                }}
                onClick={() => {
                  setActiveSession(session)
                  navigate('/session')
                }}
                whileHover={{ y: -2, boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.25)' : '0 12px 30px rgba(0,0,0,0.06)' }}
              >
                {/* Phase accent bar */}
                <div className="h-[3px] w-full" style={{ backgroundColor: color }} />
                {/* Delete button */}
                <button
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                  style={{ color: isDark ? '#ff4d6a' : '#e5384b' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget(session)
                  }}
                >
                  <X size={18} />
                </button>
                <div className="p-6">
                  <PhaseBadge phase={session.phase} />
                  <h3
                    className="text-[17px] font-[750] font-headline mb-1 mt-4 transition-colors group-hover:!text-[var(--hover-color)]"
                    style={{ color: textPrimary, '--hover-color': accent } as React.CSSProperties}
                  >
                    {session.client}
                  </h3>
                  <p className="text-[13px] font-medium mb-6" style={{ color: textSoft }}>
                    {session.industry}
                  </p>
                  <div
                    className="flex items-center justify-between pt-4"
                    style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}
                  >
                    <span className="font-mono text-[11.5px]" style={{ color: textMuted }}>
                      {session.date}
                    </span>
                    <span className="font-mono text-[11.5px]" style={{ color: textMuted }}>
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
              className="relative rounded-[14px] border border-dashed flex flex-col items-center justify-center p-8 min-h-[260px] col-span-full"
              style={{
                backgroundColor: isDark ? 'rgba(26,27,32,0.3)' : 'rgba(255,255,255,0.3)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }}
            >
              <div
                className="absolute inset-0 rounded-full blur-[60px] pointer-events-none"
                style={{ backgroundColor: `${accent}0d` }}
              />
              <ClipboardList size={52} className="mb-4 opacity-40" color={textMuted} />
              <p className="font-headline font-[800] text-[24px] text-center mb-2" style={{ color: textPrimary }}>
                No sessions yet
              </p>
              <p className="text-sm text-center mb-4" style={{ color: textMuted }}>
                Start your first client visit session
              </p>
              <PrimaryBtn className="px-5 py-2.5" onClick={() => navigate('/setup')}>
                Create Session
              </PrimaryBtn>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
