import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, UserPlus } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import type { Phase } from '@/stores/session'
import { useToast } from '@/stores/toast'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { GlassCard } from '@/components/ui/GlassCard'
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
  const toast = useToast((s) => s.show)

  const [client, setClient] = useState('')
  const [industry, setIndustry] = useState('')
  const [attendees, setAttendees] = useState('')
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isValid = client.trim() && industry && selectedPhase

  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const accent = isDark ? '#10b981' : '#059669'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  async function handleSubmit() {
    if (!isValid || !selectedPhase || submitting) return
    setSubmitting(true)
    try {
      const session = await addSession({ client, industry, phase: selectedPhase, attendees })
      useSession.setState({ activeSession: session })
      navigate('/session')
    } catch {
      toast('Failed to create session')
      setSubmitting(false)
    }
  }

  return (
    <main className="max-w-[540px] mx-auto px-6 pt-12 pb-24 relative" style={{ zIndex: 1 }}>
      <header className="flex justify-between items-center mb-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-semibold text-sm hover:opacity-80 transition-opacity"
          style={{ color: accent }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <ThemeToggle />
      </header>

      <section className="mb-10">
        <h1 className="text-[28px] font-bold tracking-tight" style={{ color: textPrimary }}>
          New Session
        </h1>
        <p className="text-sm mt-1.5" style={{ color: textSoft }}>
          Initialize a new client field engagement.
        </p>
      </section>

      <div className="space-y-8">
        <GlassCard className="p-7">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-widest px-0.5" style={{ color: textMuted }}>
                Client Name
              </label>
              <Input placeholder="e.g. Meridian Global" value={client} onChange={(e) => setClient(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-widest px-0.5" style={{ color: textMuted }}>
                Industry Sector
              </label>
              <select
                className="w-full h-12 border-none rounded-[12px] px-4 text-sm font-medium outline-none appearance-none cursor-pointer"
                style={{
                  backgroundColor: isDark ? '#1e1e22' : '#f4f4f5',
                  color: industry ? textPrimary : textMuted,
                }}
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                {industries.map((ind) => (
                  <option key={ind} value={ind}>{ind || 'Select industry...'}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-widest px-0.5" style={{ color: textMuted }}>
                Key Attendees
              </label>
              <div className="relative">
                <Input placeholder="Add participants..." value={attendees} onChange={(e) => setAttendees(e.target.value)} />
                <UserPlus size={16} className="absolute right-4 top-1/2 -translate-y-1/2" color={textMuted} />
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-3">
          <label className="block text-[11px] font-semibold uppercase tracking-widest px-0.5" style={{ color: textMuted }}>
            Engagement Phase
          </label>
          <div className="grid grid-cols-2 gap-3">
            {phases.map(({ phase, num, desc }) => {
              const color = getPhaseColor(phase, theme)
              const isActive = selectedPhase === phase
              return (
                <div
                  key={phase}
                  className="p-5 rounded-[16px] text-left relative transition-all cursor-pointer"
                  style={{
                    backgroundColor: isActive ? `${color}10` : (isDark ? '#18181b' : '#ffffff'),
                    border: `1px solid ${isActive ? `${color}55` : border}`,
                  }}
                  onClick={() => setSelectedPhase(phase)}
                >
                  {isActive && (
                    <div
                      className="w-2 h-2 rounded-full absolute top-4 right-4"
                      style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                    />
                  )}
                  <span className="font-mono text-[10px] font-medium mb-1.5 block" style={{ color }}>
                    PHASE {num}
                  </span>
                  <div className="font-bold text-[15px] mb-1" style={{ color: textPrimary }}>
                    {phaseConfig[phase].label}
                  </div>
                  <div className="text-[11px] leading-relaxed" style={{ color: textSoft }}>
                    {desc}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="pt-2">
          <PrimaryBtn
            className="w-full h-[48px] text-sm font-bold"
            disabled={!isValid || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Creating...' : 'Start Session'} <ArrowRight size={16} />
          </PrimaryBtn>
        </div>
      </div>
    </main>
  )
}
