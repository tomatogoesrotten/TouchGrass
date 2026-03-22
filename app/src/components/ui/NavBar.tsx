import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Settings } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { PrimaryBtn } from '@/components/ui/PrimaryBtn'

const tabs = [
  { label: 'Dashboard', path: '/' },
  { label: 'Sessions', path: '/sessions' },
  { label: 'Analytics', path: '/analytics' },
]

export function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'

  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  function isActive(path: string) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-[20px]"
      style={{
        backgroundColor: isDark ? 'rgba(9,9,11,0.85)' : 'rgba(245,245,247,0.85)',
        borderBottom: `1px solid ${border}`,
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-9 h-9 rounded-[10px] overflow-hidden flex-shrink-0">
            <img
              src="/touchgrass.png"
              alt="TouchGrass"
              className="w-full h-full object-cover scale-[1.35]"
            />
          </div>
          <span className="text-[17px] font-bold tracking-tight" style={{ color: textPrimary }}>
            TouchGrass
          </span>
        </div>

        <nav
          className="hidden md:flex items-center gap-1 rounded-[100px] p-1"
          style={{ backgroundColor: isDark ? '#18181b' : '#ffffff', border: `1px solid ${border}` }}
        >
          {tabs.map((tab) => {
            const active = isActive(tab.path)
            return (
              <button
                key={tab.path}
                className="px-5 py-2 rounded-[100px] text-[13px] font-semibold transition-all"
                style={{
                  backgroundColor: active ? (isDark ? '#27272a' : '#f4f4f5') : 'transparent',
                  color: active ? textPrimary : textMuted,
                }}
                onClick={() => navigate(tab.path)}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/settings')}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all hover:brightness-110"
            style={{
              backgroundColor: isDark ? '#27272a' : '#f4f4f5',
              border: `1px solid ${border}`,
            }}
            aria-label="Settings"
          >
            <Settings size={16} color={isDark ? '#a1a1aa' : '#52525b'} />
          </button>
          <ThemeToggle />
          <PrimaryBtn className="px-4 py-2 h-9 text-[13px] hidden sm:flex" onClick={() => navigate('/setup')}>
            <Plus size={15} strokeWidth={2.5} />
            New Session
          </PrimaryBtn>
          <PrimaryBtn className="w-9 h-9 p-0 flex sm:hidden items-center justify-center" onClick={() => navigate('/setup')}>
            <Plus size={18} strokeWidth={2.5} />
          </PrimaryBtn>
        </div>
      </div>
    </header>
  )
}
