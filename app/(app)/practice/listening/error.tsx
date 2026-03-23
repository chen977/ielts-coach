'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ListeningError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Listening practice error:', error)
  }, [error])

  return (
    <div className="max-w-lg mx-auto py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Listening Practice Error</h2>
      <p className="text-sm text-gray-500 mb-2">
        An error occurred during listening practice.
      </p>
      <p className="text-xs text-gray-400 mb-6">
        Audio playback may not be fully supported in this browser. For the best experience, use Safari on iOS or Chrome on desktop.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={reset}
          className="py-2.5 px-6 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition"
        >
          Try Again
        </button>
        <Link
          href="/practice/listening"
          className="py-2.5 px-6 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-xl transition text-center"
        >
          Back to Listening Hub
        </Link>
      </div>
    </div>
  )
}
