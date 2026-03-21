'use client'

import { useState, useRef } from 'react'
import type { VocabularyWord } from '@/lib/supabase/types'

interface FillInBlankProps {
  words: VocabularyWord[]
  onComplete: () => void
}

export default function FillInBlank({ words, onComplete }: FillInBlankProps) {
  // Filter to words that have example sentences
  const playableWords = words.filter(w => w.example_sentence)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 })
  const [finished, setFinished] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  if (playableWords.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <p className="text-gray-500">Not enough words with example sentences for this mode.</p>
        <button onClick={onComplete} className="mt-4 py-2 px-5 bg-violet-500 hover:bg-violet-600 text-white font-semibold rounded-xl transition">
          Back
        </button>
      </div>
    )
  }

  const current = playableWords[currentIndex]
  const blanked = current.example_sentence!.replace(
    new RegExp(current.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
    '______'
  )

  function checkAnswer() {
    const isCorrect = answer.trim().toLowerCase() === current.word.toLowerCase()
    setRevealed(true)
    setResults(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))

    // Also update SRS
    fetch('/api/vocabulary', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wordId: current.id, correct: isCorrect }),
    }).catch(console.error)
  }

  function nextWord() {
    if (currentIndex + 1 >= playableWords.length) {
      setFinished(true)
    } else {
      setCurrentIndex(currentIndex + 1)
      setAnswer('')
      setRevealed(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const isCorrect = answer.trim().toLowerCase() === current.word.toLowerCase()

  if (finished) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Practice Complete!</h2>
        <p className="text-gray-500 mb-4">
          {results.correct} out of {results.total} correct
        </p>
        <button onClick={onComplete} className="py-2.5 px-6 bg-violet-500 hover:bg-violet-600 text-white font-semibold rounded-xl transition">
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
            style={{ width: `${(currentIndex / playableWords.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-gray-500">{currentIndex + 1}/{playableWords.length}</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <p className="text-sm text-gray-500 font-medium">Fill in the missing word:</p>

        <p className="text-lg text-gray-900 leading-relaxed">{blanked}</p>

        {current.definition && (
          <p className="text-sm text-gray-400">
            Hint: {current.definition}
          </p>
        )}

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !revealed && checkAnswer()}
            disabled={revealed}
            placeholder="Type the word..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-gray-50"
            autoFocus
          />
          {!revealed ? (
            <button
              onClick={checkAnswer}
              disabled={!answer.trim()}
              className="py-2.5 px-5 bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
            >
              Check
            </button>
          ) : (
            <button
              onClick={nextWord}
              className="py-2.5 px-5 bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold rounded-xl transition"
            >
              Next
            </button>
          )}
        </div>

        {revealed && (
          <div className={`p-3 rounded-xl text-sm ${isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {isCorrect ? (
              <p>Correct!</p>
            ) : (
              <p>The answer was: <strong>{current.word}</strong></p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
