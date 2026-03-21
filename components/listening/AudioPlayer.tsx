'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ScriptSegment, LearningLevel, VoiceAssignment } from '@/lib/listening/types'

interface AudioPlayerProps {
  script: ScriptSegment[]
  level: LearningLevel
  autoPlay?: boolean
  onPlaybackComplete: () => void
  onSegmentChange?: (segmentIndex: number) => void
  /** External cancel signal — set .current = true to kill the speech loop from outside */
  externalCancelRef?: React.RefObject<boolean>
}

// Split long text at sentence boundaries
function splitLongText(text: string, maxLen = 200): string[] {
  if (text.length <= maxLen) return [text]
  const sentences = text.match(/[^.!?]+[.!?]+\s*/g) || [text]
  const chunks: string[] = []
  let current = ''
  for (const s of sentences) {
    if (current.length + s.length > maxLen && current) {
      chunks.push(current.trim())
      current = s
    } else {
      current += s
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks
}

// Assign different voice configs per speaker
function assignVoices(speakers: string[]): Map<string, VoiceAssignment> {
  const configs: VoiceAssignment[] = [
    { speaker: '', pitch: 1.0, rate: 0.92 },
    { speaker: '', pitch: 1.2, rate: 0.88 },
    { speaker: '', pitch: 0.85, rate: 0.95 },
    { speaker: '', pitch: 1.1, rate: 0.85 },
  ]
  const map = new Map<string, VoiceAssignment>()
  speakers.forEach((s, i) => {
    const cfg = configs[i % configs.length]
    map.set(s, { ...cfg, speaker: s })
  })
  return map
}

export default function AudioPlayer({
  script,
  level,
  autoPlay = false,
  onPlaybackComplete,
  onSegmentChange,
  externalCancelRef,
}: AudioPlayerProps) {
  const [playbackState, setPlaybackState] = useState<'idle' | 'playing' | 'paused' | 'complete'>('idle')
  const [currentSegment, setCurrentSegment] = useState(0)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  // For level 2: track which round we're on (1 or 2)
  const [playRound, setPlayRound] = useState(1)
  const maxRounds = level === 2 ? 2 : 1

  const voiceAssignmentsRef = useRef<Map<string, VoiceAssignment>>(new Map())
  const isPlayingRef = useRef(false)
  const segmentIndexRef = useRef(0)
  const cancelledRef = useRef(false)
  const playRoundRef = useRef(1)

  // Load voices
  useEffect(() => {
    function loadVoices() {
      const available = speechSynthesis.getVoices()
      if (available.length > 0) setVoices(available)
    }
    loadVoices()
    speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices)
      speechSynthesis.cancel()
    }
  }, [])

  // Build voice assignments when voices load
  useEffect(() => {
    if (voices.length === 0) return
    const speakers = [...new Set(script.map(s => s.speaker))]
    voiceAssignmentsRef.current = assignVoices(speakers)
  }, [voices, script])

  const getPreferredVoice = useCallback(() => {
    return voices.find(v => v.lang === 'en-GB' && !v.localService)
      || voices.find(v => v.lang === 'en-AU' && !v.localService)
      || voices.find(v => v.lang === 'en-GB')
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0]
  }, [voices])

  // Check both internal cancel and external cancel (from transcript click-to-speak)
  const isCancelled = useCallback(() => {
    return cancelledRef.current || (externalCancelRef?.current ?? false)
  }, [externalCancelRef])

  const speakSegments = useCallback(async (startIndex: number) => {
    if (isCancelled()) return
    isPlayingRef.current = true
    setPlaybackState('playing')
    // Reset external cancel so AudioPlayer can play normally
    if (externalCancelRef && 'current' in externalCancelRef) {
      (externalCancelRef as React.MutableRefObject<boolean>).current = false
    }

    const baseVoice = getPreferredVoice()

    // Chrome keepalive: periodically nudge speechSynthesis so it doesn't auto-stop
    const keepAlive = setInterval(() => {
      if (speechSynthesis.speaking) {
        speechSynthesis.pause()
        speechSynthesis.resume()
      }
    }, 10_000)

    try {
      for (let i = startIndex; i < script.length; i++) {
        if (isCancelled()) break

        segmentIndexRef.current = i
        setCurrentSegment(i)
        onSegmentChange?.(i)

        const seg = script[i]
        const assignment = voiceAssignmentsRef.current.get(seg.speaker)

        // If there's a direction, add a small pause
        if (seg.direction) {
          await new Promise(resolve => setTimeout(resolve, 800))
        }

        // Split long segments
        const chunks = splitLongText(seg.text)
        for (const chunk of chunks) {
          if (isCancelled()) break

          await new Promise<void>((resolve) => {
            let settled = false
            const done = () => { if (!settled) { settled = true; resolve() } }

            const utterance = new SpeechSynthesisUtterance(chunk)
            if (baseVoice) utterance.voice = baseVoice
            utterance.pitch = assignment?.pitch ?? 1.0
            utterance.rate = assignment?.rate ?? 0.9
            utterance.onend = done
            utterance.onerror = (e) => {
              if (e.error !== 'canceled' && e.error !== 'interrupted') console.error('TTS error:', e.error)
              done()
            }

            // Safety timeout: if onend/onerror never fire, resolve anyway
            const estimatedMs = Math.max((chunk.length * 80) / (assignment?.rate ?? 0.9), 3000) + 2000
            setTimeout(done, estimatedMs)

            speechSynthesis.speak(utterance)
          })
        }

        // Small pause between speakers
        if (i < script.length - 1 && !isCancelled()) {
          const nextSpeaker = script[i + 1]?.speaker
          const pauseMs = seg.speaker !== nextSpeaker ? 600 : 300
          await new Promise(resolve => setTimeout(resolve, pauseMs))
        }
      }
    } finally {
      clearInterval(keepAlive)
    }

    if (!isCancelled()) {
      isPlayingRef.current = false

      // Level 2: play twice before completing
      if (level === 2 && playRoundRef.current < maxRounds) {
        playRoundRef.current += 1
        setPlayRound(playRoundRef.current)
        // Brief pause between plays, then restart
        await new Promise(resolve => setTimeout(resolve, 1200))
        if (!isCancelled()) {
          setCurrentSegment(0)
          speakSegments(0)
        }
      } else {
        setPlaybackState('complete')
        setHasPlayed(true)
        onPlaybackComplete()
      }
    }
  }, [script, getPreferredVoice, onPlaybackComplete, onSegmentChange, level, maxRounds, isCancelled, externalCancelRef])

  // Auto-play (Level 3, after user has clicked "Start Test")
  useEffect(() => {
    if (autoPlay && !hasPlayed && voices.length > 0) {
      speakSegments(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, voices])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelledRef.current = true
      speechSynthesis.cancel()
    }
  }, [])

  const handlePlay = () => {
    if (playbackState === 'paused') {
      speechSynthesis.resume()
      setPlaybackState('playing')
      return
    }
    cancelledRef.current = false
    // Reset external cancel so AudioPlayer can take back control
    if (externalCancelRef && 'current' in externalCancelRef) {
      (externalCancelRef as React.MutableRefObject<boolean>).current = false
    }
    speakSegments(0)
  }

  const handlePause = () => {
    speechSynthesis.pause()
    setPlaybackState('paused')
  }

  const handleRestart = () => {
    cancelledRef.current = true
    speechSynthesis.cancel()
    playRoundRef.current = 1
    setPlayRound(1)
    setTimeout(() => {
      cancelledRef.current = false
      setCurrentSegment(0)
      speakSegments(0)
    }, 100)
  }

  const handleStop = () => {
    cancelledRef.current = true
    speechSynthesis.cancel()
    isPlayingRef.current = false
    setPlaybackState('complete')
    setHasPlayed(true)
    onPlaybackComplete()
  }

  const progress = script.length > 0 ? ((currentSegment + 1) / script.length) * 100 : 0
  const canPlay = level === 1 || !hasPlayed
  const canReplay = level === 1

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
          <span>
            Audio Progress
            {level === 2 && (
              <span className="ml-2 font-medium text-sky-500">
                (Play {playRound} of {maxRounds})
              </span>
            )}
          </span>
          <span>{playbackState === 'complete' ? 'Complete' : `${currentSegment + 1} / ${script.length}`}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-400 rounded-full transition-all duration-500"
            style={{ width: `${playbackState === 'idle' ? 0 : progress}%` }}
          />
        </div>
        {/* Round indicator dots for level 2 */}
        {level === 2 && (
          <div className="flex items-center gap-1.5 mt-2">
            {Array.from({ length: maxRounds }).map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i + 1 < playRound
                    ? 'bg-sky-400'
                    : i + 1 === playRound && playbackState === 'playing'
                      ? 'bg-sky-400 animate-pulse'
                      : 'bg-gray-200'
                }`}
              />
            ))}
            <span className="text-xs text-gray-400 ml-1">
              {playbackState === 'complete' ? 'Both plays complete' : `Play ${playRound} of ${maxRounds}`}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {/* Level 3: no manual controls, auto-plays */}
        {level === 3 && playbackState === 'idle' && (
          <p className="text-sm text-gray-500">Audio will begin automatically...</p>
        )}

        {level === 3 && playbackState === 'playing' && (
          <div className="flex items-center gap-2 text-sky-600">
            <div className="flex gap-1">
              <span className="w-1 h-4 bg-sky-400 rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-sky-400 rounded-full animate-pulse [animation-delay:0.15s]" />
              <span className="w-1 h-4 bg-sky-400 rounded-full animate-pulse [animation-delay:0.3s]" />
            </div>
            <span className="text-sm font-medium">Playing audio...</span>
          </div>
        )}

        {level === 3 && playbackState === 'complete' && (
          <p className="text-sm text-gray-500">Audio complete</p>
        )}

        {/* Level 1 & 2: show controls */}
        {level !== 3 && (
          <>
            {playbackState === 'idle' && canPlay && (
              <button
                onClick={handlePlay}
                className="flex items-center gap-2 py-2.5 px-6 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play Audio
              </button>
            )}

            {playbackState === 'playing' && (
              <>
                {level === 1 && (
                  <button
                    onClick={handlePause}
                    className="flex items-center gap-2 py-2.5 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                    </svg>
                    Pause
                  </button>
                )}
                <div className="flex items-center gap-2 text-sky-600">
                  <div className="flex gap-1">
                    <span className="w-1 h-4 bg-sky-400 rounded-full animate-pulse" />
                    <span className="w-1 h-4 bg-sky-400 rounded-full animate-pulse [animation-delay:0.15s]" />
                    <span className="w-1 h-4 bg-sky-400 rounded-full animate-pulse [animation-delay:0.3s]" />
                  </div>
                  <span className="text-sm font-medium">
                    {level === 2 ? `Playing — listen ${playRound === 1 ? 'carefully' : 'again'}...` : 'Playing...'}
                  </span>
                </div>
                {level === 2 && (
                  <button
                    onClick={handleStop}
                    className="text-xs text-gray-400 hover:text-gray-600 transition"
                  >
                    Skip
                  </button>
                )}
              </>
            )}

            {playbackState === 'paused' && (
              <button
                onClick={handlePlay}
                className="flex items-center gap-2 py-2.5 px-6 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Resume
              </button>
            )}

            {playbackState === 'complete' && canReplay && (
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 py-2.5 px-6 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Replay
              </button>
            )}

            {playbackState === 'complete' && !canReplay && (
              <p className="text-sm text-gray-500">Audio complete — answer the questions below</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
