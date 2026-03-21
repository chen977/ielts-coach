export type SpeakingPart = 1 | 2 | 3
export type LearningLevel = 1 | 2 | 3

export interface CueCard {
  topic: string
  bulletPoints: string[]
  followUp: string
}

export type GeneratedQuestions =
  | { part: 1; questions: string[] }
  | { part: 2; cueCard: CueCard }
  | { part: 3; questions: string[]; topic: string }

export interface QuestionResponse {
  question: string
  transcript: string
}

export interface CriterionScore {
  criterion: 'FC' | 'LR' | 'GRA' | 'Pronunciation'
  band: number
  feedback: string
  tips: string[]
}

export interface PerQuestionFeedback {
  question: string
  transcript: string
  modelAnswer: string
  feedback: string
}

export interface EvaluationResult {
  overallBand: number
  criteria: CriterionScore[]
  perQuestion: PerQuestionFeedback[]
}

// Session state machine
export type SessionState =
  | { phase: 'idle' }
  | { phase: 'generating' }
  | { phase: 'practicing'; questions: GeneratedQuestions; currentIndex: number; responses: QuestionResponse[] }
  | { phase: 'evaluating'; questions: GeneratedQuestions; responses: QuestionResponse[] }
  | { phase: 'results'; evaluation: EvaluationResult; questions: GeneratedQuestions; responses: QuestionResponse[] }
  | { phase: 'error'; message: string; questions?: GeneratedQuestions; responses?: QuestionResponse[] }

export type SessionAction =
  | { type: 'START' }
  | { type: 'GENERATED'; questions: GeneratedQuestions }
  | { type: 'SAVE_RESPONSE'; response: QuestionResponse }
  | { type: 'NEXT_QUESTION' }
  | { type: 'COMPLETE' }
  | { type: 'EVALUATED'; evaluation: EvaluationResult }
  | { type: 'ERROR'; message: string }
  | { type: 'RESTART' }

// ============================================================
// Learning Ladder types
// ============================================================

export interface PersonalDetailPrompt {
  field: string
  label: string
  placeholder: string
}

export interface TopicCueCard {
  topic: string
  bullets: string[]
}

export interface Topic {
  id: string
  part: SpeakingPart
  name: string
  icon: string
  questions: string[]
  personalDetailPrompts: PersonalDetailPrompt[]
  cueCard?: TopicCueCard
}

export interface UpgradePhrase {
  phrase: string
  definition: string
  category: 'vocabulary' | 'connector' | 'grammar'
}

export interface GrammarPattern {
  pattern: string
  example: string
  explanation: string
}

export interface PersonalAnswer {
  id: string
  user_id: string
  topic: string
  part: SpeakingPart
  question: string
  personal_details: Record<string, string>
  model_answer: string
  upgrade_phrases: UpgradePhrase[]
  grammar_patterns: GrammarPattern[]
  speaking_tips: string[]
  times_practiced: number
  best_band: number | null
  created_at: string
  updated_at: string
}

export interface GuidedCriterionScore {
  band: number
  feedback: string
}

export interface GuidedEvaluationResult {
  overallBand: number
  criteria: {
    fluencyCoherence: GuidedCriterionScore
    lexicalResource: GuidedCriterionScore
    grammaticalRange: GuidedCriterionScore
    pronunciation: GuidedCriterionScore
  }
  positives: string[]
  improvements: string[]
  phrasesUsed: string[]
  phrasesCanAdd: string[]
  encouragement: string
}

export interface TopicProgress {
  topicId: string
  level1Complete: boolean
  level2Complete: boolean
  bestBand: number | null
  timesPracticed: number
}

// Study session state machine
export type StudySessionState =
  | { phase: 'selecting-question' }
  | { phase: 'filling-details'; question: string }
  | { phase: 'generating-answer'; question: string; personalDetails: Record<string, string> }
  | { phase: 'studying'; personalAnswer: PersonalAnswer }
  | { phase: 'guided-practicing'; personalAnswer: PersonalAnswer }
  | { phase: 'guided-evaluating'; personalAnswer: PersonalAnswer; transcript: string }
  | { phase: 'guided-results'; personalAnswer: PersonalAnswer; evaluation: GuidedEvaluationResult }
  | { phase: 'error'; message: string }

export type StudySessionAction =
  | { type: 'SELECT_QUESTION'; question: string }
  | { type: 'SUBMIT_DETAILS'; personalDetails: Record<string, string> }
  | { type: 'ANSWER_GENERATED'; personalAnswer: PersonalAnswer }
  | { type: 'START_PRACTICE' }
  | { type: 'SUBMIT_RECORDING'; transcript: string }
  | { type: 'EVALUATION_COMPLETE'; evaluation: GuidedEvaluationResult }
  | { type: 'RETRY_PRACTICE' }
  | { type: 'BACK_TO_STUDY' }
  | { type: 'EDIT_DETAILS' }
  | { type: 'LOAD_EXISTING'; personalAnswer: PersonalAnswer }
  | { type: 'ERROR'; message: string }
