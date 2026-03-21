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

  return {
    system: `You are an experienced IELTS Speaking examiner with deep knowledge of the IELTS band descriptors. Evaluate the candidate's speaking performance based on their transcribed responses. Score on the 4 official IELTS Speaking criteria:

1. **Fluency & Coherence (FC)**: Flow of speech, logical organization, use of cohesive devices, hesitation patterns
2. **Lexical Resource (LR)**: Range of vocabulary, precision of word choice, use of idiomatic language, paraphrasing ability
3. **Grammatical Range & Accuracy (GRA)**: Variety of sentence structures, accuracy of grammar, complexity of constructions
4. **Pronunciation**: Based on transcript analysis - infer pronunciation quality from word choice patterns, complexity of vocabulary used, and natural phrasing (since we only have text, focus on what can be reasonably estimated)

Band scores should be given as whole or half numbers (e.g., 5.0, 5.5, 6.0, 6.5, 7.0) on a 0-9 scale.
Be fair but honest. Most intermediate learners score between 5.0-6.5. Only give 7+ for genuinely strong performance.`,

    user: `This is an IELTS Speaking Part ${part} practice session.

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
