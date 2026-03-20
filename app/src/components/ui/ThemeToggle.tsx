import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/stores/theme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      className="w-[44px] h-[24px] rounded-full relative p-[3px] cursor-pointer transition-colors"
      style={{ backgroundColor: isDark ? '#343439' : '#e2e7f0' }}
      aria-label="Toggle theme"
    >
      <div
        className="w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm transition-transform duration-200"
        style={{
          backgroundColor: isDark ? '#00e5a0' : '#00b37e',
          transform: isDark ? 'translateX(20px)' : 'translateX(0)',
        }}
      >
        {isDark ? (
          <Moon size={11} color="#003824" />
        ) : (
          <Sun size={11} color="#fff" />
        )}
      </div>
    </button>
  )
}
