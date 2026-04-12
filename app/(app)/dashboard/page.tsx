import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/supabase/types'
import Link from 'next/link'
import DashboardCharts from '@/components/dashboard/DashboardCharts'
import WeeklyGoals from '@/components/dashboard/WeeklyGoals'

function BandBadge({ band }: { band: number | null }) {
  if (!band) return <span className="text-gray-400 text-sm">—</span>
  const color =
    band >= 7 ? 'bg-emerald-100 text-emerald-700' :
    band >= 6 ? 'bg-sky-100 text-sky-700' :
    'bg-amber-100 text-amber-700'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold ${color}`}>
      {band.toFixed(1)}
    </span>
  )
}

function StatCard({ label, value, sub, href }: { label: string; value: React.ReactNode; sub?: string; href?: string }) {
  const inner = (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

function PracticeCard({
  title,
  description,
  href,
  icon,
  color,
}: {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl border border-gray-100 p-6 flex items-start gap-4 hover:shadow-md hover:border-gray-200 transition-all"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors">{title}</h3>
        <p className="mt-1 text-sm text-gray-500 leading-relaxed">{description}</p>
        <span className="mt-3 inline-flex items-center text-sm font-medium text-sky-600 gap-1">
          Start practice
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const profile = data as Profile | null

  // Fetch counts — default to 0 if any query fails
  let speakingCount = 0
  let listeningCount = 0
  let writingCount = 0
  let vocabCount = 0
  let speakingThisWeek = 0
  let listeningThisWeek = 0
  let writingThisWeek = 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = supabase as any

  try {
    const [spk, lst, wrt, voc] = await Promise.all([
      supabase.from('speaking_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase.from('listening_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      s.from('writing_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase.from('vocabulary').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    ])
    speakingCount = spk.count ?? 0
    listeningCount = lst.count ?? 0
    writingCount = wrt.count ?? 0
    vocabCount = voc.count ?? 0

    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const [spkWeek, lstWeek, wrtWeek] = await Promise.all([
      supabase
        .from('speaking_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .gte('created_at', weekStart.toISOString()),
      supabase
        .from('listening_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .gte('created_at', weekStart.toISOString()),
      s
        .from('writing_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .gte('created_at', weekStart.toISOString()),
    ])
    speakingThisWeek = spkWeek.count ?? 0
    listeningThisWeek = lstWeek.count ?? 0
    writingThisWeek = wrtWeek.count ?? 0
  } catch (err) {
    console.error('Dashboard query error:', err)
  }

  const firstName = profile?.display_name?.split(' ')[0] ?? 'there'
  const totalSessions = speakingCount + listeningCount + writingCount
  const isNewUser = totalSessions === 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good {getTimeOfDay()}, {firstName} 👋
        </h1>
        <p className="mt-1 text-gray-500">
          {isNewUser
            ? "Let's start your IELTS journey. Pick a practice type below."
            : `You're making great progress. Keep it up!`}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Current Band"
          value={<BandBadge band={profile?.current_estimated_band ?? null} />}
          sub={`Target: ${profile?.target_band ?? 7.0}`}
        />
        <StatCard
          label="Streak"
          value={
            <span className="flex items-center gap-1.5">
              {profile?.streak_days ?? 0}
              <span className="text-orange-400">🔥</span>
            </span>
          }
          sub="days in a row"
        />
        <StatCard
          label="Vocabulary"
          value={vocabCount}
          sub="words learned"
          href="/vocabulary"
        />
        <StatCard
          label="Sessions"
          value={totalSessions}
          sub="total practice sessions"
          href="/history"
        />
      </div>

      {/* Weekly goals */}
      <WeeklyGoals
        speakingCurrent={speakingThisWeek}
        speakingGoal={profile?.weekly_speaking_goal ?? 3}
        listeningCurrent={listeningThisWeek}
        listeningGoal={profile?.weekly_listening_goal ?? 2}
        writingCurrent={writingThisWeek}
        writingGoal={(profile as Record<string, unknown>)?.weekly_writing_goal as number ?? 2}
      />

      {/* Charts section */}
      <DashboardCharts
        targetBand={profile?.target_band ?? 7.0}
        streakDays={profile?.streak_days ?? 0}
      />

      {/* Practice cards */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">Start practising</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <PracticeCard
            title="Speaking Practice"
            description="Simulate all 3 IELTS Speaking parts with AI feedback and band scores."
            href="/practice/speaking"
            color="bg-sky-50"
            icon={
              <svg className="w-6 h-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            }
          />
          <PracticeCard
            title="Listening Practice"
            description="All 4 IELTS Listening sections with realistic audio and auto-marking."
            href="/practice/listening"
            color="bg-emerald-50"
            icon={
              <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            }
          />
          <PracticeCard
            title="Writing Practice"
            description="Study model essays, practice writing, and get detailed feedback."
            href="/practice/writing"
            color="bg-amber-50"
            icon={
              <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          />
          <PracticeCard
            title="Vocabulary Builder"
            description="Review words from your sessions using spaced repetition flashcards."
            href="/vocabulary"
            color="bg-violet-50"
            icon={
              <svg className="w-6 h-6 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
          <PracticeCard
            title="Practice History"
            description="Review your past sessions, scores, and detailed feedback."
            href="/history"
            color="bg-amber-50"
            icon={
              <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
