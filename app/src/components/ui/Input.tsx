import type { InputHTMLAttributes } from 'react'
import { useTheme } from '@/stores/theme'

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'

  return (
    <input
      className={`w-full h-12 border-none rounded-[12px] px-4 text-sm font-medium transition-all outline-none ${className}`}
      style={{
        backgroundColor: isDark ? '#1e1e22' : '#f4f4f5',
        color: isDark ? '#fafafa' : '#09090b',
      }}
      {...rest}
    />
  )
}
