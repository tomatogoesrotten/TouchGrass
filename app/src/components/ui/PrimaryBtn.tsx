import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useTheme } from '@/stores/theme'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function PrimaryBtn({ children, className = '', disabled, ...rest }: Props) {
  const theme = useTheme((s) => s.theme)
  const textColor = theme === 'dark' ? '#003824' : '#ffffff'
  const gradient = theme === 'dark' ? 'linear-gradient(45deg, #6effc0, #00e5a0)' : 'linear-gradient(45deg, #00b37e, #00e5a0)'
  const shadow = theme === 'dark' ? '0 10px 30px rgba(0,229,160,0.15)' : '0 10px 30px rgba(0,179,126,0.15)'

  return (
    <button
      className={`rounded-[10px] font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 hover:scale-[0.98] ${disabled ? 'opacity-[0.35] cursor-not-allowed hover:scale-100' : ''} ${className}`}
      style={{ background: gradient, color: textColor, boxShadow: disabled ? 'none' : shadow }}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}
