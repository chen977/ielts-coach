import { SpeakingPart } from './types'

const IELTS_TOPICS_PART1 = [
  'home and accommodation', 'work or studies', 'hometown', 'family',
  'hobbies and leisure', 'food and cooking', 'weather and seasons',
  'travel and holidays', 'technology', 'reading and books',
  'music', 'sports and exercise', 'shopping', 'friends',
  'daily routine', 'clothes and fashion', 'animals and pets',
  'health and fitness', 'films and television', 'art and culture',
]

export function getGenerationPrompt(part: SpeakingPart, topic?: string) {
  const randomTopic = IELTS_TOPICS_PART1[Math.floor(Math.random() * IELTS_TOPICS_PART1.length)]

  if (part === 1) {
    return {
      system: `You are an experienced IELTS Speaking examiner. Generate authentic IELTS Speaking Part 1 questions. These should be everyday, personal questions that a real examiner would ask. Keep them natural and conversational.`,
      user: `Generate exactly 5 IELTS Speaking Part 1 questions about the topic "${randomTopic}".

Return ONLY a JSON array of strings, no other text. Example format:
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]`,
    }
  }

  if (part === 2) {
    return {
      system: `You are an experienced IELTS Speaking examiner. Generate an authentic IELTS Speaking Part 2 cue card. The card should have a clear topic, 3-4 bullet points the candidate should cover, and a brief follow-up question.`,
      user: `Generate an IELTS Speaking Part 2 cue card on an interesting and common IELTS topic.

Return ONLY valid JSON in this exact format, no other text:
{
  "topic": "Describe a [topic]",
  "bulletPoints": ["You should say: ...", "point 2", "point 3", "and explain ..."],
  "followUp": "A brief follow-up question?"
}`,
    }
  }

  // Part 3
  return {
    system: `You are an experienced IELTS Speaking examiner. Generate authentic IELTS Speaking Part 3 discussion questions. These should be abstract, analytical questions that explore the broader themes related to the Part 2 topic. They should require candidates to discuss ideas, give opinions, compare, and speculate.`,
    user: `The Part 2 topic was: "${topic || 'a general everyday topic'}"

Generate exactly 5 IELTS Speaking Part 3 abstract discussion questions related to this topic's broader themes.

Return ONLY a JSON array of strings, no other text. Example format:
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]`,
  }
}

export function getEvaluationPrompt(
  part: SpeakingPart,
  responses: { question: string; transcript: string }[]
) {
  const responsesText = responses
    .map((r, i) => `Question ${i + 1}: ${r.question}\nCandidate's response: ${r.transcript}`)
    .join('\n\n')

  const totalWords = responses.reduce((sum, r) => sum + r.transcript.trim().split(/\s+/).filter(Boolean).length, 0)
  const avgWords = responses.length > 0 ? Math.round(totalWords / responses.length) : 0

  return {
    system: `You are an experienced IELTS Speaking examiner with deep knowledge of the IELTS band descriptors. Evaluate the candidate's speaking performance based on their transcribed responses. Score on the 4 official IELTS Speaking criteria:

1. **Fluency & Coherence (FC)**: Flow of speech, logical organization, use of cohesive devices, hesitation patterns
2. **Lexical Resource (LR)**: Range of vocabulary, precision of word choice, use of idiomatic language, paraphrasing ability
3. **Grammatical Range & Accuracy (GRA)**: Variety of sentence structures, accuracy of grammar, complexity of constructions
4. **Pronunciation**: Based on transcript analysis - infer pronunciation quality from word choice patterns, complexity of vocabulary used, and natural phrasing (since we only have text, focus on what can be reasonably estimated)

## Band Descriptors — use these to calibrate your scores:

**Band 0-2**: No answer given, completely unintelligible speech, or unrelated language (e.g., not English, random words). Score 0 for no attempt, 1-2 for essentially no communicative ability.

**Band 3**: Extremely limited communication. Isolated words or memorized phrases only. Cannot form sentences. Frequent long pauses with almost no coherent output.

**Band 4**: Very short answers (under 20 words on average), basic vocabulary only, frequent long pauses. Can produce simple phrases but with very limited range. Many errors that cause communication breakdown.

**Band 5**: Short but coherent answers that address the question. Simple vocabulary with noticeable repetition. Frequent grammatical errors, mostly simple sentence structures. Some hesitation and pauses, basic organizational structure.

**Band 6**: Adequate length answers with some development and relevant detail. Some good vocabulary with occasional less common words. Occasional grammatical errors, mix of simple and complex sentences. Generally fluent with some hesitation, logical organization.

**Band 7**: Well-developed answers with clear, relevant ideas. Good vocabulary range with some idiomatic/less common items used naturally. Few grammatical errors, confident use of complex structures. Fluent and coherent with effective use of discourse markers and natural flow.

**Band 8**: Sophisticated, fully developed answers with nuanced ideas. Wide vocabulary used precisely and naturally, including idiomatic language. Very rare grammatical errors, wide range of complex structures used effortlessly. Highly fluent with excellent coherence.

**Band 9**: Expert-level, native-like fluency and precision. Effortless, fully natural speech with complete flexibility. Flawless or near-flawless grammar and vocabulary. Feels indistinguishable from an educated native speaker.

## Scoring Rules — you MUST follow these:

- **Use the FULL range from 0 to 9. Do NOT default to 5-6 for every response.**
- Word count is a key scoring factor. Short answers cannot score high.
- If a response averages under 20 words per question, Fluency & Coherence MUST be Band 4.0 or below.
- If a response is empty, off-topic, or incomprehensible, ALL criteria MUST be Band 2.0 or below.
- A genuinely strong, detailed response with good language SHOULD score 7.0+. Do not hold back.
- A weak, short, error-filled response SHOULD score 3.0-4.0. Do not be generous.
- Be accurate and discriminating. The scores must reflect real IELTS standards.
- Differentiate clearly between levels. A Band 5 response is noticeably worse than Band 6, which is noticeably worse than Band 7.

Band scores should be given as whole or half numbers (e.g., 0, 2.0, 3.5, 5.0, 6.5, 7.0, 8.5, 9.0) on a 0-9 scale.`,

    user: `This is an IELTS Speaking Part ${part} practice session.

Word count stats: ${totalWords} total words across ${responses.length} response(s), averaging ${avgWords} words per response.

${responsesText}

Evaluate the candidate and return ONLY valid JSON in this exact format, no other text:
{
  "overallBand": 6.0,
  "criteria": [
    {
      "criterion": "FC",
      "band": 6.0,
      "feedback": "Detailed feedback on fluency and coherence...",
      "tips": ["Specific actionable tip 1", "Specific actionable tip 2"]
    },
    {
      "criterion": "LR",
      "band": 6.0,
      "feedback": "Detailed feedback on lexical resource...",
      "tips": ["Specific actionable tip 1", "Specific actionable tip 2"]
    },
    {
      "criterion": "GRA",
      "band": 6.0,
      "feedback": "Detailed feedback on grammatical range and accuracy...",
      "tips": ["Specific actionable tip 1", "Specific actionable tip 2"]
    },
    {
      "criterion": "Pronunciation",
      "band": 6.0,
      "feedback": "Estimated pronunciation feedback based on transcript patterns...",
      "tips": ["Specific actionable tip 1", "Specific actionable tip 2"]
    }
  ],
  "perQuestion": [
    {
      "question": "The question text",
      "transcript": "What the candidate said",
      "modelAnswer": "A band 7-8 level model answer for this question (2-4 sentences for Part 1/3, or a full 2-minute response for Part 2)",
      "feedback": "Specific feedback comparing the candidate's response to ideal performance"
    }
  ]
}`,
  }
}

export function extractJSON(text: string): unknown {
  // Try direct parse first
  try {
    return JSON.parse(text)
  } catch {
    // Try extracting from markdown code fences
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (match) {
      return JSON.parse(match[1].trim())
    }
    // Try finding JSON object or array in the text
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }
    throw new Error('Could not extract JSON from response')
  }
}
