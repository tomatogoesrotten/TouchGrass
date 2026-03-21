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
  const accent = isDark ? '#10b981' : '#059669'

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-[20px] p-8 space-y-6"
      style={{
        backgroundColor: isDark ? 'rgba(16,185,129,0.04)' : 'rgba(5,150,105,0.04)',
        border: `1px solid ${isDark ? 'rgba(16,185,129,0.12)' : 'rgba(5,150,105,0.12)'}`,
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center"
          style={{ backgroundColor: `${accent}15` }}
        >
          <Sparkles size={16} color={accent} />
        </div>
        <h3 className="font-semibold text-[15px]" style={{ color: accent }}>
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  )
}
