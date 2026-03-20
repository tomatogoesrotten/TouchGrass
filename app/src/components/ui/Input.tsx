import type { InputHTMLAttributes } from 'react'
import { useTheme } from '@/stores/theme'

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'

  return (
    <input
      className={`w-full h-12 border-none rounded-[10px] px-4 text-[14.5px] font-medium transition-all outline-none ${className}`}
      style={{
        backgroundColor: isDark ? '#1a1b20' : '#f1f3f9',
        color: isDark ? '#f0f1f4' : '#111318',
      }}
      {...rest}
    />
  )
}
