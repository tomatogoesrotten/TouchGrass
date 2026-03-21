import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/stores/theme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-[10px] flex items-center justify-center transition-all hover:brightness-110"
      style={{
        backgroundColor: isDark ? '#27272a' : '#f4f4f5',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      }}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Moon size={16} color="#a1a1aa" />
      ) : (
        <Sun size={16} color="#52525b" />
      )}
    </button>
  )
}
