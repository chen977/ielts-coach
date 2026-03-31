'use client'

import type { EvaluationResult, SpeakingPart } from '@/lib/speaking/types'
import BandScoreCard from './BandScoreCard'
import Link from 'next/link'

interface ResultsViewProps {
  evaluation: EvaluationResult
  part: SpeakingPart
  onNewSession: () => void
}

function getOverallColor(band: number) {
  if (band >= 7) return { ring: 'border-emerald-400', text: 'text-emerald-600', bg: 'bg-emerald-50' }
  if (band >= 6) return { ring: 'border-sky-400', text: 'text-sky-600', bg: 'bg-sky-50' }
  if (band >= 5) return { ring: 'border-amber-400', text: 'text-amber-600', bg: 'bg-amber-50' }
  return { ring: 'border-red-400', text: 'text-red-600', bg: 'bg-red-50' }
}

export default function ResultsView({ evaluation, part, onNewSession }: ResultsViewProps) {
  const color = getOverallColor(evaluation.overallBand)

  return (
    <div className="space-y-6">
      {/* Overall Band */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-500 mb-3">Your Overall Band Score</p>
        <div className={`w-24 h-24 rounded-full border-4 ${color.ring} ${color.bg} flex items-center justify-center mx-auto mb-3`}>
          <span className={`text-3xl font-bold ${color.text}`}>{evaluation.overallBand}</span>
        </div>
        <p className="text-sm text-gray-500">Speaking Part {part}</p>
      </div>

      {/* Criteria Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {evaluation.criteria.map(c => (
          <BandScoreCard key={c.criterion} {...c} />
        ))}
      </div>

      {/* Per-Question Breakdown */}
      {evaluation.perQuestion.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <p className="font-medium text-gray-900 text-sm">Question-by-Question Breakdown</p>
          </div>
          <div className="divide-y divide-gray-50">
            {evaluation.perQuestion.map((q, i) => (
              <div key={i} className="px-5 py-4 space-y-3">
                <p className="text-sm text-gray-700 font-medium">
                  <span className="text-gray-400">Q{i + 1}:</span> {q.question}
                </p>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Your Response</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{q.transcript}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-500 mb-1">Model Answer (Band 7-8)</p>
                  <p className="text-sm text-gray-600 bg-emerald-50 rounded-lg p-3">{q.modelAnswer}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-sky-500 mb-1">Feedback</p>
                  <p className="text-sm text-gray-600">{q.feedback}</p>
                </div>
              </div>
            ))}
          </div>
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
          href="/practice/speaking"
          className="flex-1 py-3 px-5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-xl transition text-center"
        >
          Back to Speaking Hub
        </Link>
      </div>
    </div>
  )
}
