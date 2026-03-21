'use client'

import type { LearningLevel } from '@/lib/speaking/types'

const levels = [
  { level: 1 as LearningLevel, label: 'Study', color: 'amber' },
  { level: 2 as LearningLevel, label: 'Practice', color: 'sky' },
  { level: 3 as LearningLevel, label: 'Mock Test', color: 'emerald' },
]

const colorClasses = {
  amber: {
    active: 'bg-amber-500 text-white',
    completed: 'bg-amber-500 text-white',
    inactive: 'bg-gray-200 text-gray-400',
    line: 'bg-amber-500',
    lineInactive: 'bg-gray-200',
    label: 'text-amber-700',
    labelInactive: 'text-gray-400',
  },
  sky: {
    active: 'bg-sky-500 text-white',
    completed: 'bg-sky-500 text-white',
    inactive: 'bg-gray-200 text-gray-400',
    line: 'bg-sky-500',
    lineInactive: 'bg-gray-200',
    label: 'text-sky-700',
    labelInactive: 'text-gray-400',
  },
  emerald: {
    active: 'bg-emerald-500 text-white',
    completed: 'bg-emerald-500 text-white',
    inactive: 'bg-gray-200 text-gray-400',
    line: 'bg-emerald-500',
    lineInactive: 'bg-gray-200',
    label: 'text-emerald-700',
    labelInactive: 'text-gray-400',
  },
}

interface LevelIndicatorProps {
  currentLevel: LearningLevel
  completedLevels: LearningLevel[]
}

export default function LevelIndicator({ currentLevel, completedLevels }: LevelIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {levels.map((l, i) => {
        const isCompleted = completedLevels.includes(l.level)
        const isActive = currentLevel === l.level
        const colors = colorClasses[l.color as keyof typeof colorClasses]

        const circleClass = isActive
          ? colors.active
          : isCompleted
            ? colors.completed
            : colors.inactive

        const labelClass = isActive || isCompleted ? colors.label : colors.labelInactive

        return (
          <div key={l.level} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${circleClass}`}>
                {isCompleted && !isActive ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  l.level
                )}
              </div>
              <span className={`text-xs font-medium ${labelClass}`}>{l.label}</span>
            </div>
            {i < levels.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-2 mb-5 transition-colors ${
                  completedLevels.includes(l.level) ? colors.line : colors.lineInactive
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
