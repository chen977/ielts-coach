'use client'

import { useReducer, useCallback } from 'react'
import Link from 'next/link'
import type {
  SpeakingPart,
  SessionState,
  SessionAction,
  GeneratedQuestions,
  QuestionResponse,
} from '@/lib/speaking/types'
import QuestionCard from '@/components/speaking/QuestionCard'
import AudioRecorder from '@/components/speaking/AudioRecorder'
import CueCard from '@/components/speaking/CueCard'
import SessionProgress from '@/components/speaking/SessionProgress'
import ResultsView from '@/components/speaking/ResultsView'

function getQuestionList(questions: GeneratedQuestions): string[] {
  if (questions.part === 2) {
    return [questions.cueCard.topic]
  }
  return questions.questions
}

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'START':
      return { phase: 'generating' }

    case 'GENERATED':
      return {
        phase: 'practicing',
        questions: action.questions,
        currentIndex: 0,
        responses: [],
      }

    case 'SAVE_RESPONSE': {
      if (state.phase !== 'practicing') return state
      return {
        ...state,
        responses: [...state.responses, action.response],
      }
    }

    case 'NEXT_QUESTION': {
      if (state.phase !== 'practicing') return state
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
      }
    }

    case 'COMPLETE': {
      if (state.phase !== 'practicing') return state
      return {
        phase: 'evaluating',
        questions: state.questions,
        responses: state.responses,
      }
    }

    case 'EVALUATED': {
      if (state.phase !== 'evaluating') return state
      return {
        phase: 'results',
        evaluation: action.evaluation,
        questions: state.questions,
        responses: state.responses,
      }
    }

    case 'ERROR':
      return {
        phase: 'error',
        message: action.message,
        questions: state.phase === 'practicing' || state.phase === 'evaluating' ? state.questions : undefined,
        responses: state.phase === 'practicing' || state.phase === 'evaluating' ? state.responses : undefined,
      }

    case 'RESTART':
      return { phase: 'idle' }

    default:
      return state
  }
}

const partDescriptions: Record<SpeakingPart, { title: string; description: string; icon: string }> = {
  1: {
    title: 'Part 1 — Introduction & Interview',
    description: 'You will answer 5 everyday questions about familiar topics. Speak naturally for 30-60 seconds per question.',
    icon: '💬',
  },
  2: {
    title: 'Part 2 — Long Turn',
    description: 'You will receive a cue card with a topic. You have 1 minute to prepare notes, then speak for up to 2 minutes.',
    icon: '🗣️',
  },
  3: {
    title: 'Part 3 — Discussion',
    description: 'You will discuss 5 abstract questions related to a broader theme. Give detailed, analytical answers.',
    icon: '🧠',
  },
}

interface SpeakingSessionProps {
  part: SpeakingPart
}

export default function SpeakingSession({ part }: SpeakingSessionProps) {
  const [state, dispatch] = useReducer(sessionReducer, { phase: 'idle' })

  const startSession = useCallback(async () => {
    dispatch({ type: 'START' })
    try {
      const res = await fetch('/api/speaking/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ part }),
      })
      if (!res.ok) throw new Error('Failed to generate questions')
      const data = await res.json() as GeneratedQuestions
      dispatch({ type: 'GENERATED', questions: data })
    } catch (err) {
      dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : 'Failed to generate questions' })
    }
  }, [part])

  const handleRecordingComplete = useCallback((transcript: string) => {
    if (state.phase !== 'practicing') return
    const questionList = getQuestionList(state.questions)
    const response: QuestionResponse = {
      question: questionList[state.currentIndex],
      transcript,
    }
    dispatch({ type: 'SAVE_RESPONSE', response })

    const isLast = state.currentIndex >= questionList.length - 1
    if (isLast) {
      // Move to evaluation
      const allResponses = [...state.responses, response]
      dispatch({ type: 'COMPLETE' })
      evaluateResponses(allResponses)
    } else {
      dispatch({ type: 'NEXT_QUESTION' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const evaluateResponses = async (responses: QuestionResponse[]) => {
    try {
      const questionsPayload = state.phase === 'practicing' ? state.questions :
        state.phase === 'evaluating' ? state.questions : null

      const res = await fetch('/api/speaking/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part,
          questions: questionsPayload,
          responses,
        }),
      })
      if (!res.ok) throw new Error('Failed to evaluate responses')
      const data = await res.json()
      dispatch({ type: 'EVALUATED', evaluation: data.evaluation })
    } catch (err) {
      dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : 'Failed to evaluate responses' })
    }
  }

  const info = partDescriptions[part]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/practice/speaking"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-700 font-medium">Speaking Part {part}</span>
      </div>

      {/* IDLE */}
      {state.phase === 'idle' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-5">
          <div className="text-4xl">{info.icon}</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{info.title}</h1>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">{info.description}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-left max-w-sm mx-auto">
            <p className="text-xs font-medium text-gray-500 mb-2">Before you begin:</p>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li className="flex items-start gap-2">
                <span className="text-sky-500 mt-0.5">•</span>
                Find a quiet place with good audio
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 mt-0.5">•</span>
                Allow microphone access when prompted
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 mt-0.5">•</span>
                Speak clearly and at a natural pace
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
          <p className="font-medium text-gray-900">Generating your questions...</p>
          <p className="text-sm text-gray-400 mt-1">This takes a few seconds</p>
        </div>
      )}

      {/* PRACTICING */}
      {state.phase === 'practicing' && (
        <div className="space-y-6">
          {state.questions.part === 2 ? (
            // Part 2: Cue Card flow
            <CueCard
              cueCard={state.questions.cueCard}
              onComplete={handleRecordingComplete}
            />
          ) : (
            // Part 1 & 3: Question-by-question flow
            <>
              <SessionProgress
                current={state.currentIndex}
                total={state.questions.questions.length}
              />
              <QuestionCard
                question={state.questions.questions[state.currentIndex]}
                partNum={part}
                index={state.currentIndex}
                total={state.questions.questions.length}
              />
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <AudioRecorder
                  key={state.currentIndex}
                  maxDuration={part === 1 ? 60 : 90}
                  onComplete={handleRecordingComplete}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* EVALUATING */}
      {state.phase === 'evaluating' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-medium text-gray-900">AI is evaluating your responses...</p>
          <p className="text-sm text-gray-400 mt-1">Scoring on Fluency, Vocabulary, Grammar & Pronunciation</p>
        </div>
      )}

      {/* RESULTS */}
      {state.phase === 'results' && (
        <ResultsView
          evaluation={state.evaluation}
          part={part}
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
            {state.responses && state.responses.length > 0 ? (
              <button
                onClick={() => {
                  dispatch({ type: 'RESTART' })
                  // Could retry evaluation here if responses exist
                }}
                className="py-2.5 px-5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition"
              >
                Try Again
              </button>
            ) : (
              <button
                onClick={() => dispatch({ type: 'RESTART' })}
                className="py-2.5 px-5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition"
              >
                Start Over
              </button>
            )}
            <Link
              href="/practice/speaking"
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
