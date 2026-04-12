'use client'

import type { GrammarCorrection } from '@/lib/writing/types'

interface GrammarCorrectionsProps {
  corrections: GrammarCorrection[]
}

export default function GrammarCorrections({ corrections }: GrammarCorrectionsProps) {
  if (!corrections.length) return null

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <h4 className="text-sm font-semibold text-gray-900">Grammar Corrections</h4>
      </div>
      <div className="divide-y divide-gray-50">
        {corrections.map((c, i) => (
          <div key={i} className="px-5 py-3">
            <div className="flex items-start gap-3 mb-1.5">
              <div className="flex-1">
                <span className="text-sm text-red-600 line-through">{c.original}</span>
                <span className="text-gray-400 mx-2">&rarr;</span>
                <span className="text-sm text-emerald-700 font-medium">{c.corrected}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">{c.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
