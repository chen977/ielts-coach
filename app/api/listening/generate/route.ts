import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getListeningGenerationPrompt, extractJSON } from '@/lib/listening/prompts'
import type { ListeningSection, GeneratedListeningContent } from '@/lib/listening/types'

const anthropic = new Anthropic()

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const section = body.section as ListeningSection
    const level = (body.level as number) || 3

    if (![1, 2, 3, 4].includes(section)) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }

    const prompt = getListeningGenerationPrompt(section)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = extractJSON(text) as GeneratedListeningContent

    // Validate required fields
    if (!parsed.script || !parsed.questionGroups || !Array.isArray(parsed.script)) {
      throw new Error('Invalid response structure from AI')
    }

    // Build plain-text script for DB storage
    const scriptText = parsed.script
      .map(seg => {
        const dir = seg.direction ? `[${seg.direction}] ` : ''
        return `${dir}${seg.speaker}: ${seg.text}`
      })
      .join('\n\n')

    // Extract all questions and correct answers
    const allQuestions = parsed.questionGroups.flatMap(g => g.questions)
    const correctAnswers = Object.fromEntries(
      allQuestions.map(q => [q.id, q.correctAnswer])
    )

    // Save to listening_sessions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session, error: dbError } = await (supabase.from('listening_sessions') as any)
      .insert({
        user_id: user.id,
        section,
        script: scriptText,
        questions: {
          level,
          questionGroups: parsed.questionGroups,
          scriptSegments: parsed.script,
          vocabulary: parsed.vocabulary,
          title: parsed.title,
        },
        correct_answers: correctAnswers,
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('DB insert error:', dbError)
      throw new Error('Failed to save session')
    }

    return NextResponse.json({
      sessionId: session.id,
      content: parsed,
    })
  } catch (err) {
    console.error('Listening generate error:', err)
    return NextResponse.json(
      { error: 'Failed to generate listening test' },
      { status: 500 }
    )
  }
}
