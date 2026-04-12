'use client'

import { useState } from 'react'
import type { ModelEssayData, UpgradePhrase, GrammarPattern } from '@/lib/writing/types'

interface ModelEssayViewProps {
  data: ModelEssayData
  onStartWriting: () => void
  onEditIdeas: () => void
}

const PARAGRAPH_COLORS: Record<string, { bg: string; border: string; label: string; labelBg: string }> = {
  introduction: { bg: 'bg-sky-50', border: 'border-sky-200', label: 'Introduction', labelBg: 'bg-sky-100 text-sky-700' },
  body: { bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Body', labelBg: 'bg-emerald-100 text-emerald-700' },
  conclusion: { bg: 'bg-violet-50', border: 'border-violet-200', label: 'Conclusion', labelBg: 'bg-violet-100 text-violet-700' },
}

// Alternate body paragraph colors
const BODY_COLORS = [
  { bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Body 1', labelBg: 'bg-emerald-100 text-emerald-700' },
  { bg: 'bg-amber-50', border: 'border-amber-200', label: 'Body 2', labelBg: 'bg-amber-100 text-amber-700' },
  { bg: 'bg-orange-50', border: 'border-orange-200', label: 'Body 3', labelBg: 'bg-orange-100 text-orange-700' },
]

function highlightPhrases(text: string, phrases: UpgradePhrase[]) {
  if (!phrases.length) return text

  let result = text
  const sorted = [...phrases].sort((a, b) => b.phrase.length - a.phrase.length)

  for (const phrase of sorted) {
    const escaped = phrase.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped})`, 'gi')
    result = result.replace(regex, `<mark class="bg-yellow-100 text-yellow-900 rounded px-0.5" title="${phrase.definition}">$1</mark>`)
  }

  return result
}

export default function ModelEssayView({ data, onStartWriting, onEditIdeas }: ModelEssayViewProps) {
  const [showStructure, setShowStructure] = useState(false)
  const [showGrammar, setShowGrammar] = useState(false)
  const [showTips, setShowTips] = useState(false)

  const wordCount = data.modelEssay.trim().split(/\s+/).filter(Boolean).length
  let bodyIndex = 0

  return (
    <div className="space-y-4">
      {/* Essay with color-coded paragraphs */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Your Personalized Model Essay</h3>
            <p className="text-xs text-gray-400 mt-0.5">{wordCount} words</p>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-sky-100 text-sky-700">
            Band 7
          </span>
        </div>

        <div className="p-5 space-y-3">
          {data.paragraphs.map((para, i) => {
            let colors = PARAGRAPH_COLORS[para.type]
            if (para.type === 'body') {
              colors = BODY_COLORS[bodyIndex] || BODY_COLORS[0]
              bodyIndex++
            }

            return (
              <div key={i} className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.labelBg}`}>
                    {para.type === 'body' ? colors.label : PARAGRAPH_COLORS[para.type].label}
                  </span>
                  <span className="text-xs text-gray-500">{para.purpose}</span>
                </div>
                <p
                  className="text-sm text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightPhrases(para.text, data.upgradePhrases) }}
                />
                <p className="text-xs text-gray-500 mt-2 italic">
                  Technique: {para.technique}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upgrade Phrases */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Phrases to Learn</h4>
        <div className="space-y-2">
          {data.upgradePhrases.map((phrase, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0 ${
                phrase.category === 'linking'
                  ? 'bg-blue-100 text-blue-600'
                  : phrase.category === 'grammar'
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-green-100 text-green-600'
              }`}>
                {phrase.category === 'linking' ? 'L' : phrase.category === 'grammar' ? 'G' : 'V'}
              </span>
              <div>
                <span className="text-sm font-medium text-gray-800">{phrase.phrase}</span>
                <span className="text-sm text-gray-500"> — {phrase.definition}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collapsible: Structure Template */}
      <CollapsibleSection
        title="Essay Structure Template"
        isOpen={showStructure}
        onToggle={() => setShowStructure(!showStructure)}
      >
        <p className="text-sm text-gray-700 whitespace-pre-line">{data.structureTemplate}</p>
      </CollapsibleSection>

      {/* Collapsible: Grammar Patterns */}
      <CollapsibleSection
        title="Grammar Patterns"
        isOpen={showGrammar}
        onToggle={() => setShowGrammar(!showGrammar)}
      >
        <div className="space-y-3">
          {data.grammarPatterns.map((gp, i) => (
            <div key={i}>
              <p className="text-sm font-medium text-gray-800">{gp.pattern}</p>
              <p className="text-sm text-gray-600 mt-0.5 bg-gray-50 rounded-lg p-2 italic">&ldquo;{gp.example}&rdquo;</p>
              <p className="text-xs text-gray-500 mt-1">{gp.explanation}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Collapsible: Writing Tips */}
      <CollapsibleSection
        title="Writing Tips"
        isOpen={showTips}
        onToggle={() => setShowTips(!showTips)}
      >
        <ul className="space-y-1.5">
          {data.writingTips.map((tip, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {tip}
            </li>
          ))}
        </ul>
      </CollapsibleSection>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onStartWriting}
          className="flex-1 py-3 px-6 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Now Write Your Own Essay
        </button>
        <button
          onClick={onEditIdeas}
          className="py-3 px-4 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-xl transition-colors"
        >
          Edit Ideas
        </button>
      </div>
    </div>
  )
}

function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="px-5 pb-5">{children}</div>}
    </div>
  )
}
