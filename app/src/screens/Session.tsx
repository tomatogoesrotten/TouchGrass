import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, Sparkles } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import { useRecordingTimer } from '@/hooks/useRecordingTimer'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { PhaseBadge } from '@/components/ui/PhaseBadge'
import { ExportModal } from '@/components/ui/ExportModal'
import { RecordTab } from './tabs/RecordTab'
import { NotesTab } from './tabs/NotesTab'
import { StructureTab } from './tabs/StructureTab'
import { QuestionsTab } from './tabs/QuestionsTab'
import { DomainTab } from './tabs/DomainTab'
import { SolutionsTab } from './tabs/SolutionsTab'

export function Session() {
  const navigate = useNavigate()
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const { activeSession, isRecording, isPaused, recSeconds } = useSession()
  const [showExport, setShowExport] = useState(false)

  useRecordingTimer()

  useEffect(() => {
    if (!activeSession) navigate('/')
  }, [activeSession, navigate])

  if (!activeSession) return null

  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const dangerColor = isDark ? 'var(--color-danger-dark)' : 'var(--color-danger-light)'
  const warnColor = isDark ? 'var(--color-warn-dark)' : 'var(--color-warn-light)'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  const m = String(Math.floor(recSeconds / 60)).padStart(2, '0')
  const s = String(recSeconds % 60).padStart(2, '0')

  return (
    <div className="min-h-screen flex flex-col relative" style={{ zIndex: 1 }}>
      <header
        className="sticky top-0 z-50 backdrop-blur-[20px]"
        style={{
          backgroundColor: isDark ? 'rgba(10,10,10,0.85)' : 'rgba(245,245,247,0.85)',
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="w-9 h-9 flex items-center justify-center rounded-[10px] transition-all hover:brightness-110"
              style={{
                backgroundColor: isDark ? 'var(--color-surface-low)' : 'var(--color-surface-light-low)',
                border: `1px solid ${border}`,
              }}
            >
              <ArrowLeft size={16} color={textPrimary} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[15px] font-bold tracking-tight" style={{ color: textPrimary }}>
                  {activeSession.client}
                </h1>
                <PhaseBadge phase={activeSession.phase} variant="mini" />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs" style={{ color: textSoft }}>{activeSession.industry}</span>
                <span className="text-[10px]" style={{ color: textMuted }}>·</span>
                <span className="font-mono text-[11px]" style={{ color: textMuted }}>{activeSession.date}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isRecording && (
              <div
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-[100px]"
                style={{
                  backgroundColor: isPaused
                    ? (isDark ? 'rgba(255,138,0,0.12)' : 'rgba(230,125,0,0.12)')
                    : (isDark ? 'rgba(255,77,106,0.12)' : 'rgba(229,56,75,0.12)'),
                  border: `1px solid ${isPaused
                    ? (isDark ? 'rgba(255,138,0,0.3)' : 'rgba(230,125,0,0.3)')
                    : (isDark ? 'rgba(255,77,106,0.3)' : 'rgba(229,56,75,0.3)')}`,
                }}
              >
                <div className={`w-2 h-2 rounded-full ${isPaused ? '' : 'animate-pulse'}`} style={{ backgroundColor: isPaused ? warnColor : dangerColor }} />
                <span className="font-mono font-bold text-sm" style={{ color: isPaused ? warnColor : dangerColor }}>
                  {m}:{s}{isPaused ? ' · Paused' : ''}
                </span>
              </div>
            )}
            <ThemeToggle />
            <button
              onClick={() => navigate('/session/plan')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-[10px] text-[13px] font-semibold transition-all hover:brightness-110"
              style={{
                backgroundColor: isDark ? 'rgba(196,240,66,0.1)' : 'rgba(163,204,41,0.1)',
                color: 'var(--color-accent-dark)',
                border: `1px solid ${isDark ? 'rgba(196,240,66,0.2)' : 'rgba(163,204,41,0.2)'}`,
              }}
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">Plan</span>
            </button>
            <button
              onClick={() => setShowExport(true)}
              className="w-9 h-9 flex items-center justify-center rounded-[10px] transition-all hover:brightness-110"
              style={{
                backgroundColor: isDark ? 'var(--color-surface-low)' : 'var(--color-surface-light-low)',
                border: `1px solid ${border}`,
              }}
            >
              <Share2 size={16} color={textSoft} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto pt-6 pb-12 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-120px)]">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[minmax(400px,auto)]">
               <RecordTab />
               <NotesTab />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[minmax(400px,auto)]">
               <StructureTab />
               <QuestionsTab />
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="min-h-[400px]">
              <DomainTab />
            </div>
            <div className="min-h-[400px]">
              <SolutionsTab />
            </div>
          </div>
        </div>
      </main>

      <ExportModal open={showExport} onClose={() => setShowExport(false)} />
    </div>
  )
}
