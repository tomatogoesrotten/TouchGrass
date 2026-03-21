import { useState } from 'react'
import { FileText } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { GlassCard } from '@/components/ui/GlassCard'

export function NotesTab() {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const [text, setText] = useState('')

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const textPrimary = isDark ? '#fafafa' : '#09090b'

  return (
    <GlassCard className="h-full flex flex-col p-5 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          <FileText size={16} color={textPrimary} />
        </div>
        <h2 className="text-[16px] font-bold tracking-tight" style={{ color: textPrimary }}>Notes</h2>
      </div>

      <textarea
        className="flex-1 w-full border-none rounded-[16px] px-5 py-4 text-[15px] leading-[1.8] outline-none resize-none transition-all"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          color: isDark ? '#fafafa' : '#09090b',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        }}
        placeholder={'Start typing your session notes here...\n\nUse this space to capture key observations, client requirements, and action items from the visit.'}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex items-center justify-between px-1 mt-3 flex-shrink-0">
        <span className="text-[11px] font-mono" style={{ color: textMuted }}>
          {wordCount} word{wordCount !== 1 ? 's' : ''}
        </span>
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded-[6px]"
          style={{
            backgroundColor: isDark ? 'rgba(196,240,66,0.1)' : 'rgba(163,204,41,0.08)',
            color: 'var(--color-accent-dark)',
          }}
        >
          Transcript available
        </span>
      </div>
    </GlassCard>
  )
}
