'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ListeningSection, LearningLevel } from '@/lib/listening/types'
import LevelSelector from '@/components/listening/LevelSelector'
import ListeningSession from './ListeningSession'

export default function ListeningSessionPage() {
  const params = useParams()
  const sectionNum = parseInt(params.section as string) as ListeningSection
  const [level, setLevel] = useState<LearningLevel>(2)
  const [sessionKey, setSessionKey] = useState(0)

  if (![1, 2, 3, 4].includes(sectionNum)) notFound()

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/practice/listening"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-700 font-medium">Listening Section {sectionNum}</span>
      </div>

      {/* Level Selector */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-sm font-medium text-gray-700 mb-3">Choose your level</p>
        <LevelSelector
          selectedLevel={level}
          onSelectLevel={(l) => {
            setLevel(l)
            setSessionKey(k => k + 1)
          }}
        />
      </div>

      {/* Session */}
      <ListeningSession key={sessionKey} section={sectionNum} level={level} />
    </div>
  )
}
