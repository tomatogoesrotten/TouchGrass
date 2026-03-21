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
      className={`rounded-[var(--radius-card)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${className}`}
      style={{
        backgroundColor: isDark ? 'rgba(20, 20, 20, 0.65)' : 'rgba(255, 255, 255, 0.65)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)'}`,
        boxShadow: isDark 
          ? '0 8px 32px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)' 
          : '0 8px 32px -8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
