import { createClient } from '@/lib/supabase/server'
import type { SpeakingSession, ListeningSession } from '@/lib/supabase/types'
import Link from 'next/link'
import HistoryClient from '@/components/history/HistoryClient'

type HistoryItem =
  | { type: 'speaking'; id: string; part: number; scores: Record<string, unknown> | null; created_at: string }
  | { type: 'listening'; id: string; section: number; score: number | null; band_estimate: number | null; created_at: string }

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: speakingData } = await supabase
    .from('speaking_sessions')
    .select('id, part, scores, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)
  const { data: listeningData } = await supabase
    .from('listening_sessions')
    .select('id, section, score, band_estimate, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const speaking = (speakingData ?? []) as Pick<SpeakingSession, 'id' | 'part' | 'scores' | 'created_at'>[]
  const listening = (listeningData ?? []) as Pick<ListeningSession, 'id' | 'section' | 'score' | 'band_estimate' | 'created_at'>[]

  const items: HistoryItem[] = [
    ...speaking.map(s => ({ type: 'speaking' as const, id: s.id, part: s.part, scores: s.scores as Record<string, unknown> | null, created_at: s.created_at })),
    ...listening.map(l => ({ type: 'listening' as const, id: l.id, section: l.section, score: l.score, band_estimate: l.band_estimate, created_at: l.created_at })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Practice History</h1>
        <p className="mt-1 text-gray-500">All your completed sessions and scores.</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No sessions yet</h2>
          <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
            Complete your first Speaking or Listening practice to see your history here.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/practice/speaking" className="py-2.5 px-5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition">
              Speaking Practice
            </Link>
            <Link href="/practice/listening" className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition">
              Listening Practice
            </Link>
          </div>
        </div>
      ) : (
        <HistoryClient items={items} />
      )}
    </div>
  )
}
