'use client'

import { useState } from 'react'
import type { WritingEvaluationResult } from '@/lib/writing/types'
import GrammarCorrections from './GrammarCorrections'
import VocabUpgrades from './VocabUpgrades'
import EssayComparison from './EssayComparison'
import Link from 'next/link'

interface WritingResultsProps {
  evaluation: WritingEvaluationResult
  userEssay: string
  modelEssay?: string
  task: 1 | 2
  onRetry: () => void
}

const CRITERIA_LABELS: Record<string, string> = {
  TA: 'Task Achievement',
  CC: 'Coherence & Cohesion',
  LR: 'Lexical Resource',
  GRA: 'Grammatical Range',
}

function getColor(band: number) {
  if (band >= 7) return { ring: 'border-emerald-400', text: 'text-emerald-600', bg: 'bg-emerald-50' }
  if (band >= 6) return { ring: 'border-sky-400', text: 'text-sky-600', bg: 'bg-sky-50' }
  if (band >= 5) return { ring: 'border-amber-400', text: 'text-amber-600', bg: 'bg-amber-50' }
  return { ring: 'border-red-400', text: 'text-red-600', bg: 'bg-red-50' }
}

export default function WritingResults({
  evaluation,
  userEssay,
  modelEssay,
  task,
  onRetry,
}: WritingResultsProps) {
  const [showParagraphs, setShowParagraphs] = useState(false)
  const color = getColor(evaluation.overallBand)

  return (
    <div className="space-y-6">
      {/* Overall Band */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-500 mb-3">Your Overall Band Score</p>
        <div className={`w-24 h-24 rounded-full border-4 ${color.ring} ${color.bg} flex items-center justify-center mx-auto mb-3`}>
          <span className={`text-3xl font-bold ${color.text}`}>{evaluation.overallBand}</span>
        </div>
        <p className="text-sm text-gray-500">Writing Task {task}</p>
      </div>

      {/* Criteria Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {evaluation.criteria.map(c => {
          const criterionColor = getColor(c.band)
          return (
            <div key={c.criterion} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  {CRITERIA_LABELS[c.criterion] || c.criterion}
                </h4>
                <div className={`w-10 h-10 rounded-full border-2 ${criterionColor.ring} ${criterionColor.bg} flex items-center justify-center`}>
                  <span className={`text-sm font-bold ${criterionColor.text}`}>{c.band}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{c.feedback}</p>
            </div>
          )
        })}
      </div>

      {/* Positives & Improvements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {evaluation.positives.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-emerald-800 mb-2">What you did well</h4>
            <ul className="space-y-1.5">
              {evaluation.positives.map((p, i) => (
                <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">&#10003;</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
        {evaluation.improvements.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-amber-800 mb-2">Areas to improve</h4>
            <ul className="space-y-1.5">
              {evaluation.improvements.map((imp, i) => (
                <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">&#9679;</span>
                  {imp}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Paragraph Feedback (collapsible) */}
      {evaluation.paragraphFeedback.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowParagraphs(!showParagraphs)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <h4 className="text-sm font-semibold text-gray-900">Paragraph-by-Paragraph Feedback</h4>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${showParagraphs ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showParagraphs && (
            <div className="divide-y divide-gray-50">
              {evaluation.paragraphFeedback.map((pf, i) => (
                <div key={i} className="px-5 py-4">
                  <p className="text-xs font-medium text-gray-400 mb-2">Paragraph {pf.paragraphNumber}</p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-emerald-600">Strengths: </span>
                      <span className="text-sm text-gray-600">{pf.positives}</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-amber-600">To improve: </span>
                      <span className="text-sm text-gray-600">{pf.improvements}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grammar Corrections */}
      <GrammarCorrections corrections={evaluation.grammarCorrections} />

      {/* Vocabulary Upgrades */}
      <VocabUpgrades upgrades={evaluation.vocabUpgrades} />

      {/* Essay Comparison */}
      {modelEssay && (
        <EssayComparison userEssay={userEssay} modelEssay={modelEssay} />
      )}

      {/* Encouragement */}
      {evaluation.encouragement && (
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 text-center">
          <p className="text-sm text-sky-800">{evaluation.encouragement}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-3 px-6 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/practice/writing"
          className="flex-1 py-3 px-6 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-xl transition-colors text-center"
        >
          Back to Hub
        </Link>
      </div>
    </div>
  )
}
