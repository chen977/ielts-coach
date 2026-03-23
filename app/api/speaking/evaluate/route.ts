import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getEvaluationPrompt, extractJSON } from '@/lib/speaking/prompts'
import { extractAndSaveVocabulary } from '@/lib/vocabulary/extract'
import type { SpeakingPart, EvaluationResult } from '@/lib/speaking/types'

const anthropic = new Anthropic()

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { part, questions, responses } = body as {
      part: SpeakingPart
      questions: unknown
      responses: { question: string; transcript: string }[]
    }

    if (![1, 2, 3].includes(part)) {
      return NextResponse.json({ error: 'Invalid part' }, { status: 400 })
    }

    if (!responses || responses.length === 0) {
      return NextResponse.json({ error: 'No responses provided' }, { status: 400 })
    }

    const prompt = getEvaluationPrompt(part, responses)

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 4096,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const evaluation = extractJSON(text) as EvaluationResult

    // Save to database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session } = await (supabase.from('speaking_sessions') as any).insert({
      user_id: user.id,
      part,
      questions,
      responses,
      scores: {
        overall: evaluation.overallBand,
        criteria: evaluation.criteria,
      },
      model_answers: evaluation.perQuestion,
    }).select('id').single()

    // Update last practice date for streak tracking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('profiles') as any).update({
      last_practice_date: new Date().toISOString().split('T')[0],
    }).eq('id', user.id)

    // Extract vocabulary in the background
    if (session?.id) {
      const transcript = responses.map((r: { transcript: string }) => r.transcript).join(' ')
      extractAndSaveVocabulary(supabase, user.id, session.id, 'speaking', transcript)
        .catch((err: unknown) => console.error('Vocab extraction error:', err))
    }

    return NextResponse.json({ evaluation })

  } catch (err) {
    console.error('Speaking evaluate error:', err)
    return NextResponse.json(
      { error: 'Failed to evaluate responses' },
      { status: 500 }
    )
  }
}
