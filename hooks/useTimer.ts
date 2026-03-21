'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseTimerOptions {
  mode: 'countup' | 'countdown'
  duration?: number // seconds, required for countdown
  onComplete?: () => void
}

export function useTimer({ mode, duration = 60, onComplete }: UseTimerOptions) {
  const [seconds, setSeconds] = useState(mode === 'countdown' ? duration : 0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)

  onCompleteRef.current = onComplete

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    clearTimer()
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (mode === 'countdown') {
          if (prev <= 1) {
            clearTimer()
            setIsRunning(false)
            onCompleteRef.current?.()
            return 0
          }
          return prev - 1
        } else {
          const next = prev + 1
          if (duration && next >= duration) {
            clearTimer()
            setIsRunning(false)
            onCompleteRef.current?.()
            return next
          }
          return next
        }
      })
    }, 1000)
  }, [mode, duration, clearTimer])

  const stop = useCallback(() => {
    clearTimer()
    setIsRunning(false)
  }, [clearTimer])

  const reset = useCallback(() => {
    clearTimer()
    setIsRunning(false)
    setSeconds(mode === 'countdown' ? duration : 0)
  }, [mode, duration, clearTimer])

  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const formatted = `${minutes}:${secs.toString().padStart(2, '0')}`

  return { seconds, formatted, isRunning, start, stop, reset }
}
