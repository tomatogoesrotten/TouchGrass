import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useTheme } from '@/stores/theme'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function SecondaryBtn({ children, className = '', ...rest }: Props) {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'

  return (
    <button
      className={`rounded-[10px] font-bold text-sm flex items-center justify-center transition-all active:scale-95 ${className}`}
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f3f9',
        color: isDark ? '#f0f1f4' : '#111318',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
