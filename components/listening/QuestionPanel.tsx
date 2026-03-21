'use client'

import type { QuestionGroup, ListeningQuestion, QuestionResult } from '@/lib/listening/types'

interface QuestionPanelProps {
  questionGroups: QuestionGroup[]
  userAnswers: Record<number, string>
  onAnswerChange: (questionId: number, answer: string) => void
  disabled?: boolean
  showResults?: boolean
  results?: QuestionResult[]
}

function getResultForQuestion(results: QuestionResult[] | undefined, id: number) {
  return results?.find(r => r.questionId === id)
}

function FormFillInput({
  q,
  value,
  onChange,
  disabled,
  result,
}: {
  q: { id: number; label: string; correctAnswer: string }
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  result?: QuestionResult
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs font-bold text-gray-400 mt-2.5 w-6 text-right flex-shrink-0">{q.id}</span>
      <div className="flex-1">
        <label className="text-sm text-gray-600 mb-1 block">{q.label}</label>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Type your answer..."
          className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition
            ${result
              ? result.isCorrect
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-red-300 bg-red-50'
              : 'border-gray-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-200'
            }
            ${disabled ? 'bg-gray-50 text-gray-500' : ''}`}
        />
        {result && !result.isCorrect && (
          <p className="text-xs text-emerald-600 mt-1">
            Correct answer: <span className="font-medium">{result.correctAnswer}</span>
          </p>
        )}
      </div>
      {result && (
        <span className="mt-2.5 flex-shrink-0">
          {result.isCorrect ? (
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </span>
      )}
    </div>
  )
}

function MultipleChoiceInput({
  q,
  value,
  onChange,
  disabled,
  result,
}: {
  q: { id: number; question: string; options: { label: string; value: string }[]; correctAnswer: string }
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  result?: QuestionResult
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs font-bold text-gray-400 mt-0.5 w-6 text-right flex-shrink-0">{q.id}</span>
      <div className="flex-1">
        <p className="text-sm text-gray-700 mb-2">{q.question}</p>
        <div className="space-y-1.5">
          {q.options.map(opt => {
            const isSelected = value === opt.value
            const isCorrect = result && opt.value === result.correctAnswer
            const isWrong = result && isSelected && !result.isCorrect

            return (
              <label
                key={opt.value}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm cursor-pointer transition
                  ${isCorrect ? 'border-emerald-300 bg-emerald-50' : ''}
                  ${isWrong ? 'border-red-300 bg-red-50' : ''}
                  ${!result && isSelected ? 'border-sky-400 bg-sky-50' : ''}
                  ${!result && !isSelected ? 'border-gray-200 hover:border-gray-300' : ''}
                  ${disabled ? 'cursor-default' : ''}`}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  value={opt.value}
                  checked={isSelected}
                  onChange={() => onChange(opt.value)}
                  disabled={disabled}
                  className="accent-sky-500"
                />
                <span className="font-medium text-gray-500 w-4">{opt.value}</span>
                <span className="text-gray-700">{opt.label}</span>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MatchingInput({
  q,
  value,
  onChange,
  disabled,
  result,
}: {
  q: { id: number; item: string; options: string[]; correctAnswer: string }
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  result?: QuestionResult
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs font-bold text-gray-400 mt-2.5 w-6 text-right flex-shrink-0">{q.id}</span>
      <div className="flex-1">
        <p className="text-sm text-gray-700 mb-1">{q.item}</p>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition appearance-none bg-white
            ${result
              ? result.isCorrect
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-red-300 bg-red-50'
              : 'border-gray-200 focus:border-sky-400'
            }
            ${disabled ? 'bg-gray-50 text-gray-500' : ''}`}
        >
          <option value="">Select an answer...</option>
          {q.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {result && !result.isCorrect && (
          <p className="text-xs text-emerald-600 mt-1">
            Correct answer: <span className="font-medium">{result.correctAnswer}</span>
          </p>
        )}
      </div>
      {result && (
        <span className="mt-2.5 flex-shrink-0">
          {result.isCorrect ? (
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </span>
      )}
    </div>
  )
}

function SentenceCompletionInput({
  q,
  value,
  onChange,
  disabled,
  result,
}: {
  q: { id: number; sentence: string; correctAnswer: string }
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  result?: QuestionResult
}) {
  // Split sentence at the blank marker
  const parts = q.sentence.split('______')

  return (
    <div className="flex items-start gap-3">
      <span className="text-xs font-bold text-gray-400 mt-2.5 w-6 text-right flex-shrink-0">{q.id}</span>
      <div className="flex-1">
        <div className="text-sm text-gray-700 leading-relaxed">
          {parts[0]}
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            placeholder="..."
            className={`inline-block w-40 mx-1 px-2 py-0.5 text-sm border-b-2 outline-none transition bg-transparent
              ${result
                ? result.isCorrect
                  ? 'border-emerald-400 text-emerald-700'
                  : 'border-red-400 text-red-700'
                : 'border-gray-300 focus:border-sky-400'
              }
              ${disabled ? 'text-gray-500' : ''}`}
          />
          {parts[1]}
        </div>
        {result && !result.isCorrect && (
          <p className="text-xs text-emerald-600 mt-1">
            Correct answer: <span className="font-medium">{result.correctAnswer}</span>
          </p>
        )}
      </div>
      {result && (
        <span className="mt-2.5 flex-shrink-0">
          {result.isCorrect ? (
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </span>
      )}
    </div>
  )
}

function QuestionInput({
  question,
  value,
  onChange,
  disabled,
  result,
}: {
  question: ListeningQuestion
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  result?: QuestionResult
}) {
  switch (question.type) {
    case 'form_fill':
      return <FormFillInput q={question} value={value} onChange={onChange} disabled={disabled} result={result} />
    case 'multiple_choice':
      return <MultipleChoiceInput q={question} value={value} onChange={onChange} disabled={disabled} result={result} />
    case 'matching':
      return <MatchingInput q={question} value={value} onChange={onChange} disabled={disabled} result={result} />
    case 'sentence_completion':
      return <SentenceCompletionInput q={question} value={value} onChange={onChange} disabled={disabled} result={result} />
  }
}

export default function QuestionPanel({
  questionGroups,
  userAnswers,
  onAnswerChange,
  disabled,
  showResults,
  results,
}: QuestionPanelProps) {
  return (
    <div className="space-y-6">
      {questionGroups.map((group, gi) => (
        <div key={gi} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 bg-gray-50">
            <p className="text-sm font-medium text-gray-700">{group.instructions}</p>
          </div>

          {group.contextLabel && (
            <div className="mx-5 mt-4 mb-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{group.contextLabel}</p>
            </div>
          )}

          <div className="p-5 space-y-4">
            {group.questions.map(q => (
              <QuestionInput
                key={q.id}
                question={q}
                value={userAnswers[q.id] || ''}
                onChange={v => onAnswerChange(q.id, v)}
                disabled={disabled}
                result={showResults ? getResultForQuestion(results, q.id) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
