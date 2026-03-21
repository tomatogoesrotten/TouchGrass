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
      className={`rounded-[20px] ${className}`}
      style={{
        backgroundColor: isDark ? '#18181b' : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
