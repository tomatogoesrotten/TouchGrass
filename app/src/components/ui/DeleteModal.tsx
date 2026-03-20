import { AnimatePresence, motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import { useToast } from '@/stores/toast'
import { SecondaryBtn } from './SecondaryBtn'
import { DangerBtn } from './DangerBtn'

export function DeleteModal() {
  const { deleteTarget, setDeleteTarget, removeSession } = useSession()
  const theme = useTheme((s) => s.theme)
  const toast = useToast((s) => s.show)
  const isDark = theme === 'dark'

  return (
    <AnimatePresence>
      {deleteTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={() => setDeleteTarget(null)}
          />
          {/* Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-[440px] rounded-[18px] p-[30px] overflow-hidden"
            style={{
              backgroundColor: isDark ? '#121317' : '#ffffff',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
          >
            {/* Accent bar */}
            <div
              className="absolute top-0 left-0 w-full h-[2px]"
              style={{
                background: `linear-gradient(to right, transparent, ${isDark ? 'rgba(255,77,106,0.3)' : 'rgba(229,56,75,0.3)'}, transparent)`,
              }}
            />

            <div className="flex flex-col gap-6">
              {/* Icon */}
              <div
                className="p-3 rounded-[14px] w-fit"
                style={{ backgroundColor: isDark ? 'rgba(255,77,106,0.1)' : 'rgba(229,56,75,0.1)' }}
              >
                <Trash2 size={28} color={isDark ? '#ff4d6a' : '#e5384b'} />
              </div>

              {/* Text */}
              <div className="space-y-2">
                <h2
                  className="font-headline text-[18px] font-[750] tracking-tight"
                  style={{ color: isDark ? '#f0f1f4' : '#111318' }}
                >
                  Delete session?
                </h2>
                <p
                  className="text-[14px] leading-relaxed font-medium"
                  style={{ color: isDark ? '#a0a5b8' : '#5a5f72' }}
                >
                  This action cannot be undone. Are you sure you want to permanently delete this intelligence session?
                </p>
              </div>

              {/* Metadata */}
              <div
                className="rounded-[14px] p-4 flex items-center gap-4"
                style={{ backgroundColor: isDark ? 'rgba(13,14,18,0.5)' : '#f1f3f9' }}
              >
                <div className="flex flex-col">
                  <span
                    className="text-[10px] uppercase tracking-widest font-bold"
                    style={{ color: isDark ? '#a0a5b8' : '#5a5f72' }}
                  >
                    Client
                  </span>
                  <span
                    className="font-mono text-[12px]"
                    style={{ color: isDark ? '#00e5a0' : '#00b37e' }}
                  >
                    {deleteTarget.client}
                  </span>
                </div>
                <div
                  className="w-px h-8"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                />
                <div className="flex flex-col">
                  <span
                    className="text-[10px] uppercase tracking-widest font-bold"
                    style={{ color: isDark ? '#a0a5b8' : '#5a5f72' }}
                  >
                    Recorded
                  </span>
                  <span className="font-mono text-[12px]" style={{ color: isDark ? '#f0f1f4' : '#111318' }}>
                    {deleteTarget.date}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <SecondaryBtn className="flex-1 h-[48px] text-[14px]" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </SecondaryBtn>
                <DangerBtn
                  className="flex-1 h-[48px] text-[14px] shadow-lg"
                  onClick={() => {
                    removeSession(deleteTarget.id)
                    toast('Session deleted successfully')
                  }}
                >
                  Delete
                </DangerBtn>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
