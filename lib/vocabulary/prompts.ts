export function getVocabularyExtractionPrompt(transcript: string, topic?: string) {
  return {
    system: `You are an IELTS vocabulary expert. Extract 5-10 key vocabulary words from the student's speaking transcript that are important for IELTS preparation. Focus on B2-C1 level words (band 6.5-7.5) that would help improve their lexical resource score. Include both words the student used well AND words they could have used but didn't (suggest better alternatives).`,
    user: `Extract vocabulary from this IELTS speaking transcript${topic ? ` (topic: ${topic})` : ''}:

"${transcript}"

Return ONLY valid JSON as an array of objects, no other text:
[
  {
    "word": "the word or phrase",
    "pronunciation": "/IPA pronunciation/",
    "definition": "clear, concise definition",
    "example_sentence": "An example sentence in an IELTS context using this word",
    "part_of_speech": "noun|verb|adjective|adverb|phrase",
    "ielts_topic": "${topic || 'general'}"
  }
]

Guidelines:
- Include 5-10 words
- Focus on words useful for IELTS band 6.5-7.5
- Include collocations and phrasal verbs when relevant
- Example sentences should be IELTS-style (speaking or writing contexts)
- IPA pronunciation should be accurate`,
  }
}
