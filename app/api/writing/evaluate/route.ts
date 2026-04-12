import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getWritingEvaluationPrompt } from '@/lib/writing/prompts'
import { extractJSON } from '@/lib/speaking/prompts'
import { extractAndSaveVocabulary } from '@/lib/vocabulary/extract'
import type { WritingEvaluationResult } from '@/lib/writing/types'

const anthropic = new Anthropic()

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      task,
      topicId,
      topicText,
      userEssay,
      essayType,
      personalEssayId,
      level,
      timeSpent,
      chartData,
      modelEssay,
    } = body as {
      task: number
      topicId: string
      topicText: string
      userEssay: string
      essayType?: string
      personalEssayId?: string
      level: number
      timeSpent: number
      chartData?: unknown
      modelEssay?: string
    }

    if (!topicId || !topicText || !userEssay) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const wordCount = userEssay.trim().split(/\s+/).filter(Boolean).length

    const prompt = getWritingEvaluationPrompt(
      task as 1 | 2,
      topicText,
      userEssay,
      essayType,
      modelEssay
    )

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 4096,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const evaluation = extractJSON(text) as WritingEvaluationResult

    // Save writing session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session, error: sessionError } = await (supabase.from('writing_sessions') as any)
      .insert({
        user_id: user.id,
        task,
        level,
        topic_id: topicId,
        topic_text: topicText,
        essay_type: essayType || null,
        chart_type: chartData ? (chartData as { chartType?: string }).chartType : null,
        chart_data: chartData || null,
        user_essay: userEssay,
        model_essay: modelEssay || null,
        word_count: wordCount,
        scores: {
          overall: evaluation.overallBand,
          criteria: evaluation.criteria,
        },
        feedback: {
          paragraphFeedback: evaluation.paragraphFeedback,
          grammarCorrections: evaluation.grammarCorrections,
          vocabUpgrades: evaluation.vocabUpgrades,
          positives: evaluation.positives,
          improvements: evaluation.improvements,
          encouragement: evaluation.encouragement,
        },
        time_spent_seconds: timeSpent,
      })
      .select()
      .single()

    if (sessionError) {
      console.error('DB insert error:', sessionError)
      return NextResponse.json({ error: 'Failed to save session' }, { status: 500 })
    }

    // Update personal_essays progress and profiles in parallel (non-blocking)
    const updates: Promise<unknown>[] = []

    if (personalEssayId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = supabase as any

      // Fetch current best band for comparison
      updates.push(
        s.from('personal_essays')
          .select('times_practiced, best_band')
          .eq('id', personalEssayId)
          .single()
          .then(({ data: pe }: { data: { times_practiced: number; best_band: number | null } | null }) => {
            const currentBest = pe?.best_band ?? 0
            const newBest = Math.max(currentBest, evaluation.overallBand)
            return s.from('personal_essays')
              .update({
                times_practiced: (pe?.times_practiced ?? 0) + 1,
                best_band: newBest,
                updated_at: new Date().toISOString(),
              })
              .eq('id', personalEssayId)
          })
      )
    }

    // Update last practice date
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updates.push(
      (supabase as any).from('profiles')
        .update({ last_practice_date: new Date().toISOString().split('T')[0] })
        .eq('id', user.id)
    )

    // Extract vocabulary from the essay asynchronously
    if (session?.id) {
      extractAndSaveVocabulary(
        supabase,
        user.id,
        session.id,
        'writing',
        userEssay,
        topicText
      ).catch(err => console.error('Vocabulary extraction error:', err))
    }

    await Promise.all(updates).catch(err => console.error('Update error:', err))

    return NextResponse.json({ evaluation })
  } catch (err) {
    console.error('Writing evaluation error:', err)
    return NextResponse.json({ error: 'Failed to evaluate essay' }, { status: 500 })
  }
}
