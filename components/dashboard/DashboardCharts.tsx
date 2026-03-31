'use client'

import { useState, useEffect } from 'react'
import BandTrendChart from './BandTrendChart'
import SkillBreakdown from './SkillBreakdown'
import StreakTracker from './StreakTracker'
import VocabStats from './VocabStats'

interface DashboardChartsProps {
  targetBand: number
  streakDays: number
}

interface StatsData {
  bandTrend: { date: string; speaking?: number; listening?: number }[]
  speakingBreakdown: { criterion: string; average: number }[]
  listeningBreakdown: { section: number; average: number }[]
  vocabStats: { total: number; due: number; mastered: number; byBox: number[] }
  practiceDays: string[]
}

export default function DashboardCharts({ targetBand, streakDays }: DashboardChartsProps) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => {
        if (!res.ok) throw new Error('API error')
        return res.json()
      })
      .then(data => {
        // Validate the response has the expected shape
        if (data && Array.isArray(data.bandTrend)) {
          setStats(data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 h-64 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
            <div className="h-40 bg-gray-50 rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <BandTrendChart data={stats.bandTrend} targetBand={targetBand} />
      <SkillBreakdown
        speakingBreakdown={stats.speakingBreakdown}
        listeningBreakdown={stats.listeningBreakdown}
      />
      <StreakTracker streakDays={streakDays} practiceDays={stats.practiceDays} />
      <VocabStats {...stats.vocabStats} />
    </div>
  )
}
