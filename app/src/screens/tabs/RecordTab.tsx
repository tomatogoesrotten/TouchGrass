import { useRef, useCallback, useEffect, useState } from 'react'
import { X, Mic, Upload, Download, Loader2 } from 'lucide-react'
import { useTheme } from '@/stores/theme'
import { useSession } from '@/stores/session'
import { useSettings } from '@/stores/settings'
import { useToast } from '@/stores/toast'
import { api } from '@/lib/api'
import { GlassCard } from '@/components/ui/GlassCard'

const quickTags = [
  { label: 'Important', emoji: '⚠️' },
  { label: 'Question', emoji: '❓' },
  { label: 'Decision', emoji: '✅' },
  { label: 'Action', emoji: '📌' },
  { label: 'Unclear', emoji: '🤔' },
]

type SpeechRecognitionEvent = Event & { results: SpeechRecognitionResultList; resultIndex: number }

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mimeType })
}

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const mimeTypeRef = useRef('audio/webm')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [savingAudio, setSavingAudio] = useState(false)
  const [loadingAudio, setLoadingAudio] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const finalizedTextRef = useRef('')

  const textPrimary = isDark ? '#fafafa' : '#09090b'
  const textSoft = isDark ? '#a1a1aa' : '#52525b'
  const textMuted = isDark ? '#71717a' : '#a1a1aa'
  const dangerColor = isDark ? '#ef4444' : '#dc2626'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const accent = isDark ? '#c4f042' : '#a3cc29'

  const tags = activeSession?.quickTags ?? []
  const transcript = activeSession?.transcript ?? ''

  // Load persisted audio on mount
  useEffect(() => {
    if (!activeSession?.id) return
    setLoadingAudio(true)
    api.getAudio(activeSession.id)
      .then(({ audio, mimeType }) => {
        const blob = base64ToBlob(audio, mimeType)
        setAudioUrl(URL.createObjectURL(blob))
        mimeTypeRef.current = mimeType
      })
      .catch(() => { /* no audio stored yet */ })
      .finally(() => setLoadingAudio(false))
  }, [activeSession?.id])

  const stopRecognition = useCallback(() => {
    activeRef.current = false
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.onresult = null
      recognitionRef.current.onerror = null
      try { recognitionRef.current.stop() } catch { /* already stopped */ }
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

  async function persistAudio(blob: Blob) {
    if (!activeSession?.id) return
    setSavingAudio(true)
    try {
      const base64 = await blobToBase64(blob)
      await api.uploadAudio(activeSession.id, base64, blob.type)
    } catch (err) {
      console.error('Failed to persist audio:', err)
    } finally {
      setSavingAudio(false)
    }
  }

  function startMediaRecorder() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      audioChunksRef.current = []
      const mime = getSupportedMimeType()
      mimeTypeRef.current = mime
      const recorder = new MediaRecorder(stream, { mimeType: mime })
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((t) => t.stop())
        persistAudio(blob)
      }
      recorder.start(1000)
      mediaRecorderRef.current = recorder
    }).catch(() => {
      // Mic already captured by SpeechRecognition; non-fatal
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

    finalizedTextRef.current = useSession.getState().activeSession?.transcript ?? ''

    const recognition = new SR()
    recognition.continuous = settings.speech_settings.continuous
    recognition.interimResults = true
    recognition.lang = settings.speech_settings.language

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let finals = ''
      let interim = ''

      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i]
        if (result.isFinal) {
          finals += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      if (finals) {
        finalizedTextRef.current = finalizedTextRef.current + finals
      }

      const display = finalizedTextRef.current + (interim ? interim : '')
      updateActiveSession({ transcript: display })
    }

    recognition.onerror = (e: Event & { error: string }) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return
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
    const ext = mimeTypeRef.current.includes('mp4') ? 'mp4' : 'webm'
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `recording-${activeSession?.client || 'session'}-${new Date().toISOString().slice(0, 10)}.${ext}`
    a.click()
  }

  async function handleImportAudio(file: File) {
    setImporting(true)
    try {
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
      mimeTypeRef.current = file.type || 'audio/mpeg'
      toast(`Imported: ${file.name}`)

      if (activeSession?.id) {
        const base64 = await blobToBase64(file)
        await api.uploadAudio(activeSession.id, base64, file.type || 'audio/mpeg')
        toast('Audio saved to session', 'success')
      }
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
          {savingAudio && (
            <div className="flex items-center gap-2 text-[11px] font-medium" style={{ color: textMuted }}>
              <Loader2 size={12} className="animate-spin" /> Saving audio...
            </div>
          )}
        </div>

        {/* Audio Player */}
        {loadingAudio && (
          <div className="flex items-center gap-2 justify-center py-4">
            <Loader2 size={14} className="animate-spin" color={textMuted} />
            <span className="text-[12px]" style={{ color: textMuted }}>Loading audio...</span>
          </div>
        )}
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
