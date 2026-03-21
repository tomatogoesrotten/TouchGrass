import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '@/stores/theme'
import { useToast } from '@/stores/toast'
import { Check } from 'lucide-react'

export function Toast() {
  const { message, visible } = useToast()
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const accent = isDark ? '#10b981' : '#059669'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-8 left-1/2 z-[80] flex items-center gap-3 px-5 py-3 rounded-[14px]"
          style={{
            backgroundColor: isDark ? '#18181b' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.4)'
              : '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${accent}20` }}
          >
            <Check size={12} color={accent} strokeWidth={3} />
          </div>
          <span
            className="font-medium text-sm"
            style={{ color: isDark ? '#fafafa' : '#09090b' }}
          >
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
