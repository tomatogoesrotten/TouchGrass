import { useEffect, useRef } from 'react'
import { useSession } from '@/stores/session'

export function useRecordingTimer() {
  const isRecording = useSession((s) => s.isRecording)
  const isPaused = useSession((s) => s.isPaused)
  const setRecSeconds = useSession((s) => s.setRecSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        useSession.setState((s) => ({ recSeconds: s.recSeconds + 1 }))
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRecording, isPaused, setRecSeconds])
}
