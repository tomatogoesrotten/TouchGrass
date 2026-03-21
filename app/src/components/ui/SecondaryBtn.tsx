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
      className={`rounded-[12px] font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] hover:brightness-110 ${className}`}
      style={{
        backgroundColor: isDark ? '#27272a' : '#f4f4f5',
        color: isDark ? '#fafafa' : '#09090b',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
