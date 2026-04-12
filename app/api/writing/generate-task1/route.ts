import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getTask1GenerationPrompt } from '@/lib/writing/prompts'
import { extractJSON } from '@/lib/speaking/prompts'
import type { ChartType } from '@/lib/writing/types'

const anthropic = new Anthropic()

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { chartType, chartTypeId } = body as { chartType: ChartType; chartTypeId: string }

    if (!chartType || !chartTypeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const prompt = getTask1GenerationPrompt(chartType)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const result = extractJSON(text) as {
      chartType: string
      chartTitle: string
      chartData: unknown[]
      xAxisKey: string
      dataKeys: string[]
      modelDescription: string
      paragraphs: unknown[]
      dataLanguage: unknown[]
      structureTemplate: string
    }

    // Save to personal_essays table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('personal_essays') as any).upsert(
      {
        user_id: user.id,
        topic_id: chartTypeId,
        task: 1,
        model_essay: result.modelDescription,
        model_essay_data: result,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,topic_id' }
    ).select().single()

    if (error) {
      console.error('DB upsert error:', error)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({ personalEssay: data, modelData: result })
  } catch (err) {
    console.error('Task 1 generation error:', err)
    return NextResponse.json({ error: 'Failed to generate chart data' }, { status: 500 })
  }
}
