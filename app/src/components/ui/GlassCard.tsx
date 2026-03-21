import type { ReactNode, HTMLAttributes } from 'react'
import { useTheme } from '@/stores/theme'

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hoverable?: boolean
}

export function GlassCard({ children, className = '', hoverable = false, style, ...rest }: Props) {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'

  const hoverClasses = hoverable
    ? 'transition-all duration-300 hover:-translate-y-1.5 hover:border-white/12 dark:hover:border-white/12'
    : ''

  return (
    <div
      className={`rounded-[var(--radius-card)] backdrop-blur-xl ${hoverClasses} ${className}`}
      style={{
        backgroundColor: isDark ? 'rgba(18, 18, 18, 0.55)' : 'rgba(255, 255, 255, 0.55)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'}`,
        boxShadow: isDark
          ? '0 8px 32px -4px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 80px rgba(255,255,255,0.01)'
          : '0 8px 32px -8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 0 80px rgba(255,255,255,0.2)',
        ...(hoverable ? { transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' } : {}),
        ...style,
      }}
      onMouseEnter={hoverable ? (e) => {
        const el = e.currentTarget
        el.style.boxShadow = isDark
          ? '0 20px 50px -8px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 0 80px rgba(255,255,255,0.02)'
          : '0 20px 50px -12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 80px rgba(255,255,255,0.3)'
        el.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.9)'
      } : undefined}
      onMouseLeave={hoverable ? (e) => {
        const el = e.currentTarget
        el.style.boxShadow = isDark
          ? '0 8px 32px -4px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 80px rgba(255,255,255,0.01)'
          : '0 8px 32px -8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 0 80px rgba(255,255,255,0.2)'
        el.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'
      } : undefined}
      {...rest}
    >
      {children}
    </div>
  )
}
