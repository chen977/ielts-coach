'use client'

import Link from 'next/link'
import type { Topic, TopicProgress, SpeakingPart } from '@/lib/speaking/types'

interface TopicCardProps {
  topic: Topic
  progress: TopicProgress
  part: SpeakingPart
}

export default function TopicCard({ topic, progress, part }: TopicCardProps) {
  const { level1Complete, level2Complete, bestBand } = progress

  const buttonText = !level1Complete ? 'Start' : level2Complete ? 'Review' : 'Continue'
  const buttonColor = !level1Complete
    ? 'text-amber-600'
    : level2Complete
      ? 'text-emerald-600'
      : 'text-sky-600'

  return (
    <Link
      href={`/practice/speaking/${part}/${topic.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{topic.icon}</span>
          <h3 className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors">
            {topic.name}
          </h3>
        </div>
        {bestBand !== null && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
            Best: {bestBand.toFixed(1)}
          </span>
        )}
      </div>

      {/* Level progress dots */}
      <div className="flex items-center gap-2 mt-3">
        <LevelDot level={1} complete={level1Complete} label="Study" />
        <div className={`flex-1 h-px ${level1Complete ? 'bg-amber-300' : 'bg-gray-200'}`} />
        <LevelDot level={2} complete={level2Complete} label="Practice" />
        <div className={`flex-1 h-px ${level2Complete ? 'bg-sky-300' : 'bg-gray-200'}`} />
        <LevelDot level={3} complete={false} label="Test" />
      </div>

      <div className="mt-4 flex items-center text-sm font-medium gap-1">
        <span className={buttonColor}>{buttonText}</span>
        <svg className={`w-4 h-4 ${buttonColor} group-hover:translate-x-0.5 transition-transform`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

function LevelDot({ level, complete, label }: { level: number; complete: boolean; label: string }) {
  const colors = {
    1: complete ? 'bg-amber-500' : 'bg-gray-300',
    2: complete ? 'bg-sky-500' : 'bg-gray-300',
    3: complete ? 'bg-emerald-500' : 'bg-gray-300',
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={`w-2.5 h-2.5 rounded-full ${colors[level as 1 | 2 | 3]}`} />
      <span className="text-[10px] text-gray-400">{label}</span>
    </div>
  )
}
