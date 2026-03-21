'use client'

import { useReducer, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type {
  SpeakingPart,
  Topic,
  StudySessionState,
  StudySessionAction,
  PersonalAnswer,
  GuidedEvaluationResult,
} from '@/lib/speaking/types'
import LevelIndicator from '@/components/speaking/LevelIndicator'
import PersonalDetailsForm from '@/components/speaking/PersonalDetailsForm'
import PersonalizedAnswer from '@/components/speaking/PersonalizedAnswer'
import HintPanel from '@/components/speaking/HintPanel'
import AudioRecorder from '@/components/speaking/AudioRecorder'
import GuidedResultsView from '@/components/speaking/GuidedResultsView'
import QuestionCard from '@/components/speaking/QuestionCard'

function studyReducer(state: StudySessionState, action: StudySessionAction): StudySessionState {
  switch (action.type) {
    case 'SELECT_QUESTION':
      return { phase: 'filling-details', question: action.question }

    case 'SUBMIT_DETAILS':
      if (state.phase !== 'filling-details') return state
      return { phase: 'generating-answer', question: state.question, personalDetails: action.personalDetails }

    case 'ANSWER_GENERATED':
      return { phase: 'studying', personalAnswer: action.personalAnswer }

    case 'START_PRACTICE':
      if (state.phase !== 'studying') return state
      return { phase: 'guided-practicing', personalAnswer: state.personalAnswer }

    case 'SUBMIT_RECORDING':
      if (state.phase !== 'guided-practicing') return state
      return { phase: 'guided-evaluating', personalAnswer: state.personalAnswer, transcript: action.transcript }

    case 'EVALUATION_COMPLETE':
      if (state.phase !== 'guided-evaluating') return state
      return { phase: 'guided-results', personalAnswer: state.personalAnswer, evaluation: action.evaluation }

    case 'RETRY_PRACTICE':
      if (state.phase !== 'guided-results') return state
      return { phase: 'guided-practicing', personalAnswer: state.personalAnswer }

    case 'BACK_TO_STUDY':
      if (state.phase !== 'guided-results' && state.phase !== 'guided-practicing') return state
      return { phase: 'studying', personalAnswer: state.personalAnswer }

    case 'EDIT_DETAILS':
      if (state.phase !== 'studying') return state
      return { phase: 'filling-details', question: state.personalAnswer.question }

    case 'LOAD_EXISTING':
      return { phase: 'studying', personalAnswer: action.personalAnswer }

    case 'ERROR':
      return { phase: 'error', message: action.message }

    default:
      return state
  }
}

interface StudySessionProps {
  part: SpeakingPart
  topic: Topic
}

export default function StudySession({ part, topic }: StudySessionProps) {
  const [state, dispatch] = useReducer(studyReducer, { phase: 'selecting-question' })
  const [existingAnswers, setExistingAnswers] = useState<PersonalAnswer[]>([])
  const [loadingExisting, setLoadingExisting] = useState(true)

  // Load existing personal answers for this topic on mount
  useEffect(() => {
    fetch(`/api/speaking/personal-answer?topicId=${topic.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.personalAnswers) setExistingAnswers(data.personalAnswers) })
      .catch(() => { /* not critical — user can start fresh */ })
      .finally(() => setLoadingExisting(false))
  }, [topic.id])

  const generateAnswer = useCallback(async (question: string, personalDetails: Record<string, string>) => {
    dispatch({ type: 'SUBMIT_DETAILS', personalDetails })
    try {
      const res = await fetch('/api/speaking/personal-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ part, topicId: topic.id, question, personalDetails }),
      })
      if (!res.ok) throw new Error('Failed to generate answer')
      const data = await res.json()
      dispatch({ type: 'ANSWER_GENERATED', personalAnswer: data.personalAnswer })
    } catch (err) {
      dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : 'Failed to generate answer' })
    }
  }, [part, topic.id])

  const handleRecordingComplete = useCallback((transcript: string) => {
    dispatch({ type: 'SUBMIT_RECORDING', transcript })
    // Trigger evaluation
    evaluateRecording(transcript)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const evaluateRecording = async (transcript: string) => {
    if (state.phase !== 'guided-practicing' && state.phase !== 'guided-evaluating') return
    const personalAnswer = state.personalAnswer

    try {
      const res = await fetch('/api/speaking/guided-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part,
          topicId: topic.id,
          question: personalAnswer.question,
          transcript,
          personalAnswerId: personalAnswer.id,
        }),
      })
      if (!res.ok) throw new Error('Failed to evaluate')
      const data = await res.json()
      dispatch({ type: 'EVALUATION_COMPLETE', evaluation: data.evaluation as GuidedEvaluationResult })
    } catch (err) {
      dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : 'Failed to evaluate' })
    }
  }

  // Derive level indicator state from phase in a single pass
  const { currentLevel, completedLevels } = (() => {
    const phase = state.phase
    const inLevel2 = phase === 'guided-practicing' || phase === 'guided-evaluating' || phase === 'guided-results'
    return {
      currentLevel: (inLevel2 ? 2 : 1) as 1 | 2,
      completedLevels: [
        ...(inLevel2 ? [1 as const] : []),
        ...(phase === 'guided-results' ? [2 as const] : []),
      ] as (1 | 2 | 3)[],
    }
  })()

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
        <span className="text-sm text-gray-700 font-medium">
          {topic.icon} {topic.name}
        </span>
      </div>

      {/* Level Indicator */}
      {state.phase !== 'error' && (
        <LevelIndicator currentLevel={currentLevel} completedLevels={completedLevels} />
      )}

      {/* SELECTING QUESTION */}
      {state.phase === 'selecting-question' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <div className="text-4xl mb-3">{topic.icon}</div>
            <h1 className="text-xl font-bold text-gray-900">{topic.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Choose a question to practice</p>
          </div>

          {loadingExisting ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="space-y-2">
              {topic.questions.map((q, i) => {
                const existing = existingAnswers.find(a => a.question === q)
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (existing) {
                        dispatch({ type: 'LOAD_EXISTING', personalAnswer: existing })
                      } else {
                        dispatch({ type: 'SELECT_QUESTION', question: q })
                      }
                    }}
                    className="w-full text-left bg-white rounded-xl border border-gray-100 p-4 hover:border-amber-200 hover:bg-amber-50/50 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-gray-800 font-medium">{q}</p>
                      {existing ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex-shrink-0">
                          Studied
                        </span>
                      ) : (
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-amber-500 transition-colors flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* FILLING DETAILS */}
      {state.phase === 'filling-details' && (
        <div className="space-y-4">
          <QuestionCard
            question={state.question}
            partNum={part}
            index={0}
            total={1}
          />
          <PersonalDetailsForm
            prompts={topic.personalDetailPrompts}
            onSubmit={(details) => generateAnswer(state.question, details)}
            isLoading={false}
          />
        </div>
      )}

      {/* GENERATING ANSWER */}
      {state.phase === 'generating-answer' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-medium text-gray-900">Creating your personalized answer...</p>
          <p className="text-sm text-gray-400 mt-1">Making a Band 7 version of your story</p>
        </div>
      )}

      {/* STUDYING (Level 1) */}
      {state.phase === 'studying' && (
        <div className="space-y-4">
          <QuestionCard
            question={state.personalAnswer.question}
            partNum={part}
            index={0}
            total={1}
          />
          <PersonalizedAnswer
            modelAnswer={state.personalAnswer.model_answer}
            upgradePhrases={state.personalAnswer.upgrade_phrases || []}
            grammarPatterns={state.personalAnswer.grammar_patterns || []}
            speakingTips={state.personalAnswer.speaking_tips || []}
            onStartPractice={() => dispatch({ type: 'START_PRACTICE' })}
            onEditDetails={() => dispatch({ type: 'EDIT_DETAILS' })}
          />
        </div>
      )}

      {/* GUIDED PRACTICING (Level 2) */}
      {state.phase === 'guided-practicing' && (
        <div className="flex gap-4">
          <div className="flex-1 space-y-4">
            <QuestionCard
              question={state.personalAnswer.question}
              partNum={part}
              index={0}
              total={1}
            />
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <AudioRecorder
                maxDuration={part === 2 ? 120 : 60}
                onComplete={handleRecordingComplete}
              />
            </div>
            <button
              onClick={() => dispatch({ type: 'BACK_TO_STUDY' })}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              &larr; Back to model answer
            </button>
          </div>
          <HintPanel
            upgradePhrases={state.personalAnswer.upgrade_phrases || []}
            personalDetails={state.personalAnswer.personal_details as Record<string, string>}
            speakingTips={state.personalAnswer.speaking_tips || []}
          />
        </div>
      )}

      {/* GUIDED EVALUATING */}
      {state.phase === 'guided-evaluating' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-medium text-gray-900">Reviewing your practice...</p>
          <p className="text-sm text-gray-400 mt-1">Comparing with your personalized answer</p>
        </div>
      )}

      {/* GUIDED RESULTS */}
      {state.phase === 'guided-results' && (
        <GuidedResultsView
          evaluation={state.evaluation}
          part={part}
          onRetry={() => dispatch({ type: 'RETRY_PRACTICE' })}
          onNextLevel={() => {
            // Navigate to mock test
            window.location.href = `/practice/speaking/${part}`
          }}
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
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => dispatch({ type: 'SELECT_QUESTION', question: topic.questions[0] })}
              className="py-2.5 px-5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition"
            >
              Try Again
            </button>
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
