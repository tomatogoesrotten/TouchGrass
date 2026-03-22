import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, RefreshCw, Send, Loader2, Sparkles, Check, MessageSquare } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import { useToast } from '@/stores/toast'
import { api } from '@/lib/api'
import type { ChatMessage } from '@/lib/api'
import { GlassCard } from '@/components/ui/GlassCard'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { PhaseBadge } from '@/components/ui/PhaseBadge'

export function PlanPage() {
  const navigate = useNavigate()
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const { activeSession, updateActiveSession } = useSession()
  const toast = useToast((s) => s.show)

  const [generating, setGenerating] = useState(false)
  const [chatting, setChatting] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [copied, setCopied] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!activeSession) navigate('/')
  }, [activeSession, navigate])

  if (!activeSession) return null

  const plan = activeSession.actionPlan ?? ''
  const chatMessages: ChatMessage[] = activeSession.planChat ?? []

  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const accent = isDark ? '#c4f042' : '#a3cc29'

  const hasContent = !!(activeSession.transcript || activeSession.manualNotes || activeSession.structuredNotes)

  async function handleGenerate() {
    setGenerating(true)
    try {
      const { result } = await api.aiPlan(activeSession!.id)
      updateActiveSession({ actionPlan: result, planChat: [] })
      toast('Plan generated', 'success')
    } catch {
      toast('Failed to generate plan', 'error')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSendChat() {
    const msg = chatInput.trim()
    if (!msg || chatting) return

    const newUserMsg: ChatMessage = { role: 'user', content: msg }
    const updatedMessages = [...chatMessages, newUserMsg]
    updateActiveSession({ planChat: updatedMessages })
    setChatInput('')
    setChatting(true)

    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

    try {
      const { message, plan: updatedPlan } = await api.aiPlanChat(
        activeSession!.id,
        updatedMessages,
        plan
      )
      const withReply = [...updatedMessages, { role: 'assistant' as const, content: message }]
      updateActiveSession({ planChat: withReply, actionPlan: updatedPlan })
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch {
      toast('Chat failed — try again', 'error')
    } finally {
      setChatting(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(plan)
    setCopied(true)
    toast('Plan copied to clipboard', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendChat()
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={{ zIndex: 1 }}>
      {/* Header */}
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
              onClick={() => navigate('/session')}
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
                  Plan — {activeSession.client}
                </h1>
                <PhaseBadge phase={activeSession.phase} variant="mini" />
              </div>
              <span className="text-xs" style={{ color: textSoft }}>{activeSession.industry}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto pt-6 pb-12 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-120px)]">

          {/* Left: Plan */}
          <div className="lg:col-span-7 flex flex-col">
            <GlassCard className="flex-1 flex flex-col p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-5 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center"
                    style={{ backgroundColor: `${accent}18` }}
                  >
                    <Sparkles size={16} color={accent} />
                  </div>
                  <h2 className="text-[16px] font-bold tracking-tight" style={{ color: textPrimary }}>
                    Implementation Plan
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {plan && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all hover:brightness-110"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        color: textSoft,
                        border: `1px solid ${border}`,
                      }}
                    >
                      {copied ? <Check size={12} color={accent} /> : <Copy size={12} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                  <button
                    onClick={handleGenerate}
                    disabled={generating || !hasContent}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all hover:brightness-110 disabled:opacity-40"
                    style={{
                      backgroundColor: `${accent}18`,
                      color: accent,
                      border: `1px solid ${accent}30`,
                    }}
                  >
                    {generating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    {plan ? 'Regenerate' : 'Generate'}
                  </button>
                </div>
              </div>

              <div
                className="flex-1 overflow-y-auto pr-2"
                style={{ scrollbarWidth: 'thin', scrollbarColor: `${textMuted} transparent` }}
              >
                {generating ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-20">
                    <div className="relative">
                      <Loader2 size={28} className="animate-spin" color={accent} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: textSoft }}>Generating your plan...</p>
                    <p className="text-xs" style={{ color: textMuted }}>Analyzing notes, solutions, and meeting data</p>
                  </div>
                ) : plan ? (
                  <div
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: textSoft }}
                  >
                    {plan}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-5 py-20">
                    <div
                      className="w-16 h-16 rounded-[18px] flex items-center justify-center"
                      style={{ backgroundColor: `${accent}12` }}
                    >
                      <Sparkles size={28} color={accent} />
                    </div>
                    <div className="text-center">
                      <p className="text-[15px] font-bold mb-1.5" style={{ color: textPrimary }}>
                        Ready to plan
                      </p>
                      <p className="text-sm max-w-[300px]" style={{ color: textMuted }}>
                        {hasContent
                          ? 'Generate an implementation plan from your session notes, transcript, and solutions.'
                          : 'Add notes or record a transcript first, then generate your plan.'}
                      </p>
                    </div>
                    {hasContent && (
                      <button
                        onClick={handleGenerate}
                        className="px-6 py-3 rounded-[12px] font-bold text-[14px] flex items-center gap-2.5 transition-all hover:brightness-110 active:scale-[0.97]"
                        style={{
                          backgroundColor: accent,
                          color: '#000000',
                          boxShadow: `0 0 24px ${accent}40`,
                        }}
                      >
                        <Sparkles size={16} />
                        Generate Plan
                      </button>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Right: Chat */}
          <div className="lg:col-span-5 flex flex-col">
            <GlassCard className="flex-1 flex flex-col p-6 overflow-hidden min-h-[500px]">
              <div className="flex items-center gap-2.5 mb-5 flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center"
                  style={{ backgroundColor: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(124,58,237,0.1)' }}
                >
                  <MessageSquare size={16} color={isDark ? '#8b5cf6' : '#7c3aed'} />
                </div>
                <h2 className="text-[16px] font-bold tracking-tight" style={{ color: textPrimary }}>
                  Refine Plan
                </h2>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4"
                style={{ scrollbarWidth: 'thin', scrollbarColor: `${textMuted} transparent` }}
              >
                {!plan && chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-3 py-12">
                    <MessageSquare size={24} color={textMuted} />
                    <p className="text-sm text-center" style={{ color: textMuted }}>
                      Generate a plan first, then chat here to refine it.
                    </p>
                  </div>
                )}
                {plan && chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-3 py-12">
                    <p className="text-sm text-center max-w-[250px]" style={{ color: textMuted }}>
                      Ask me to modify the plan — add sections, change scope, adjust complexity, or focus on specific areas.
                    </p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-[85%] rounded-[14px] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                      style={msg.role === 'user' ? {
                        backgroundColor: `${accent}18`,
                        color: textPrimary,
                        border: `1px solid ${accent}25`,
                      } : {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        color: textSoft,
                        border: `1px solid ${border}`,
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatting && (
                  <div className="flex justify-start">
                    <div
                      className="rounded-[14px] px-4 py-3 flex items-center gap-2"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${border}`,
                      }}
                    >
                      <Loader2 size={14} className="animate-spin" color={textMuted} />
                      <span className="text-sm" style={{ color: textMuted }}>Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div
                className="flex-shrink-0 flex items-end gap-2 rounded-[12px] p-2"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${border}`,
                }}
              >
                <textarea
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!plan || chatting}
                  placeholder={plan ? 'Ask to modify the plan...' : 'Generate a plan first'}
                  rows={1}
                  className="flex-1 bg-transparent border-none outline-none resize-none text-sm px-2 py-1.5 disabled:opacity-40"
                  style={{ color: textPrimary, maxHeight: '120px' }}
                  onInput={(e) => {
                    const el = e.currentTarget
                    el.style.height = 'auto'
                    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
                  }}
                />
                <button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim() || !plan || chatting}
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-all hover:brightness-110 disabled:opacity-30 flex-shrink-0"
                  style={{
                    backgroundColor: accent,
                    color: '#000000',
                  }}
                >
                  <Send size={14} />
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
