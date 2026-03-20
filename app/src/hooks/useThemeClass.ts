import { useEffect } from 'react'
import { useTheme } from '@/stores/theme'

export function useThemeClass() {
  const theme = useTheme((s) => s.theme)

  useEffect(() => {
    const body = document.body
    if (theme === 'dark') {
      body.classList.add('dark-mesh')
      body.classList.remove('light-mesh')
    } else {
      body.classList.add('light-mesh')
      body.classList.remove('dark-mesh')
    }
  }, [theme])

  return theme
}
