import { useState } from 'react'
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
  const dangerColor = isDark ? '#ef4444' : '#dc2626'
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      await removeSession(deleteTarget.id)
      toast('Session deleted')
    } catch {
      toast('Failed to delete session', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AnimatePresence>
      {deleteTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setDeleteTarget(null)}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-[440px] rounded-[24px] p-8 overflow-hidden"
            style={{
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
            }}
          >
            <div className="flex flex-col gap-6">
              <div
                className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                style={{ backgroundColor: `${dangerColor}12` }}
              >
                <Trash2 size={22} color={dangerColor} />
              </div>

              <div className="space-y-2">
                <h2
                  className="text-lg font-bold tracking-tight"
                  style={{ color: isDark ? '#fafafa' : '#09090b' }}
                >
                  Delete session?
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: isDark ? '#a1a1aa' : '#52525b' }}
                >
                  This action cannot be undone. Are you sure you want to permanently delete this intelligence session?
                </p>
              </div>

              <div
                className="rounded-[14px] p-4 flex items-center gap-4"
                style={{ backgroundColor: isDark ? '#111113' : '#f4f4f5' }}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: isDark ? '#71717a' : '#a1a1aa' }}>
                    Client
                  </span>
                  <span className="font-mono text-xs font-medium" style={{ color: isDark ? '#10b981' : '#059669' }}>
                    {deleteTarget.client}
                  </span>
                </div>
                <div className="w-px h-8" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: isDark ? '#71717a' : '#a1a1aa' }}>
                    Recorded
                  </span>
                  <span className="font-mono text-xs" style={{ color: isDark ? '#fafafa' : '#09090b' }}>
                    {deleteTarget.date}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <SecondaryBtn className="flex-1 h-[44px] text-sm" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </SecondaryBtn>
                <DangerBtn
                  className="flex-1 h-[44px] text-sm"
                  disabled={deleting}
                  onClick={handleDelete}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </DangerBtn>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
