import { useState } from 'react'
import { useTheme } from '@/stores/theme'

export function NotesTab() {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const [text, setText] = useState('')

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="space-y-4">
      <textarea
        className="w-full border-none rounded-[14px] px-6 py-5 font-headline text-[15px] leading-[1.7] min-h-[200px] outline-none resize-y transition-all"
        style={{
          backgroundColor: isDark ? '#1a1b20' : '#f1f3f9',
          color: isDark ? '#f0f1f4' : '#111318',
        }}
        placeholder={'Start typing your session notes here...\n\nUse this space to capture key observations, client requirements, and action items from the visit.'}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-mono" style={{ color: isDark ? '#5c6178' : '#5a5f72' }}>
          {wordCount} word{wordCount !== 1 ? 's' : ''}
        </span>
        <span className="text-xs" style={{ color: isDark ? '#5c6178' : '#5a5f72' }}>
          Transcript: Available
        </span>
      </div>
    </div>
  )
}
