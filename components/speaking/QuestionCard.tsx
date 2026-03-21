'use client'

import type { SpeakingPart } from '@/lib/speaking/types'

interface QuestionCardProps {
  question: string
  partNum: SpeakingPart
  index: number
  total: number
}

const partColors: Record<SpeakingPart, { bg: string; badge: string; accent: string }> = {
  1: { bg: 'bg-sky-50 border-sky-200', badge: 'bg-sky-100 text-sky-700', accent: 'text-sky-600' },
  2: { bg: 'bg-violet-50 border-violet-200', badge: 'bg-violet-100 text-violet-700', accent: 'text-violet-600' },
  3: { bg: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', accent: 'text-emerald-600' },
}

export default function QuestionCard({ question, partNum, index, total }: QuestionCardProps) {
  const colors = partColors[partNum]

  return (
    <div className={`rounded-2xl border p-6 ${colors.bg}`}>
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors.badge}`}>
          Question {index + 1} of {total}
        </span>
        <span className={`text-xs font-medium ${colors.accent}`}>
          Part {partNum}
        </span>
      </div>
      <p className="text-lg font-medium text-gray-900 leading-relaxed">{question}</p>
    </div>
  )
}
