import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TASK2_TOPICS, TASK1_CHART_TYPES } from '@/lib/writing/topics'
import type { WritingTopicProgress } from '@/lib/writing/types'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const task = searchParams.get('task')

    // Fetch personal essays for progress tracking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: personalEssays } = await (supabase.from('personal_essays') as any)
      .select('topic_id, times_practiced, best_band')
      .eq('user_id', user.id)

    // Fetch writing sessions for level 2/3 completion
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: writingSessions } = await (supabase.from('writing_sessions') as any)
      .select('topic_id, level, scores')
      .eq('user_id', user.id)

    const essays = personalEssays || []
    const sessions = writingSessions || []

    // Build progress map
    const progressMap = new Map<string, WritingTopicProgress>()

    for (const pe of essays) {
      progressMap.set(pe.topic_id, {
        topicId: pe.topic_id,
        level1Complete: true,
        level2Complete: false,
        bestBand: pe.best_band,
        timesPracticed: pe.times_practiced,
      })
    }

    // Check for level 2+ sessions
    for (const s of sessions) {
      if (!s.topic_id) continue
      const existing = progressMap.get(s.topic_id)
      if (existing && s.level >= 2) {
        existing.level2Complete = true
        const sessionBand = (s.scores as { overall?: number } | null)?.overall
        if (sessionBand && (!existing.bestBand || sessionBand > existing.bestBand)) {
          existing.bestBand = sessionBand
        }
      }
    }

    if (task === '1') {
      const chartTypes = TASK1_CHART_TYPES.map(ct => ({
        ...ct,
        progress: progressMap.get(ct.id) || null,
      }))
      return NextResponse.json({ topics: chartTypes })
    }

    // Default to task 2
    const topics = TASK2_TOPICS.map(t => ({
      ...t,
      progress: progressMap.get(t.id) || null,
    }))
    return NextResponse.json({ topics })
  } catch (err) {
    console.error('Writing topics error:', err)
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 })
  }
}
