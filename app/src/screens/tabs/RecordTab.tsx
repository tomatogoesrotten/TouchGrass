import { useRef, useCallback, useEffect, useState } from 'react'
import { X, Mic, Upload, Download, Loader2 } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import { useSettings } from '@/stores/settings'
import { useToast } from '@/stores/toast'
import { GlassCard } from '@/components/ui/GlassCard'

const quickTags = [
  { label: 'Important', emoji: '⚠️' },
  { label: 'Question', emoji: '❓' },
  { label: 'Decision', emoji: '✅' },
  { label: 'Action', emoji: '📌' },
  { label: 'Unclear', emoji: '🤔' },
]

type SpeechRecognitionEvent = Event & { results: SpeechRecognitionResultList; resultIndex: number }

export function RecordTab() {
  const theme = useTheme((s) => s.theme)
  const isDark = theme === 'dark'
  const {
    activeSession, isRecording, setRecording, setRecSeconds,
    addTag, removeTag, updateActiveSession,
  } = useSession()
  const toast = useToast((s) => s.show)
  const { settings } = useSettings()
  const recognitionRef = useRef<InstanceType<typeof window.SpeechRecognition> | null>(null)
  const activeRef = useRef(false)
  const finalizedRef = useRef('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const dangerColor = isDark ? '#ef4444' : '#dc2626'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const accent = isDark ? '#c4f042' : '#a3cc29'

  const tags = activeSession?.quickTags ?? []
  const transcript = activeSession?.transcript ?? ''

  const stopRecognition = useCallback(() => {
    activeRef.current = false
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
  }, [])

  const stopMediaRecorder = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  useEffect(() => {
    return () => {
      stopRecognition()
      stopMediaRecorder()
    }
  }, [stopRecognition, stopMediaRecorder])

  function startMediaRecorder() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      audioChunksRef.current = []
      const recorder = new MediaRecorder(stream, { mimeType: getSupportedMimeType() })
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((t) => t.stop())
      }
      recorder.start(1000)
      mediaRecorderRef.current = recorder
    }).catch(() => {
      // Mic already captured by SpeechRecognition in some browsers; non-fatal
    })
  }

  function getSupportedMimeType() {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type
    }
    return 'audio/webm'
  }

  function toggleRecording() {
    if (isRecording) {
      stopRecognition()
      stopMediaRecorder()
      setRecording(false)
      toast('Recording saved')
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      toast('Speech recognition not available — use Chrome or Edge', 'error')
      return
    }

    const recognition = new SR()
    recognition.continuous = settings.speech_settings.continuous
    recognition.interimResults = true
    recognition.lang = settings.speech_settings.language

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let finalText = ''
      let interimText = ''
      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i]
        if (result.isFinal) {
          finalText += result[0].transcript
        } else {
          interimText += result[0].transcript
        }
      }

      const newFinalized = finalizedRef.current + finalText
      if (finalText) {
        finalizedRef.current = newFinalized
      }

      const combined = (newFinalized + interimText).trim()
      if (combined) {
        updateActiveSession({ transcript: combined })
      }
    }

    recognition.onerror = (e: Event & { error: string }) => {
      if (e.error === 'no-speech') return
      if (e.error === 'network') {
        toast('No internet — recording audio only', 'error')
      } else if (e.error === 'not-allowed') {
        toast('Microphone access denied — check browser permissions', 'error')
        stopRecognition()
        stopMediaRecorder()
        setRecording(false)
      } else {
        toast(`Recognition error: ${e.error}`, 'error')
      }
    }

    recognition.onend = () => {
      if (activeRef.current) {
        try { recognition.start() } catch { /* already started */ }
      }
    }

    recognitionRef.current = recognition
    activeRef.current = true
    finalizedRef.current = useSession.getState().activeSession?.transcript ?? ''
    setAudioUrl(null)
    recognition.start()
    startMediaRecorder()
    setRecSeconds(0)
    setRecording(true)
  }

  function handleAddTag(label: string, emoji: string) {
    addTag(label, emoji)
    toast(`${emoji} ${label} tagged`)
  }

  function handleExportAudio() {
    if (!audioUrl) return
    const ext = mediaRecorderRef.current?.mimeType?.includes('mp4') ? 'mp4' : 'webm'
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `recording-${activeSession?.client || 'session'}-${new Date().toISOString().slice(0, 10)}.${ext}`
    a.click()
  }

  async function handleImportAudio(file: File) {
    setImporting(true)
    try {
      const audioContext = new AudioContext()
      const arrayBuffer = await file.arrayBuffer()
      await audioContext.decodeAudioData(arrayBuffer)

      const url = URL.createObjectURL(file)
      setAudioUrl(url)
      toast(`Imported: ${file.name}`)

      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SR) {
        toast('Speech recognition not available for transcription', 'error')
        setImporting(false)
        return
      }

      toast('Audio imported. Use the browser to play and transcribe live, or manually add notes.', 'success')
    } catch {
      toast('Failed to import audio file', 'error')
    } finally {
      setImporting(false)
    }
  }

  return (
    <GlassCard className="h-full flex flex-col p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
            <Mic size={16} color={textPrimary} />
          </div>
          <h2 className="text-[16px] font-bold tracking-tight" style={{ color: textPrimary }}>Record</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Import Audio */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.webm,.flac"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImportAudio(file)
              e.target.value = ''
            }}
          />
          <button
            className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-all hover:brightness-110"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${border}`,
            }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isRecording || importing}
            title="Import audio file"
          >
            {importing ? <Loader2 size={14} color={textMuted} className="animate-spin" /> : <Upload size={14} color={textMuted} />}
          </button>
          {/* Export Audio */}
          <button
            className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-all hover:brightness-110 disabled:opacity-30"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${border}`,
            }}
            onClick={handleExportAudio}
            disabled={!audioUrl}
            title="Export recording"
          >
            <Download size={14} color={textMuted} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-8 pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: `${textMuted} transparent` }}>
        <div className="flex flex-col items-center justify-center gap-5 py-4">
          <button
            onClick={toggleRecording}
            className="group relative px-8 py-4 rounded-[100px] font-bold text-[15px] flex items-center gap-3 transition-all active:scale-[0.97] record-pulse"
            style={{
              backgroundColor: isRecording ? dangerColor : 'var(--color-accent-dark)',
              color: isRecording ? '#ffffff' : '#000000',
              boxShadow: isRecording
                ? `0 0 30px ${dangerColor}40`
                : `0 0 30px rgba(196, 240, 66, 0.4)`,
            }}
          >
            {isRecording ? (
              <>
                <span className="w-3 h-3 bg-white rounded-[3px]" />
                Stop Recording
              </>
            ) : (
              <>
                <span className="w-3 h-3 rounded-full bg-black" />
                Start Recording
              </>
            )}
          </button>
        </div>

        {/* Imported/Recorded Audio Player */}
        {audioUrl && !isRecording && (
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
              Audio
            </h3>
            <div
              className="rounded-[12px] p-3"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${border}` }}
            >
              <audio controls src={audioUrl} className="w-full h-8" style={{ filter: isDark ? 'invert(1) hue-rotate(180deg) opacity(0.8)' : 'opacity(0.8)' }} />
            </div>
            <button
              className="flex items-center gap-2 text-[11px] font-semibold transition-opacity hover:opacity-80"
              style={{ color: accent }}
              onClick={handleExportAudio}
            >
              <Download size={12} />
              Download recording
            </button>
          </div>
        )}

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
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
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

        <div className="space-y-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="p-4 rounded-[14px] flex items-center justify-between group"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${border}`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px]" style={{ color: textMuted }}>{tag.time}</span>
                <span
                  className="px-2.5 py-1 rounded-[8px] text-[10px] font-semibold"
                  style={{ backgroundColor: isDark ? 'rgba(196,240,66,0.12)' : 'rgba(163,204,41,0.12)', color: 'var(--color-accent-dark)' }}
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold" style={{ color: textPrimary }}>Live Transcript</h2>
            <span
              className="text-[11px] font-medium px-2.5 py-1 rounded-[8px]"
              style={{ backgroundColor: isDark ? 'rgba(196,240,66,0.12)' : 'rgba(163,204,41,0.12)', color: 'var(--color-accent-dark)' }}
            >
              {isRecording ? 'Listening...' : transcript ? 'Captured' : 'Ready'}
            </span>
          </div>
          <div className="min-h-[200px] p-5 overflow-y-auto rounded-[16px]" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${border}` }}>
            {transcript ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: textSoft }}>{transcript}</p>
            ) : (
              <p className="text-sm italic" style={{ color: textMuted }}>
                {isRecording ? 'Listening for speech...' : 'Start recording to capture transcript.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
