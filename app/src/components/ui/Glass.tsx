import type { ReactNode, HTMLAttributes } from 'react'
import { useTheme } from '@/stores/theme'

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Glass({ children, className = '', ...rest }: Props) {
  const theme = useTheme((s) => s.theme)
  const base =
    theme === 'dark'
      ? 'bg-[rgba(18,21,30,0.72)] border border-[rgba(255,255,255,0.08)]'
      : 'bg-[rgba(255,255,255,0.65)] border border-[rgba(0,0,0,0.08)]'
  return (
    <div className={`backdrop-blur-[16px] ${base} ${className}`} {...rest}>
      {children}
    </div>
  )
}
