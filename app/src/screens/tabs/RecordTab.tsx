import { X } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import { useToast } from '@/stores/toast'
import { GlassCard } from '@/components/ui/GlassCard'

const quickTags = [
  { label: 'Important', emoji: '⚠️' },
  { label: 'Question', emoji: '❓' },
  { label: 'Decision', emoji: '✅' },
  { label: 'Action', emoji: '📌' },
  { label: 'Unclear', emoji: '🤔' },
]

export function RecordTab() {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const { isRecording, setRecording, setRecSeconds, tags, addTag, removeTag } = useSession()
  const toast = useToast((s) => s.show)

  const accent = isDark ? '#10b981' : '#059669'
  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const dangerColor = isDark ? '#ef4444' : '#dc2626'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  function toggleRecording() {
    if (isRecording) {
      setRecording(false)
      toast('Recording saved')
    } else {
      setRecSeconds(0)
      setRecording(true)
    }
  }

  function handleAddTag(label: string, emoji: string) {
    addTag(label, emoji)
    toast(`${emoji} ${label} tagged`)
  }

  return (
    <div className="space-y-8">
      {/* Record Button */}
      <div className="flex flex-col items-center justify-center gap-5 py-6">
        <button
          onClick={toggleRecording}
          className="group relative px-8 py-4 rounded-[100px] font-bold text-[15px] flex items-center gap-3 transition-all active:scale-[0.97] record-pulse"
          style={{
            backgroundColor: isRecording ? dangerColor : accent,
            color: '#ffffff',
            boxShadow: isRecording
              ? `0 0 30px ${dangerColor}25`
              : `0 0 30px ${accent}25`,
          }}
        >
          {isRecording ? (
            <>
              <span className="w-3 h-3 bg-white rounded-[3px]" />
              Stop Recording
            </>
          ) : (
            <>
              <span className="w-3 h-3 rounded-full bg-white" />
              Start Recording
            </>
          )}
        </button>
      </div>

      {/* Quick Tags */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
          Quick Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {quickTags.map(({ label, emoji }) => (
            <button
              key={label}
              className="px-4 py-2 rounded-[100px] cursor-pointer transition-all text-[13px] font-medium flex items-center gap-2 hover:brightness-110"
              style={{
                backgroundColor: isDark ? '#18181b' : '#ffffff',
                color: textPrimary,
                border: `1px solid ${border}`,
              }}
              onClick={() => handleAddTag(label, emoji)}
            >
              <span>{emoji}</span> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tag List */}
      <div className="space-y-2">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="p-4 rounded-[14px] flex items-center justify-between group"
            style={{
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              border: `1px solid ${border}`,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px]" style={{ color: textMuted }}>{tag.time}</span>
              <span
                className="px-2.5 py-1 rounded-[8px] text-[10px] font-semibold"
                style={{ backgroundColor: `${accent}12`, color: accent }}
              >
                {tag.emoji} {tag.label}
              </span>
              <p className="text-sm" style={{ color: textSoft }}>{tag.note}</p>
            </div>
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-[8px] flex items-center justify-center"
              style={{ color: textMuted }}
              onClick={() => removeTag(tag.id)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Transcript */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold" style={{ color: textPrimary }}>Live Transcript</h2>
          <span
            className="text-[11px] font-medium px-2.5 py-1 rounded-[8px]"
            style={{ backgroundColor: `${accent}12`, color: accent }}
          >
            Real-time
          </span>
        </div>
        <GlassCard className="h-[260px] p-6 overflow-y-auto space-y-5">
          <div className="flex gap-4">
            <div
              className="w-10 h-7 rounded-[8px] flex-shrink-0 flex items-center justify-center font-mono text-[10px] font-medium"
              style={{ backgroundColor: isDark ? '#27272a' : '#f4f4f5', color: textMuted }}
            >
              01:12
            </div>
            <p className="text-sm leading-relaxed" style={{ color: textSoft }}>
              The primary concern with the current model is heat dissipation at scale. We need to reconsider the internal cooling channels.
            </p>
          </div>
          <div className="flex gap-4">
            <div
              className="w-10 h-7 rounded-[8px] flex-shrink-0 flex items-center justify-center font-mono text-[10px] font-medium"
              style={{ backgroundColor: isDark ? '#27272a' : '#f4f4f5', color: textMuted }}
            >
              02:10
            </div>
            <p className="text-sm leading-relaxed font-medium italic" style={{ color: accent }}>
              "If we bypass the secondary system, we save 12% immediately."
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
