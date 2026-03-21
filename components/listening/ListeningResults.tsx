'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ListeningResults as ListeningResultsType, GeneratedListeningContent, ListeningSection, LearningLevel } from '@/lib/listening/types'
import QuestionPanel from './QuestionPanel'
import TranscriptView from './TranscriptView'

interface ListeningResultsProps {
  results: ListeningResultsType
  content: GeneratedListeningContent
  section: ListeningSection
  level: LearningLevel
  userAnswers: Record<number, string>
  onNewSession: () => void
}

function getScoreColor(band: number) {
  if (band >= 7) return { ring: 'border-emerald-400', text: 'text-emerald-600', bg: 'bg-emerald-50' }
  if (band >= 6) return { ring: 'border-sky-400', text: 'text-sky-600', bg: 'bg-sky-50' }
  if (band >= 5) return { ring: 'border-amber-400', text: 'text-amber-600', bg: 'bg-amber-50' }
  return { ring: 'border-red-400', text: 'text-red-600', bg: 'bg-red-50' }
}

export default function ListeningResults({
  results,
  content,
  section,
  level,
  userAnswers,
  onNewSession,
}: ListeningResultsProps) {
  const [showTranscript, setShowTranscript] = useState(false)
  const [showVocab, setShowVocab] = useState(false)
  const color = getScoreColor(results.bandEstimate)

  return (
    <div className="space-y-6">
      {/* Score */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-500 mb-3">Your Estimated Band Score</p>
        <div className={`w-24 h-24 rounded-full border-4 ${color.ring} ${color.bg} flex items-center justify-center mx-auto mb-3`}>
          <span className={`text-3xl font-bold ${color.text}`}>{results.bandEstimate}</span>
        </div>
        <p className="text-sm text-gray-700 font-medium">{results.score}/10 correct</p>
        <p className="text-xs text-gray-400 mt-1">
          Section {section} — Level {level === 1 ? 'Study' : level === 2 ? 'Practice' : 'Test'}
        </p>
      </div>

      {/* Question Results */}
      <QuestionPanel
        questionGroups={content.questionGroups}
        userAnswers={userAnswers}
        onAnswerChange={() => {}}
        disabled
        showResults
        results={results.perQuestion}
      />

      {/* Transcript Toggle */}
      <div>
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full flex items-center justify-between px-5 py-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition"
        >
          <span className="text-sm font-medium text-gray-700">Full Transcript</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${showTranscript ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showTranscript && (
          <div className="mt-2">
            <TranscriptView script={content.script} />
          </div>
        )}
      </div>

      {/* Vocabulary Toggle */}
      {results.vocabulary.length > 0 && (
        <div>
          <button
            onClick={() => setShowVocab(!showVocab)}
            className="w-full flex items-center justify-between px-5 py-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition"
          >
            <span className="text-sm font-medium text-gray-700">
              Key Vocabulary ({results.vocabulary.length})
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${showVocab ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showVocab && (
            <div className="mt-2 bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50">
              {results.vocabulary.map((v, i) => (
                <div key={i} className="px-5 py-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-gray-900">{v.word}</span>
                    <span className="text-xs text-gray-400">—</span>
                    <span className="text-sm text-gray-600">{v.definition}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 italic">&ldquo;{v.example}&rdquo;</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onNewSession}
          className="flex-1 py-3 px-5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition"
        >
          Try Another Session
        </button>
        <Link
          href="/practice/listening"
          className="flex-1 py-3 px-5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-xl transition text-center"
        >
          Back to Listening Hub
        </Link>
      </div>
    </div>
  )
}
