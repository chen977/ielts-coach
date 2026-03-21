'use client'

import { useState, useEffect, useCallback } from 'react'
import type { VocabularyWord } from '@/lib/supabase/types'
import WordCard from './WordCard'
import FlashcardReview from './FlashcardReview'
import FillInBlank from './FillInBlank'
import MatchGame from './MatchGame'

type Tab = 'review' | 'all' | 'topic'
type PracticeMode = 'flashcard' | 'fill-blank' | 'match' | null

export default function VocabularyClient({
  initialDueCount,
  initialTotalCount,
  initialMasteredCount,
}: {
  initialDueCount: number
  initialTotalCount: number
  initialMasteredCount: number
}) {
  const [tab, setTab] = useState<Tab>('review')
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(null)
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [dueWords, setDueWords] = useState<VocabularyWord[]>([])
  const [loading, setLoading] = useState(false)
  const [dueCount, setDueCount] = useState(initialDueCount)
  const [topics, setTopics] = useState<string[]>([])
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)

  const fetchWords = useCallback(async (filter?: string, topic?: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter) params.set('filter', filter)
    if (topic) params.set('topic', topic)
    const res = await fetch(`/api/vocabulary?${params}`)
    const data = await res.json()
    setLoading(false)
    return (data.words || []) as VocabularyWord[]
  }, [])

  useEffect(() => {
    fetchWords('due').then(setDueWords)
    fetchWords().then(w => {
      setWords(w)
      const uniqueTopics = [...new Set(w.map((word: VocabularyWord) => word.ielts_topic).filter(Boolean))] as string[]
      setTopics(uniqueTopics)
    })
  }, [fetchWords])

  function handlePracticeComplete() {
    setPracticeMode(null)
    // Refresh data
    fetchWords('due').then(w => {
      setDueWords(w)
      setDueCount(w.length)
    })
    fetchWords().then(setWords)
  }

  // If in a practice mode, show that
  if (practiceMode === 'flashcard' && dueWords.length > 0) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setPracticeMode(null)}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to vocabulary
        </button>
        <FlashcardReview words={dueWords} onComplete={handlePracticeComplete} />
      </div>
    )
  }

  if (practiceMode === 'fill-blank') {
    const practiceWords = dueWords.length > 0 ? dueWords : words
    return (
      <div className="space-y-4">
        <button
          onClick={() => setPracticeMode(null)}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to vocabulary
        </button>
        <FillInBlank words={practiceWords} onComplete={handlePracticeComplete} />
      </div>
    )
  }

  if (practiceMode === 'match') {
    const practiceWords = dueWords.length > 0 ? dueWords : words
    return (
      <div className="space-y-4">
        <button
          onClick={() => setPracticeMode(null)}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to vocabulary
        </button>
        <MatchGame words={practiceWords} onComplete={handlePracticeComplete} />
      </div>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'review', label: `Review Due (${dueCount})` },
    { id: 'all', label: 'All Words' },
    { id: 'topic', label: 'By Topic' },
  ]

  const wordsByTopic = topics.reduce((acc, t) => {
    acc[t] = words.filter(w => w.ielts_topic === t)
    return acc
  }, {} as Record<string, VocabularyWord[]>)

  // Group all words alphabetically
  const sortedWords = [...words].sort((a, b) => a.word.localeCompare(b.word))

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition ${
              tab === t.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Practice modes */}
      {tab === 'review' && (
        <div className="space-y-4">
          {dueCount > 0 ? (
            <>
              <p className="text-sm text-gray-500">
                You have <strong className="text-amber-600">{dueCount}</strong> words due for review.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setPracticeMode('flashcard')}
                  className="bg-white rounded-xl border border-gray-100 p-4 text-left hover:shadow-md hover:border-violet-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition">Flashcards</h3>
                  <p className="text-xs text-gray-500 mt-1">Flip to reveal definition</p>
                </button>
                <button
                  onClick={() => setPracticeMode('fill-blank')}
                  className="bg-white rounded-xl border border-gray-100 p-4 text-left hover:shadow-md hover:border-violet-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-sky-600 transition">Fill in the Blank</h3>
                  <p className="text-xs text-gray-500 mt-1">Complete the sentence</p>
                </button>
                <button
                  onClick={() => setPracticeMode('match')}
                  className="bg-white rounded-xl border border-gray-100 p-4 text-left hover:shadow-md hover:border-violet-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition">Match Game</h3>
                  <p className="text-xs text-gray-500 mt-1">Match words to definitions</p>
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">All caught up!</h3>
              <p className="text-sm text-gray-500">No words due for review right now. Check back later.</p>
              {initialTotalCount > 0 && (
                <div className="mt-4 flex gap-3 justify-center">
                  <button
                    onClick={() => setPracticeMode('fill-blank')}
                    className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                  >
                    Practice fill-in-blank
                  </button>
                  <button
                    onClick={() => setPracticeMode('match')}
                    className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                  >
                    Play match game
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'all' && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : sortedWords.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No words yet</div>
          ) : (
            sortedWords.map(w => <WordCard key={w.id} word={w} />)
          )}
        </div>
      )}

      {tab === 'topic' && (
        <div className="space-y-3">
          {topics.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No topics yet</div>
          ) : (
            topics.sort().map(topic => (
              <div key={topic} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpandedTopic(expandedTopic === topic ? null : topic)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-gray-900 capitalize">{topic}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{wordsByTopic[topic]?.length ?? 0} words</span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${expandedTopic === topic ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {expandedTopic === topic && (
                  <div className="border-t border-gray-100 p-3 space-y-2">
                    {wordsByTopic[topic]?.map(w => (
                      <WordCard key={w.id} word={w} compact />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
