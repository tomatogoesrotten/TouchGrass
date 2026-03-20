import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/stores/theme'
import { Sparkles } from 'lucide-react'

interface Props {
  title: string
  visible: boolean
  children: ReactNode
}

export function AIResultBox({ title, visible, children }: Props) {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const accent = isDark ? '#00e5a0' : '#00b37e'

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-[14px] p-8 space-y-6"
      style={{
        backgroundColor: isDark ? 'rgba(0,229,160,0.03)' : 'rgba(0,179,126,0.04)',
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <Sparkles size={20} color={accent} />
        <h3 className="font-headline font-bold text-lg" style={{ color: accent }}>
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  )
}
