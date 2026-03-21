import type { ListeningSection } from './types'

// Re-export extractJSON from speaking prompts
export { extractJSON } from '../speaking/prompts'

export function getListeningGenerationPrompt(section: ListeningSection) {
  const baseSystem = `You are an expert IELTS Listening test designer. Generate a realistic IELTS Listening Section ${section} practice test. Return ONLY valid JSON matching the exact schema specified — no other text.`

  if (section === 1) {
    return {
      system: baseSystem,
      user: `Generate an IELTS Listening Section 1 practice test.

SCENARIO: An everyday conversation between exactly 2 speakers in a practical context (e.g., booking a hotel, enrolling at a gym, renting equipment, calling a travel agency, registering for a course). Pick a specific, realistic scenario.

SCRIPT REQUIREMENTS:
- 2 speakers with named roles (e.g., "RECEPTIONIST", "CALLER")
- 500-700 words of natural dialogue
- Include stage directions in the direction field (e.g., "phone rings", "typing sounds", "pause")
- Naturally embed factual details (names, numbers, dates, addresses, prices) that become answers
- Use natural speech patterns with fillers and corrections

QUESTIONS: Exactly 10 questions in 2 groups:
- Group 1 (Questions 1-5): form_fill type — completing a form/notes. Provide a contextLabel (e.g., "HOTEL BOOKING FORM"). Each question has a label (the form field name) and the correctAnswer.
- Group 2 (Questions 6-10): sentence_completion type — completing sentences about the conversation. Each has a sentence with "______" marking the blank, and the correctAnswer (1-3 words).

Correct answers should be short (1-3 words): names, numbers, dates, single nouns.

VOCABULARY: 5-6 useful words/phrases from the script with definitions and example sentences.

Return JSON in this exact format:
{
  "section": 1,
  "title": "Descriptive title of the scenario",
  "script": [
    { "speaker": "RECEPTIONIST", "text": "Good morning, City Library. How can I help you?", "direction": "phone rings" },
    { "speaker": "CALLER", "text": "Hi, I'd like to register for a library card please." }
  ],
  "questionGroups": [
    {
      "instructions": "Questions 1-5: Complete the form below.",
      "contextLabel": "LIBRARY MEMBERSHIP APPLICATION",
      "questions": [
        { "id": 1, "type": "form_fill", "label": "Full Name", "correctAnswer": "Sarah Mitchell" },
        { "id": 2, "type": "form_fill", "label": "Date of Birth", "correctAnswer": "15 March 1990" }
      ]
    },
    {
      "instructions": "Questions 6-10: Complete the sentences below. Write NO MORE THAN THREE WORDS for each answer.",
      "questions": [
        { "id": 6, "type": "sentence_completion", "sentence": "The caller needs to bring a ______ as proof of address.", "correctAnswer": "utility bill" }
      ]
    }
  ],
  "vocabulary": [
    { "word": "register", "definition": "to officially sign up for something", "example": "I need to register for the new course." }
  ]
}`,
    }
  }

  if (section === 2) {
    return {
      system: baseSystem,
      user: `Generate an IELTS Listening Section 2 practice test.

SCENARIO: A monologue by a single speaker on an everyday topic (e.g., a tour guide explaining a local attraction, an orientation talk at a workplace, an announcement about community facilities, a talk about a local event or service).

SCRIPT REQUIREMENTS:
- 1 main speaker with a named role (e.g., "GUIDE", "MANAGER")
- 600-800 words of natural monologue
- Include stage directions (e.g., "pointing to map", "pause", "clicks to next slide")
- Organized with clear sections and signposting language ("First... Next... Finally...")
- Include specific details: names, locations, times, prices, features

QUESTIONS: Exactly 10 questions in 2 groups:
- Group 1 (Questions 1-5): multiple_choice type — each has a question, 3 options (A/B/C), and correctAnswer (the value: "A", "B", or "C")
- Group 2 (Questions 6-10): matching type — match items to categories from a list. Each has an item to match, a list of options, and the correctAnswer (the matching option text).

VOCABULARY: 5-6 useful words/phrases with definitions and examples.

Return JSON in this exact format:
{
  "section": 2,
  "title": "Descriptive title",
  "script": [
    { "speaker": "GUIDE", "text": "Welcome everyone to the Riverside Nature Reserve.", "direction": "addressing group" }
  ],
  "questionGroups": [
    {
      "instructions": "Questions 1-5: Choose the correct letter, A, B or C.",
      "questions": [
        { "id": 1, "type": "multiple_choice", "question": "The reserve was established in", "options": [{"label": "1985", "value": "A"}, {"label": "1992", "value": "B"}, {"label": "2001", "value": "C"}], "correctAnswer": "B" }
      ]
    },
    {
      "instructions": "Questions 6-10: What feature is found in each area of the reserve?",
      "questions": [
        { "id": 6, "type": "matching", "item": "East Garden", "options": ["Children's playground", "Picnic area", "Bird watching hide", "Café", "Gift shop", "Sculpture trail"], "correctAnswer": "Bird watching hide" }
      ]
    }
  ],
  "vocabulary": [
    { "word": "reserve", "definition": "a protected area of land", "example": "The nature reserve is home to many rare birds." }
  ]
}`,
    }
  }

  if (section === 3) {
    return {
      system: baseSystem,
      user: `Generate an IELTS Listening Section 3 practice test.

SCENARIO: An academic conversation between 2-3 speakers (e.g., students discussing an assignment, a student consulting a tutor, a study group planning a project). The topic should be academic but accessible.

SCRIPT REQUIREMENTS:
- 2-3 speakers with named roles (e.g., "STUDENT A", "STUDENT B", "TUTOR" or "DR CHEN")
- 600-800 words of natural academic discussion
- Include stage directions (e.g., "looking at notes", "pause", "shuffling papers")
- Speakers should express opinions, agree/disagree, and build on each other's points
- Include academic vocabulary and reference to research/sources

QUESTIONS: Exactly 10 questions in 2 groups:
- Group 1 (Questions 1-5): multiple_choice type — questions about opinions, reasons, plans. 3 options each.
- Group 2 (Questions 6-10): matching type — match items (e.g., topics, researchers, study methods) to descriptions/opinions.

VOCABULARY: 5-6 academic words/phrases with definitions and examples.

Return JSON in this exact format:
{
  "section": 3,
  "title": "Descriptive title",
  "script": [
    { "speaker": "TUTOR", "text": "So, how are you getting on with your research project?" }
  ],
  "questionGroups": [
    {
      "instructions": "Questions 1-5: Choose the correct letter, A, B or C.",
      "questions": [
        { "id": 1, "type": "multiple_choice", "question": "What is the main topic of their project?", "options": [{"label": "Climate change effects on agriculture", "value": "A"}, {"label": "Urban planning strategies", "value": "B"}, {"label": "Social media impact on learning", "value": "C"}], "correctAnswer": "A" }
      ]
    },
    {
      "instructions": "Questions 6-10: Match each research method with the correct description.",
      "questions": [
        { "id": 6, "type": "matching", "item": "Surveys", "options": ["Most time-consuming", "Most reliable results", "Easiest to analyse", "Best for qualitative data", "Already completed", "Still in progress"], "correctAnswer": "Already completed" }
      ]
    }
  ],
  "vocabulary": [
    { "word": "methodology", "definition": "a system of methods used in a particular area of study", "example": "We need to explain our research methodology clearly." }
  ]
}`,
    }
  }

  // Section 4
  return {
    system: baseSystem,
    user: `Generate an IELTS Listening Section 4 practice test.

SCENARIO: An academic lecture or presentation by a single speaker on a specific academic topic (e.g., marine biology, urban development, historical linguistics, psychology of decision-making, sustainable architecture). Choose an interesting, specific topic.

SCRIPT REQUIREMENTS:
- 1 speaker: a lecturer or presenter (e.g., "PROFESSOR", "DR MARTINEZ")
- 800-1000 words — the longest section
- Include stage directions (e.g., "shows slide", "draws on board", "pause")
- Dense with information: statistics, dates, research findings, technical terms
- Well-organized with clear topic sentences and transitions
- More complex vocabulary and sentence structures than other sections

QUESTIONS: Exactly 10 questions in 2 groups:
- Group 1 (Questions 1-5): sentence_completion type — completing sentences from the lecture. Answers should be 1-3 words.
- Group 2 (Questions 6-10): form_fill type (summary/notes completion) — filling in a set of lecture notes. Provide a contextLabel (e.g., "LECTURE NOTES: [Topic]"). Answers should be 1-3 words.

Correct answers should use specific academic vocabulary, numbers, or technical terms from the lecture.

VOCABULARY: 6-8 academic words/phrases with definitions and examples.

Return JSON in this exact format:
{
  "section": 4,
  "title": "Descriptive title",
  "script": [
    { "speaker": "PROFESSOR", "text": "Today I want to talk about a fascinating area of research...", "direction": "shows first slide" }
  ],
  "questionGroups": [
    {
      "instructions": "Questions 1-5: Complete the sentences below. Write NO MORE THAN THREE WORDS for each answer.",
      "questions": [
        { "id": 1, "type": "sentence_completion", "sentence": "The earliest known examples of this phenomenon date back to ______.", "correctAnswer": "the 15th century" }
      ]
    },
    {
      "instructions": "Questions 6-10: Complete the notes below. Write NO MORE THAN THREE WORDS for each answer.",
      "contextLabel": "LECTURE NOTES: Topic Name",
      "questions": [
        { "id": 6, "type": "form_fill", "label": "Main research method used", "correctAnswer": "field observations" }
      ]
    }
  ],
  "vocabulary": [
    { "word": "phenomenon", "definition": "a fact or situation that is observed to exist or happen", "example": "This phenomenon has been studied extensively." }
  ]
}`,
  }
}
