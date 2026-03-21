import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '@/stores/theme'
import { useToast } from '@/stores/toast'
import { Check, X } from 'lucide-react'

export function Toast() {
  const { message, visible, type } = useToast()
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'

  const isError = type === 'error'
  const iconColor = isError
    ? (isDark ? 'var(--color-danger-dark)' : 'var(--color-danger-light)')
    : (isDark ? 'var(--color-accent-dark)' : 'var(--color-accent-light)')
  const iconBg = isError
    ? (isDark ? 'rgba(255,77,106,0.15)' : 'rgba(229,56,75,0.12)')
    : (isDark ? 'rgba(196,240,66,0.15)' : 'rgba(163,204,41,0.12)')
  const Icon = isError ? X : Check

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-8 left-1/2 z-[80] flex items-center gap-3 px-5 py-3 rounded-[14px] backdrop-blur-xl"
          style={{
            backgroundColor: isDark ? 'rgba(18,18,18,0.8)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.4)'
              : '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: iconBg }}
          >
            <Icon size={12} color={iconColor} strokeWidth={3} />
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
