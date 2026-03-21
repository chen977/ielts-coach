'use client'

import { useEffect } from 'react'
import { useTimer } from '@/hooks/useTimer'

interface ReadingTimerProps {
  seconds: number
  onComplete: () => void
}

export default function ReadingTimer({ seconds, onComplete }: ReadingTimerProps) {
  const timer = useTimer({ mode: 'countdown', duration: seconds, onComplete })

  useEffect(() => {
    timer.start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const progress = timer.seconds / seconds
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-mono font-bold text-gray-900">{timer.formatted}</span>
        </div>
      </div>
      <p className="text-sm font-medium text-amber-600">Reading Time</p>
      <p className="text-xs text-gray-500 text-center max-w-xs">
        Read through the questions below before the audio begins
      </p>
    </div>
  )
}
