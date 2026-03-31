import { SpeakingPart, UpgradePhrase } from './types'

export function getPersonalAnswerPrompt(
  part: SpeakingPart,
  question: string,
  personalDetails: Record<string, string>
) {
  // Format details as readable lines, skipping blanks
  const detailsList = Object.entries(personalDetails)
    .filter(([, value]) => value.trim())
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n')

  const wordCount = part === 2
    ? '180-220 words (about 2 minutes spoken)'
    : '50-70 words (about 25-35 seconds spoken)'

  return {
    system: `You are an IELTS Speaking coach. The student is at Band 5-5.5 and aiming for Band 7.

Using their personal details, write a natural Band 7 speaking response that:
- Uses THEIR real information throughout (names, places, experiences, feelings)
- Weaves complex personal histories naturally — if they were born in one place and now live somewhere else, use bridging phrases like "Although I grew up in..., I've been living in... for the past... years" or "I moved to... when I..."
- Handles gaps gracefully — if a detail is vague or missing, work around it naturally without inventing specifics
- Demonstrates Band 7 vocabulary and grammar authentically, not artificially
- Includes discourse markers naturally (Well, Actually, To be honest, I suppose, What I find is...)
- Sounds like a real person talking, not a written essay read aloud
- Is ${wordCount}
- For Part 2: covers all four bullet points on the cue card

Also identify:
- 5-8 "upgrade phrases" actually used in the answer, each with a simple definition and category
- 3 grammar patterns demonstrated (e.g., "past perfect for background", "conditional for speculation")
- 2-3 speaking tips specific to this question type

Respond in JSON format only. No other text.`,

    user: `IELTS Speaking Part ${part} question: "${question}"

Student's personal details:
${detailsList}

Return ONLY valid JSON in this exact format:
{
  "modelAnswer": "the full Band 7 answer in first person, using the student's real details",
  "upgradePhrases": [
    {"phrase": "exact phrase from the answer", "definition": "what it means / why it sounds natural", "category": "vocabulary"},
    {"phrase": "another phrase", "definition": "simple explanation", "category": "connector"},
    {"phrase": "another phrase", "definition": "simple explanation", "category": "grammar"}
  ],
  "grammarPatterns": [
    {"pattern": "Pattern name", "example": "exact sentence from the answer", "explanation": "why this is Band 7"}
  ],
  "speakingTips": ["specific tip for this question", "another tip"]
}`,
  }
}

export function getGuidedEvaluationPrompt(
  part: SpeakingPart,
  question: string,
  transcript: string,
  modelAnswer: string,
  upgradePhrases: UpgradePhrase[]
) {
  const phrasesList = upgradePhrases.length
    ? upgradePhrases.map(p => `- "${p.phrase}" (${p.category})`).join('\n')
    : '(none listed)'

  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length

  return {
    system: `You are a supportive IELTS Speaking coach. The student is at Band 5-5.5 and is practicing with a personalized model answer they've studied.

Evaluate warmly and constructively:
- Always lead with something genuine they did well — find at least one real positive
- Give a maximum of 3 specific, actionable improvements (not vague advice like "use more vocabulary")
- Check which target upgrade phrases they used — even partial or approximate usage counts
- Suggest only 1-2 phrases from their model answer they could try next time
- Be encouraging — they're practicing, not being judged
- Don't penalize divergence from the model answer; the goal is natural fluency, not memorization
- If the transcript is short or incomplete, note it gently and focus on what's there

## Band Descriptors — use these to calibrate your scores:

**Band 0-2**: No answer given, completely unintelligible speech, or unrelated language. Score 0 for no attempt, 1-2 for essentially no communicative ability.

**Band 3**: Extremely limited communication. Isolated words or memorized phrases only. Cannot form sentences. Frequent long pauses with almost no coherent output.

**Band 4**: Very short answers (under 20 words), basic vocabulary only, frequent long pauses. Can produce simple phrases but with very limited range. Many errors that cause communication breakdown.

**Band 5**: Short but coherent answers. Simple vocabulary with noticeable errors. Mostly simple sentence structures. Some hesitation but addresses the question.

**Band 6**: Adequate answers with some development. Some good vocabulary and structures. Occasional errors, mix of simple and complex sentences. Generally fluent.

**Band 7**: Well-developed answers with clear ideas. Good vocabulary range with some idiomatic items. Few errors, confident use of complex structures. Fluent and coherent with natural flow.

**Band 8**: Sophisticated, fully developed answers. Wide vocabulary used precisely and naturally. Very rare errors, wide range of complex structures. Highly fluent.

**Band 9**: Expert-level, native-like fluency and precision. Effortless, fully natural speech. Flawless or near-flawless grammar and vocabulary.

## Scoring Rules — you MUST follow these:

- **Use the FULL range from 0 to 9. Do NOT default to 5-6 for every response.**
- Word count matters. Short answers cannot score high on Fluency & Coherence.
- If the response is under 20 words, Fluency & Coherence MUST be Band 4.0 or below.
- If the response is empty, off-topic, or incomprehensible, ALL criteria MUST be Band 2.0 or below.
- If the student shows genuine improvement and uses studied phrases well, reflect that in higher scores.
- Be accurate — encouragement should not inflate scores beyond what the response deserves.
- Differentiate clearly between levels. A Band 5 response is noticeably worse than Band 6, which is noticeably worse than Band 7.

Band scores: whole or half numbers (0, 2.0, 3.5, 5.0, 6.5, 7.0, 8.5, 9.0) on a 0-9 scale.

Respond in JSON format only. No other text.`,

    user: `IELTS Speaking Part ${part} question: "${question}"

Word count of student's response: ${wordCount} words.

Their personalized model answer (studied in Level 1):
"${modelAnswer}"

Upgrade phrases they studied:
${phrasesList}

Student's actual spoken response:
"${transcript}"

Return ONLY valid JSON in this exact format:
{
  "overallBand": 5.5,
  "criteria": {
    "fluencyCoherence": {"band": 5.5, "feedback": "One or two specific observations..."},
    "lexicalResource": {"band": 5.0, "feedback": "One or two specific observations..."},
    "grammaticalRange": {"band": 5.5, "feedback": "One or two specific observations..."},
    "pronunciation": {"band": 6.0, "feedback": "Estimated from text patterns — note any patterns suggesting clarity or difficulty"}
  },
  "positives": ["something genuine they did well", "another real positive if present"],
  "improvements": ["specific, actionable suggestion 1", "specific suggestion 2"],
  "phrasesUsed": ["phrase from their studied list that appeared in their answer"],
  "phrasesCanAdd": ["one or two phrases from the model answer to try next time"],
  "encouragement": "A short warm closing message that feels genuine, not generic"
}`,
  }
}
