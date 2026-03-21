import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processReview } from '@/lib/vocabulary/srs'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const topic = searchParams.get('topic')

    const today = new Date().toISOString().split('T')[0]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from('vocabulary') as any)
      .select('*')
      .eq('user_id', user.id)

    if (filter === 'due') {
      query = query.lte('next_review_date', today)
    }
    if (topic) {
      query = query.eq('ielts_topic', topic)
    }

    query = query.order('next_review_date', { ascending: true })

    const { data: words, error } = await query

    if (error) {
      console.error('Vocabulary fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch vocabulary' }, { status: 500 })
    }

    return NextResponse.json({ words: words || [] })
  } catch (err) {
    console.error('Vocabulary GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch vocabulary' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { wordId, correct } = await request.json()

    if (!wordId || typeof correct !== 'boolean') {
      return NextResponse.json({ error: 'Missing wordId or correct' }, { status: 400 })
    }

    // Fetch current word state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: word, error: fetchError } = await (supabase.from('vocabulary') as any)
      .select('srs_box, times_reviewed, times_correct')
      .eq('id', wordId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 })
    }

    const { newBox, nextReviewDate } = processReview(word.srs_box, correct)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from('vocabulary') as any)
      .update({
        srs_box: newBox,
        next_review_date: nextReviewDate,
        times_reviewed: word.times_reviewed + 1,
        times_correct: correct ? word.times_correct + 1 : word.times_correct,
      })
      .eq('id', wordId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Vocabulary update error:', updateError)
      return NextResponse.json({ error: 'Failed to update word' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, newBox, nextReviewDate })
  } catch (err) {
    console.error('Vocabulary PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update vocabulary' }, { status: 500 })
  }
}
