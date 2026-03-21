'use client'

import { useState } from 'react'
import type { UpgradePhrase } from '@/lib/speaking/types'

const SENTENCE_STARTERS = [
  'Well, to be honest...',
  'Actually, I\'d say that...',
  'What I really enjoy is...',
  'I suppose the main reason is...',
  'To be frank...',
  'I\'d have to say...',
  'Generally speaking...',
  'As far as I\'m concerned...',
]

interface HintPanelProps {
  upgradePhrases: UpgradePhrase[]
  personalDetails: Record<string, string>
  speakingTips: string[]
}

export default function HintPanel({
  upgradePhrases,
  personalDetails,
  speakingTips,
}: HintPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <>
      {/* Toggle button (always visible) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-30 lg:hidden bg-amber-500 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center"
        aria-label={isExpanded ? 'Hide hints' : 'Show hints'}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </button>

      {/* Panel */}
      <div className={`
        fixed right-0 top-0 h-full w-72 bg-white border-l border-gray-100 shadow-lg z-20 overflow-y-auto
        transition-transform duration-300
        lg:relative lg:right-auto lg:top-auto lg:h-auto lg:shadow-none lg:border lg:rounded-2xl lg:translate-x-0
        ${isExpanded ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Header (mobile close) */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 lg:hidden">
          <h3 className="font-semibold text-gray-900">Hints</h3>
          <button onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Key Phrases */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key Phrases to Use</h4>
            <div className="space-y-1.5">
              {upgradePhrases.map((phrase, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded mt-0.5 ${
                    phrase.category === 'connector'
                      ? 'bg-blue-100 text-blue-600'
                      : phrase.category === 'grammar'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-green-100 text-green-600'
                  }`}>
                    {phrase.category.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-700">{phrase.phrase}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sentence Starters */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sentence Starters</h4>
            <div className="space-y-1">
              {SENTENCE_STARTERS.map((starter, i) => (
                <p key={i} className="text-sm text-sky-700 italic">{starter}</p>
              ))}
            </div>
          </div>

          {/* Your Details */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Details</h4>
            <ul className="space-y-1">
              {Object.entries(personalDetails).map(([key, value]) => (
                <li key={key} className="text-sm text-gray-600">
                  <span className="text-gray-400">•</span> {value}
                </li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          {speakingTips.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tips</h4>
              <ul className="space-y-1">
                {speakingTips.map((tip, i) => (
                  <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                    <svg className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
