import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useTheme } from '@/stores/theme'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function DangerBtn({ children, className = '', ...rest }: Props) {
  const theme = useTheme((s) => s.theme)
  const bg = theme === 'dark' ? '#ff4d6a' : '#e5384b'
  const hover = theme === 'dark' ? '#ff3355' : '#d02f42'

  return (
    <button
      className={`rounded-[10px] font-bold text-sm text-white flex items-center justify-center transition-all active:scale-95 ${className}`}
      style={{ backgroundColor: bg }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hover)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = bg)}
      {...rest}
    >
      {children}
    </button>
  )
}
