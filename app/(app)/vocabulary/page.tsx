import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import VocabularyClient from '@/components/vocabulary/VocabularyClient'

export default async function VocabularyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date().toISOString().split('T')[0]

  const [{ count: totalWords }, { count: dueWords }, { count: masteredWords }] = await Promise.all([
    supabase.from('vocabulary').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase
      .from('vocabulary')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .lte('next_review_date', today),
    supabase
      .from('vocabulary')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('srs_box', 5),
  ])

  const total = totalWords ?? 0
  const due = dueWords ?? 0
  const mastered = masteredWords ?? 0
  const masteryPct = total > 0 ? Math.round((mastered / total) * 100) : 0
  const isEmpty = total === 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vocabulary Builder</h1>
        <p className="mt-1 text-gray-500">
          Words collected from your practice sessions, reviewed with spaced repetition.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Total words</p>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Due for review</p>
          <p className={`text-2xl font-bold ${due > 0 ? 'text-amber-500' : 'text-gray-900'}`}>
            {due}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 col-span-2 sm:col-span-1">
          <p className="text-sm text-gray-500 mb-1">Mastery (Box 5)</p>
          <p className="text-2xl font-bold text-gray-900">{masteryPct}%</p>
          <p className="text-xs text-gray-400">{mastered} of {total} words</p>
        </div>
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No words yet</h2>
          <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
            Complete a Speaking or Listening session and vocabulary will be automatically extracted
            and added here for you to review.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/practice/speaking"
              className="py-2.5 px-5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition"
            >
              Speaking Practice
            </Link>
            <Link
              href="/practice/listening"
              className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition"
            >
              Listening Practice
            </Link>
          </div>
        </div>
      ) : (
        <VocabularyClient
          initialDueCount={due}
          initialTotalCount={total}
          initialMasteredCount={mastered}
        />
      )}
    </div>
  )
}
