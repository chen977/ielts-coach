'use client'

import type { GuidedEvaluationResult, SpeakingPart } from '@/lib/speaking/types'

interface GuidedResultsViewProps {
  evaluation: GuidedEvaluationResult
  part: SpeakingPart
  onRetry: () => void
  onNextLevel: () => void
}

function getBandColor(band: number) {
  if (band >= 7) return { bg: 'bg-emerald-500', ring: 'ring-emerald-200', text: 'text-emerald-700' }
  if (band >= 6) return { bg: 'bg-sky-500', ring: 'ring-sky-200', text: 'text-sky-700' }
  if (band >= 5) return { bg: 'bg-amber-500', ring: 'ring-amber-200', text: 'text-amber-700' }
  return { bg: 'bg-red-500', ring: 'ring-red-200', text: 'text-red-700' }
}

export default function GuidedResultsView({ evaluation, onRetry, onNextLevel }: GuidedResultsViewProps) {
  const bandColor = getBandColor(evaluation.overallBand)
  const { criteria } = evaluation

  const criteriaList = [
    { key: 'FC', label: 'Fluency & Coherence', ...criteria.fluencyCoherence },
    { key: 'LR', label: 'Lexical Resource', ...criteria.lexicalResource },
    { key: 'GRA', label: 'Grammar Range', ...criteria.grammaticalRange },
    { key: 'Pron', label: 'Pronunciation', ...criteria.pronunciation },
  ]

  return (
    <div className="space-y-4">
      {/* Encouragement */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center">
        <p className="text-amber-800 font-medium">{evaluation.encouragement}</p>
      </div>

      {/* Band Score Circle */}
      <div className="flex justify-center py-4">
        <div className={`w-24 h-24 rounded-full ${bandColor.bg} ring-4 ${bandColor.ring} flex items-center justify-center`}>
          <span className="text-3xl font-bold text-white">{evaluation.overallBand}</span>
        </div>
      </div>

      {/* What you did well */}
      {evaluation.positives.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h4 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            What you did well
          </h4>
          <ul className="space-y-2">
            {evaluation.positives.map((pos, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {pos}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {evaluation.improvements.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h4 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Try adding next time
          </h4>
          <ul className="space-y-2">
            {evaluation.improvements.map((imp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                {imp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Phrases */}
      <div className="grid grid-cols-2 gap-3">
        {evaluation.phrasesUsed.length > 0 && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
            <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Phrases You Used</h4>
            <ul className="space-y-1">
              {evaluation.phrasesUsed.map((p, i) => (
                <li key={i} className="text-sm text-green-800 flex items-center gap-1.5">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  &ldquo;{p}&rdquo;
                </li>
              ))}
            </ul>
          </div>
        )}
        {evaluation.phrasesCanAdd.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Phrases to Try</h4>
            <ul className="space-y-1">
              {evaluation.phrasesCanAdd.map((p, i) => (
                <li key={i} className="text-sm text-amber-800 flex items-center gap-1.5">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  &ldquo;{p}&rdquo;
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Criteria Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h4 className="font-semibold text-gray-900 mb-3">Score Breakdown</h4>
        <div className="grid grid-cols-2 gap-3">
          {criteriaList.map(c => {
            const color = getBandColor(c.band)
            return (
              <div key={c.key} className="rounded-xl border border-gray-100 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500">{c.label}</span>
                  <span className={`text-sm font-bold ${color.text}`}>{c.band}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{c.feedback}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={onNextLevel}
          className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
        >
          Ready for Mock Test
        </button>
      </div>
    </div>
  )
}
