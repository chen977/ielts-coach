import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getPersonalEssayPrompt } from '@/lib/writing/prompts'
import { extractJSON } from '@/lib/speaking/prompts'
import type { EssayType } from '@/lib/writing/types'

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
    const { data, error } = await (supabase.from('personal_essays') as any)
      .select()
      .eq('user_id', user.id)
      .eq('topic_id', topicId)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }

    return NextResponse.json({ personalEssay: data || null })
  } catch (err) {
    console.error('Fetch personal essay error:', err)
    return NextResponse.json({ error: 'Failed to fetch personal essay' }, { status: 500 })
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
    const { task, topicId, topicText, essayType, personalIdeas } = body as {
      task: number
      topicId: string
      topicText: string
      essayType: EssayType
      personalIdeas: Record<string, string>
    }

    if (!topicId || !topicText || !essayType || !personalIdeas) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const prompt = getPersonalEssayPrompt(topicText, essayType, personalIdeas)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const result = extractJSON(text) as {
      modelEssay: string
      essayType: string
      paragraphs: unknown[]
      upgradePhrases: unknown[]
      grammarPatterns: unknown[]
      structureTemplate: string
      writingTips: string[]
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('personal_essays') as any).upsert(
      {
        user_id: user.id,
        topic_id: topicId,
        task,
        essay_type: essayType,
        personal_ideas: personalIdeas,
        model_essay: result.modelEssay,
        model_essay_data: result,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,topic_id' }
    ).select().single()

    if (error) {
      console.error('DB upsert error:', error)
      return NextResponse.json({ error: 'Failed to save personal essay' }, { status: 500 })
    }

    return NextResponse.json({ personalEssay: data })
  } catch (err) {
    console.error('Personal essay generation error:', err)
    return NextResponse.json({ error: 'Failed to generate personal essay' }, { status: 500 })
  }
}
