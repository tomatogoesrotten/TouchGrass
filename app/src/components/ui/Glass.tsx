import type { ReactNode, HTMLAttributes } from 'react'
import { useTheme } from '@/stores/theme'

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Glass({ children, className = '', style, ...rest }: Props) {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'

  return (
    <div
      className={`backdrop-blur-[20px] ${className}`}
      style={{
        backgroundColor: isDark ? 'rgba(17,17,19,0.85)' : 'rgba(255,255,255,0.75)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
