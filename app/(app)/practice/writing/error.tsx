'use client'

import Link from 'next/link'

export default function WritingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
      <p className="text-sm text-gray-500 max-w-xs mx-auto">{error.message || 'An unexpected error occurred.'}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="py-2.5 px-5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition"
        >
          Try Again
        </button>
        <Link
          href="/practice/writing"
          className="py-2.5 px-5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-xl transition"
        >
          Back to Writing
        </Link>
      </div>
    </div>
  )
}
