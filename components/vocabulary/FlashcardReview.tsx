'use client'

import { useState } from 'react'
import type { VocabularyWord } from '@/lib/supabase/types'

interface FlashcardReviewProps {
  words: VocabularyWord[]
  onComplete: () => void
}

export default function FlashcardReview({ words, onComplete }: FlashcardReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState<{ correct: number; incorrect: number }>({ correct: 0, incorrect: 0 })
  const [finished, setFinished] = useState(false)
  const [updating, setUpdating] = useState(false)

  const current = words[currentIndex]

  async function handleAnswer(correct: boolean) {
    if (updating) return
    setUpdating(true)

    await fetch('/api/vocabulary', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wordId: current.id, correct }),
    })

    const newResults = {
      correct: results.correct + (correct ? 1 : 0),
      incorrect: results.incorrect + (correct ? 0 : 1),
    }
    setResults(newResults)

    if (currentIndex + 1 >= words.length) {
      setFinished(true)
    } else {
      setCurrentIndex(currentIndex + 1)
      setFlipped(false)
    }
    setUpdating(false)
  }

  if (finished) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Review Complete!</h2>
        <div className="flex justify-center gap-6 mb-6">
          <div>
            <p className="text-2xl font-bold text-emerald-600">{results.correct}</p>
            <p className="text-sm text-gray-500">Got it</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-500">{results.incorrect}</p>
            <p className="text-sm text-gray-500">Still learning</p>
          </div>
        </div>
        <button
          onClick={onComplete}
          className="py-2.5 px-6 bg-violet-500 hover:bg-violet-600 text-white font-semibold rounded-xl transition"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all"
            style={{ width: `${((currentIndex) / words.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-gray-500 flex-shrink-0">
          {currentIndex + 1}/{words.length}
        </span>
      </div>

      {/* Card */}
      <div
        onClick={() => !flipped && setFlipped(true)}
        className={`bg-white rounded-2xl border border-gray-100 p-8 min-h-[280px] flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow ${!flipped ? 'select-none' : ''}`}
      >
        {!flipped ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{current.word}</h2>
            <p className="text-sm text-gray-400">Tap to reveal</p>
          </div>
        ) : (
          <div className="text-center space-y-3 w-full">
            <h2 className="text-xl font-bold text-gray-900">{current.word}</h2>
            {current.pronunciation && (
              <p className="text-sm text-gray-400 font-mono">{current.pronunciation}</p>
            )}
            {current.part_of_speech && (
              <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                {current.part_of_speech}
              </span>
            )}
            {current.definition && (
              <p className="text-gray-700">{current.definition}</p>
            )}
            {current.example_sentence && (
              <p className="text-sm text-gray-500 italic border-l-2 border-violet-200 pl-3 text-left">
                {current.example_sentence}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Answer buttons */}
      {flipped && (
        <div className="flex gap-3">
          <button
            onClick={() => handleAnswer(false)}
            disabled={updating}
            className="flex-1 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-xl transition disabled:opacity-50"
          >
            Still learning
          </button>
          <button
            onClick={() => handleAnswer(true)}
            disabled={updating}
            className="flex-1 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl transition disabled:opacity-50"
          >
            Got it!
          </button>
        </div>
      )}
    </div>
  )
}
