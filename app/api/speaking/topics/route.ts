import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllTopics } from '@/lib/speaking/topics'
import type { SpeakingPart, TopicProgress } from '@/lib/speaking/types'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const partParam = parseInt(searchParams.get('part') || '1', 10)
    const part = ([1, 2, 3].includes(partParam) ? partParam : 1) as SpeakingPart

    const topics = getAllTopics(part)

    // Fetch user's personal answers for progress tracking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: personalAnswers } = await (supabase.from('personal_answers') as any)
      .select('topic, times_practiced, best_band')
      .eq('user_id', user.id)
      .eq('part', part)

    // Group answers by topic in a single pass, then derive progress per topic
    type AnswerRow = { topic: string; times_practiced: number; best_band: number | null }
    const answersByTopic = new Map<string, AnswerRow[]>()
    for (const a of (personalAnswers || []) as AnswerRow[]) {
      const list = answersByTopic.get(a.topic)
      if (list) list.push(a)
      else answersByTopic.set(a.topic, [a])
    }

    const progressMap = new Map<string, TopicProgress>()
    for (const topic of topics) {
      const answers = answersByTopic.get(topic.id) ?? []
      // Single reduce pass: hasPracticed + bestBand + totalPracticed
      const { hasPracticed, bestBand, totalPracticed } = answers.reduce(
        (acc, a) => ({
          hasPracticed: acc.hasPracticed || a.times_practiced > 0,
          bestBand: a.best_band !== null
            ? (acc.bestBand === null ? a.best_band : Math.max(acc.bestBand, a.best_band))
            : acc.bestBand,
          totalPracticed: acc.totalPracticed + (a.times_practiced || 0),
        }),
        { hasPracticed: false, bestBand: null as number | null, totalPracticed: 0 }
      )
      progressMap.set(topic.id, {
        topicId: topic.id,
        level1Complete: answers.length > 0,
        level2Complete: hasPracticed,
        bestBand,
        timesPracticed: totalPracticed,
      })
    }

    const topicsWithProgress = topics.map(topic => ({
      ...topic,
      progress: progressMap.get(topic.id) || {
        topicId: topic.id,
        level1Complete: false,
        level2Complete: false,
        bestBand: null,
        timesPracticed: 0,
      },
    }))

    return NextResponse.json({ topics: topicsWithProgress })

  } catch (err) {
    console.error('Topics fetch error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    )
  }
}
