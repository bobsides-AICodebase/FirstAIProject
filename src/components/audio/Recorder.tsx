import { useCallback, useEffect, useRef, useState } from 'react'

const MAX_DURATION_SECS = 90

export type RecorderResult = {
  blob: Blob
  durationSecs: number
  mimeType: string
}

type RecorderProps = {
  onResult: (result: RecorderResult) => void
  disabled?: boolean
}

function isMediaRecorderSupported(): boolean {
  return typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined'
}

type RecordingState = 'idle' | 'recording' | 'paused'

export function Recorder({ onResult, disabled }: RecorderProps) {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [elapsedSecs, setElapsedSecs] = useState(0)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const activeSecsRef = useRef(0)
  const stopRecordingRef = useRef<() => void>(() => {})

  useEffect(() => {
    setSupported(isMediaRecorderSupported())
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    timerRef.current = setInterval(() => {
      setElapsedSecs((s) => {
        const next = s + 1
        activeSecsRef.current = next
        if (next >= MAX_DURATION_SECS) {
          stopRecordingRef.current()
          return MAX_DURATION_SECS
        }
        return next
      })
    }, 1000)
  }, [stopTimer])

  const startRecording = useCallback(async () => {
    if (!supported || recordingState !== 'idle' || disabled) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4'
      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      chunksRef.current = []
      activeSecsRef.current = 0
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const durationSecs = Math.min(activeSecsRef.current, MAX_DURATION_SECS)
        onResult({ blob, durationSecs, mimeType })
      }
      recorder.start()
      setRecordingState('recording')
      setElapsedSecs(0)
      startTimer()
    } catch (err) {
      console.error('Recorder start failed:', err)
    }
  }, [supported, recordingState, disabled, onResult, startTimer])

  const pauseRecording = useCallback(() => {
    const rec = recorderRef.current
    if (rec?.state === 'recording') {
      rec.pause()
      stopTimer()
      setRecordingState('paused')
    }
  }, [stopTimer])

  const resumeRecording = useCallback(() => {
    const rec = recorderRef.current
    if (rec?.state === 'paused') {
      rec.resume()
      setRecordingState('recording')
      startTimer()
    }
  }, [startTimer])

  const stopRecording = useCallback(() => {
    stopTimer()
    const rec = recorderRef.current
    const str = streamRef.current
    if (rec && rec.state !== 'inactive') rec.stop()
    str?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    recorderRef.current = null
    setRecordingState('idle')
  }, [stopTimer])

  stopRecordingRef.current = stopRecording

  useEffect(() => {
    return () => {
      stopTimer()
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (recorderRef.current?.state !== 'inactive') recorderRef.current?.stop()
    }
  }, [stopTimer])

  if (supported === null) {
    return <p className="text-gray-500">Checking microphone…</p>
  }
  if (!supported) {
    return (
      <p className="text-amber-700">
        Recording is not supported in this browser (MediaRecorder unavailable). Try Chrome or Firefox.
      </p>
    )
  }

  const isActive = recordingState === 'recording' || recordingState === 'paused'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-lg font-medium tabular-nums">
        {isActive ? `${elapsedSecs}s / ${MAX_DURATION_SECS}s` : '0s'}
        {recordingState === 'paused' && ' (paused)'}
      </div>
      <div className="flex gap-2">
        {recordingState === 'idle' ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="rounded bg-brand-gradient px-4 py-2 text-brand-ivory hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Record
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={recordingState === 'recording' ? pauseRecording : resumeRecording}
              disabled={disabled}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {recordingState === 'recording' ? 'Pause' : 'Resume'}
            </button>
            <button
              type="button"
              onClick={stopRecording}
              disabled={disabled}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              Stop
            </button>
          </>
        )}
      </div>
    </div>
  )
}
