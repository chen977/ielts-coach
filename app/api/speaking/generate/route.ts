import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getGenerationPrompt, extractJSON } from '@/lib/speaking/prompts'
import type { SpeakingPart, CueCard } from '@/lib/speaking/types'

const anthropic = new Anthropic()

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const part = body.part as SpeakingPart
    const topic = body.topic as string | undefined

    if (![1, 2, 3].includes(part)) {
      return NextResponse.json({ error: 'Invalid part' }, { status: 400 })
    }

    const prompt = getGenerationPrompt(part, topic)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = extractJSON(text)

    if (part === 1) {
      const questions = parsed as string[]
      return NextResponse.json({ part: 1, questions })
    }

    if (part === 2) {
      const cueCard = parsed as CueCard
      return NextResponse.json({ part: 2, cueCard })
    }

    // Part 3
    const questions = parsed as string[]
    return NextResponse.json({ part: 3, questions, topic: topic || '' })

  } catch (err) {
    console.error('Speaking generate error:', err)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}
