import type { ListeningQuestion, QuestionGroup, ListeningResults, QuestionResult } from './types'

// ─── Basic normalizers ────────────────────────────────────────────────────────

const NUMBER_WORDS: Record<string, string> = {
  zero: '0', one: '1', two: '2', three: '3', four: '4',
  five: '5', six: '6', seven: '7', eight: '8', nine: '9',
  ten: '10', eleven: '11', twelve: '12', thirteen: '13',
  fourteen: '14', fifteen: '15', sixteen: '16', seventeen: '17',
  eighteen: '18', nineteen: '19', twenty: '20', thirty: '30',
  forty: '40', fifty: '50', sixty: '60', seventy: '70',
  eighty: '80', ninety: '90', hundred: '100', thousand: '1000',
}

/** Lowercase, trim, collapse whitespace, strip common punctuation */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"()\-]/g, ' ')   // treat hyphens/dashes as whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

function stripArticles(text: string): string {
  return text.replace(/^(the|a|an)\s+/i, '').trim()
}

function normalizeNumberWords(text: string): string {
  let result = text.toLowerCase()
  for (const [word, digit] of Object.entries(NUMBER_WORDS)) {
    result = result.replace(new RegExp(`\\b${word}\\b`, 'g'), digit)
  }
  return result
}

// ─── Domain-specific normalizers ─────────────────────────────────────────────

/**
 * Phone numbers: strip all spaces, dashes, and parentheses from digit strings.
 * "07842 195 637" → "07842195637"   "(0800) 123-4567" → "08001234567"
 */
function normalizePhone(text: string): string {
  // Only collapse if the result looks like a phone number (7+ consecutive digits, optional +)
  const collapsed = text.replace(/[\s\-().]/g, '')
  if (/^\+?\d{7,15}$/.test(collapsed)) return collapsed
  return text
}

/**
 * Dates: normalise month abbreviations to full names and strip ordinal suffixes.
 * "15th Sep" → "15 september"   "1st Jan 2024" → "1 january 2024"
 */
const MONTH_ABBREVS: Record<string, string> = {
  jan: 'january', feb: 'february', mar: 'march', apr: 'april',
  may: 'may', jun: 'june', jul: 'july', aug: 'august',
  sep: 'september', sept: 'september', oct: 'october', nov: 'november', dec: 'december',
}

function normalizeDates(text: string): string {
  return text
    // Strip ordinal suffixes: 1st → 1, 2nd → 2, 3rd → 3, 4th → 4
    .replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, '$1')
    // Expand month abbreviations
    .replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b/gi,
      m => MONTH_ABBREVS[m.toLowerCase()] ?? m)
}

/**
 * Currency: strip symbols/words and reduce to the bare number so that
 * "£344", "344 pounds", "GBP 344", "344 gbp" all become "344".
 */
function normalizeCurrency(text: string): string {
  return text
    .replace(/£\s*/g, '')
    .replace(/\$\s*/g, '')
    .replace(/€\s*/g, '')
    .replace(/\b(pounds?|gbp|usd|eur|dollars?|euros?)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Units: normalise abbreviations and American/British spellings.
 * "km" → "kilometres", "meters" → "metres", "liter" → "litres", etc.
 */
function normalizeUnits(text: string): string {
  return text
    // Distance
    .replace(/\bkm\b/gi, 'kilometres')
    .replace(/\bkilometers?\b/gi, 'kilometres')
    .replace(/\bkilometre\b/gi, 'kilometres')
    .replace(/\bmeters?\b/gi, 'metres')
    .replace(/\bmetre\b/gi, 'metres')
    .replace(/\bcm\b/gi, 'centimetres')
    .replace(/\bcentimeters?\b/gi, 'centimetres')
    .replace(/\bcentimetre\b/gi, 'centimetres')
    .replace(/\bmm\b/gi, 'millimetres')
    .replace(/\bmillimeters?\b/gi, 'millimetres')
    .replace(/\bmillimetre\b/gi, 'millimetres')
    // Weight
    .replace(/\bkg\b/gi, 'kilograms')
    .replace(/\bkilogram\b/gi, 'kilograms')
    .replace(/\b(?<!\d)g\b/gi, 'grams')      // bare "g" only (not part of a number)
    .replace(/\bgram\b/gi, 'grams')
    // Volume
    .replace(/\bml\b/gi, 'millilitres')
    .replace(/\bmilliliters?\b/gi, 'millilitres')
    .replace(/\bmillilitre\b/gi, 'millilitres')
    .replace(/\bliters?\b/gi, 'litres')
    .replace(/\blitre\b/gi, 'litres')
}

// ─── Combined deep normalizer ─────────────────────────────────────────────────

/**
 * Apply all normalizations in sequence to produce a canonical comparison string.
 * Used for form_fill and sentence_completion where IELTS accepts format variations.
 */
function deepNormalize(text: string): string {
  let s = normalizeText(text)   // lowercase, trim, punctuation → spaces
  s = normalizePhone(s)         // collapse phone number separators
  s = normalizeDates(s)         // full month names, strip ordinals
  s = normalizeCurrency(s)      // strip currency symbols/words
  s = normalizeUnits(s)         // canonical unit names
  s = normalizeNumberWords(s)   // word numbers → digits
  s = stripArticles(s)          // remove leading a/an/the
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

// ─── Date component match (order-independent) ─────────────────────────────────

/**
 * If both strings contain the same month and the same day number, treat as equal.
 * Handles "15 September" = "September 15" after other normalizations have run.
 */
function sameDateComponents(a: string, b: string): boolean {
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
  ]
  const monthA = months.find(m => a.includes(m))
  const monthB = months.find(m => b.includes(m))
  if (!monthA || !monthB || monthA !== monthB) return false
  const dayA = a.match(/\b(\d{1,2})\b/)?.[1]
  const dayB = b.match(/\b(\d{1,2})\b/)?.[1]
  return !!(dayA && dayB && dayA === dayB)
}

// ─── Levenshtein ──────────────────────────────────────────────────────────────

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = []
  for (let i = 0; i <= a.length; i++) matrix[i] = [i]
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }
  return matrix[a.length][b.length]
}

// ─── Public match function ────────────────────────────────────────────────────

export function matchAnswer(
  userAnswer: string,
  correctAnswer: string,
  questionType: ListeningQuestion['type']
): boolean {
  if (!userAnswer || !userAnswer.trim()) return false

  // Multiple choice and matching: exact (normalised) match only
  if (questionType === 'multiple_choice' || questionType === 'matching') {
    return normalizeText(userAnswer) === normalizeText(correctAnswer)
  }

  // ── Form fill & sentence completion: progressive fuzzy matching ──

  // 1. Basic normalisation (same as before, catches most simple cases fast)
  const userBasic = normalizeText(userAnswer)
  const correctBasic = normalizeText(correctAnswer)
  if (userBasic === correctBasic) return true
  if (stripArticles(userBasic) === stripArticles(correctBasic)) return true

  // 2. Deep normalisation — applies all domain rules
  const userDeep = deepNormalize(userAnswer)
  const correctDeep = deepNormalize(correctAnswer)
  if (userDeep === correctDeep) return true

  // 3. Order-independent date components ("15 September" = "September 15")
  if (sameDateComponents(userDeep, correctDeep)) return true

  // 4. Levenshtein on deeply-normalised strings (handles single typos)
  //    Allow 1 edit for strings ≥ 5 chars; 2 edits for strings ≥ 10 chars
  const minLen = Math.min(userDeep.length, correctDeep.length)
  if (minLen >= 10 && levenshtein(userDeep, correctDeep) <= 2) return true
  if (minLen >= 5  && levenshtein(userDeep, correctDeep) <= 1) return true

  // 5. Levenshtein on article-stripped deep strings
  const userStripped = stripArticles(userDeep)
  const correctStripped = stripArticles(correctDeep)
  const minLenS = Math.min(userStripped.length, correctStripped.length)
  if (minLenS >= 10 && levenshtein(userStripped, correctStripped) <= 2) return true
  if (minLenS >= 5  && levenshtein(userStripped, correctStripped) <= 1) return true

  return false
}

// ─── Band score & grading ────────────────────────────────────────────────────

// Band score mapping for 10 questions
// DB constraint: band_estimate between 5.0 and 9.0
const BAND_SCORE_MAP: Record<number, number> = {
  10: 9.0,
  9: 8.5,
  8: 8.0,
  7: 7.5,
  6: 7.0,
  5: 6.5,
  4: 6.0,
  3: 5.5,
  2: 5.0,
  1: 5.0,
  0: 5.0,
}

export function calculateBandScore(rawScore: number): number {
  return BAND_SCORE_MAP[Math.min(rawScore, 10)] ?? 4.0
}

export function gradeSession(
  questionGroups: QuestionGroup[],
  userAnswers: Record<number, string>,
  vocabulary: { word: string; definition: string; example: string }[]
): ListeningResults {
  const allQuestions: ListeningQuestion[] = questionGroups.flatMap(g => g.questions)

  const perQuestion: QuestionResult[] = allQuestions.map(q => ({
    questionId: q.id,
    userAnswer: userAnswers[q.id] || '',
    correctAnswer: q.correctAnswer,
    isCorrect: matchAnswer(userAnswers[q.id] || '', q.correctAnswer, q.type),
  }))

  const score = perQuestion.filter(r => r.isCorrect).length

  return {
    score,
    bandEstimate: calculateBandScore(score),
    perQuestion,
    vocabulary,
  }
}
