'use client'

import { useReducer, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type {
  ChartTypeConfig,
  Task1StudySessionState,
  Task1StudySessionAction,
  PersonalEssay,
  Task1ModelData,
  WritingEvaluationResult,
  DataLanguagePhrase,
} from '@/lib/writing/types'
import LevelIndicator from '@/components/speaking/LevelIndicator'
import ChartDisplay from '@/components/writing/ChartDisplay'
import WritingEditor from '@/components/writing/WritingEditor'
import WritingResults from '@/components/writing/WritingResults'

function task1Reducer(state: Task1StudySessionState, action: Task1StudySessionAction): Task1StudySessionState {
  switch (action.type) {
    case 'SELECT_CHART':
      return { phase: 'generating-chart', chartType: action.chartType }

    case 'CHART_GENERATED':
      return { phase: 'studying', personalEssay: action.personalEssay, modelData: action.modelData }

    case 'START_WRITING':
      if (state.phase !== 'studying') return state
      return { phase: 'writing', personalEssay: state.personalEssay, modelData: state.modelData }

    case 'SUBMIT_DESCRIPTION':
      if (state.phase !== 'writing') return state
      return {
        phase: 'evaluating',
        personalEssay: state.personalEssay,
        modelData: state.modelData,
        userDescription: action.userDescription,
        wordCount: action.wordCount,
        timeSpent: action.timeSpent,
      }

    case 'EVALUATION_COMPLETE':
      if (state.phase !== 'evaluating') return state
      return {
        phase: 'results',
        personalEssay: state.personalEssay,
        modelData: state.modelData,
        userDescription: state.userDescription,
        evaluation: action.evaluation,
      }

    case 'RETRY_WRITING':
      if (state.phase !== 'results') return state
      return { phase: 'writing', personalEssay: state.personalEssay, modelData: state.modelData }

    case 'BACK_TO_STUDY':
      if (state.phase !== 'writing' && state.phase !== 'results') return state
      return { phase: 'studying', personalEssay: state.personalEssay, modelData: state.modelData }

    case 'LOAD_EXISTING':
      return { phase: 'studying', personalEssay: action.personalEssay, modelData: action.modelData }

    case 'ERROR':
      return { phase: 'error', message: action.message }

    default:
      return state
  }
}

interface WritingTask1SessionProps {
  chartTypeConfig: ChartTypeConfig
}

export default function WritingTask1Session({ chartTypeConfig }: WritingTask1SessionProps) {
  const [state, dispatch] = useReducer(task1Reducer, { phase: 'selecting-chart' })
  const [loadingExisting, setLoadingExisting] = useState(true)

  // Load existing or auto-generate
  useEffect(() => {
    fetch(`/api/writing/personal-essay?topicId=${chartTypeConfig.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.personalEssay?.model_essay_data) {
          dispatch({
            type: 'LOAD_EXISTING',
            personalEssay: data.personalEssay,
            modelData: data.personalEssay.model_essay_data as Task1ModelData,
          })
        }
      })
      .catch(() => { /* not critical */ })
      .finally(() => setLoadingExisting(false))
  }, [chartTypeConfig.id])

  const generateChart = useCallback(async () => {
    dispatch({ type: 'SELECT_CHART', chartType: chartTypeConfig.chartType })
    try {
      const res = await fetch('/api/writing/generate-task1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartType: chartTypeConfig.chartType, chartTypeId: chartTypeConfig.id }),
      })
      if (!res.ok) throw new Error('Failed to generate chart')
      const data = await res.json()
      dispatch({
        type: 'CHART_GENERATED',
        personalEssay: data.personalEssay,
        modelData: data.modelData as Task1ModelData,
      })
    } catch (err) {
      dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : 'Failed to generate chart' })
    }
  }, [chartTypeConfig])

  const evaluateDescription = useCallback(async (userDescription: string, wordCount: number, timeSpent: number) => {
    dispatch({ type: 'SUBMIT_DESCRIPTION', userDescription, wordCount, timeSpent })

    if (state.phase !== 'writing') return
    const { personalEssay, modelData } = state

    try {
      const res = await fetch('/api/writing/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 1,
          topicId: chartTypeConfig.id,
          topicText: modelData.chartTitle,
          userEssay: userDescription,
          personalEssayId: personalEssay.id,
          level: 2,
          timeSpent,
          chartData: modelData,
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
  }, [state, chartTypeConfig])

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
        <Link href="/practice/writing" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-700 font-medium">
          {chartTypeConfig.icon} {chartTypeConfig.name}
        </span>
      </div>

      {state.phase !== 'error' && (
        <LevelIndicator currentLevel={currentLevel} completedLevels={completedLevels} />
      )}

      {/* SELECTING CHART */}
      {state.phase === 'selecting-chart' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <div className="text-4xl mb-3">{chartTypeConfig.icon}</div>
            <h1 className="text-xl font-bold text-gray-900">{chartTypeConfig.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{chartTypeConfig.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
              {chartTypeConfig.keyLanguage.slice(0, 6).map((phrase, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-sky-50 text-sky-700 rounded-full">{phrase}</span>
              ))}
            </div>
          </div>

          {loadingExisting ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <button
              onClick={generateChart}
              className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
            >
              Generate Chart & Model Description
            </button>
          )}
        </div>
      )}

      {/* GENERATING CHART */}
      {state.phase === 'generating-chart' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-medium text-gray-900">Generating chart data...</p>
          <p className="text-sm text-gray-400 mt-1">Creating a realistic IELTS chart with model description</p>
        </div>
      )}

      {/* STUDYING (Level 1) */}
      {state.phase === 'studying' && (
        <div className="space-y-4">
          <ChartDisplay data={state.modelData} />

          {/* Model Description */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Model Description</h3>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-sky-100 text-sky-700">Band 7</span>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
              {state.modelData.modelDescription}
            </p>
          </div>

          {/* Data Language */}
          {state.modelData.dataLanguage && state.modelData.dataLanguage.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Data Language</h4>
              <div className="space-y-2">
                {(state.modelData.dataLanguage as DataLanguagePhrase[]).map((dl, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded mt-0.5 bg-sky-100 text-sky-600">D</span>
                    <div>
                      <span className="text-sm font-medium text-gray-800">{dl.phrase}</span>
                      <span className="text-sm text-gray-500"> — {dl.definition}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => dispatch({ type: 'START_WRITING' })}
            className="w-full py-3 px-6 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Now Write Your Own Description
          </button>
        </div>
      )}

      {/* WRITING (Level 2) */}
      {state.phase === 'writing' && (
        <div className="space-y-4">
          <ChartDisplay data={state.modelData} />
          <WritingEditor
            minWords={150}
            onSubmit={evaluateDescription}
          />
          <button
            onClick={() => dispatch({ type: 'BACK_TO_STUDY' })}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            &larr; Back to model description
          </button>
        </div>
      )}

      {/* EVALUATING */}
      {state.phase === 'evaluating' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-medium text-gray-900">Evaluating your description...</p>
          <p className="text-sm text-gray-400 mt-1">Checking data language, accuracy, and structure</p>
        </div>
      )}

      {/* RESULTS */}
      {state.phase === 'results' && (
        <WritingResults
          evaluation={state.evaluation}
          userEssay={state.userDescription}
          modelEssay={state.personalEssay.model_essay}
          task={1}
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
          <p className="font-medium text-gray-900">Something went wrong</p>
          <p className="text-sm text-gray-500">{state.message}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={generateChart} className="py-2.5 px-5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition">
              Try Again
            </button>
            <Link href="/practice/writing" className="py-2.5 px-5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-xl transition text-center">
              Back to Hub
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
