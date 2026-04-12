'use client'

import { useState } from 'react'
import type { IdeaPrompt, EssayType } from '@/lib/writing/types'
import { ESSAY_TYPES } from '@/lib/writing/topics'

interface IdeaFormProps {
  prompts: IdeaPrompt[]
  essayType: EssayType
  initialValues?: Record<string, string>
  onSubmit: (ideas: Record<string, string>) => void
  isLoading: boolean
}

export default function IdeaForm({
  prompts,
  essayType,
  initialValues,
  onSubmit,
  isLoading,
}: IdeaFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const p of prompts) {
      init[p.field] = initialValues?.[p.field] || ''
    }
    return init
  })

  const allFilled = prompts.every(p => values[p.field]?.trim())
  const essayTypeConfig = ESSAY_TYPES[essayType]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (allFilled && !isLoading) {
      onSubmit(values)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-amber-800">Share your ideas</h3>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
            {essayTypeConfig.name}
          </span>
        </div>
        <p className="text-sm text-amber-700">
          Write your thoughts in simple English — we&apos;ll create a Band 7 essay using your ideas.
        </p>
      </div>

      <div className="space-y-3">
        {prompts.map(prompt => (
          <div key={prompt.field}>
            <label htmlFor={prompt.field} className="block text-sm font-medium text-gray-700 mb-1">
              {prompt.label}
            </label>
            <textarea
              id={prompt.field}
              value={values[prompt.field]}
              onChange={e => setValues(prev => ({ ...prev, [prompt.field]: e.target.value }))}
              placeholder={prompt.placeholder}
              disabled={isLoading}
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 resize-none"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={!allFilled || isLoading}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creating your personalized essay...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate My Band 7 Essay
          </>
        )}
      </button>
    </form>
  )
}
