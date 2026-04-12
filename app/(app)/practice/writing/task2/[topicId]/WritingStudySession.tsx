'use client'

import { useReducer, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type {
  WritingTopic,
  WritingStudySessionState,
  WritingStudySessionAction,
  PersonalEssay,
  WritingEvaluationResult,
  ModelEssayData,
} from '@/lib/writing/types'
import { ESSAY_TYPES } from '@/lib/writing/topics'
import LevelIndicator from '@/components/speaking/LevelIndicator'
import IdeaForm from '@/components/writing/IdeaForm'
import ModelEssayView from '@/components/writing/ModelEssayView'
import WritingEditor from '@/components/writing/WritingEditor'
import WritingHintPanel from '@/components/writing/WritingHintPanel'
import WritingResults from '@/components/writing/WritingResults'

function studyReducer(state: WritingStudySessionState, action: WritingStudySessionAction): WritingStudySessionState {
  switch (action.type) {
    case 'SELECT_TOPIC':
      return { phase: 'filling-ideas', topic: action.topic }

    case 'SUBMIT_IDEAS':
      if (state.phase !== 'filling-ideas') return state
      return { phase: 'generating-essay', topic: state.topic, personalIdeas: action.personalIdeas }

    case 'ESSAY_GENERATED':
      return { phase: 'studying', personalEssay: action.personalEssay }

    case 'START_WRITING':
      if (state.phase !== 'studying') return state
      return { phase: 'writing', personalEssay: state.personalEssay }

    case 'SUBMIT_ESSAY':
      if (state.phase !== 'writing') return state
      return {
        phase: 'evaluating',
        personalEssay: state.personalEssay,
        userEssay: action.userEssay,
        wordCount: action.wordCount,
        timeSpent: action.timeSpent,
      }

    case 'EVALUATION_COMPLETE':
      if (state.phase !== 'evaluating') return state
      return {
        phase: 'results',
        personalEssay: state.personalEssay,
        userEssay: state.userEssay,
        evaluation: action.evaluation,
      }

    case 'RETRY_WRITING':
      if (state.phase !== 'results') return state
      return { phase: 'writing', personalEssay: state.personalEssay }

    case 'BACK_TO_STUDY':
      if (state.phase !== 'writing' && state.phase !== 'results') return state
      return { phase: 'studying', personalEssay: state.personalEssay }

    case 'EDIT_IDEAS':
      if (state.phase !== 'studying') return state
      return { phase: 'filling-ideas', topic: { id: state.personalEssay.topic_id } as WritingTopic }

    case 'LOAD_EXISTING':
      return { phase: 'studying', personalEssay: action.personalEssay }

    case 'ERROR':
      return { phase: 'error', message: action.message }

    default:
      return state
  }
}

interface WritingStudySessionProps {
  topic: WritingTopic
}

export default function WritingStudySession({ topic }: WritingStudySessionProps) {
  const [state, dispatch] = useReducer(studyReducer, { phase: 'selecting-topic' })
  const [loadingExisting, setLoadingExisting] = useState(true)
  const [wordCount, setWordCount] = useState(0)

  // Load existing personal essay on mount
  useEffect(() => {
    fetch(`/api/writing/personal-essay?topicId=${topic.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.personalEssay) {
          dispatch({ type: 'LOAD_EXISTING', personalEssay: data.personalEssay })
        }
      })
      .catch(() => { /* not critical */ })
      .finally(() => setLoadingExisting(false))
  }, [topic.id])

  const generateEssay = useCallback(async (personalIdeas: Record<string, string>) => {
    dispatch({ type: 'SUBMIT_IDEAS', personalIdeas })
    try {
      const res = await fetch('/api/writing/personal-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 2,
          topicId: topic.id,
          topicText: topic.topic,
          essayType: topic.essayType,
          personalIdeas,
        }),
      })
      if (!res.ok) throw new Error('Failed to generate essay')
      const data = await res.json()
      dispatch({ type: 'ESSAY_GENERATED', personalEssay: data.personalEssay })
    } catch (err) {
      dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : 'Failed to generate essay' })
    }
  }, [topic])

  const evaluateEssay = useCallback(async (userEssay: string, wc: number, timeSpent: number) => {
    dispatch({ type: 'SUBMIT_ESSAY', userEssay, wordCount: wc, timeSpent })

    if (state.phase !== 'writing') return
    const personalEssay = state.personalEssay

    try {
      const res = await fetch('/api/writing/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 2,
          topicId: topic.id,
          topicText: topic.topic,
          userEssay,
          essayType: topic.essayType,
          personalEssayId: personalEssay.id,
          level: 2,
          timeSpent,
          modelEssay: personalEssay.model_essay,
        }),
      })
      if (!res.ok) throw new Error('Failed to evaluate')
      const data = await res.json()
      dispatch({ type: 'EVALUATION_COMPLETE', evaluation: data.evaluation as WritingEvaluationResult })
    } catch (err) {
      dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : 'Failed to evaluate' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, topic])

  const essayTypeConfig = ESSAY_TYPES[topic.essayType]

  // Level indicator state
  const { currentLevel, completedLevels } = (() => {
    const phase = state.phase
    const inLevel2 = phase === 'writing' || phase === 'evaluating' || phase === 'results'
    return {
      currentLevel: (inLevel2 ? 2 : 1) as 1 | 2,
      completedLevels: [
        ...(inLevel2 ? [1 as const] : []),
        ...(phase === 'results' ? [2 as const] : []),
      ] as (1 | 2 | 3)[],
    }
  })()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/practice/writing"
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

      {/* SELECTING TOPIC */}
      {state.phase === 'selecting-topic' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{topic.icon}</span>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{topic.name}</h1>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {essayTypeConfig.name}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mt-3">
              <p className="text-sm text-gray-800 leading-relaxed italic">{topic.topic}</p>
            </div>
          </div>

          {loadingExisting ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <button
              onClick={() => dispatch({ type: 'SELECT_TOPIC', topic })}
              className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
            >
              Start Learning
            </button>
          )}
        </div>
      )}

      {/* FILLING IDEAS */}
      {state.phase === 'filling-ideas' && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-800 leading-relaxed italic">{topic.topic}</p>
          </div>
          <IdeaForm
            prompts={topic.ideaPrompts}
            essayType={topic.essayType}
            onSubmit={(ideas) => generateEssay(ideas)}
            isLoading={false}
          />
        </div>
      )}

      {/* GENERATING ESSAY */}
      {state.phase === 'generating-essay' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-medium text-gray-900">Creating your personalized essay...</p>
          <p className="text-sm text-gray-400 mt-1">Writing a Band 7 version using your ideas</p>
        </div>
      )}

      {/* STUDYING (Level 1) */}
      {state.phase === 'studying' && state.personalEssay.model_essay_data && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-800 leading-relaxed italic">{topic.topic}</p>
          </div>
          <ModelEssayView
            data={state.personalEssay.model_essay_data as ModelEssayData}
            onStartWriting={() => dispatch({ type: 'START_WRITING' })}
            onEditIdeas={() => dispatch({ type: 'EDIT_IDEAS' })}
          />
        </div>
      )}

      {/* WRITING (Level 2) */}
      {state.phase === 'writing' && (
        <div className="flex gap-4">
          <div className="flex-1 space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-800 leading-relaxed italic">{topic.topic}</p>
            </div>
            <WritingEditor
              minWords={250}
              onSubmit={evaluateEssay}
            />
            <button
              onClick={() => dispatch({ type: 'BACK_TO_STUDY' })}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              &larr; Back to model essay
            </button>
          </div>
          {state.personalEssay.model_essay_data && (
            <WritingHintPanel
              essayData={state.personalEssay.model_essay_data as ModelEssayData}
              essayType={topic.essayType}
              personalIdeas={(state.personalEssay.personal_ideas as Record<string, string>) || {}}
              wordCount={wordCount}
              minWords={250}
            />
          )}
        </div>
      )}

      {/* EVALUATING */}
      {state.phase === 'evaluating' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-medium text-gray-900">Evaluating your essay...</p>
          <p className="text-sm text-gray-400 mt-1">Checking grammar, vocabulary, and structure</p>
        </div>
      )}

      {/* RESULTS */}
      {state.phase === 'results' && (
        <WritingResults
          evaluation={state.evaluation}
          userEssay={state.userEssay}
          modelEssay={state.personalEssay.model_essay}
          task={2}
          onRetry={() => dispatch({ type: 'RETRY_WRITING' })}
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
              onClick={() => dispatch({ type: 'SELECT_TOPIC', topic })}
              className="py-2.5 px-5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition"
            >
              Try Again
            </button>
            <Link
              href="/practice/writing"
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
