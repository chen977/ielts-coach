import Anthropic from '@anthropic-ai/sdk'
import { getVocabularyExtractionPrompt } from './prompts'
import { extractJSON } from '@/lib/speaking/prompts'
import type { SupabaseClient } from '@supabase/supabase-js'

interface ExtractedWord {
  word: string
  pronunciation: string
  definition: string
  example_sentence: string
  part_of_speech: string
  ielts_topic: string
}

const anthropic = new Anthropic()

export async function extractAndSaveVocabulary(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  sourceType: 'speaking' | 'listening',
  transcript: string,
  topic?: string
): Promise<void> {
  const prompt = getVocabularyExtractionPrompt(transcript, topic)

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const words = extractJSON(text) as ExtractedWord[]

  if (!Array.isArray(words) || words.length === 0) return

  const today = new Date().toISOString().split('T')[0]

  const rows = words.map((w) => ({
    user_id: userId,
    word: w.word.toLowerCase().trim(),
    pronunciation: w.pronunciation || null,
    definition: w.definition || null,
    example_sentence: w.example_sentence || null,
    part_of_speech: w.part_of_speech || null,
    ielts_topic: w.ielts_topic || topic || null,
    source_type: sourceType,
    source_session_id: sessionId,
    srs_box: 1,
    next_review_date: today,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('vocabulary') as any).upsert(rows, {
    onConflict: 'user_id,word',
    ignoreDuplicates: false,
  })
}

export async function saveListeningVocabulary(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  vocabulary: { word: string; definition: string; example?: string }[]
): Promise<void> {
  if (!vocabulary || vocabulary.length === 0) return

  const today = new Date().toISOString().split('T')[0]

  const rows = vocabulary.map((v) => ({
    user_id: userId,
    word: v.word.toLowerCase().trim(),
    definition: v.definition || null,
    example_sentence: v.example || null,
    source_type: 'listening' as const,
    source_session_id: sessionId,
    srs_box: 1,
    next_review_date: today,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('vocabulary') as any).upsert(rows, {
    onConflict: 'user_id,word',
    ignoreDuplicates: false,
  })
}
