'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import WritingTopicCard from '@/components/writing/WritingTopicCard'
import type { WritingTopic, WritingTopicProgress, ChartTypeConfig } from '@/lib/writing/types'
import { ESSAY_TYPES } from '@/lib/writing/topics'

type ActiveTab = 'task2' | 'task1'

interface Task2TopicWithProgress extends WritingTopic {
  progress: WritingTopicProgress | null
}

interface ChartTypeWithProgress extends ChartTypeConfig {
  progress: WritingTopicProgress | null
}

export default function WritingHubPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('task2')
  const [task2Topics, setTask2Topics] = useState<Task2TopicWithProgress[]>([])
  const [task1Types, setTask1Types] = useState<ChartTypeWithProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const task = activeTab === 'task2' ? '2' : '1'
    fetch(`/api/writing/topics?task=${task}`)
      .then(res => res.json())
      .then(data => {
        if (activeTab === 'task2') {
          setTask2Topics(data.topics || [])
        } else {
          setTask1Types(data.topics || [])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [activeTab])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Writing Practice</h1>
        <p className="mt-1 text-gray-500">
          Study model essays, practice writing, and get detailed feedback on your work.
        </p>
      </div>

      {/* Mock Test button */}
      <Link
        href="/practice/writing/mock"
        className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl">
            🎯
          </div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors">
              Full Mock Test
            </p>
            <p className="text-sm text-gray-500">Task 1 (20 min) + Task 2 (40 min) — timed, no hints</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-400 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('task2')}
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'task2'
              ? 'text-amber-600 border-amber-500'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Task 2 — Essays
        </button>
        <button
          onClick={() => setActiveTab('task1')}
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'task1'
              ? 'text-sky-600 border-sky-500'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Task 1 — Charts
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400 mt-2">Loading topics...</p>
        </div>
      ) : activeTab === 'task2' ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {task2Topics.map(topic => (
            <WritingTopicCard
              key={topic.id}
              id={topic.id}
              name={topic.name}
              icon={topic.icon}
              category={topic.category}
              essayType={ESSAY_TYPES[topic.essayType]?.name}
              href={`/practice/writing/task2/${topic.id}`}
              progress={topic.progress}
            />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {task1Types.map(ct => (
            <WritingTopicCard
              key={ct.id}
              id={ct.id}
              name={ct.name}
              icon={ct.icon}
              category={ct.description}
              href={`/practice/writing/task1/${ct.id}`}
              progress={ct.progress}
            />
          ))}
        </div>
      )}
    </div>
  )
}
