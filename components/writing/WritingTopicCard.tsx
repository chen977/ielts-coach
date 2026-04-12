'use client'

import Link from 'next/link'
import type { WritingTopicProgress } from '@/lib/writing/types'

interface WritingTopicCardProps {
  id: string
  name: string
  icon: string
  category: string
  essayType?: string
  href: string
  progress: WritingTopicProgress | null
}

export default function WritingTopicCard({
  name,
  icon,
  category,
  essayType,
  href,
  progress,
}: WritingTopicCardProps) {
  const level1Complete = progress?.level1Complete ?? false
  const level2Complete = progress?.level2Complete ?? false
  const bestBand = progress?.bestBand ?? null

  const buttonText = !level1Complete ? 'Start' : level2Complete ? 'Review' : 'Continue'
  const buttonColor = !level1Complete
    ? 'text-amber-600'
    : level2Complete
      ? 'text-emerald-600'
      : 'text-sky-600'

  return (
    <Link
      href={href}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400">{category}</span>
              {essayType && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {essayType}
                </span>
              )}
            </div>
          </div>
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
  const colors: Record<number, string> = {
    1: complete ? 'bg-amber-500' : 'bg-gray-300',
    2: complete ? 'bg-sky-500' : 'bg-gray-300',
    3: complete ? 'bg-emerald-500' : 'bg-gray-300',
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={`w-2.5 h-2.5 rounded-full ${colors[level]}`} />
      <span className="text-[10px] text-gray-400">{label}</span>
    </div>
  )
}
