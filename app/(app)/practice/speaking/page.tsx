'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import TopicCard from '@/components/speaking/TopicCard'
import type { SpeakingPart, Topic, TopicProgress } from '@/lib/speaking/types'

const tabs: { part: SpeakingPart; label: string; color: string; activeColor: string }[] = [
  { part: 1, label: 'Part 1', color: 'text-gray-500', activeColor: 'text-sky-600 border-sky-500' },
  { part: 2, label: 'Part 2', color: 'text-gray-500', activeColor: 'text-violet-600 border-violet-500' },
  { part: 3, label: 'Part 3', color: 'text-gray-500', activeColor: 'text-emerald-600 border-emerald-500' },
]

interface TopicWithProgress extends Topic {
  progress: TopicProgress
}

export default function SpeakingHubPage() {
  const [activePart, setActivePart] = useState<SpeakingPart>(1)
  const [topics, setTopics] = useState<TopicWithProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/speaking/topics?part=${activePart}`)
      .then(res => res.json())
      .then(data => {
        setTopics(data.topics || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [activePart])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Speaking Practice</h1>
        <p className="mt-1 text-gray-500">
          Choose a topic and build your answer step by step, or jump straight to a mock test.
        </p>
      </div>

      {/* Quick Practice button */}
      <Link
        href={`/practice/speaking/${activePart}`}
        className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
            🎯
          </div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">Quick Practice — Mock Test</p>
            <p className="text-sm text-gray-500">Skip to a full timed session with random questions</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.part}
            onClick={() => setActivePart(tab.part)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activePart === tab.part
                ? tab.activeColor
                : `${tab.color} border-transparent hover:text-gray-700`
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Topic grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No topics available for Part {activePart} yet.</p>
          <p className="text-sm mt-1">Use Quick Practice above for a mock test.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {topics.map(topic => (
            <TopicCard
              key={topic.id}
              topic={topic}
              progress={topic.progress}
              part={activePart}
            />
          ))}
        </div>
      )}

      {/* Browser requirement */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-amber-500 mt-0.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-medium text-amber-800">Browser requirement</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Speaking practice uses your microphone and speech recognition. For best results, use
              Google Chrome on a computer or Android device.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
