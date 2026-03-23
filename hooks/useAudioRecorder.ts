'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { hasGetUserMedia, hasMediaRecorder, getAudioContextClass, getRecorderMimeType } from '@/lib/browser'

interface UseAudioRecorderReturn {
  isRecording: boolean
  isSupported: boolean
  audioLevel: number // 0-1
  start: () => Promise<void>
  stop: () => void
  blob: Blob | null
  error: string | null
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check support once on mount (client-side only)
  const [isSupported] = useState(() => hasGetUserMedia() && hasMediaRecorder())

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)

  const cleanup = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close()
        }
      } catch {
        // AudioContext.close() can throw on some mobile browsers
      }
      audioContextRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    analyserRef.current = null
    setAudioLevel(0)
  }, [])

  const updateLevel = useCallback(() => {
    if (!analyserRef.current) return
    try {
      const data = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(data)
      // RMS
      let sum = 0
      for (let i = 0; i < data.length; i++) {
        const normalized = data[i] / 255
        sum += normalized * normalized
      }
      const rms = Math.sqrt(sum / data.length)
      setAudioLevel(Math.min(1, rms * 2.5)) // boost slightly for visual feedback
    } catch {
      // AnalyserNode can throw if context is closed
    }
    animFrameRef.current = requestAnimationFrame(updateLevel)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    setBlob(null)
    chunksRef.current = []

    if (!isSupported) {
      setError('Audio recording is not supported in this browser. Please use Safari on iOS or Chrome on desktop.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up audio analysis (optional — gracefully skip if AudioContext unavailable)
      const AudioContextClass = getAudioContextClass()
      if (AudioContextClass) {
        try {
          const audioCtx = new AudioContextClass()
          audioContextRef.current = audioCtx
          const source = audioCtx.createMediaStreamSource(stream)
          const analyser = audioCtx.createAnalyser()
          analyser.fftSize = 256
          source.connect(analyser)
          analyserRef.current = analyser
        } catch {
          // AudioContext setup failed — continue without audio level meter
          console.warn('AudioContext unavailable, skipping audio level meter')
        }
      }

      // Pick supported MIME type
      const mimeType = getRecorderMimeType()

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const recordedMime = recorder.mimeType || mimeType || 'audio/webm'
        const recordedBlob = new Blob(chunksRef.current, { type: recordedMime })
        setBlob(recordedBlob)
        cleanup()
        setIsRecording(false)
      }

      recorder.onerror = () => {
        cleanup()
        setIsRecording(false)
        setError('Recording failed. Please try again.')
      }

      recorder.start(250) // collect data every 250ms
      setIsRecording(true)
      if (analyserRef.current) {
        updateLevel()
      }
    } catch (err) {
      cleanup()
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.')
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.')
      } else {
        setError('Could not access microphone. Please check your device settings.')
      }
    }
  }, [cleanup, updateLevel, isSupported])

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch {
        // MediaRecorder.stop() can throw if already stopped
        cleanup()
        setIsRecording(false)
      }
    }
  }, [cleanup])

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop()
        } catch {
          // ignore
        }
      }
      cleanup()
    }
  }, [cleanup])

  return { isRecording, isSupported, audioLevel, start, stop, blob, error }
}
