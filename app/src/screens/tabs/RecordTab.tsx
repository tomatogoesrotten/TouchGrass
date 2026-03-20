import { X } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import { useToast } from '@/stores/toast'
import { Glass } from '@/components/ui/Glass'
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

  const accent = isDark ? '#00e5a0' : '#00b37e'
  const textPrimary = isDark ? '#f0f1f4' : '#111318'
  const textSoft = isDark ? '#a0a5b8' : '#5a5f72'
  const textMuted = isDark ? '#5c6178' : '#5a5f72'
  const dangerColor = isDark ? '#ff4d6a' : '#e5384b'

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

  const gradient = isDark ? 'linear-gradient(45deg, #6effc0, #00e5a0)' : 'linear-gradient(45deg, #00b37e, #00e5a0)'
  const btnText = isDark ? '#003824' : '#ffffff'

  return (
    <div className="space-y-8">
      {/* Record Button */}
      <div className="flex flex-col items-center justify-center gap-6 py-4">
        <button
          onClick={toggleRecording}
          className="group relative px-10 py-5 rounded-[50px] font-[900] text-xl font-headline flex items-center gap-3 transition-transform active:scale-95 record-pulse"
          style={{
            background: isRecording ? dangerColor : gradient,
            color: isRecording ? '#fff' : btnText,
            boxShadow: isRecording
              ? `0 20px 40px ${dangerColor}26`
              : `0 20px 40px ${accent}26`,
          }}
        >
          {isRecording ? (
            <>
              <span className="w-3 h-3 bg-white rounded-sm" />
              Stop Recording
            </>
          ) : (
            <>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: btnText }} />
              Start Recording
            </>
          )}
        </button>
      </div>

      {/* Quick Tags */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: textMuted }}>
          Quick Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {quickTags.map(({ label, emoji }) => (
            <Glass
              key={label}
              className="px-4 py-2 rounded-[20px] cursor-pointer transition-all text-sm font-bold flex items-center gap-2 hover:opacity-80"
              style={{ color: textPrimary }}
              onClick={() => handleAddTag(label, emoji)}
            >
              <span>{emoji}</span> {label}
            </Glass>
          ))}
        </div>
      </div>

      {/* Tag List */}
      <div className="space-y-2">
        {tags.map((tag) => (
          <Glass key={tag.id} className="p-4 rounded-[14px] flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs" style={{ color: textMuted }}>{tag.time}</span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                style={{ backgroundColor: `${accent}1a`, color: accent }}
              >
                {tag.emoji} {tag.label}
              </span>
              <p className="text-sm font-medium" style={{ color: textPrimary }}>{tag.note}</p>
            </div>
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: textMuted }}
              onClick={() => removeTag(tag.id)}
            >
              <X size={18} />
            </button>
          </Glass>
        ))}
      </div>

      {/* Transcript */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold font-headline" style={{ color: textPrimary }}>Live Transcript</h2>
          <span className="text-xs font-mono" style={{ color: textMuted }}>Real-time</span>
        </div>
        <GlassCard className="h-[260px] p-6 overflow-y-auto space-y-5">
          <div className="flex gap-4">
            <div
              className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center font-mono text-[10px]"
              style={{ backgroundColor: isDark ? '#292a2e' : '#e2e7f0', color: textMuted }}
            >
              01:12
            </div>
            <p className="text-sm leading-relaxed" style={{ color: textSoft }}>
              The primary concern with the current model is heat dissipation at scale. We need to reconsider the internal cooling channels.
            </p>
          </div>
          <div className="flex gap-4">
            <div
              className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center font-mono text-[10px]"
              style={{ backgroundColor: isDark ? '#292a2e' : '#e2e7f0', color: textMuted }}
            >
              02:10
            </div>
            <p className="text-sm leading-relaxed font-semibold italic" style={{ color: accent }}>
              "If we bypass the secondary system, we save 12% immediately."
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
