'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { ScriptSegment } from '@/lib/listening/types'

interface TranscriptViewProps {
  script: ScriptSegment[]
  highlightSegmentIndex?: number
  clickToSpeak?: boolean
  revealedCount?: number
  /** Called when click-to-speak starts — use to stop AudioPlayer's loop */
  onPlaybackStart?: () => void
}

const SPEAKER_COLORS: Record<number, string> = {
  0: 'bg-sky-100 text-sky-700',
  1: 'bg-violet-100 text-violet-700',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-emerald-100 text-emerald-700',
}

// Must mirror AudioPlayer's voice configs so click-to-speak uses the same voice per speaker
const VOICE_CONFIGS = [
  { pitch: 1.0, rate: 0.92 },
  { pitch: 1.2, rate: 0.88 },
  { pitch: 0.85, rate: 0.95 },
  { pitch: 1.1, rate: 0.85 },
]

function buildVoiceMap(script: ScriptSegment[]): Map<string, { pitch: number; rate: number }> {
  const speakers = [...new Set(script.map(s => s.speaker))]
  return new Map(speakers.map((s, i) => [s, VOICE_CONFIGS[i % VOICE_CONFIGS.length]]))
}

function getPreferredVoice(voices: SpeechSynthesisVoice[]) {
  return (
    voices.find(v => v.lang === 'en-GB' && !v.localService) ||
    voices.find(v => v.lang === 'en-AU' && !v.localService) ||
    voices.find(v => v.lang === 'en-GB') ||
    voices.find(v => v.lang.startsWith('en')) ||
    voices[0]
  )
}

function SpeakerIcon({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6h12v12H6z" />
    </svg>
  )
}

function splitIntoSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]+\s*/g)
  if (matches && matches.length > 0) return matches.map(s => s.trim()).filter(Boolean)
  return [text]
}

interface ActivePosition {
  segIndex: number
  sentIndex: number
}

export default function TranscriptView({
  script,
  highlightSegmentIndex,
  clickToSpeak = false,
  revealedCount,
  onPlaybackStart,
}: TranscriptViewProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [activePos, setActivePos] = useState<ActivePosition | null>(null)
  const cancelRef = useRef(false)
  // Generation counter: each playFrom call gets a unique ID so stale loops can't resume
  const playGenRef = useRef(0)

  // Load available TTS voices
  useEffect(() => {
    function loadVoices() {
      const available = speechSynthesis.getVoices()
      if (available.length > 0) setVoices(available)
    }
    loadVoices()
    speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [])

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      cancelRef.current = true
      speechSynthesis.cancel()
    }
  }, [])

  const stopPlayback = useCallback(() => {
    playGenRef.current++        // invalidate any running generation
    cancelRef.current = true
    speechSynthesis.cancel()
    setActivePos(null)
  }, [])

  // Play from a specific segment+sentence, continuing to end of script.
  //
  // Uses a generation counter so that when the user clicks a new sentence (or
  // Stop), any previous async loop immediately bails out — even if it was
  // sleeping in an inter-sentence pause.
  //
  // Also works around two Chrome TTS bugs:
  // 1. Chrome silently kills speechSynthesis after ~15 s of continuous use.
  //    Fix: pause()/resume() heartbeat every 10 s keeps it alive.
  // 2. After a cancel(), the next utterance's onend sometimes never fires,
  //    hanging the promise chain. Fix: a safety timeout based on text length
  //    guarantees forward progress even if the event is swallowed.
  const playFrom = useCallback(async (startSegIndex: number, startSentIndex: number) => {
    // Cancel any in-progress playback (both ours and AudioPlayer's)
    cancelRef.current = true
    speechSynthesis.cancel()
    onPlaybackStart?.()   // tells ListeningSession to kill AudioPlayer's loop

    // Wait long enough for Chrome to fully tear down the previous queue
    await new Promise(r => setTimeout(r, 150))

    // Start a new generation — any older loop will see the mismatch and exit
    const gen = ++playGenRef.current
    cancelRef.current = false

    const stale = () => cancelRef.current || playGenRef.current !== gen

    const voiceMap = buildVoiceMap(script)
    const baseVoice = getPreferredVoice(voices)

    // Chrome keepalive: periodically nudge speechSynthesis so it doesn't auto-stop
    const keepAlive = setInterval(() => {
      if (speechSynthesis.speaking) {
        speechSynthesis.pause()
        speechSynthesis.resume()
      }
    }, 10_000)

    try {
      for (let si = startSegIndex; si < script.length; si++) {
        if (stale()) break
        const seg = script[si]
        const sentences = splitIntoSentences(seg.text)
        const startJ = si === startSegIndex ? startSentIndex : 0

        for (let j = startJ; j < sentences.length; j++) {
          if (stale()) break

          setActivePos({ segIndex: si, sentIndex: j })

          const cfg = voiceMap.get(seg.speaker)
          const text = sentences[j]

          await new Promise<void>(resolve => {
            let settled = false
            const done = () => { if (!settled) { settled = true; resolve() } }

            const utterance = new SpeechSynthesisUtterance(text)
            if (baseVoice) utterance.voice = baseVoice
            utterance.pitch = cfg?.pitch ?? 1.0
            utterance.rate = cfg?.rate ?? 0.9
            utterance.onend = done
            utterance.onerror = e => {
              if (e.error !== 'canceled' && e.error !== 'interrupted') console.error('TTS error:', e.error)
              done()
            }

            // Safety timeout: if onend/onerror never fire, resolve anyway.
            const estimatedMs = Math.max((text.length * 80) / (cfg?.rate ?? 0.9), 3000) + 2000
            setTimeout(done, estimatedMs)

            speechSynthesis.speak(utterance)
          })

          // Pause between sentences / speakers
          if (!stale()) {
            const isLastSentInSeg = j === sentences.length - 1
            const nextSpeaker = isLastSentInSeg ? script[si + 1]?.speaker : seg.speaker
            const pauseMs = isLastSentInSeg && nextSpeaker !== seg.speaker ? 600 : 200
            await new Promise(r => setTimeout(r, pauseMs))
          }
        }
      }
    } finally {
      clearInterval(keepAlive)
    }

    if (!stale()) setActivePos(null)
  }, [script, voices, onPlaybackStart])

  const speakers = [...new Set(script.map(s => s.speaker))]
  const speakerColorMap = Object.fromEntries(
    speakers.map((s, i) => [s, SPEAKER_COLORS[i % Object.keys(SPEAKER_COLORS).length]])
  )

  const isProgressiveReveal = revealedCount !== undefined
  const visibleScript = isProgressiveReveal ? script.slice(0, revealedCount) : script
  const isPlaying = activePos !== null

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">Transcript</p>

        <div className="flex items-center gap-3">
          {clickToSpeak && !isPlaying && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <SpeakerIcon />
              Click any sentence to play from there
            </span>
          )}
          {clickToSpeak && isPlaying && (
            <button
              onClick={stopPlayback}
              className="flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-800 transition-colors"
            >
              <StopIcon />
              Stop
            </button>
          )}
          {isProgressiveReveal && revealedCount! < script.length && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-gray-300 animate-bounce" />
                <span className="w-1 h-1 rounded-full bg-gray-300 animate-bounce [animation-delay:0.15s]" />
                <span className="w-1 h-1 rounded-full bg-gray-300 animate-bounce [animation-delay:0.3s]" />
              </span>
              Revealing...
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
        {visibleScript.map((seg, si) => {
          const isNewest = isProgressiveReveal && si === (revealedCount ?? 0) - 1
          return (
            <div
              key={si}
              className={`rounded-lg p-3 transition-colors ${isNewest ? 'animate-fade-in-up' : ''} ${
                highlightSegmentIndex === si
                  ? 'bg-amber-50 ring-1 ring-amber-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              {seg.direction && (
                <p className="text-xs italic text-gray-400 mb-1">[{seg.direction}]</p>
              )}
              <div className="flex items-start gap-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${speakerColorMap[seg.speaker]}`}
                >
                  {seg.speaker}
                </span>

                {clickToSpeak ? (
                  <div className="flex-1 space-y-0.5">
                    {splitIntoSentences(seg.text).map((sentence, j) => {
                      const isActive = activePos?.segIndex === si && activePos?.sentIndex === j
                      return (
                        <button
                          key={j}
                          onClick={() => playFrom(si, j)}
                          className={`group flex items-start gap-1.5 text-left w-full rounded px-1 py-0.5 transition-colors ${
                            isActive
                              ? 'bg-sky-100 text-sky-800'
                              : 'hover:bg-sky-50'
                          }`}
                          title="Click to play from this sentence"
                        >
                          <span
                            className={`mt-1 flex-shrink-0 transition-opacity ${
                              isActive
                                ? 'text-sky-500 opacity-100'
                                : 'text-sky-400 opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {isActive ? (
                              // Animated bars when playing
                              <span className="flex gap-px items-end h-3">
                                <span className="w-0.5 h-2 bg-sky-500 rounded-full animate-pulse" />
                                <span className="w-0.5 h-3 bg-sky-500 rounded-full animate-pulse [animation-delay:0.15s]" />
                                <span className="w-0.5 h-1.5 bg-sky-500 rounded-full animate-pulse [animation-delay:0.3s]" />
                              </span>
                            ) : (
                              <SpeakerIcon />
                            )}
                          </span>
                          <span
                            className={`text-sm leading-relaxed transition-colors ${
                              isActive
                                ? 'text-sky-800 font-medium'
                                : 'text-gray-700 group-hover:text-sky-700'
                            }`}
                          >
                            {sentence}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed">{seg.text}</p>
                )}
              </div>
            </div>
          )
        })}

        {isProgressiveReveal && revealedCount !== undefined && revealedCount >= script.length && (
          <p className="text-xs text-center text-gray-400 pt-1">End of transcript</p>
        )}
      </div>
    </div>
  )
}
