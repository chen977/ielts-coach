'use client'

import type { VocabUpgrade } from '@/lib/writing/types'

interface VocabUpgradesProps {
  upgrades: VocabUpgrade[]
}

export default function VocabUpgrades({ upgrades }: VocabUpgradesProps) {
  if (!upgrades.length) return null

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <h4 className="text-sm font-semibold text-gray-900">Vocabulary Upgrades</h4>
      </div>
      <div className="divide-y divide-gray-50">
        {upgrades.map((u, i) => (
          <div key={i} className="px-5 py-3">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm text-gray-600">{u.original}</span>
              <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-sm text-sky-700 font-medium">{u.upgrade}</span>
            </div>
            <p className="text-xs text-gray-500">{u.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
