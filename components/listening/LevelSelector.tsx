'use client'

import type { LearningLevel } from '@/lib/listening/types'

interface LevelSelectorProps {
  selectedLevel: LearningLevel
  onSelectLevel: (level: LearningLevel) => void
}

const levels: { level: LearningLevel; label: string; description: string; color: string; selectedColor: string }[] = [
  {
    level: 1,
    label: 'Study',
    description: 'Transcript visible, free replay',
    color: 'border-gray-200 hover:border-amber-300',
    selectedColor: 'border-amber-400 bg-amber-50 ring-1 ring-amber-200',
  },
  {
    level: 2,
    label: 'Practice',
    description: 'Audio plays once, no transcript',
    color: 'border-gray-200 hover:border-sky-300',
    selectedColor: 'border-sky-400 bg-sky-50 ring-1 ring-sky-200',
  },
  {
    level: 3,
    label: 'Test',
    description: '30s reading time, single play',
    color: 'border-gray-200 hover:border-emerald-300',
    selectedColor: 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200',
  },
]

const labelColors: Record<LearningLevel, string> = {
  1: 'text-amber-600',
  2: 'text-sky-600',
  3: 'text-emerald-600',
}

export default function LevelSelector({ selectedLevel, onSelectLevel }: LevelSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {levels.map(l => {
        const isSelected = selectedLevel === l.level
        return (
          <button
            key={l.level}
            onClick={() => onSelectLevel(l.level)}
            className={`rounded-xl border-2 p-3 text-left transition-all ${isSelected ? l.selectedColor : l.color}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold ${isSelected ? labelColors[l.level] : 'text-gray-400'}`}>
                L{l.level}
              </span>
              <span className={`text-sm font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                {l.label}
              </span>
            </div>
            <p className="text-xs text-gray-500">{l.description}</p>
          </button>
        )
      })}
    </div>
  )
}
