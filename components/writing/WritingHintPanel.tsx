'use client'

import { useState } from 'react'
import type { ModelEssayData } from '@/lib/writing/types'
import { ESSAY_TYPES } from '@/lib/writing/topics'
import type { EssayType } from '@/lib/writing/types'

const LINKING_PHRASES = {
  introducing: ['Firstly,', 'To begin with,', 'One key reason is that', 'It is widely believed that'],
  adding: ['Furthermore,', 'In addition,', 'Moreover,', 'Another important point is that'],
  contrasting: ['However,', 'On the other hand,', 'Nevertheless,', 'In contrast,', 'Despite this,'],
  giving_examples: ['For instance,', 'For example,', 'A case in point is', 'This is evident in'],
  concluding: ['In conclusion,', 'To sum up,', 'Overall,', 'All things considered,'],
}

interface WritingHintPanelProps {
  essayData: ModelEssayData
  essayType: EssayType
  personalIdeas: Record<string, string>
  wordCount: number
  minWords: number
}

export default function WritingHintPanel({
  essayData,
  essayType,
  personalIdeas,
  wordCount,
  minWords,
}: WritingHintPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const essayTypeConfig = ESSAY_TYPES[essayType]
  const progress = Math.min(100, Math.round((wordCount / minWords) * 100))

  return (
    <>
      {/* Toggle button (mobile) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-30 lg:hidden bg-amber-500 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center"
        aria-label={isExpanded ? 'Hide hints' : 'Show hints'}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </button>

      <div className={`
        fixed right-0 top-0 h-full w-72 bg-white border-l border-gray-100 shadow-lg z-20 overflow-y-auto
        transition-transform duration-300
        lg:relative lg:right-auto lg:top-auto lg:h-auto lg:shadow-none lg:border lg:rounded-2xl lg:translate-x-0
        ${isExpanded ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 lg:hidden">
          <h3 className="font-semibold text-gray-900">Writing Hints</h3>
          <button onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Word count progress */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Word Count</span>
              <span className={`text-xs font-medium ${wordCount >= minWords ? 'text-emerald-600' : 'text-amber-600'}`}>
                {wordCount}/{minWords}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${wordCount >= minWords ? 'bg-emerald-400' : 'bg-amber-400'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Essay Type */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Essay Type</h4>
            <p className="text-sm text-gray-700 font-medium">{essayTypeConfig.name}</p>
          </div>

          {/* Structure Template */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Structure</h4>
            <p className="text-xs text-gray-600 leading-relaxed">{essayTypeConfig.template}</p>
          </div>

          {/* Key Phrases */}
          {essayData.upgradePhrases.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key Phrases</h4>
              <div className="space-y-1.5">
                {essayData.upgradePhrases.slice(0, 6).map((phrase, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded mt-0.5 ${
                      phrase.category === 'linking'
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
          )}

          {/* Linking Phrases by Function */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Linking Phrases</h4>
            {Object.entries(LINKING_PHRASES).map(([category, phrases]) => (
              <div key={category} className="mb-2">
                <p className="text-[10px] font-medium text-gray-400 uppercase mb-1">
                  {category.replace('_', ' ')}
                </p>
                {phrases.map((p, i) => (
                  <p key={i} className="text-xs text-sky-700 italic ml-2">{p}</p>
                ))}
              </div>
            ))}
          </div>

          {/* Your Ideas */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Ideas</h4>
            <ul className="space-y-1">
              {Object.entries(personalIdeas).map(([key, value]) => (
                <li key={key} className="text-sm text-gray-600">
                  <span className="text-gray-400">&#8226;</span> {value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
