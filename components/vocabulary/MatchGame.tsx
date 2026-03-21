'use client'

import { useState, useMemo } from 'react'
import type { VocabularyWord } from '@/lib/supabase/types'

interface MatchGameProps {
  words: VocabularyWord[]
  onComplete: () => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MatchGame({ words, onComplete }: MatchGameProps) {
  // Take up to 5 words with definitions
  const gameWords = useMemo(() => {
    const withDefs = words.filter(w => w.definition)
    return shuffle(withDefs).slice(0, 5)
  }, [words])

  const shuffledDefs = useMemo(() => shuffle(gameWords.map((w, i) => ({ index: i, definition: w.definition! }))), [gameWords])

  const [selectedWord, setSelectedWord] = useState<number | null>(null)
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [wrong, setWrong] = useState<{ word: number; def: number } | null>(null)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)

  if (gameWords.length < 2) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <p className="text-gray-500">Not enough words with definitions for this mode.</p>
        <button onClick={onComplete} className="mt-4 py-2 px-5 bg-violet-500 hover:bg-violet-600 text-white font-semibold rounded-xl transition">
          Back
        </button>
      </div>
    )
  }

  const finished = matched.size === gameWords.length

  function handleDefClick(defIndex: number, originalIndex: number) {
    if (selectedWord === null || matched.has(selectedWord)) return

    setAttempts(a => a + 1)

    if (selectedWord === originalIndex) {
      // Correct match
      const newMatched = new Set(matched)
      newMatched.add(selectedWord)
      setMatched(newMatched)
      setScore(s => s + 1)
      setSelectedWord(null)
      setWrong(null)

      // Update SRS for the matched word
      fetch('/api/vocabulary', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordId: gameWords[selectedWord].id, correct: true }),
      }).catch(console.error)
    } else {
      // Wrong match
      setWrong({ word: selectedWord, def: defIndex })
      setTimeout(() => {
        setWrong(null)
        setSelectedWord(null)
      }, 800)
    }
  }

  if (finished) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-2">All matched!</h2>
        <p className="text-gray-500 mb-4">
          {score}/{gameWords.length} correct in {attempts} attempts
        </p>
        <button onClick={onComplete} className="py-2.5 px-6 bg-violet-500 hover:bg-violet-600 text-white font-semibold rounded-xl transition">
          Done
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <p className="text-sm text-gray-500 text-center">Tap a word, then tap its definition to match</p>

      <div className="grid grid-cols-2 gap-4">
        {/* Words column */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Words</p>
          {gameWords.map((w, i) => {
            const isMatched = matched.has(i)
            const isSelected = selectedWord === i
            const isWrong = wrong?.word === i

            return (
              <button
                key={w.id}
                onClick={() => !isMatched && setSelectedWord(i)}
                disabled={isMatched}
                className={`w-full text-left p-3 rounded-xl text-sm font-medium transition-all ${
                  isMatched
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : isWrong
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : isSelected
                    ? 'bg-violet-50 text-violet-700 border-2 border-violet-400 shadow-sm'
                    : 'bg-white text-gray-900 border border-gray-200 hover:border-violet-300'
                }`}
              >
                {w.word}
              </button>
            )
          })}
        </div>

        {/* Definitions column */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Definitions</p>
          {shuffledDefs.map((d, i) => {
            const isMatched = matched.has(d.index)
            const isWrong = wrong?.def === i

            return (
              <button
                key={i}
                onClick={() => handleDefClick(i, d.index)}
                disabled={isMatched || selectedWord === null}
                className={`w-full text-left p-3 rounded-xl text-sm transition-all ${
                  isMatched
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : isWrong
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : selectedWord !== null && !isMatched
                    ? 'bg-white text-gray-700 border border-gray-200 hover:border-violet-300 cursor-pointer'
                    : 'bg-gray-50 text-gray-500 border border-gray-100'
                }`}
              >
                {d.definition}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
