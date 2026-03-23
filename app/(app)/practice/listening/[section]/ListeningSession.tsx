'use client'

import { useReducer, useCallback, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type {
  ListeningSection,
  LearningLevel,
  ListeningSessionState,
  ListeningSessionAction,
  GeneratedListeningContent,
} from '@/lib/listening/types'
import { gradeSession } from '@/lib/listening/scoring'
import { hasSpeechSynthesis, safeSpeechSynthesis } from '@/lib/browser'
import AudioPlayer from '@/components/listening/AudioPlayer'
import QuestionPanel from '@/components/listening/QuestionPanel'
import ReadingTimer from '@/components/listening/ReadingTimer'
import TranscriptView from '@/components/listening/TranscriptView'
import ListeningResults from '@/components/listening/ListeningResults'

function listeningReducer(state: ListeningSessionState, action: ListeningSessionAction): ListeningSessionState {
  switch (action.type) {
    case 'START':
      return { phase: 'generating' }

    case 'GENERATED':
      return {
        phase: 'reading-time',
        content: action.content,
        sessionId: action.sessionId,
      }

    case 'READING_TIME_COMPLETE':
      if (state.phase !== 'reading-time') return state
      return {
        phase: 'playing',
        content: state.content,
        sessionId: state.sessionId,
        userAnswers: {},
      }

    case 'START_PLAYBACK':
      if (state.phase !== 'reading-time') return state
      return {
        phase: 'playing',
        content: state.content,
        sessionId: state.sessionId,
        userAnswers: {},
      }

    case 'PLAYBACK_COMPLETE':
      if (state.phase !== 'playing') return state
      return {
        phase: 'answering',
        content: state.content,
        sessionId: state.sessionId,
        userAnswers: state.userAnswers,
      }

    case 'UPDATE_ANSWER': {
      if (state.phase !== 'playing' && state.phase !== 'answering') return state
      return {
        ...state,
        userAnswers: { ...state.userAnswers, [action.questionId]: action.answer },
      }
    }

    case 'SUBMIT':
      if (state.phase !== 'answering' && state.phase !== 'playing') return state
      return {
        phase: 'results',
        content: state.content,
        sessionId: state.sessionId,
        userAnswers: state.userAnswers,
        results: action.results,
      }

    case 'ERROR':
      return { phase: 'error', message: action.message }

    case 'RESTART':
      return { phase: 'idle' }

    default:
      return state
  }
}

const sectionDescriptions: Record<ListeningSection, { title: string; description: string; icon: string }> = {
  1: {
    title: 'Section 1 — Everyday Conversation',
    description: 'A conversation between two speakers in an everyday context: booking, enquiry, or appointment.',
    icon: '📞',
  },
  2: {
    title: 'Section 2 — Monologue',
    description: 'A single speaker on an everyday topic: tour guide, announcement, or facility information.',
    icon: '📢',
  },
  3: {
    title: 'Section 3 — Academic Conversation',
    description: 'A discussion between 2-3 speakers in an academic context: study group, tutorial, or project planning.',
    icon: '🎓',
  },
  4: {
    title: 'Section 4 — Academic Lecture',
    description: 'A university-style lecture on an academic subject with complex vocabulary and dense information.',
    icon: '🔬',
  },
}

interface ListeningSessionProps {
  section: ListeningSection
  level: LearningLevel
}

export default function ListeningSession({ section, level }: ListeningSessionProps) {
  const [state, dispatch] = useReducer(listeningReducer, { phase: 'idle' })

  // Level 3: whether the user has clicked "Start Test" (required to unblock autoplay)
  const [testStarted, setTestStarted] = useState(false)

  // Level 2: progressive transcript reveal count after audio finishes
  const [revealedCount, setRevealedCount] = useState(0)
  const revealIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Shared cancel signal: TranscriptView click-to-speak → kills AudioPlayer's loop
  const audioPlayerCancelRef = useRef(false)

  // Reset per-session state when returning to idle
  useEffect(() => {
    if (state.phase === 'idle') {
      setTestStarted(false)
      setRevealedCount(0)
    }
  }, [state.phase])

  // Level 2: progressively reveal transcript segments once in answering phase
  useEffect(() => {
    if (state.phase === 'answering' && level === 2 && 'content' in state) {
      const total = state.content.script.length
      setRevealedCount(0)
      let current = 0
      revealIntervalRef.current = setInterval(() => {
        current += 1
        setRevealedCount(current)
        if (current >= total) {
          if (revealIntervalRef.current) clearInterval(revealIntervalRef.current)
        }
      }, 700)
      return () => {
        if (revealIntervalRef.current) clearInterval(revealIntervalRef.current)
      }
    }
  }, [state.phase, level])

  const startSession = useCallback(async () => {
    dispatch({ type: 'START' })
    try {
      const res = await fetch('/api/listening/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, level }),
      })
      if (!res.ok) throw new Error('Failed to generate listening test')
      const data = await res.json() as { sessionId: string; content: GeneratedListeningContent }
      dispatch({ type: 'GENERATED', content: data.content, sessionId: data.sessionId })
    } catch (err) {
      dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : 'Failed to generate listening test' })
    }
  }, [section, level])

  const handleSubmit = useCallback(async () => {
    if (state.phase !== 'answering' && state.phase !== 'playing') return

    const results = gradeSession(
      state.content.questionGroups,
      state.userAnswers,
      state.content.vocabulary
    )

    dispatch({ type: 'SUBMIT', results })

    // Save results to DB
    try {
      await fetch(`/api/listening/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          userAnswers: state.userAnswers,
          score: results.score,
          bandEstimate: results.bandEstimate,
        }),
      })
    } catch {
      // Non-critical: results are already shown to user
      console.error('Failed to save results')
    }
  }, [state])

  const handleAnswerChange = useCallback((questionId: number, answer: string) => {
    dispatch({ type: 'UPDATE_ANSWER', questionId, answer })
  }, [])

  // Transcript click-to-speak: kill AudioPlayer's loop so they don't fight
  const handleTranscriptPlaybackStart = useCallback(() => {
    audioPlayerCancelRef.current = true
    try { safeSpeechSynthesis()?.cancel() } catch { /* ignore */ }
  }, [])

  // Level 3: user clicks "Start Test" — prime TTS to satisfy autoplay policy, then start timer
  const handleStartTest = useCallback(() => {
    // Speak a silent utterance immediately on click to unlock speech synthesis (iOS requirement)
    if (hasSpeechSynthesis()) {
      try {
        const prime = new SpeechSynthesisUtterance('\u00A0')
        prime.volume = 0
        prime.rate = 10
        safeSpeechSynthesis()?.speak(prime)
      } catch {
        // TTS priming failed — not critical, audio may still work
      }
    }
    setTestStarted(true)
  }, [])

  const info = sectionDescriptions[section]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* IDLE */}
      {state.phase === 'idle' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-5">
          <div className="text-4xl">{info.icon}</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{info.title}</h1>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">{info.description}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-left max-w-sm mx-auto">
            <p className="text-xs font-medium text-gray-500 mb-2">What to expect:</p>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li className="flex items-start gap-2">
                <span className="text-sky-500 mt-0.5">•</span>
                10 questions based on AI-generated audio
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 mt-0.5">•</span>
                {level === 1
                  ? 'Transcript visible, replay freely, click sentences to hear them'
                  : level === 2
                    ? 'Audio plays twice, transcript revealed after — answer anytime'
                    : '30-second reading time, then audio plays once'}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 mt-0.5">•</span>
                Auto-marked with instant results
              </li>
            </ul>
          </div>
          <button
            onClick={startSession}
            className="py-3 px-8 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-sky-200"
          >
            Start Session
          </button>
        </div>
      )}

      {/* GENERATING */}
      {state.phase === 'generating' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-medium text-gray-900">Generating your listening test...</p>
          <p className="text-sm text-gray-400 mt-1">Creating script, audio, and questions</p>
        </div>
      )}

      {/* READING TIME */}
      {state.phase === 'reading-time' && (
        <div className="space-y-6">
          {level === 3 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center">
              {!testStarted ? (
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                    <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">Ready to begin?</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs">
                      You&apos;ll get 30 seconds to read the questions, then audio plays automatically.
                    </p>
                  </div>
                  <button
                    onClick={handleStartTest}
                    className="py-2.5 px-8 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-amber-100"
                  >
                    Start Test
                  </button>
                </div>
              ) : (
                <ReadingTimer seconds={30} onComplete={() => dispatch({ type: 'READING_TIME_COMPLETE' })} />
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <p className="text-sm text-gray-700 mb-4">Your test is ready. Review the questions, then start the audio.</p>
              <button
                onClick={() => dispatch({ type: 'START_PLAYBACK' })}
                className="py-2.5 px-6 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition"
              >
                Start Audio
              </button>
            </div>
          )}

          <QuestionPanel
            questionGroups={state.content.questionGroups}
            userAnswers={{}}
            onAnswerChange={() => {}}
            disabled={level === 3}
          />
        </div>
      )}

      {/* PLAYING */}
      {state.phase === 'playing' && (
        <div className="space-y-6">
          <AudioPlayer
            script={state.content.script}
            level={level}
            autoPlay={level === 3}
            onPlaybackComplete={() => dispatch({ type: 'PLAYBACK_COMPLETE' })}
            externalCancelRef={audioPlayerCancelRef}
          />

          {/* Transcript for Level 1 (click-to-speak) */}
          {level === 1 && (
            <TranscriptView
              script={state.content.script}
              clickToSpeak
              onPlaybackStart={handleTranscriptPlaybackStart}
            />
          )}

          <QuestionPanel
            questionGroups={state.content.questionGroups}
            userAnswers={state.userAnswers}
            onAnswerChange={handleAnswerChange}
          />

          {/* Allow early submit in Level 1 */}
          {level === 1 && (
            <button
              onClick={handleSubmit}
              className="w-full py-3 px-5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition"
            >
              Submit Answers
            </button>
          )}
        </div>
      )}

      {/* ANSWERING (after audio finishes) */}
      {state.phase === 'answering' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Audio complete</p>
                <p className="text-xs text-gray-500">
                  {level === 2
                    ? 'The transcript is being revealed below — check your answers and submit when ready'
                    : 'Check your answers and submit when ready'}
                </p>
              </div>
            </div>
          </div>

          {/* Level 2: progressive transcript reveal */}
          {level === 2 && (
            <TranscriptView
              script={state.content.script}
              revealedCount={revealedCount}
            />
          )}

          <QuestionPanel
            questionGroups={state.content.questionGroups}
            userAnswers={state.userAnswers}
            onAnswerChange={handleAnswerChange}
          />

          <button
            onClick={handleSubmit}
            className="w-full py-3 px-5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition"
          >
            Submit Answers
          </button>
        </div>
      )}

      {/* RESULTS */}
      {state.phase === 'results' && (
        <ListeningResults
          results={state.results}
          content={state.content}
          section={section}
          level={level}
          userAnswers={state.userAnswers}
          onNewSession={() => dispatch({ type: 'RESTART' })}
        />
      )}

      {/* ERROR */}
      {state.phase === 'error' && (
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900">Something went wrong</p>
            <p className="text-sm text-gray-500 mt-1">{state.message}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => dispatch({ type: 'RESTART' })}
              className="py-2.5 px-5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition"
            >
              Try Again
            </button>
            <Link
              href="/practice/listening"
              className="py-2.5 px-5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-xl transition text-center"
            >
              Back to Hub
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
