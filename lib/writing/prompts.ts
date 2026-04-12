import type { EssayType, ChartType } from './types'
import { ESSAY_TYPES } from './topics'

export { extractJSON } from '@/lib/speaking/prompts'

export function getPersonalEssayPrompt(
  topicText: string,
  essayType: EssayType,
  personalIdeas: Record<string, string>
) {
  const ideasList = Object.entries(personalIdeas)
    .filter(([, value]) => value.trim())
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n')

  const essayTypeConfig = ESSAY_TYPES[essayType]

  return {
    system: `You are an IELTS Writing examiner and coach. The student is at Band 5-5.5 aiming for Band 7.

Given their ideas and opinions, write a Band 7 model essay that:
- Uses THEIR ideas and examples (don't invent different arguments)
- Demonstrates clear paragraph structure (introduction, 2-3 body paragraphs, conclusion)
- Uses appropriate linking devices naturally (not mechanically)
- Shows Band 7 vocabulary without being pretentious
- Is 250-280 words (realistic for a timed exam)
- Matches the essay type: "${essayTypeConfig.name}" — ${essayTypeConfig.instruction}
- Structure follows: ${essayTypeConfig.template}

Also provide:
- A structural breakdown: for each paragraph, explain its PURPOSE and KEY TECHNIQUE
- 8-10 "upgrade phrases" used in the essay with definitions
- The reusable template for this essay type
- 3 grammar patterns demonstrated in the essay
- 3 practical writing tips

Respond in JSON format only. No other text.`,

    user: `IELTS Writing Task 2 topic:
"${topicText}"

Essay type: ${essayTypeConfig.name}

Student's ideas:
${ideasList}

Return ONLY valid JSON in this exact format:
{
  "essayType": "${essayType}",
  "modelEssay": "the full essay text with proper paragraph breaks (use \\n\\n between paragraphs)",
  "paragraphs": [
    {
      "type": "introduction",
      "text": "the introduction paragraph text",
      "purpose": "what this paragraph does (e.g., 'Paraphrases the question and states the writer's position')",
      "technique": "key writing technique (e.g., 'Thesis statement with qualified opinion')"
    },
    {
      "type": "body",
      "text": "body paragraph 1 text",
      "purpose": "what this paragraph argues",
      "technique": "key technique used"
    },
    {
      "type": "body",
      "text": "body paragraph 2 text",
      "purpose": "what this paragraph argues",
      "technique": "key technique used"
    },
    {
      "type": "conclusion",
      "text": "conclusion paragraph text",
      "purpose": "what this paragraph does",
      "technique": "key technique used"
    }
  ],
  "upgradePhrases": [
    {"phrase": "exact phrase from the essay", "definition": "what it means / why it's effective", "category": "linking"},
    {"phrase": "another phrase", "definition": "explanation", "category": "vocabulary"},
    {"phrase": "another phrase", "definition": "explanation", "category": "grammar"}
  ],
  "structureTemplate": "A reusable skeleton template for this essay type",
  "grammarPatterns": [
    {"pattern": "Pattern name", "example": "exact sentence from the essay", "explanation": "why this is effective at Band 7"}
  ],
  "writingTips": ["practical tip 1", "practical tip 2", "practical tip 3"]
}`,
  }
}

export function getTask1GenerationPrompt(chartType: ChartType) {
  const chartDescriptions: Record<ChartType, string> = {
    line: 'a line graph showing changes over time (e.g., population growth, sales trends, temperature changes over years/months)',
    bar: 'a bar chart comparing different categories (e.g., spending by country, energy sources, transport usage)',
    pie: 'a pie chart showing proportions of a whole (e.g., budget allocation, energy sources, student preferences)',
    table: 'a data table presenting specific numerical data (e.g., tourist arrivals, exports by country, employment figures)',
    process: 'a process diagram showing sequential steps (e.g., how chocolate is made, water treatment, recycling process)',
  }

  return {
    system: `You are an IELTS Writing Task 1 coach. Generate a realistic data set and a Band 7 model description.

Create:
1. A simple, clear data set appropriate for ${chartDescriptions[chartType]}
2. The data should be IELTS-exam-appropriate (realistic topic, clear trends/features to describe)
3. A Band 7 model description (150-180 words) that:
   - Starts with a paraphrase of what the data shows
   - Gives a clear overview of the main trends/features
   - Describes key data points with specific numbers
   - Uses appropriate data language throughout
   - Has a clear structure: paraphrase → overview → details

${chartType === 'process' ? `For process diagrams, provide:
- A list of 6-8 steps in the process
- Each step has a name and description
- The chartData should be an array of {step: number, name: string, description: string}
- Use xAxisKey: "step" and dataKeys: ["name"]` : `For ${chartType} charts, provide:
- Data in Recharts-compatible JSON format
- For line graphs: [{year: "2010", value1: 50, value2: 30}, ...]
- For bar charts: [{category: "USA", amount: 500}, ...]
- For pie charts: [{name: "Category A", value: 30}, ...]
- For tables: [{country: "USA", year2020: 500, year2021: 600}, ...]`}

Respond in JSON format only. No other text.`,

    user: `Generate an IELTS Writing Task 1 ${chartType === 'table' ? 'table' : chartType + ' chart'} with data and a model description.

Return ONLY valid JSON in this exact format:
{
  "chartType": "${chartType}",
  "chartTitle": "A clear, descriptive title for the chart",
  "chartData": [data points as described above],
  "xAxisKey": "the key for the x-axis (e.g., 'year', 'category', 'name')",
  "dataKeys": ["key1", "key2"],
  "modelDescription": "the full Band 7 description text with proper paragraph breaks (use \\n\\n between paragraphs)",
  "paragraphs": [
    {
      "type": "introduction",
      "text": "paraphrase paragraph",
      "purpose": "Paraphrases what the data shows",
      "technique": "Paraphrasing the chart title/description"
    },
    {
      "type": "body",
      "text": "overview and key features",
      "purpose": "Highlights main trends",
      "technique": "Overview statement"
    },
    {
      "type": "body",
      "text": "detailed data description",
      "purpose": "Provides specific data",
      "technique": "Data language with numbers"
    }
  ],
  "dataLanguage": [
    {"phrase": "exact phrase from the description", "definition": "what it means", "usage": "when to use this phrase"},
    {"phrase": "another phrase", "definition": "explanation", "usage": "context"}
  ],
  "structureTemplate": "Paraphrase → Overview → Key Feature 1 → Key Feature 2 → Detail"
}`,
  }
}

export function getWritingEvaluationPrompt(
  task: 1 | 2,
  topicText: string,
  userEssay: string,
  essayType?: string,
  modelEssay?: string
) {
  const wordCount = userEssay.trim().split(/\s+/).filter(Boolean).length
  const minWords = task === 1 ? 150 : 250
  const taskLabel = task === 1 ? 'Task 1 (Report/Description)' : 'Task 2 (Essay)'

  const modelContext = modelEssay
    ? `\n\nModel answer (for comparison — student studied this in Level 1):\n"${modelEssay}"\n`
    : ''

  const essayTypeContext = essayType
    ? `\nEssay type: ${essayType}\n`
    : ''

  return {
    system: `You are an experienced IELTS Writing examiner. Evaluate this ${taskLabel} constructively.
The student is at Band 5-5.5 and aiming for Band 7.

Evaluate on the official IELTS Writing criteria:
1. **Task Achievement/Response (TA)** (0-9): Did they address all parts of the task? Is the position clear? Are ideas adequately developed and supported?
2. **Coherence & Cohesion (CC)** (0-9): Is it well-organized with clear progression? Are paragraphs used logically? Are linking devices used effectively (not mechanically)?
3. **Lexical Resource (LR)** (0-9): Vocabulary range and accuracy? Use of less common items? Word choice precision? Spelling accuracy?
4. **Grammatical Range & Accuracy (GRA)** (0-9): Sentence variety and complexity? Error frequency and type? Punctuation accuracy?

## Band Descriptors — calibrate your scores:

**Band 0-2**: No answer, completely irrelevant, or unintelligible writing. Score 0 for blank, 1-2 for no communicative ability.

**Band 3**: Extremely limited writing. Only isolated words or copied phrases. No discernible organization. Incomprehensible most of the time.

**Band 4**: Very basic writing. Limited vocabulary, many errors causing difficulty for the reader. Minimal paragraphing. Barely addresses the task.

**Band 5**: Addresses the task but incompletely. Limited vocabulary with noticeable errors. Repetitive linking devices. Mostly simple sentences with frequent errors. Some paragraphing but not always logical.

**Band 6**: Addresses all parts of the task, though some parts may be more developed than others. Adequate vocabulary with some less common items. Some errors in word choice. Mix of simple and complex sentences. Clear overall progression with some effective linking.

**Band 7**: Addresses all parts of the task with a clear position and well-supported ideas. Good vocabulary range with awareness of style and collocation. Few errors in word choice. Variety of complex structures with frequent error-free sentences. Well-organized with clear progression throughout.

**Band 8**: Fully developed response with relevant, extended ideas. Wide vocabulary used skillfully and precisely. Very rare errors. Wide range of structures used flexibly and accurately. Skillful paragraphing.

**Band 9**: Expert, fully-developed response. Complete flexibility in vocabulary. Extremely rare errors. Full range of structures used with full accuracy and appropriacy.

## Scoring Rules — you MUST follow these:

- **Use the FULL range from 0 to 9. Do NOT cluster scores around 5-6.**
- Word count is a key factor: under ${minWords} words means max Band 5 for Task Achievement.
- No clear paragraphing: max Band 5 for Coherence & Cohesion.
- If the essay is off-topic or doesn't address the task, TA must be Band 3 or below.
- A genuinely strong essay with good language SHOULD score 7.0+.
- A weak, error-filled essay SHOULD score 3.0-4.0.
- Be accurate and discriminating. Scores must reflect real IELTS standards.
- Be warm and encouraging but honest. Always start feedback with positives.

Band scores: whole or half numbers (0, 2.0, 3.5, 5.0, 6.5, 7.0, 8.5, 9.0) on a 0-9 scale.

Respond in JSON format only. No other text.`,

    user: `IELTS Writing ${taskLabel}

Topic: "${topicText}"
${essayTypeContext}
Word count: ${wordCount} words (minimum required: ${minWords})

Student's essay:
"${userEssay}"
${modelContext}
Evaluate the essay and return ONLY valid JSON in this exact format:
{
  "overallBand": 6.0,
  "criteria": [
    {"criterion": "TA", "band": 6.0, "feedback": "Detailed feedback on task achievement..."},
    {"criterion": "CC", "band": 6.0, "feedback": "Detailed feedback on coherence and cohesion..."},
    {"criterion": "LR", "band": 5.5, "feedback": "Detailed feedback on lexical resource..."},
    {"criterion": "GRA", "band": 6.0, "feedback": "Detailed feedback on grammatical range..."}
  ],
  "paragraphFeedback": [
    {"paragraphNumber": 1, "positives": "What works well in this paragraph...", "improvements": "What could be improved..."}
  ],
  "grammarCorrections": [
    {"original": "exact text from the essay with error", "corrected": "corrected version", "explanation": "brief explanation of the error"}
  ],
  "vocabUpgrades": [
    {"original": "simple word/phrase from the essay", "upgrade": "better alternative", "explanation": "why this is an improvement"}
  ],
  "positives": ["genuine strength 1", "genuine strength 2"],
  "improvements": ["specific actionable improvement 1", "specific improvement 2"],
  "encouragement": "A warm closing message that feels genuine"
}`,
  }
}
