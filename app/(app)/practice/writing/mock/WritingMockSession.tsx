'use client'

import { useReducer, useCallback } from 'react'
import Link from 'next/link'
import type {
  MockTestState,
  MockTestAction,
  WritingTopic,
  Task1ModelData,
  WritingEvaluationResult,
} from '@/lib/writing/types'
import { TASK2_TOPICS } from '@/lib/writing/topics'
import ChartDisplay from '@/components/writing/ChartDisplay'
import WritingEditor from '@/components/writing/WritingEditor'
import WritingResults from '@/components/writing/WritingResults'

function mockReducer(state: MockTestState, action: MockTestAction): MockTestState {
  switch (action.type) {
    case 'START':
      return { phase: 'generating' }

    case 'GENERATED':
      return { phase: 'task1-writing', chartData: action.chartData, topic: action.topic, startTime: Date.now() }

    case 'SUBMIT_TASK1':
      if (state.phase !== 'task1-writing') return state
      return { phase: 'task2-writing', chartData: state.chartData, task1Essay: action.essay, topic: state.topic, startTime: Date.now() }

    case 'SUBMIT_TASK2':
      if (state.phase !== 'task2-writing') return state
      return { phase: 'evaluating', chartData: state.chartData, task1Essay: state.task1Essay, topic: state.topic, task2Essay: action.essay }

    case 'EVALUATED':
      return { phase: 'results', task1Evaluation: action.task1Evaluation, task2Evaluation: action.task2Evaluation }

    case 'ERROR':
      return { phase: 'error', message: action.message }

    case 'RESTART':
      return { phase: 'idle' }

    default:
      return state
  }
}

export default function WritingMockSession() {
  const [state, dispatch] = useReducer(mockReducer, { phase: 'idle' })

  const startTest = useCallback(async () => {
    dispatch({ type: 'START' })
    try {
      // Generate Task 1 chart
      const chartTypes = ['line', 'bar', 'pie', 'table'] as const
      const randomChart = chartTypes[Math.floor(Math.random() * chartTypes.length)]

      const chartRes = await fetch('/api/writing/generate-task1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartType: randomChart, chartTypeId: `mock_${randomChart}` }),
      })
      if (!chartRes.ok) throw new Error('Failed to generate chart')
      const chartData = await chartRes.json()

      // Pick a random Task 2 topic
      const randomTopic = TASK2_TOPICS[Math.floor(Math.random() * TASK2_TOPICS.length)]

      dispatch({
        type: 'GENERATED',
        chartData: chartData.modelData as Task1ModelData,
        topic: randomTopic,
      })
    } catch (err) {
      dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : 'Failed to start test' })
    }
  }, [])

  const evaluateBoth = useCallback(async (task2Essay: string) => {
    dispatch({ type: 'SUBMIT_TASK2', essay: task2Essay })

    if (state.phase !== 'task2-writing') return

    try {
      const [task1Res, task2Res] = await Promise.all([
        fetch('/api/writing/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: 1,
            topicId: 'mock',
            topicText: state.chartData.chartTitle,
            userEssay: state.task1Essay,
            level: 3,
            timeSpent: 1200,
            chartData: state.chartData,
          }),
        }),
        fetch('/api/writing/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: 2,
            topicId: 'mock',
            topicText: state.topic.topic,
            userEssay: task2Essay,
            essayType: state.topic.essayType,
            level: 3,
            timeSpent: 2400,
          }),
        }),
      ])

      if (!task1Res.ok || !task2Res.ok) throw new Error('Failed to evaluate')

      const [task1Data, task2Data] = await Promise.all([task1Res.json(), task2Res.json()])

      dispatch({
        type: 'EVALUATED',
        task1Evaluation: task1Data.evaluation as WritingEvaluationResult,
        task2Evaluation: task2Data.evaluation as WritingEvaluationResult,
      })
    } catch (err) {
      dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : 'Failed to evaluate' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/practice/writing" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-700 font-medium">Mock Writing Test</span>
      </div>

      {/* IDLE */}
      {state.phase === 'idle' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">IELTS Writing Mock Test</h1>
            <p className="text-sm text-gray-500 mt-2">
              Complete both tasks under timed conditions, just like the real exam.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="bg-sky-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-sky-800">Task 1</p>
              <p className="text-xs text-sky-600 mt-1">Chart description</p>
              <p className="text-lg font-bold text-sky-700 mt-2">20 min</p>
              <p className="text-xs text-sky-500">150+ words</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800">Task 2</p>
              <p className="text-xs text-amber-600 mt-1">Essay writing</p>
              <p className="text-lg font-bold text-amber-700 mt-2">40 min</p>
              <p className="text-xs text-amber-500">250+ words</p>
            </div>
          </div>
          <button
            onClick={startTest}
            className="py-3 px-8 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors"
          >
            Start Mock Test
          </button>
        </div>
      )}

      {/* GENERATING */}
      {state.phase === 'generating' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-medium text-gray-900">Preparing your mock test...</p>
          <p className="text-sm text-gray-400 mt-1">Generating chart and essay topic</p>
        </div>
      )}

      {/* TASK 1 WRITING */}
      {state.phase === 'task1-writing' && (
        <div className="space-y-4">
          <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-sky-800">Task 1</span>
              <span className="text-xs text-sky-600 ml-2">Write at least 150 words</span>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-sky-200 text-sky-800">20 minutes</span>
          </div>
          <ChartDisplay data={state.chartData} />
          <WritingEditor
            minWords={150}
            maxMinutes={20}
            showTimer={true}
            onSubmit={(essay) => dispatch({ type: 'SUBMIT_TASK1', essay })}
          />
        </div>
      )}

      {/* TASK 2 WRITING */}
      {state.phase === 'task2-writing' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-amber-800">Task 2</span>
              <span className="text-xs text-amber-600 ml-2">Write at least 250 words</span>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-200 text-amber-800">40 minutes</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-800 leading-relaxed italic">{state.topic.topic}</p>
          </div>
          <WritingEditor
            minWords={250}
            maxMinutes={40}
            showTimer={true}
            onSubmit={(essay) => evaluateBoth(essay)}
          />
        </div>
      )}

      {/* EVALUATING */}
      {state.phase === 'evaluating' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-medium text-gray-900">Evaluating both tasks...</p>
          <p className="text-sm text-gray-400 mt-1">This may take a moment</p>
        </div>
      )}

      {/* RESULTS */}
      {state.phase === 'results' && (
        <div className="space-y-8">
          {/* Combined score */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-500 mb-3">Combined Writing Band</p>
            <div className="w-28 h-28 rounded-full border-4 border-sky-400 bg-sky-50 flex items-center justify-center mx-auto mb-3">
              <span className="text-4xl font-bold text-sky-600">
                {((state.task1Evaluation.overallBand + state.task2Evaluation.overallBand * 2) / 3).toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-gray-400">(Task 2 weighted 2:1)</p>
          </div>

          <div>
            <h2 className="font-semibold text-gray-900 mb-4">Task 1 Results</h2>
            <WritingResults
              evaluation={state.task1Evaluation}
              userEssay=""
              task={1}
              onRetry={() => dispatch({ type: 'RESTART' })}
            />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900 mb-4">Task 2 Results</h2>
            <WritingResults
              evaluation={state.task2Evaluation}
              userEssay=""
              task={2}
              onRetry={() => dispatch({ type: 'RESTART' })}
            />
          </div>
        </div>
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
          <button onClick={() => dispatch({ type: 'RESTART' })} className="py-2.5 px-5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition">
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}
