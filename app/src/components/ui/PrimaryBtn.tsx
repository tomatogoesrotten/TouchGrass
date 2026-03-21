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
        backgroundColor: isDark ? 'var(--color-accent-dark)' : 'var(--color-accent-light)',
        color: isDark ? '#000000' : '#ffffff',
        boxShadow: disabled ? 'none' : isDark ? '0 0 20px rgba(196, 240, 66, 0.2)' : '0 4px 14px rgba(163, 204, 41, 0.2)',
      }}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}
