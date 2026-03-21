'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseAudioRecorderReturn {
  isRecording: boolean
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
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
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
    animFrameRef.current = requestAnimationFrame(updateLevel)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    setBlob(null)
    chunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up audio analysis
      const audioCtx = new AudioContext()
      audioContextRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      // Pick supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : ''

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })
        setBlob(recordedBlob)
        cleanup()
        setIsRecording(false)
      }

      recorder.start(250) // collect data every 250ms
      setIsRecording(true)
      updateLevel()
    } catch (err) {
      cleanup()
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.')
      } else {
        setError('Could not access microphone. Please check your device settings.')
      }
    }
  }, [cleanup, updateLevel])

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      cleanup()
    }
  }, [cleanup])

  return { isRecording, audioLevel, start, stop, blob, error }
}
