import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '@/stores/theme'
import { useToast } from '@/stores/toast'

export function Toast() {
  const { message, visible } = useToast()
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-8 left-1/2 z-[80] flex items-center gap-3 px-6 py-3 rounded-[10px] shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
          style={{
            backgroundColor: isDark ? '#121317' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(0,229,160,0.2)' : 'rgba(0,179,126,0.2)'}`,
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: isDark ? 'linear-gradient(45deg,#6effc0,#00e5a0)' : 'linear-gradient(45deg,#00b37e,#00e5a0)' }}
          />
          <span
            className="font-headline font-bold text-sm tracking-wide"
            style={{ color: isDark ? '#00e5a0' : '#00b37e' }}
          >
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
