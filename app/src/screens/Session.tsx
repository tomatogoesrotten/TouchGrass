import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mic, FileText, Network, HelpCircle, BookOpen, Lock, Download } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import { useRecordingTimer } from '@/hooks/useRecordingTimer'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { PhaseBadge } from '@/components/ui/PhaseBadge'
import { RecordTab } from './tabs/RecordTab'
import { NotesTab } from './tabs/NotesTab'
import { StructureTab } from './tabs/StructureTab'
import { QuestionsTab } from './tabs/QuestionsTab'
import { DomainTab } from './tabs/DomainTab'
import { SolutionsTab } from './tabs/SolutionsTab'

const tabs = [
  { id: 'record', label: 'Record', icon: Mic },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'structure', label: 'Structure', icon: Network },
  { id: 'questions', label: 'Questions', icon: HelpCircle },
  { id: 'domain', label: 'Domain', icon: BookOpen },
  { id: 'solutions', label: 'Solutions', icon: Lock },
]

export function Session() {
  const navigate = useNavigate()
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const { activeSession, activeTab, setActiveTab, isRecording, recSeconds } = useSession()

  useRecordingTimer()

  useEffect(() => {
    if (!activeSession) navigate('/')
  }, [activeSession, navigate])

  if (!activeSession) return null

  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const dangerColor = isDark ? '#ef4444' : '#dc2626'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  const m = String(Math.floor(recSeconds / 60)).padStart(2, '0')
  const s = String(recSeconds % 60).padStart(2, '0')

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-[20px]"
        style={{
          backgroundColor: isDark ? 'rgba(9,9,11,0.85)' : 'rgba(245,245,247,0.85)',
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="w-9 h-9 flex items-center justify-center rounded-[10px] transition-all hover:brightness-110"
              style={{
                backgroundColor: isDark ? '#18181b' : '#f4f4f5',
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
                  backgroundColor: `${dangerColor}12`,
                  border: `1px solid ${dangerColor}30`,
                }}
              >
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: dangerColor }} />
                <span className="font-mono font-bold text-sm" style={{ color: dangerColor }}>
                  {m}:{s}
                </span>
              </div>
            )}
            <ThemeToggle />
            <button
              className="w-9 h-9 flex items-center justify-center rounded-[10px] transition-all hover:brightness-110"
              style={{
                backgroundColor: isDark ? '#18181b' : '#f4f4f5',
                border: `1px solid ${border}`,
              }}
            >
              <Download size={16} color={textSoft} />
            </button>
          </div>
        </div>

        {/* Pill Tab Bar */}
        <div className="max-w-[1400px] mx-auto px-6 pb-3">
          <nav
            className="inline-flex items-center gap-1 rounded-[100px] p-1"
            style={{ backgroundColor: isDark ? '#18181b' : '#ffffff', border: `1px solid ${border}` }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[100px] transition-all text-[13px] font-medium whitespace-nowrap"
                  style={{
                    backgroundColor: isActive ? (isDark ? '#27272a' : '#f4f4f5') : 'transparent',
                    color: isActive ? (isDark ? '#fafafa' : '#09090b') : textMuted,
                  }}
                >
                  <Icon size={15} />
                  {tab.label}
                  {tab.id === 'solutions' && (
                    <span
                      className="ml-1 px-1.5 py-0.5 rounded-[6px] text-[9px] font-bold uppercase"
                      style={{
                        backgroundColor: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(217,119,6,0.1)',
                        color: isDark ? '#f59e0b' : '#d97706',
                      }}
                    >
                      Private
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="pt-8 pb-24 px-6">
        <div className="max-w-[720px] mx-auto">
          {activeTab === 'record' && <RecordTab />}
          {activeTab === 'notes' && <NotesTab />}
          {activeTab === 'structure' && <StructureTab />}
          {activeTab === 'questions' && <QuestionsTab />}
          {activeTab === 'domain' && <DomainTab />}
          {activeTab === 'solutions' && <SolutionsTab />}
        </div>
      </main>
    </div>
  )
}
