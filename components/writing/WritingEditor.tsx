'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTimer } from '@/hooks/useTimer'

interface WritingEditorProps {
  minWords: number
  maxMinutes?: number
  showTimer?: boolean
  onSubmit: (essay: string, wordCount: number, timeSpent: number) => void
  disabled?: boolean
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function countParagraphs(text: string): number {
  return text.split(/\n\s*\n/).filter(p => p.trim()).length || (text.trim() ? 1 : 0)
}

export default function WritingEditor({
  minWords,
  maxMinutes,
  showTimer = false,
  onSubmit,
  disabled = false,
}: WritingEditorProps) {
  const [text, setText] = useState('')
  const [showWarning, setShowWarning] = useState(false)
  const draftKeyRef = useRef(`writing-draft-${minWords}`)
  const startTimeRef = useRef(Date.now())

  const timer = useTimer({
    mode: maxMinutes ? 'countdown' : 'countup',
    duration: maxMinutes ? maxMinutes * 60 : undefined,
    onComplete: maxMinutes ? () => handleAutoSubmit() : undefined,
  })

  // Auto-start timer when showTimer is true
  useEffect(() => {
    if (showTimer && !timer.isRunning) {
      timer.start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTimer])

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem(draftKeyRef.current)
    if (draft) setText(draft)
  }, [])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (text.trim()) {
        localStorage.setItem(draftKeyRef.current, text)
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [text])

  const wordCount = countWords(text)
  const paragraphCount = countParagraphs(text)

  // 30-second warning for timed mode
  useEffect(() => {
    if (maxMinutes && timer.seconds <= 30 && timer.seconds > 0 && timer.isRunning) {
      setShowWarning(true)
    }
  }, [maxMinutes, timer.seconds, timer.isRunning])

  const handleAutoSubmit = useCallback(() => {
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
    localStorage.removeItem(draftKeyRef.current)
    onSubmit(text, countWords(text), elapsed)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, onSubmit])

  function handleSubmit() {
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
    localStorage.removeItem(draftKeyRef.current)
    onSubmit(text, wordCount, elapsed)
  }

  const wordCountColor = wordCount === 0
    ? 'text-gray-400'
    : wordCount < minWords * 0.6
      ? 'text-red-500'
      : wordCount < minWords
        ? 'text-amber-500'
        : 'text-emerald-500'

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-4">
          <span className={`text-sm font-medium ${wordCountColor}`}>
            {wordCount} / {minWords}+ words
          </span>
          <span className="text-xs text-gray-400">
            {paragraphCount} paragraph{paragraphCount !== 1 ? 's' : ''}
          </span>
        </div>
        {showTimer && (
          <div className={`text-sm font-mono font-medium ${
            showWarning ? 'text-red-500 animate-pulse' : 'text-gray-600'
          }`}>
            {timer.formatted}
          </div>
        )}
      </div>

      {/* Warning banner */}
      {showWarning && (
        <div className="px-4 py-2 bg-red-50 text-red-700 text-sm font-medium text-center">
          Less than 30 seconds remaining!
        </div>
      )}

      {/* Text area */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={disabled}
        placeholder="Start writing your essay here..."
        className="w-full min-h-[400px] px-6 py-4 text-gray-900 text-[15px] leading-relaxed placeholder:text-gray-400 focus:outline-none resize-y disabled:opacity-50 disabled:bg-gray-50"
      />

      {/* Submit bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
        {wordCount < minWords && (
          <p className="text-xs text-amber-600">
            Write at least {minWords - wordCount} more word{minWords - wordCount !== 1 ? 's' : ''} to reach the minimum
          </p>
        )}
        {wordCount >= minWords && (
          <p className="text-xs text-emerald-600">Minimum word count reached</p>
        )}
        <button
          onClick={handleSubmit}
          disabled={disabled || wordCount === 0}
          className="ml-auto py-2.5 px-6 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Essay
        </button>
      </div>
    </div>
  )
}
