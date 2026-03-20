import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mic, FileText, Network, HelpCircle, BookOpen, Lock } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import { useRecordingTimer } from '@/hooks/useRecordingTimer'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Glass } from '@/components/ui/Glass'
import { PhaseBadge } from '@/components/ui/PhaseBadge'
import { SecondaryBtn } from '@/components/ui/SecondaryBtn'
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

  const accent = isDark ? '#00e5a0' : '#00b37e'
  const textPrimary = isDark ? '#f0f1f4' : '#111318'
  const textSoft = isDark ? '#a0a5b8' : '#5a5f72'
  const textMuted = isDark ? '#5c6178' : '#5a5f72'
  const warnColor = isDark ? '#ffb347' : '#e68a00'
  const dangerColor = isDark ? '#ff4d6a' : '#e5384b'

  const m = String(Math.floor(recSeconds / 60)).padStart(2, '0')
  const s = String(recSeconds % 60).padStart(2, '0')

  return (
    <div>
      <Glass className="fixed top-0 z-50 w-full rounded-none">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 flex items-center justify-center rounded-[10px] transition-colors"
              style={{
                backgroundColor: isDark ? 'rgba(18,21,30,0.72)' : 'rgba(255,255,255,0.65)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              }}
            >
              <ArrowLeft size={18} color={textPrimary} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-[15.5px] font-[750] tracking-tight font-headline" style={{ color: textPrimary }}>
                {activeSession.client}
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <PhaseBadge phase={activeSession.phase} variant="mini" />
                <span className="text-xs font-medium" style={{ color: textSoft }}>{activeSession.industry}</span>
                <span className="font-mono text-[11px]" style={{ color: textMuted }}>{activeSession.date}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5">
            {isRecording && (
              <div
                className="flex items-center gap-3 px-4 py-2 rounded-[20px]"
                style={{
                  backgroundColor: isDark ? 'rgba(13,14,18,0.4)' : '#f1f3f9',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                }}
              >
                <div className="w-2 h-2 rounded-full intel-pulse animate-pulse" style={{ backgroundColor: dangerColor }} />
                <span className="font-mono font-bold tracking-tighter text-lg" style={{ color: dangerColor }}>
                  {m}:{s}
                </span>
              </div>
            )}
            <ThemeToggle />
            <SecondaryBtn className="px-5 py-2 text-sm">Export</SecondaryBtn>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6">
          <nav className="flex items-center gap-8 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 py-4 transition-all relative whitespace-nowrap"
                  style={{
                    color: isActive ? accent : textMuted,
                    borderBottom: isActive ? `2.5px solid ${accent}` : '2.5px solid transparent',
                  }}
                >
                  <Icon size={20} />
                  <span className="text-sm font-bold font-headline">{tab.label}</span>
                  {tab.id === 'solutions' && (
                    <span
                      className="absolute -top-1 -right-9 px-1.5 py-0.5 rounded text-[9px] font-bold"
                      style={{
                        backgroundColor: `${warnColor}26`,
                        color: warnColor,
                        border: `1px solid ${warnColor}33`,
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
      </Glass>
      <main className="pt-40 pb-24 px-6">
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
