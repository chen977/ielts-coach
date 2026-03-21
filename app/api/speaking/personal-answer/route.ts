import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getPersonalAnswerPrompt } from '@/lib/speaking/personal-prompts'
import { extractJSON } from '@/lib/speaking/prompts'
import type { SpeakingPart } from '@/lib/speaking/types'

const anthropic = new Anthropic()

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')
    if (!topicId) {
      return NextResponse.json({ error: 'Missing topicId' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('personal_answers') as any)
      .select()
      .eq('user_id', user.id)
      .eq('topic', topicId)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }

    return NextResponse.json({ personalAnswers: data || [] })
  } catch (err) {
    console.error('Fetch personal answers error:', err)
    return NextResponse.json({ error: 'Failed to fetch personal answers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { part, topicId, question, personalDetails } = body as {
      part: SpeakingPart
      topicId: string
      question: string
      personalDetails: Record<string, string>
    }

    if (![1, 2, 3].includes(part)) {
      return NextResponse.json({ error: 'Invalid part' }, { status: 400 })
    }

    if (!topicId || !question || !personalDetails) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const prompt = getPersonalAnswerPrompt(part, question, personalDetails)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const result = extractJSON(text) as {
      modelAnswer: string
      upgradePhrases: unknown[]
      grammarPatterns: unknown[]
      speakingTips: string[]
    }

    // Upsert — allows regeneration for the same user+topic+question
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('personal_answers') as any).upsert(
      {
        user_id: user.id,
        topic: topicId,
        part,
        question,
        personal_details: personalDetails,
        model_answer: result.modelAnswer,
        upgrade_phrases: result.upgradePhrases,
        grammar_patterns: result.grammarPatterns,
        speaking_tips: result.speakingTips,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,topic,question' }
    ).select().single()

    if (error) {
      console.error('DB upsert error:', error)
      return NextResponse.json({ error: 'Failed to save personal answer' }, { status: 500 })
    }

    return NextResponse.json({ personalAnswer: data })

  } catch (err) {
    console.error('Personal answer generation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate personal answer' },
      { status: 500 }
    )
  }
}
