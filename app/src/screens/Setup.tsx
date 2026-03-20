import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, UserPlus } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import type { Phase } from '@/stores/session'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Glass } from '@/components/ui/Glass'
import { PrimaryBtn } from '@/components/ui/PrimaryBtn'
import { Input } from '@/components/ui/Input'
import { getPhaseColor, phaseConfig } from '@/lib/phase'

const phases: { phase: Phase; num: string; desc: string }[] = [
  { phase: 'requirements', num: '01', desc: 'Initial assessment and baseline data.' },
  { phase: 'follow-up', num: '02', desc: 'Continue previous engagement threads.' },
  { phase: 'demo', num: '03', desc: 'Live product demonstration session.' },
  { phase: 'troubleshoot', num: '04', desc: 'Diagnose and resolve client issues.' },
]

const industries = ['', 'Renewable Energy', 'Cloud Infrastructure', 'Financial Services', 'Autonomous Logistics', 'Healthcare', 'Aerospace']

export function Setup() {
  const navigate = useNavigate()
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const addSession = useSession((s) => s.addSession)
  const setActiveSession = useSession((s) => s.setActiveSession)

  const [client, setClient] = useState('')
  const [industry, setIndustry] = useState('')
  const [attendees, setAttendees] = useState('')
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null)

  const isValid = client.trim() && industry && selectedPhase

  const textPrimary = isDark ? '#f0f1f4' : '#111318'
  const textSoft = isDark ? '#a0a5b8' : '#5a5f72'
  const textMuted = isDark ? '#5c6178' : '#5a5f72'
  const accent = isDark ? '#00e5a0' : '#00b37e'

  function handleSubmit() {
    if (!isValid || !selectedPhase) return
    const session = { client, industry, phase: selectedPhase, attendees }
    addSession(session)
    // Set the newly created session as active for the session screen
    const store = useSession.getState()
    setActiveSession(store.sessions[0])
    navigate('/session')
  }

  return (
    <main className="max-w-[540px] mx-auto px-6 pt-12 pb-24">
      {/* Nav */}
      <header className="flex justify-between items-center mb-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-semibold text-sm tracking-wide hover:opacity-80 transition-opacity"
          style={{ color: accent }}
        >
          <ArrowLeft size={18} /> Dashboard
        </button>
        <ThemeToggle />
      </header>

      {/* Title */}
      <section className="mb-12">
        <h1 className="font-headline font-[900] text-[30px] leading-tight tracking-tight" style={{ color: textPrimary }}>
          New Session
        </h1>
        <p className="font-medium mt-2 text-sm" style={{ color: textSoft }}>
          Initialize a new client field engagement.
        </p>
      </section>

      <div className="space-y-8">
        {/* Form Card */}
        <Glass className="p-8 rounded-[14px] shadow-2xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10.5px] font-bold uppercase tracking-widest px-1" style={{ color: textSoft }}>
                Client Name
              </label>
              <Input placeholder="e.g. Meridian Global" value={client} onChange={(e) => setClient(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="block text-[10.5px] font-bold uppercase tracking-widest px-1" style={{ color: textSoft }}>
                Industry Sector
              </label>
              <select
                className="w-full h-12 border-none rounded-[10px] px-4 text-[14.5px] font-medium outline-none"
                style={{ backgroundColor: isDark ? '#1a1b20' : '#f1f3f9', color: textPrimary }}
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                {industries.map((ind) => (
                  <option key={ind} value={ind}>{ind || 'Select industry...'}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[10.5px] font-bold uppercase tracking-widest px-1" style={{ color: textSoft }}>
                Key Attendees
              </label>
              <div className="relative">
                <Input placeholder="Add participants..." value={attendees} onChange={(e) => setAttendees(e.target.value)} />
                <UserPlus size={18} className="absolute right-4 top-1/2 -translate-y-1/2" color={textMuted} />
              </div>
            </div>
          </div>
        </Glass>

        {/* Phase Selector */}
        <div className="space-y-4">
          <label className="block text-[10.5px] font-bold uppercase tracking-widest px-1" style={{ color: textSoft }}>
            Engagement Phase
          </label>
          <div className="grid grid-cols-2 gap-4">
            {phases.map(({ phase, num, desc }) => {
              const color = getPhaseColor(phase, theme)
              const isActive = selectedPhase === phase
              return (
                <Glass
                  key={phase}
                  className={`p-5 rounded-[14px] text-left relative transition-all cursor-pointer`}
                  style={{
                    borderColor: isActive ? `${color}99` : undefined,
                    backgroundColor: isActive
                      ? isDark ? `${color}1a` : `${color}1a`
                      : undefined,
                    outline: isActive ? `1px solid ${color}99` : undefined,
                  }}
                  onClick={() => setSelectedPhase(phase)}
                >
                  {isActive && (
                    <div
                      className="w-[7px] h-[7px] rounded-full absolute top-3 right-3"
                      style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                    />
                  )}
                  <span className="font-mono text-[10px] mb-1 block" style={{ color }}>
                    PHASE {num}
                  </span>
                  <div className="font-headline font-bold text-base" style={{ color: textPrimary }}>
                    {phaseConfig[phase].label}
                  </div>
                  <div className="text-[11px] mt-1 leading-relaxed" style={{ color: textSoft }}>
                    {desc}
                  </div>
                </Glass>
              )
            })}
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-4">
          <PrimaryBtn
            className="w-full h-[56px] text-[15px] font-extrabold tracking-wide font-headline"
            disabled={!isValid}
            onClick={handleSubmit}
          >
            Start Session <ArrowRight size={18} />
          </PrimaryBtn>
        </div>
      </div>
    </main>
  )
}
