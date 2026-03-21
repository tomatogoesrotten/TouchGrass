import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useTheme } from '@/stores/theme'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function PrimaryBtn({ children, className = '', disabled, ...rest }: Props) {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'

  return (
    <button
      className={`rounded-[12px] font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-110'} ${className}`}
      style={{
        backgroundColor: isDark ? '#10b981' : '#059669',
        color: '#ffffff',
        boxShadow: disabled ? 'none' : isDark ? '0 0 20px rgba(16,185,129,0.15)' : '0 4px 14px rgba(5,150,105,0.2)',
      }}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}
