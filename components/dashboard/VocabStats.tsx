'use client'

import Link from 'next/link'
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts'

interface VocabStatsProps {
  total: number
  due: number
  mastered: number
  byBox: number[]
}

const BOX_COLORS = ['#f59e0b', '#fb923c', '#0ea5e9', '#8b5cf6', '#10b981']

export default function VocabStats({ total = 0, due = 0, mastered = 0, byBox = [] }: VocabStatsProps) {
  const masteryPct = total > 0 ? Math.round((mastered / total) * 100) : 0

  const boxData = (byBox ?? []).map((count, i) => ({
    name: `Box ${i + 1}`,
    count,
    color: BOX_COLORS[i],
  }))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Vocabulary</h3>
        <Link href="/vocabulary" className="text-xs text-violet-600 hover:text-violet-700 font-medium">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-400">Learned</p>
        </div>
        <div>
          <p className={`text-xl font-bold ${due > 0 ? 'text-amber-500' : 'text-gray-900'}`}>{due}</p>
          <p className="text-xs text-gray-400">Due</p>
        </div>
        <div>
          <p className="text-xl font-bold text-emerald-600">{masteryPct}%</p>
          <p className="text-xs text-gray-400">Mastered</p>
        </div>
      </div>

      {total > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2">SRS Box Distribution</p>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={boxData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
                  {boxData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-1">
            {[1, 2, 3, 4, 5].map(box => (
              <span key={box} className="text-[10px] text-gray-400">Box {box}</span>
            ))}
          </div>
        </div>
      )}

      {due > 0 && (
        <Link
          href="/vocabulary"
          className="mt-4 block text-center py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 text-sm font-semibold rounded-xl transition"
        >
          Review {due} words
        </Link>
      )}
    </div>
  )
}
