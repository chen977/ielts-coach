import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { saveListeningVocabulary } from '@/lib/vocabulary/extract'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId, userAnswers, score, bandEstimate } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('listening_sessions') as any)
      .update({
        user_answers: userAnswers,
        score,
        band_estimate: bandEstimate,
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)

    if (error) {
      console.error('DB update error:', error)
      return NextResponse.json({ error: 'Failed to save results' }, { status: 500 })
    }

    // Update last practice date
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('profiles') as any).update({
      last_practice_date: new Date().toISOString().split('T')[0],
    }).eq('id', user.id)

    // Extract vocabulary from the listening session's generated vocabulary
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session } = await (supabase.from('listening_sessions') as any)
      .select('questions')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (session?.questions?.vocabulary) {
      saveListeningVocabulary(supabase, user.id, sessionId, session.questions.vocabulary)
        .catch((err: unknown) => console.error('Listening vocab save error:', err))
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Listening save error:', err)
    return NextResponse.json({ error: 'Failed to save results' }, { status: 500 })
  }
}
