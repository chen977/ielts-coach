import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const today = new Date().toISOString().split('T')[0]

    // Fetch all data in parallel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = supabase as any
    const [
      { data: speakingSessions },
      { data: listeningSessions },
      { count: totalVocab },
      { count: dueVocab },
      { count: masteredVocab },
      { data: vocabByBox },
    ] = await Promise.all([
      s
        .from('speaking_sessions')
        .select('scores, created_at')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true }),
      s
        .from('listening_sessions')
        .select('section, score, band_estimate, created_at')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true }),
      s
        .from('vocabulary')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      s
        .from('vocabulary')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .lte('next_review_date', today),
      s
        .from('vocabulary')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('srs_box', 5),
      s
        .from('vocabulary')
        .select('srs_box')
        .eq('user_id', user.id),
    ]) as { data: any[]; count: number }[]

    // Band trend data
    interface BandTrendPoint {
      date: string
      speaking?: number
      listening?: number
    }
    const bandTrend: BandTrendPoint[] = []

    for (const s of speakingSessions ?? []) {
      const scores = s.scores as { overall?: number } | null
      if (scores?.overall) {
        const date = new Date(s.created_at).toISOString().split('T')[0]
        const existing = bandTrend.find(p => p.date === date)
        if (existing) {
          existing.speaking = scores.overall
        } else {
          bandTrend.push({ date, speaking: scores.overall })
        }
      }
    }

    for (const l of listeningSessions ?? []) {
      if (l.band_estimate) {
        const date = new Date(l.created_at).toISOString().split('T')[0]
        const existing = bandTrend.find(p => p.date === date)
        if (existing) {
          existing.listening = l.band_estimate
        } else {
          bandTrend.push({ date, listening: l.band_estimate })
        }
      }
    }

    bandTrend.sort((a, b) => a.date.localeCompare(b.date))

    // Speaking criteria averages
    const criteriaAccum: Record<string, { sum: number; count: number }> = {
      FC: { sum: 0, count: 0 },
      LR: { sum: 0, count: 0 },
      GRA: { sum: 0, count: 0 },
      Pronunciation: { sum: 0, count: 0 },
    }

    for (const s of speakingSessions ?? []) {
      const scores = s.scores as { criteria?: { criterion: string; band: number }[] } | null
      if (scores?.criteria) {
        for (const c of scores.criteria) {
          if (criteriaAccum[c.criterion]) {
            criteriaAccum[c.criterion].sum += c.band
            criteriaAccum[c.criterion].count++
          }
        }
      }
    }

    const speakingBreakdown = Object.entries(criteriaAccum).map(([criterion, { sum, count }]) => ({
      criterion,
      average: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
    }))

    // Listening section averages
    const sectionAccum: Record<number, { sum: number; count: number }> = {
      1: { sum: 0, count: 0 },
      2: { sum: 0, count: 0 },
      3: { sum: 0, count: 0 },
      4: { sum: 0, count: 0 },
    }

    for (const l of listeningSessions ?? []) {
      if (l.band_estimate && sectionAccum[l.section]) {
        sectionAccum[l.section].sum += l.band_estimate
        sectionAccum[l.section].count++
      }
    }

    const listeningBreakdown = Object.entries(sectionAccum).map(([section, { sum, count }]) => ({
      section: Number(section),
      average: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
    }))

    // Vocab by box distribution
    const boxCounts = [0, 0, 0, 0, 0]
    for (const v of vocabByBox ?? []) {
      const box = (v.srs_box as number) ?? 1
      if (box >= 1 && box <= 5) boxCounts[box - 1]++
    }

    // Practice days for streak calendar (last 28 days)
    const practiceDays: string[] = []
    const allSessions = [
      ...(speakingSessions ?? []).map(s => s.created_at),
      ...(listeningSessions ?? []).map(l => l.created_at),
    ]
    for (const dateStr of allSessions) {
      const day = new Date(dateStr).toISOString().split('T')[0]
      if (!practiceDays.includes(day)) practiceDays.push(day)
    }

    return NextResponse.json({
      bandTrend,
      speakingBreakdown,
      listeningBreakdown,
      vocabStats: {
        total: totalVocab ?? 0,
        due: dueVocab ?? 0,
        mastered: masteredVocab ?? 0,
        byBox: boxCounts,
      },
      practiceDays: practiceDays.sort(),
    })
  } catch (err) {
    console.error('Dashboard stats error:', err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
