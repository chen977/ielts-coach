'use client'

import { useState } from 'react'

type HistoryItem =
  | { type: 'speaking'; id: string; part: number; scores: Record<string, unknown> | null; created_at: string }
  | { type: 'listening'; id: string; section: number; score: number | null; band_estimate: number | null; created_at: string }

type Filter = 'all' | 'speaking' | 'listening'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

interface HistoryClientProps {
  items: HistoryItem[]
}

export default function HistoryClient({ items }: HistoryClientProps) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = filter === 'all'
    ? items
    : items.filter(item => item.type === filter)

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: items.length },
    { id: 'speaking', label: 'Speaking', count: items.filter(i => i.type === 'speaking').length },
    { id: 'listening', label: 'Listening', count: items.filter(i => i.type === 'listening').length },
  ]

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
              filter === f.id
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-3">
        {filtered.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.type === 'speaking' ? 'bg-sky-50' : 'bg-emerald-50'}`}>
                {item.type === 'speaking' ? (
                  <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {item.type === 'speaking'
                    ? `Speaking Part ${item.part}`
                    : `Listening Section ${item.section}`}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.created_at)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                {item.type === 'speaking' && item.scores && (
                  <span className="text-sm font-semibold text-sky-600">
                    Band {(item.scores as { overall?: number }).overall?.toFixed(1) ?? '—'}
                  </span>
                )}
                {item.type === 'listening' && (
                  <span className="text-sm font-semibold text-emerald-600">
                    {item.score ?? '—'}/10
                  </span>
                )}
              </div>
            </div>

            {/* Expanded details for speaking */}
            {item.type === 'speaking' && item.scores && (item.scores as { criteria?: { criterion: string; band: number }[] }).criteria && (
              <div className="mt-3 pt-3 border-t border-gray-50 flex gap-3 flex-wrap">
                {((item.scores as { criteria: { criterion: string; band: number }[] }).criteria).map(c => (
                  <div key={c.criterion} className="text-xs">
                    <span className="text-gray-400">{c.criterion}: </span>
                    <span className={`font-semibold ${c.band >= 7 ? 'text-emerald-600' : c.band >= 6 ? 'text-sky-600' : 'text-amber-600'}`}>
                      {c.band.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Band estimate for listening */}
            {item.type === 'listening' && item.band_estimate && (
              <div className="mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400">Band estimate: </span>
                <span className={`text-xs font-semibold ${item.band_estimate >= 7 ? 'text-emerald-600' : item.band_estimate >= 6 ? 'text-sky-600' : 'text-amber-600'}`}>
                  {item.band_estimate.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
