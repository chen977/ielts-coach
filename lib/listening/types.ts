export type ListeningSection = 1 | 2 | 3 | 4
export type LearningLevel = 1 | 2 | 3

// Script structure for TTS playback
export interface ScriptSegment {
  speaker: string
  text: string
  direction?: string
}

// Question types — discriminated union
export type QuestionType = 'form_fill' | 'multiple_choice' | 'matching' | 'sentence_completion'

interface BaseQuestion {
  id: number
  type: QuestionType
}

export interface FormFillQuestion extends BaseQuestion {
  type: 'form_fill'
  label: string
  correctAnswer: string
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice'
  question: string
  options: { label: string; value: string }[]
  correctAnswer: string
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching'
  item: string
  options: string[]
  correctAnswer: string
}

export interface SentenceCompletionQuestion extends BaseQuestion {
  type: 'sentence_completion'
  sentence: string
  correctAnswer: string
}

export type ListeningQuestion =
  | FormFillQuestion
  | MultipleChoiceQuestion
  | MatchingQuestion
  | SentenceCompletionQuestion

// Question group (as in real IELTS exam)
export interface QuestionGroup {
  instructions: string
  contextLabel?: string
  questions: ListeningQuestion[]
}

// Generated content from the API
export interface GeneratedListeningContent {
  section: ListeningSection
  title: string
  script: ScriptSegment[]
  questionGroups: QuestionGroup[]
  vocabulary: { word: string; definition: string; example: string }[]
}

// Results
export interface QuestionResult {
  questionId: number
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
}

export interface ListeningResults {
  score: number
  bandEstimate: number
  perQuestion: QuestionResult[]
  vocabulary: { word: string; definition: string; example: string }[]
}

// Voice assignment for TTS
export interface VoiceAssignment {
  speaker: string
  pitch: number
  rate: number
}

// Session state machine
export type ListeningSessionState =
  | { phase: 'idle' }
  | { phase: 'generating' }
  | { phase: 'reading-time'; content: GeneratedListeningContent; sessionId: string }
  | { phase: 'playing'; content: GeneratedListeningContent; sessionId: string; userAnswers: Record<number, string> }
  | { phase: 'answering'; content: GeneratedListeningContent; sessionId: string; userAnswers: Record<number, string> }
  | { phase: 'results'; content: GeneratedListeningContent; sessionId: string; userAnswers: Record<number, string>; results: ListeningResults }
  | { phase: 'error'; message: string }

export type ListeningSessionAction =
  | { type: 'START' }
  | { type: 'GENERATED'; content: GeneratedListeningContent; sessionId: string }
  | { type: 'READING_TIME_COMPLETE' }
  | { type: 'START_PLAYBACK' }
  | { type: 'PLAYBACK_COMPLETE' }
  | { type: 'UPDATE_ANSWER'; questionId: number; answer: string }
  | { type: 'SUBMIT'; results: ListeningResults }
  | { type: 'ERROR'; message: string }
  | { type: 'RESTART' }
