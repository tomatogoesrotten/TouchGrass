import { useState } from 'react'
import { useTheme } from '@/stores/theme'

export function NotesTab() {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const [text, setText] = useState('')

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const textMuted = isDark ? '#71717a' : '#a1a1aa'

  return (
    <div className="space-y-3">
      <textarea
        className="w-full border-none rounded-[16px] px-6 py-5 text-[15px] leading-[1.8] min-h-[280px] outline-none resize-y transition-all"
        style={{
          backgroundColor: isDark ? '#18181b' : '#ffffff',
          color: isDark ? '#fafafa' : '#09090b',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        }}
        placeholder={'Start typing your session notes here...\n\nUse this space to capture key observations, client requirements, and action items from the visit.'}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-mono" style={{ color: textMuted }}>
          {wordCount} word{wordCount !== 1 ? 's' : ''}
        </span>
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded-[6px]"
          style={{
            backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(5,150,105,0.08)',
            color: isDark ? '#10b981' : '#059669',
          }}
        >
          Transcript available
        </span>
      </div>
    </div>
  )
}
