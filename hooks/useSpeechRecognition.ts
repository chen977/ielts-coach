'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseSpeechRecognitionReturn {
  isSupported: boolean
  isListening: boolean
  transcript: string
  interimTranscript: string
  start: () => void
  stop: () => void
  reset: () => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isSupported] = useState(() => getSpeechRecognition() !== null)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const shouldListenRef = useRef(false)
  const transcriptRef = useRef('')

  const start = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition()
    if (!SpeechRecognitionClass) return

    // Stop existing instance
    if (recognitionRef.current) {
      shouldListenRef.current = false
      try { recognitionRef.current.stop() } catch {}
    }

    const recognition = new SpeechRecognitionClass()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onresult = (event: { results: Iterable<unknown> | ArrayLike<unknown> }) => {
      let finalText = ''
      let interimText = ''

      Array.from(event.results).forEach((result: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = result as any
        if (r.isFinal) {
          finalText += r[0].transcript
        } else {
          interimText += r[0].transcript
        }
      })

      if (finalText) {
        transcriptRef.current = finalText
        setTranscript(finalText)
      }
      setInterimTranscript(interimText)
    }

    recognition.onend = () => {
      // Auto-restart if we should still be listening (Chrome stops randomly)
      if (shouldListenRef.current) {
        try {
          recognition.start()
        } catch {
          setIsListening(false)
          shouldListenRef.current = false
        }
        return
      }
      setIsListening(false)
    }

    recognition.onerror = (event: { error: string }) => {
      // 'no-speech' and 'aborted' are not fatal
      if (event.error === 'no-speech' || event.error === 'aborted') return
      shouldListenRef.current = false
      setIsListening(false)
    }

    recognitionRef.current = recognition
    shouldListenRef.current = true

    try {
      recognition.start()
      setIsListening(true)
    } catch {
      shouldListenRef.current = false
    }
  }, [])

  const stop = useCallback(() => {
    shouldListenRef.current = false
    setInterimTranscript('')
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
    }
  }, [])

  const reset = useCallback(() => {
    stop()
    setTranscript('')
    setInterimTranscript('')
    transcriptRef.current = ''
  }, [stop])

  useEffect(() => {
    return () => {
      shouldListenRef.current = false
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch {}
      }
    }
  }, [])

  return { isSupported, isListening, transcript, interimTranscript, start, stop, reset }
}
