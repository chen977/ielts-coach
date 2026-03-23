'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { UpgradePhrase, GrammarPattern } from '@/lib/speaking/types'
import { hasSpeechSynthesis, safeSpeechSynthesis } from '@/lib/browser'

interface PersonalizedAnswerProps {
  modelAnswer: string
  upgradePhrases: UpgradePhrase[]
  grammarPatterns: GrammarPattern[]
  speakingTips: string[]
  onStartPractice: () => void
  onEditDetails: () => void
}

type TTSRate = 0.8 | 1.0 | 1.2

export default function PersonalizedAnswer({
  modelAnswer,
  upgradePhrases,
  grammarPatterns,
  speakingTips,
  onStartPractice,
  onEditDetails,
}: PersonalizedAnswerProps) {
  const [showGrammar, setShowGrammar] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [ttsRate, setTtsRate] = useState<TTSRate>(1.0)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [ttsSupported] = useState(() => hasSpeechSynthesis())
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Load voices (async on some browsers)
  useEffect(() => {
    const synth = safeSpeechSynthesis()
    if (!synth) return

    function loadVoices() {
      try {
        const available = synth!.getVoices()
        if (available.length > 0) setVoices(available)
      } catch {
        // getVoices() can throw on some browsers
      }
    }
    loadVoices()
    try {
      synth.addEventListener('voiceschanged', loadVoices)
    } catch {
      // not supported on all platforms
    }
    return () => {
      try {
        synth.removeEventListener('voiceschanged', loadVoices)
        synth.cancel()
      } catch {
        // cleanup errors are non-critical
      }
    }
  }, [])

  const getPreferredVoice = useCallback(() => {
    // Prefer en-GB or en-AU for IELTS authenticity
    const preferred = voices.find(v => v.lang === 'en-GB' && !v.localService)
      || voices.find(v => v.lang === 'en-AU' && !v.localService)
      || voices.find(v => v.lang === 'en-GB')
      || voices.find(v => v.lang === 'en-AU')
      || voices.find(v => v.lang.startsWith('en'))
    return preferred || null
  }, [voices])

  function handleTTS() {
    const synth = safeSpeechSynthesis()
    if (!synth) return

    if (isSpeaking) {
      try { synth.cancel() } catch { /* ignore */ }
      setIsSpeaking(false)
      return
    }

    try {
      const utterance = new SpeechSynthesisUtterance(modelAnswer)
      const voice = getPreferredVoice()
      if (voice) utterance.voice = voice
      utterance.rate = ttsRate
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      utteranceRef.current = utterance
      synth.speak(utterance)
      setIsSpeaking(true)
    } catch {
      setIsSpeaking(false)
    }
  }

  // Highlight phrases in the model answer
  const highlightedAnswer = buildHighlightedText(modelAnswer, upgradePhrases)

  return (
    <div className="space-y-4">
      {/* Model Answer Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Your Band 7 Answer</h3>
          {ttsSupported && (
            <div className="flex items-center gap-2">
              {/* Rate selector */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                {([0.8, 1.0, 1.2] as TTSRate[]).map(rate => (
                  <button
                    key={rate}
                    onClick={() => setTtsRate(rate)}
                    className={`text-xs px-2 py-1 rounded-md transition-colors ${
                      ttsRate === rate ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
              {/* Play/Stop button */}
              <button
                onClick={handleTTS}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isSpeaking
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-sky-50 text-sky-600 hover:bg-sky-100'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                    Stop
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Listen
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Highlighted answer text */}
        <div className="text-gray-700 leading-relaxed text-[15px]">
          {highlightedAnswer.map((segment, i) => {
            if (segment.type === 'text') {
              return <span key={i}>{segment.content}</span>
            }
            const phrase = segment.phrase!
            const isTooltipActive = activeTooltip === phrase.phrase
            return (
              <span key={i} className="relative inline">
                <span
                  className={`cursor-help rounded px-0.5 ${
                    phrase.category === 'connector'
                      ? 'bg-blue-100 text-blue-800'
                      : phrase.category === 'grammar'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                  }`}
                  onClick={() => setActiveTooltip(isTooltipActive ? null : phrase.phrase)}
                  onMouseEnter={() => setActiveTooltip(phrase.phrase)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  {segment.content}
                </span>
                {isTooltipActive && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10 shadow-lg">
                    {phrase.definition}
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                  </span>
                )}
              </span>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded bg-green-100 border border-green-200" />
            Vocabulary
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
            Connector
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded bg-purple-100 border border-purple-200" />
            Grammar
          </span>
        </div>
      </div>

      {/* Upgrade Phrases List */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h4 className="font-semibold text-gray-900 mb-3">Key Upgrade Phrases</h4>
        <div className="space-y-2">
          {upgradePhrases.map((phrase, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${
                phrase.category === 'connector'
                  ? 'bg-blue-100 text-blue-700'
                  : phrase.category === 'grammar'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-green-100 text-green-700'
              }`}>
                {phrase.category}
              </span>
              <div>
                <span className="text-sm font-medium text-gray-900">&ldquo;{phrase.phrase}&rdquo;</span>
                <span className="text-sm text-gray-500 ml-1.5">— {phrase.definition}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grammar Patterns (collapsible) */}
      <button
        onClick={() => setShowGrammar(!showGrammar)}
        className="w-full flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-5 hover:bg-gray-50 transition-colors"
      >
        <h4 className="font-semibold text-gray-900">Grammar Patterns</h4>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${showGrammar ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {showGrammar && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 -mt-2 space-y-3">
          {grammarPatterns.map((gp, i) => (
            <div key={i} className="space-y-1">
              <p className="text-sm font-medium text-purple-700">{gp.pattern}</p>
              <p className="text-sm text-gray-700 italic">&ldquo;{gp.example}&rdquo;</p>
              <p className="text-xs text-gray-500">{gp.explanation}</p>
            </div>
          ))}
        </div>
      )}

      {/* Speaking Tips (collapsible) */}
      <button
        onClick={() => setShowTips(!showTips)}
        className="w-full flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-5 hover:bg-gray-50 transition-colors"
      >
        <h4 className="font-semibold text-gray-900">Speaking Tips</h4>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${showTips ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {showTips && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 -mt-2">
          <ul className="space-y-2">
            {speakingTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onEditDetails}
          className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Edit Details & Regenerate
        </button>
        <button
          onClick={onStartPractice}
          className="flex-1 py-3 px-4 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition-colors"
        >
          I&apos;ve Studied This — Practice Now
        </button>
      </div>
    </div>
  )
}

// Highlight matching phrases in the answer text
type Segment = { type: 'text'; content: string; phrase?: undefined } | { type: 'highlight'; content: string; phrase: UpgradePhrase }

function buildHighlightedText(text: string, phrases: UpgradePhrase[]): Segment[] {
  if (!phrases.length) return [{ type: 'text', content: text }]

  // Sort phrases by length (longest first) to avoid substring matches
  const sorted = [...phrases].sort((a, b) => b.phrase.length - a.phrase.length)

  // Find all match positions — lowercase the full text once, not per-phrase
  const lowerText = text.toLowerCase()
  const matches: { start: number; end: number; phrase: UpgradePhrase }[] = []
  for (const phrase of sorted) {
    const lowerPhrase = phrase.phrase.toLowerCase()
    let pos = 0
    while ((pos = lowerText.indexOf(lowerPhrase, pos)) !== -1) {
      // Check no overlap with existing matches
      const overlaps = matches.some(m => pos < m.end && pos + lowerPhrase.length > m.start)
      if (!overlaps) {
        matches.push({ start: pos, end: pos + lowerPhrase.length, phrase })
      }
      pos += 1
    }
  }

  // Sort by position
  matches.sort((a, b) => a.start - b.start)

  // Build segments
  const segments: Segment[] = []
  let cursor = 0
  for (const match of matches) {
    if (match.start > cursor) {
      segments.push({ type: 'text', content: text.slice(cursor, match.start) })
    }
    segments.push({
      type: 'highlight',
      content: text.slice(match.start, match.end),
      phrase: match.phrase,
    })
    cursor = match.end
  }
  if (cursor < text.length) {
    segments.push({ type: 'text', content: text.slice(cursor) })
  }

  return segments
}
