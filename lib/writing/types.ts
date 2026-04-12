export type WritingTask = 1 | 2
export type LearningLevel = 1 | 2 | 3

export type EssayType =
  | 'discuss_both_views'
  | 'agree_disagree'
  | 'problem_solution'
  | 'advantages_disadvantages'
  | 'two_part'

export type ChartType = 'line' | 'bar' | 'pie' | 'table' | 'process'

export interface IdeaPrompt {
  field: string
  label: string
  placeholder: string
}

export interface WritingTopic {
  id: string
  task: WritingTask
  category: string
  name: string
  icon: string
  essayType: EssayType
  topic: string
  ideaPrompts: IdeaPrompt[]
}

export interface ChartTypeConfig {
  id: string
  chartType: ChartType
  name: string
  icon: string
  description: string
  keyLanguage: string[]
}

export interface EssayTypeConfig {
  name: string
  instruction: string
  template: string
}

// Model essay structures
export interface ModelEssayParagraph {
  type: 'introduction' | 'body' | 'conclusion'
  text: string
  purpose: string
  technique: string
}

export interface UpgradePhrase {
  phrase: string
  definition: string
  category: 'linking' | 'vocabulary' | 'grammar'
}

export interface GrammarPattern {
  pattern: string
  example: string
  explanation: string
}

export interface ModelEssayData {
  essayType: EssayType
  modelEssay: string
  paragraphs: ModelEssayParagraph[]
  upgradePhrases: UpgradePhrase[]
  structureTemplate: string
  grammarPatterns: GrammarPattern[]
  writingTips: string[]
}

// Task 1 model data
export interface DataLanguagePhrase {
  phrase: string
  definition: string
  usage: string
}

export interface Task1ModelData {
  chartType: ChartType
  chartTitle: string
  chartData: Record<string, unknown>[]
  xAxisKey: string
  dataKeys: string[]
  modelDescription: string
  paragraphs: ModelEssayParagraph[]
  dataLanguage: DataLanguagePhrase[]
  structureTemplate: string
}

// Personal essay (DB row shape)
export interface PersonalEssay {
  id: string
  user_id: string
  topic_id: string
  task: WritingTask
  essay_type: string | null
  personal_ideas: Record<string, string> | null
  model_essay: string
  model_essay_data: ModelEssayData | Task1ModelData | null
  times_practiced: number
  best_band: number | null
  created_at: string
  updated_at: string
}

// Evaluation types
export interface WritingCriterionScore {
  criterion: 'TA' | 'CC' | 'LR' | 'GRA'
  band: number
  feedback: string
}

export interface GrammarCorrection {
  original: string
  corrected: string
  explanation: string
}

export interface VocabUpgrade {
  original: string
  upgrade: string
  explanation: string
}

export interface ParagraphFeedback {
  paragraphNumber: number
  positives: string
  improvements: string
}

export interface WritingEvaluationResult {
  overallBand: number
  criteria: WritingCriterionScore[]
  paragraphFeedback: ParagraphFeedback[]
  grammarCorrections: GrammarCorrection[]
  vocabUpgrades: VocabUpgrade[]
  positives: string[]
  improvements: string[]
  encouragement: string
}

export interface WritingTopicProgress {
  topicId: string
  level1Complete: boolean
  level2Complete: boolean
  bestBand: number | null
  timesPracticed: number
}

// ============================================================
// Task 2 Study Session state machine
// ============================================================

export type WritingStudySessionState =
  | { phase: 'selecting-topic' }
  | { phase: 'filling-ideas'; topic: WritingTopic }
  | { phase: 'generating-essay'; topic: WritingTopic; personalIdeas: Record<string, string> }
  | { phase: 'studying'; personalEssay: PersonalEssay }
  | { phase: 'writing'; personalEssay: PersonalEssay }
  | { phase: 'evaluating'; personalEssay: PersonalEssay; userEssay: string; wordCount: number; timeSpent: number }
  | { phase: 'results'; personalEssay: PersonalEssay; userEssay: string; evaluation: WritingEvaluationResult }
  | { phase: 'error'; message: string }

export type WritingStudySessionAction =
  | { type: 'SELECT_TOPIC'; topic: WritingTopic }
  | { type: 'SUBMIT_IDEAS'; personalIdeas: Record<string, string> }
  | { type: 'ESSAY_GENERATED'; personalEssay: PersonalEssay }
  | { type: 'START_WRITING' }
  | { type: 'SUBMIT_ESSAY'; userEssay: string; wordCount: number; timeSpent: number }
  | { type: 'EVALUATION_COMPLETE'; evaluation: WritingEvaluationResult }
  | { type: 'RETRY_WRITING' }
  | { type: 'BACK_TO_STUDY' }
  | { type: 'EDIT_IDEAS' }
  | { type: 'LOAD_EXISTING'; personalEssay: PersonalEssay }
  | { type: 'ERROR'; message: string }

// ============================================================
// Task 1 Study Session state machine
// ============================================================

export type Task1StudySessionState =
  | { phase: 'selecting-chart' }
  | { phase: 'generating-chart'; chartType: ChartType }
  | { phase: 'studying'; personalEssay: PersonalEssay; modelData: Task1ModelData }
  | { phase: 'writing'; personalEssay: PersonalEssay; modelData: Task1ModelData }
  | { phase: 'evaluating'; personalEssay: PersonalEssay; modelData: Task1ModelData; userDescription: string; wordCount: number; timeSpent: number }
  | { phase: 'results'; personalEssay: PersonalEssay; modelData: Task1ModelData; userDescription: string; evaluation: WritingEvaluationResult }
  | { phase: 'error'; message: string }

export type Task1StudySessionAction =
  | { type: 'SELECT_CHART'; chartType: ChartType }
  | { type: 'CHART_GENERATED'; personalEssay: PersonalEssay; modelData: Task1ModelData }
  | { type: 'START_WRITING' }
  | { type: 'SUBMIT_DESCRIPTION'; userDescription: string; wordCount: number; timeSpent: number }
  | { type: 'EVALUATION_COMPLETE'; evaluation: WritingEvaluationResult }
  | { type: 'RETRY_WRITING' }
  | { type: 'BACK_TO_STUDY' }
  | { type: 'LOAD_EXISTING'; personalEssay: PersonalEssay; modelData: Task1ModelData }
  | { type: 'ERROR'; message: string }

// ============================================================
// Mock Test state machine
// ============================================================

export type MockTestState =
  | { phase: 'idle' }
  | { phase: 'generating' }
  | { phase: 'task1-writing'; chartData: Task1ModelData; topic: WritingTopic; startTime: number }
  | { phase: 'task2-writing'; chartData: Task1ModelData; task1Essay: string; topic: WritingTopic; startTime: number }
  | { phase: 'evaluating'; chartData: Task1ModelData; task1Essay: string; topic: WritingTopic; task2Essay: string }
  | { phase: 'results'; task1Evaluation: WritingEvaluationResult; task2Evaluation: WritingEvaluationResult }
  | { phase: 'error'; message: string }

export type MockTestAction =
  | { type: 'START' }
  | { type: 'GENERATED'; chartData: Task1ModelData; topic: WritingTopic }
  | { type: 'SUBMIT_TASK1'; essay: string }
  | { type: 'SUBMIT_TASK2'; essay: string }
  | { type: 'EVALUATED'; task1Evaluation: WritingEvaluationResult; task2Evaluation: WritingEvaluationResult }
  | { type: 'ERROR'; message: string }
  | { type: 'RESTART' }
