import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FileText, FileJson, FileDown, Webhook, BookOpen, Loader2, Check, X } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import { useToast } from '@/stores/toast'
import { api } from '@/lib/api'

interface Props {
  open: boolean
  onClose: () => void
}

type ExportFormat = 'markdown' | 'json' | 'pdf' | 'webhook' | 'notion'

const exports: { id: ExportFormat; label: string; desc: string; icon: typeof FileText; available: boolean }[] = [
  { id: 'markdown', label: 'Markdown', desc: 'Download structured .md file', icon: FileText, available: true },
  { id: 'json', label: 'JSON', desc: 'Download raw session data', icon: FileJson, available: true },
  { id: 'pdf', label: 'PDF', desc: 'Download formatted PDF report', icon: FileDown, available: true },
  { id: 'webhook', label: 'Send to n8n', desc: 'POST session to your webhook', icon: Webhook, available: true },
  { id: 'notion', label: 'Notion', desc: 'Coming soon', icon: BookOpen, available: false },
]

export function ExportModal({ open, onClose }: Props) {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const activeSession = useSession((s) => s.activeSession)
  const toast = useToast((s) => s.show)
  const [loadingId, setLoadingId] = useState<ExportFormat | null>(null)
  const [doneId, setDoneId] = useState<ExportFormat | null>(null)

  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const accent = isDark ? '#10b981' : '#059669'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  async function handleExport(format: ExportFormat) {
    if (!activeSession || loadingId) return
    setLoadingId(format)
    setDoneId(null)

    try {
      if (format === 'markdown' || format === 'json' || format === 'pdf') {
        const url = api.getExportUrl(activeSession.id, format)
        const a = document.createElement('a')
        a.href = url
        a.download = ''
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        toast(`${format.toUpperCase()} downloaded`)
      } else if (format === 'webhook') {
        await api.exportWebhook(activeSession.id)
        toast('Sent to n8n successfully')
      }
      setDoneId(format)
    } catch {
      toast(`Export failed — try again`, 'error')
    } finally {
      setLoadingId(null)
      setTimeout(() => setDoneId(null), 2000)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-[480px] rounded-[24px] p-8 overflow-hidden"
            style={{
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold tracking-tight" style={{ color: textPrimary }}>
                  Export Session
                </h2>
                <p className="text-sm mt-1" style={{ color: textSoft }}>
                  Choose how to export your session data
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-all hover:brightness-110"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                }}
              >
                <X size={16} color={textMuted} />
              </button>
            </div>

            <div className="space-y-3">
              {exports.map((exp) => {
                const Icon = exp.icon
                const isLoading = loadingId === exp.id
                const isDone = doneId === exp.id
                const disabled = !exp.available || !!loadingId

                return (
                  <button
                    key={exp.id}
                    disabled={disabled}
                    onClick={() => handleExport(exp.id)}
                    className="w-full p-4 rounded-[16px] flex items-center gap-4 text-left transition-all hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      border: `1px solid ${isDone ? `${accent}40` : border}`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: isDone
                          ? `${accent}15`
                          : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                      }}
                    >
                      {isLoading ? (
                        <Loader2 size={18} color={accent} className="animate-spin" />
                      ) : isDone ? (
                        <Check size={18} color={accent} />
                      ) : (
                        <Icon size={18} color={exp.available ? textPrimary : textMuted} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[14px]" style={{ color: exp.available ? textPrimary : textMuted }}>
                        {exp.label}
                      </div>
                      <div className="text-[12px] mt-0.5" style={{ color: textMuted }}>
                        {exp.desc}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
