'use client'

import type { CriterionScore } from '@/lib/speaking/types'

const criterionLabels: Record<string, string> = {
  FC: 'Fluency & Coherence',
  LR: 'Lexical Resource',
  GRA: 'Grammar Range & Accuracy',
  Pronunciation: 'Pronunciation',
}

function getBandColor(band: number) {
  if (band >= 7) return { ring: 'border-emerald-400 bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100' }
  if (band >= 6) return { ring: 'border-sky-400 bg-sky-50', text: 'text-sky-700', badge: 'bg-sky-100' }
  if (band >= 5) return { ring: 'border-amber-400 bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100' }
  return { ring: 'border-red-400 bg-red-50', text: 'text-red-700', badge: 'bg-red-100' }
}

export default function BandScoreCard({ criterion, band, feedback, tips }: CriterionScore) {
  const color = getBandColor(band)
  const label = criterionLabels[criterion] || criterion

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{criterion}</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center ${color.ring}`}>
          <span className={`text-lg font-bold ${color.text}`}>{band}</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-3">{feedback}</p>
      {tips.length > 0 && (
        <div className={`rounded-lg p-3 ${color.badge}`}>
          <p className={`text-xs font-medium ${color.text} mb-1.5`}>Tips</p>
          <ul className="space-y-1">
            {tips.map((tip, i) => (
              <li key={i} className={`text-xs ${color.text} flex items-start gap-1.5`}>
                <span className="mt-0.5">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
