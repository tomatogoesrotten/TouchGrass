import type { ReactNode, HTMLAttributes } from 'react'
import { useTheme } from '@/stores/theme'

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function GlassCard({ children, className = '', ...rest }: Props) {
  const theme = useTheme((s) => s.theme)
  const base =
    theme === 'dark'
      ? 'bg-[rgba(31,31,36,0.65)] border border-[rgba(255,255,255,0.06)]'
      : 'bg-[rgba(255,255,255,0.65)] border border-[rgba(0,0,0,0.08)]'
  return (
    <div className={`backdrop-blur-[16px] rounded-[14px] ${base} ${className}`} {...rest}>
      {children}
    </div>
  )
}
