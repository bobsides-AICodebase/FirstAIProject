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

export function Recorder({ onResult, disabled }: RecorderProps) {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [recording, setRecording] = useState(false)
  const [elapsedSecs, setElapsedSecs] = useState(0)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)
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

  const startRecording = useCallback(async () => {
    if (!supported || recording || disabled) return
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
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const durationSecs = Math.min(
          Math.round((Date.now() - startTimeRef.current) / 1000),
          MAX_DURATION_SECS
        )
        onResult({ blob, durationSecs, mimeType })
      }
      recorder.start()
      setRecording(true)
      setElapsedSecs(0)
      startTimeRef.current = Date.now()
      timerRef.current = setInterval(() => {
        setElapsedSecs((s) => {
          const next = s + 1
          if (next >= MAX_DURATION_SECS) {
            stopRecordingRef.current()
            return MAX_DURATION_SECS
          }
          return next
        })
      }, 1000)
    } catch (err) {
      console.error('Recorder start failed:', err)
    }
  }, [supported, recording, disabled, onResult])

  const stopRecording = useCallback(() => {
    stopTimer()
    const rec = recorderRef.current
    const str = streamRef.current
    if (rec && rec.state !== 'inactive') rec.stop()
    str?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    recorderRef.current = null
    setRecording(false)
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

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-lg font-medium tabular-nums">
        {recording ? `${elapsedSecs}s / ${MAX_DURATION_SECS}s` : '0s'}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={disabled}
          className={
            recording
              ? 'rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50'
              : 'rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50'
          }
        >
          {recording ? 'Stop' : 'Record'}
        </button>
      </div>
    </div>
  )
}
