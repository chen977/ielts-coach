import type { WritingTopic, ChartTypeConfig, EssayTypeConfig, EssayType } from './types'

// ============================================================
// Essay Type Configurations
// ============================================================

export const ESSAY_TYPES: Record<EssayType, EssayTypeConfig> = {
  discuss_both_views: {
    name: 'Discuss Both Views',
    instruction: 'Discuss both views and give your opinion',
    template: 'Introduction (paraphrase + thesis) → Body 1 (View A + reason + example) → Body 2 (View B + reason + example) → Conclusion (your opinion + summary)',
  },
  agree_disagree: {
    name: 'Agree/Disagree',
    instruction: 'To what extent do you agree or disagree?',
    template: 'Introduction (paraphrase + position) → Body 1 (main reason + example) → Body 2 (second reason + example) → Conclusion (restate position)',
  },
  problem_solution: {
    name: 'Problem/Solution',
    instruction: 'What are the causes and solutions?',
    template: 'Introduction (paraphrase the problem) → Body 1 (causes + examples) → Body 2 (solutions + examples) → Conclusion (summary + outlook)',
  },
  advantages_disadvantages: {
    name: 'Advantages/Disadvantages',
    instruction: 'What are the advantages and disadvantages?',
    template: 'Introduction (paraphrase + overview) → Body 1 (advantages + examples) → Body 2 (disadvantages + examples) → Conclusion (overall view)',
  },
  two_part: {
    name: 'Two-Part Question',
    instruction: 'Answer both questions',
    template: 'Introduction (paraphrase both questions) → Body 1 (answer question 1) → Body 2 (answer question 2) → Conclusion (brief summary)',
  },
}

// ============================================================
// Task 2 Topics (15 topics across categories)
// ============================================================

export const TASK2_TOPICS: WritingTopic[] = [
  {
    id: 'education_practical',
    task: 2,
    category: 'Education',
    name: 'Practical vs Academic',
    icon: '🎓',
    essayType: 'discuss_both_views',
    topic: 'Some people believe that universities should focus on providing academic knowledge, while others think they should prepare students for practical work. Discuss both views and give your opinion.',
    ideaPrompts: [
      { field: 'opinion', label: "What's your opinion?", placeholder: 'e.g., I think universities should do both' },
      { field: 'forAcademic', label: 'Why is academic knowledge important?', placeholder: 'e.g., it builds critical thinking' },
      { field: 'forPractical', label: 'Why are practical skills important?', placeholder: 'e.g., employers want job-ready graduates' },
      { field: 'example', label: 'An example from your experience?', placeholder: 'e.g., my nursing program combines both' },
    ],
  },
  {
    id: 'technology_children',
    task: 2,
    category: 'Technology',
    name: 'Children & Smartphones',
    icon: '📱',
    essayType: 'agree_disagree',
    topic: 'Some people think that children should not be allowed to use smartphones until they are teenagers. To what extent do you agree or disagree?',
    ideaPrompts: [
      { field: 'opinion', label: 'Do you agree or disagree?', placeholder: 'e.g., I partly agree' },
      { field: 'reason1', label: 'Give one reason for your view', placeholder: 'e.g., too much screen time is harmful' },
      { field: 'reason2', label: 'Give another reason or counterpoint', placeholder: 'e.g., but technology skills are important' },
      { field: 'example', label: 'An example?', placeholder: 'e.g., in China, many kids use phones for homework' },
    ],
  },
  {
    id: 'environment_individual',
    task: 2,
    category: 'Environment',
    name: 'Government vs Individual',
    icon: '🌍',
    essayType: 'discuss_both_views',
    topic: 'Some people say that the best way to deal with environmental problems is through government action. Others believe individuals should take responsibility. Discuss both views and give your opinion.',
    ideaPrompts: [
      { field: 'opinion', label: 'What do you think?', placeholder: 'e.g., both are needed' },
      { field: 'forGovernment', label: 'How can governments help?', placeholder: 'e.g., laws to limit pollution' },
      { field: 'forIndividual', label: 'How can individuals help?', placeholder: 'e.g., reduce plastic use' },
      { field: 'example', label: 'An example?', placeholder: 'e.g., recycling programs in my city' },
    ],
  },
  {
    id: 'health_exercise',
    task: 2,
    category: 'Health',
    name: 'Lack of Exercise',
    icon: '🏃',
    essayType: 'problem_solution',
    topic: 'In many countries, people do not get enough physical exercise. What are the causes of this problem, and what measures can be taken to solve it?',
    ideaPrompts: [
      { field: 'cause1', label: "What's one cause?", placeholder: 'e.g., desk jobs, long working hours' },
      { field: 'cause2', label: 'Another cause?', placeholder: 'e.g., entertainment is screen-based now' },
      { field: 'solution1', label: 'One solution?', placeholder: 'e.g., companies could offer gym breaks' },
      { field: 'example', label: 'An example?', placeholder: 'e.g., my workplace has no exercise facilities' },
    ],
  },
  {
    id: 'work_remote',
    task: 2,
    category: 'Work',
    name: 'Remote Working',
    icon: '💻',
    essayType: 'advantages_disadvantages',
    topic: 'More and more people are working from home. What are the advantages and disadvantages of this trend?',
    ideaPrompts: [
      { field: 'advantage1', label: 'One advantage?', placeholder: 'e.g., save commuting time' },
      { field: 'advantage2', label: 'Another advantage?', placeholder: 'e.g., flexible schedule' },
      { field: 'disadvantage1', label: 'One disadvantage?', placeholder: 'e.g., feel isolated' },
      { field: 'example', label: 'An example from your life?', placeholder: 'e.g., I work remotely and sometimes feel lonely' },
    ],
  },
  {
    id: 'society_gap',
    task: 2,
    category: 'Society',
    name: 'Rich-Poor Gap',
    icon: '⚖️',
    essayType: 'two_part',
    topic: 'In many countries, the gap between the rich and the poor is growing. What problems does this cause? What solutions can you suggest?',
    ideaPrompts: [
      { field: 'problem1', label: 'What problem does this cause?', placeholder: 'e.g., less access to education for poor families' },
      { field: 'problem2', label: 'Another problem?', placeholder: 'e.g., social tension and crime' },
      { field: 'solution1', label: 'What solution would you suggest?', placeholder: 'e.g., progressive taxation' },
      { field: 'example', label: 'An example?', placeholder: 'e.g., in my country, rural areas lack good schools' },
    ],
  },
  {
    id: 'crime_punishment',
    task: 2,
    category: 'Crime',
    name: 'Prison vs Rehabilitation',
    icon: '🔒',
    essayType: 'discuss_both_views',
    topic: 'Some people think that the best way to reduce crime is to give longer prison sentences. Others believe there are better ways to reduce crime. Discuss both views and give your opinion.',
    ideaPrompts: [
      { field: 'opinion', label: 'What do you think?', placeholder: 'e.g., rehabilitation is more effective' },
      { field: 'forPrison', label: 'Why might longer sentences work?', placeholder: 'e.g., deters potential criminals' },
      { field: 'forAlternatives', label: 'What alternatives exist?', placeholder: 'e.g., education programs, community service' },
      { field: 'example', label: 'An example?', placeholder: 'e.g., countries with low crime rates focus on education' },
    ],
  },
  {
    id: 'media_influence',
    task: 2,
    category: 'Media',
    name: 'Social Media Influence',
    icon: '📰',
    essayType: 'agree_disagree',
    topic: 'Social media has a mostly negative effect on young people today. To what extent do you agree or disagree?',
    ideaPrompts: [
      { field: 'opinion', label: 'Do you agree or disagree?', placeholder: 'e.g., I partly disagree' },
      { field: 'negative', label: 'What negative effects does it have?', placeholder: 'e.g., cyberbullying, low self-esteem' },
      { field: 'positive', label: 'What positive effects might it have?', placeholder: 'e.g., connecting with friends, learning' },
      { field: 'example', label: 'An example?', placeholder: 'e.g., my younger sister uses it to learn languages' },
    ],
  },
  {
    id: 'culture_globalisation',
    task: 2,
    category: 'Culture',
    name: 'Cultural Identity',
    icon: '🎭',
    essayType: 'agree_disagree',
    topic: 'Globalisation is destroying cultural identity in many countries. To what extent do you agree or disagree?',
    ideaPrompts: [
      { field: 'opinion', label: 'Do you agree or disagree?', placeholder: 'e.g., I partly agree but think cultures can adapt' },
      { field: 'reason1', label: 'How does globalisation affect culture?', placeholder: 'e.g., young people prefer Western fashion and music' },
      { field: 'reason2', label: 'How do cultures resist or adapt?', placeholder: 'e.g., festivals and traditions still continue' },
      { field: 'example', label: 'An example from your country?', placeholder: 'e.g., traditional food is still popular despite fast food' },
    ],
  },
  {
    id: 'transport_cars',
    task: 2,
    category: 'Transport',
    name: 'Cars in Cities',
    icon: '🚗',
    essayType: 'problem_solution',
    topic: 'Traffic congestion is a growing problem in many large cities. What are the causes of this problem, and what solutions can be proposed?',
    ideaPrompts: [
      { field: 'cause1', label: 'What causes traffic congestion?', placeholder: 'e.g., too many private cars' },
      { field: 'cause2', label: 'Another cause?', placeholder: 'e.g., poor public transport' },
      { field: 'solution1', label: 'What solution would you propose?', placeholder: 'e.g., invest in metro systems' },
      { field: 'example', label: 'An example?', placeholder: 'e.g., my city has terrible traffic during rush hour' },
    ],
  },
  {
    id: 'housing_cities',
    task: 2,
    category: 'Housing',
    name: 'Housing Affordability',
    icon: '🏠',
    essayType: 'problem_solution',
    topic: 'In many cities, housing is becoming increasingly expensive, making it difficult for young people to afford their own homes. What are the reasons for this, and what can be done to address it?',
    ideaPrompts: [
      { field: 'cause1', label: 'Why is housing expensive?', placeholder: 'e.g., limited supply, high demand in cities' },
      { field: 'cause2', label: 'Another reason?', placeholder: 'e.g., property investors drive up prices' },
      { field: 'solution1', label: 'What can be done?', placeholder: 'e.g., government-subsidised housing' },
      { field: 'example', label: 'An example?', placeholder: 'e.g., young people in my city share apartments' },
    ],
  },
  {
    id: 'education_online',
    task: 2,
    category: 'Education',
    name: 'Online Learning',
    icon: '🖥️',
    essayType: 'advantages_disadvantages',
    topic: 'Many universities now offer online courses and degrees. What are the advantages and disadvantages of studying online compared to attending a traditional university?',
    ideaPrompts: [
      { field: 'advantage1', label: 'One advantage of online learning?', placeholder: 'e.g., study from anywhere, flexible timing' },
      { field: 'advantage2', label: 'Another advantage?', placeholder: 'e.g., cheaper than traditional universities' },
      { field: 'disadvantage1', label: 'One disadvantage?', placeholder: 'e.g., no face-to-face interaction with classmates' },
      { field: 'example', label: 'Your experience?', placeholder: 'e.g., I took an online course and found it hard to stay motivated' },
    ],
  },
  {
    id: 'globalisation_trade',
    task: 2,
    category: 'Globalization',
    name: 'International Trade',
    icon: '🌐',
    essayType: 'advantages_disadvantages',
    topic: 'International trade and free movement of goods have both positive and negative effects on countries. What are the advantages and disadvantages of international trade?',
    ideaPrompts: [
      { field: 'advantage1', label: 'One advantage?', placeholder: 'e.g., access to cheaper products' },
      { field: 'advantage2', label: 'Another advantage?', placeholder: 'e.g., economic growth and jobs' },
      { field: 'disadvantage1', label: 'One disadvantage?', placeholder: 'e.g., local businesses struggle to compete' },
      { field: 'example', label: 'An example?', placeholder: 'e.g., many local shops in my town have closed' },
    ],
  },
  {
    id: 'health_diet',
    task: 2,
    category: 'Health',
    name: 'Fast Food & Health',
    icon: '🍔',
    essayType: 'two_part',
    topic: 'In many countries, fast food is becoming cheaper and more widely available. What problems does this cause? What can be done about it?',
    ideaPrompts: [
      { field: 'problem1', label: 'What health problems does it cause?', placeholder: 'e.g., obesity and heart disease' },
      { field: 'problem2', label: 'What other problems?', placeholder: 'e.g., traditional cooking skills are lost' },
      { field: 'solution1', label: 'What can be done?', placeholder: 'e.g., tax fast food, teach cooking in schools' },
      { field: 'example', label: 'An example?', placeholder: 'e.g., many of my friends eat fast food every day' },
    ],
  },
  {
    id: 'technology_jobs',
    task: 2,
    category: 'Technology',
    name: 'Automation & Jobs',
    icon: '🤖',
    essayType: 'discuss_both_views',
    topic: 'Some people believe that automation and artificial intelligence will create more jobs than they destroy. Others think they will lead to mass unemployment. Discuss both views and give your opinion.',
    ideaPrompts: [
      { field: 'opinion', label: 'What do you think?', placeholder: 'e.g., new types of jobs will appear' },
      { field: 'forOptimistic', label: 'How could AI create jobs?', placeholder: 'e.g., new industries, need for AI trainers' },
      { field: 'forPessimistic', label: 'How could AI destroy jobs?', placeholder: 'e.g., factory workers, drivers replaced' },
      { field: 'example', label: 'An example?', placeholder: 'e.g., self-checkout machines replacing cashiers' },
    ],
  },
]

// ============================================================
// Task 1 Chart Type Configurations
// ============================================================

export const TASK1_CHART_TYPES: ChartTypeConfig[] = [
  {
    id: 'line_graph',
    chartType: 'line',
    name: 'Line Graph',
    icon: '📈',
    description: 'Shows changes over time',
    keyLanguage: [
      'increased', 'decreased', 'rose', 'fell', 'fluctuated',
      'remained stable', 'peaked at', 'reached a low of',
      'grew steadily', 'declined sharply', 'levelled off',
    ],
  },
  {
    id: 'bar_chart',
    chartType: 'bar',
    name: 'Bar Chart',
    icon: '📊',
    description: 'Compares different categories',
    keyLanguage: [
      'significantly higher than', 'roughly equal to',
      'the largest proportion', 'the smallest share',
      'twice as much as', 'marginally less than',
      'the most popular', 'the least common',
    ],
  },
  {
    id: 'pie_chart',
    chartType: 'pie',
    name: 'Pie Chart',
    icon: '🥧',
    description: 'Shows proportions of a whole',
    keyLanguage: [
      'accounted for', 'comprised', 'made up',
      'the majority of', 'a quarter of', 'a small fraction',
      'the largest segment', 'represented',
    ],
  },
  {
    id: 'table',
    chartType: 'table',
    name: 'Table',
    icon: '📋',
    description: 'Presents specific data points',
    keyLanguage: [
      'the highest figure', 'the lowest value',
      'compared to', 'in contrast', 'whereas',
      'the same as', 'slightly more than', 'considerably fewer',
    ],
  },
  {
    id: 'process',
    chartType: 'process',
    name: 'Process Diagram',
    icon: '🔄',
    description: 'Shows steps in a process',
    keyLanguage: [
      'firstly', 'subsequently', 'following this',
      'the final stage', 'is then processed',
      'at the next stage', 'once this is complete',
      'the process begins with',
    ],
  },
]

// ============================================================
// Helper functions
// ============================================================

export function getTask2TopicById(id: string): WritingTopic | undefined {
  return TASK2_TOPICS.find(t => t.id === id)
}

export function getChartTypeById(id: string): ChartTypeConfig | undefined {
  return TASK1_CHART_TYPES.find(t => t.id === id)
}

export function getEssayTypeConfig(type: EssayType): EssayTypeConfig {
  return ESSAY_TYPES[type]
}
