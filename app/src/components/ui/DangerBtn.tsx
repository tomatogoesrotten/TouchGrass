import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useTheme } from '@/stores/theme'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function DangerBtn({ children, className = '', ...rest }: Props) {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'

  return (
    <button
      className={`rounded-[12px] font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.97] hover:brightness-110 ${className}`}
      style={{ backgroundColor: isDark ? '#ef4444' : '#dc2626' }}
      {...rest}
    >
      {children}
    </button>
  )
}
