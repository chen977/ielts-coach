'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function SpeakingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Speaking practice error:', error)
  }, [error])

  return (
    <div className="max-w-lg mx-auto py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Speaking Practice Error</h2>
      <p className="text-sm text-gray-500 mb-2">
        An error occurred during speaking practice.
      </p>
      <p className="text-xs text-gray-400 mb-6">
        If you&apos;re on iOS, some features require Safari. Chrome on iOS doesn&apos;t support speech recognition — try typing your response instead.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={reset}
          className="py-2.5 px-6 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition"
        >
          Try Again
        </button>
        <Link
          href="/practice/speaking"
          className="py-2.5 px-6 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-xl transition text-center"
        >
          Back to Speaking Hub
        </Link>
      </div>
    </div>
  )
}
