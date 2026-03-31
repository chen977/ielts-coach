'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface SkillBreakdownProps {
  speakingBreakdown: { criterion: string; average: number }[]
  listeningBreakdown: { section: number; average: number }[]
}

const CRITERION_LABELS: Record<string, string> = {
  FC: 'Fluency',
  LR: 'Lexical',
  GRA: 'Grammar',
  Pronunciation: 'Pronun.',
}

export default function SkillBreakdown({ speakingBreakdown, listeningBreakdown }: SkillBreakdownProps) {
  const [view, setView] = useState<'speaking' | 'listening'>('speaking')

  const safeSpBreakdown = speakingBreakdown ?? []
  const safeLiBreakdown = listeningBreakdown ?? []
  const hasSpeakingData = safeSpBreakdown.some(s => s.average > 0)
  const hasListeningData = safeLiBreakdown.some(s => s.average > 0)

  const speakingData = safeSpBreakdown.map(s => ({
    name: CRITERION_LABELS[s.criterion] || s.criterion,
    score: s.average,
  }))

  const listeningData = safeLiBreakdown.map(s => ({
    name: `Section ${s.section}`,
    score: s.average,
  }))

  const data = view === 'speaking' ? speakingData : listeningData
  const hasData = view === 'speaking' ? hasSpeakingData : hasListeningData
  const barColor = view === 'speaking' ? '#0ea5e9' : '#10b981'

  function getBarColor(score: number) {
    if (score >= 7) return '#10b981'
    if (score >= 6) return barColor
    return '#f59e0b'
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Skill Breakdown</h3>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setView('speaking')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${
              view === 'speaking' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Speaking
          </button>
          <button
            onClick={() => setView('listening')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${
              view === 'listening' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Listening
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="h-48 flex items-center justify-center text-sm text-gray-400">
          No {view} data yet
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                domain={[0, 9]}
                ticks={[0, 3, 5, 6, 7, 8, 9]}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [Number(value).toFixed(1), 'Band']}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={36}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={getBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
