import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getGuidedEvaluationPrompt } from '@/lib/speaking/personal-prompts'
import { extractJSON } from '@/lib/speaking/prompts'
import { extractAndSaveVocabulary } from '@/lib/vocabulary/extract'
import type { SpeakingPart, GuidedEvaluationResult, UpgradePhrase } from '@/lib/speaking/types'

const anthropic = new Anthropic()

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { part, topicId, question, transcript, personalAnswerId } = body as {
      part: SpeakingPart
      topicId: string
      question: string
      transcript: string
      personalAnswerId: string
    }

    if (![1, 2, 3].includes(part)) {
      return NextResponse.json({ error: 'Invalid part' }, { status: 400 })
    }

    if (!transcript || !personalAnswerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch the personal answer for context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: personalAnswer, error: fetchError } = await (supabase.from('personal_answers') as any)
      .select()
      .eq('id', personalAnswerId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !personalAnswer) {
      return NextResponse.json({ error: 'Personal answer not found' }, { status: 404 })
    }

    const prompt = getGuidedEvaluationPrompt(
      part,
      question,
      transcript,
      personalAnswer.model_answer,
      (personalAnswer.upgrade_phrases || []) as UpgradePhrase[]
    )

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const evaluation = extractJSON(text) as GuidedEvaluationResult

    // Compute updated stats
    const newTimesPracticed = (personalAnswer.times_practiced || 0) + 1
    const currentBest = personalAnswer.best_band
    const newBand = evaluation.overallBand
    const bestBand = currentBest === null || newBand > currentBest ? newBand : currentBest
    const today = new Date().toISOString()

    // Run all three DB writes in parallel — they are independent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [, sessionResult] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('personal_answers') as any).update({
        times_practiced: newTimesPracticed,
        best_band: bestBand,
        updated_at: today,
      }).eq('id', personalAnswerId),

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('speaking_sessions') as any).insert({
        user_id: user.id,
        part,
        level: 2,
        questions: [question],
        responses: [{ question, transcript }],
        scores: { overall: evaluation.overallBand, criteria: evaluation.criteria },
        model_answers: null,
      }).select('id').single(),

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('profiles') as any).update({
        last_practice_date: today.split('T')[0],
      }).eq('id', user.id),
    ])

    // Extract vocabulary in the background
    if (sessionResult?.data?.id) {
      extractAndSaveVocabulary(supabase, user.id, sessionResult.data.id, 'speaking', transcript, topicId)
        .catch((err: unknown) => console.error('Vocab extraction error:', err))
    }

    return NextResponse.json({ evaluation })

  } catch (err) {
    console.error('Guided evaluation error:', err)
    return NextResponse.json(
      { error: 'Failed to evaluate response' },
      { status: 500 }
    )
  }
}
