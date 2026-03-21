import type { ReactNode, HTMLAttributes } from 'react'
import { useTheme } from '@/stores/theme'

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function GlassCard({ children, className = '', style, ...rest }: Props) {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'

  return (
    <div
      className={`rounded-[var(--radius-card)] ${className}`}
      style={{
        backgroundColor: isDark ? 'var(--color-surface-low)' : 'var(--color-surface-light)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        boxShadow: isDark 
          ? '0 4px 24px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)' 
          : '0 8px 32px -8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
