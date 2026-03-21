'use client'

import { useState } from 'react'
import type { CueCard as CueCardType } from '@/lib/speaking/types'
import PrepTimer from './PrepTimer'
import AudioRecorder from './AudioRecorder'

interface CueCardProps {
  cueCard: CueCardType
  onComplete: (transcript: string) => void
}

export default function CueCard({ cueCard, onComplete }: CueCardProps) {
  const [phase, setPhase] = useState<'prep' | 'speaking'>('prep')
  const [notes, setNotes] = useState('')

  return (
    <div className="space-y-6">
      {/* Cue Card */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-violet-100 text-violet-700 text-xs font-medium px-2.5 py-1 rounded-full">
            Part 2 — Long Turn
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{cueCard.topic}</h3>
        <p className="text-sm text-gray-600 mb-3">You should say:</p>
        <ul className="space-y-2 mb-4">
          {cueCard.bulletPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-violet-400 mt-0.5">•</span>
              {point}
            </li>
          ))}
        </ul>
        {cueCard.followUp && (
          <p className="text-sm text-gray-600 italic border-t border-violet-100 pt-3 mt-3">
            {cueCard.followUp}
          </p>
        )}
      </div>

      {phase === 'prep' ? (
        <div className="space-y-6">
          {/* Prep Timer */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center">
            <PrepTimer seconds={60} onComplete={() => setPhase('speaking')} />
          </div>

          {/* Notepad */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p className="text-sm font-medium text-gray-700">Notes</p>
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Jot down key points to cover in your response..."
              rows={4}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
            />
          </div>

          {/* Skip prep button */}
          <button
            onClick={() => setPhase('speaking')}
            className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip preparation →
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <p className="text-sm font-medium text-gray-700 mb-1 text-center">Now speak for 1-2 minutes</p>
          <p className="text-xs text-gray-400 mb-4 text-center">Cover all the points on the cue card</p>
          <AudioRecorder maxDuration={120} onComplete={onComplete} autoStart />
        </div>
      )}
    </div>
  )
}
