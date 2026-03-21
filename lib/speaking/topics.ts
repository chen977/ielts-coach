import { Topic, SpeakingPart } from './types'

export const PART1_TOPICS: Topic[] = [
  {
    id: 'hometown',
    part: 1,
    name: 'Hometown',
    icon: '🏠',
    questions: [
      'Where is your hometown?',
      'What do you like most about your hometown?',
      'Has your hometown changed much in recent years?',
      'Would you recommend tourists visit your hometown?',
    ],
    personalDetailPrompts: [
      { field: 'birthCity', label: 'Where did you grow up? (city/town, country)', placeholder: 'e.g., Chengdu, China' },
      { field: 'currentCity', label: 'Where do you live now? (leave blank if same place)', placeholder: 'e.g., Shanghai — or leave blank' },
      { field: 'yearsCurrentCity', label: 'If you moved, how long have you been in your current city?', placeholder: 'e.g., 3 years, or "grew up here"' },
      { field: 'whyMoved', label: 'Why did you move, if you did? (work, study, family, etc.)', placeholder: 'e.g., came to study medicine, or leave blank' },
      { field: 'bestThing', label: 'What do you like most about where you live now?', placeholder: 'e.g., the food scene, it\'s close to nature' },
      { field: 'favoriteSpot', label: 'One specific place you love there?', placeholder: 'e.g., Jinli Ancient Street, a riverside café' },
      { field: 'recentChange', label: 'How has it changed in recent years?', placeholder: 'e.g., lots of new development, or stayed the same' },
    ],
  },
  {
    id: 'work_study',
    part: 1,
    name: 'Work or Studies',
    icon: '💼',
    questions: [
      'Do you work or are you a student?',
      'What do you like about your job/studies?',
      'Would you like to change your job/field of study?',
      'What did you want to be when you were younger?',
    ],
    personalDetailPrompts: [
      { field: 'currentStatus', label: 'Are you working, studying, or doing both?', placeholder: 'e.g., working full-time, studying part-time' },
      { field: 'jobOrField', label: 'Your job title or field of study?', placeholder: 'e.g., paediatric nurse, MBA student' },
      { field: 'organization', label: 'Where do you work or study?', placeholder: 'e.g., Guangzhou Children\'s Hospital' },
      { field: 'howLong', label: 'How long have you been doing this?', placeholder: 'e.g., 2 years, just started' },
      { field: 'enjoyment', label: 'What do you genuinely enjoy about it?', placeholder: 'e.g., seeing patients recover' },
      { field: 'challenge', label: 'What\'s the hardest part?', placeholder: 'e.g., 12-hour night shifts, exam pressure' },
      { field: 'pastOrChange', label: 'Did you switch careers or fields? What did you do before?', placeholder: 'e.g., used to work in marketing, or leave blank' },
      { field: 'futureGoal', label: 'Where do you want to be professionally in a few years?', placeholder: 'e.g., specialize in cardiology, start my own business' },
    ],
  },
  {
    id: 'daily_routine',
    part: 1,
    name: 'Daily Routine',
    icon: '⏰',
    questions: [
      'What is your typical daily routine?',
      'What do you usually do in the morning?',
      'Do you prefer to have a fixed routine or a flexible one?',
      'Has your daily routine changed recently?',
    ],
    personalDetailPrompts: [
      { field: 'scheduleType', label: 'What kind of schedule do you have?', placeholder: 'e.g., regular 9-5, rotating shifts, flexible freelance' },
      { field: 'wakeTime', label: 'What time do you usually wake up?', placeholder: 'e.g., 6:30am, varies between 5am and 8am' },
      { field: 'morningRoutine', label: 'What do you do first thing in the morning?', placeholder: 'e.g., gym, make coffee, rush straight out' },
      { field: 'mainActivity', label: 'What fills most of your day?', placeholder: 'e.g., ward rounds and patient care' },
      { field: 'lunchHabits', label: 'What do you usually do at lunch?', placeholder: 'e.g., eat at my desk, go out with colleagues' },
      { field: 'eveningActivity', label: 'What do you typically do in the evenings?', placeholder: 'e.g., study English, cook, decompress watching TV' },
      { field: 'recentChange', label: 'Has your routine changed significantly recently? How?', placeholder: 'e.g., started waking earlier since having a baby, or no big changes' },
    ],
  },
  {
    id: 'hobbies',
    part: 1,
    name: 'Hobbies & Free Time',
    icon: '🎨',
    questions: [
      'What do you like to do in your free time?',
      'Have your hobbies changed since you were young?',
      'Do you prefer indoor or outdoor activities?',
      'Is there a hobby you\'d like to try?',
    ],
    personalDetailPrompts: [
      { field: 'mainHobby', label: 'What\'s your main hobby right now?', placeholder: 'e.g., hiking, reading novels, playing badminton' },
      { field: 'howLong', label: 'How long have you had this hobby?', placeholder: 'e.g., since I was a child, just picked it up last year' },
      { field: 'howOften', label: 'How often do you do it?', placeholder: 'e.g., every weekend, only when I have free time (rare!)' },
      { field: 'whyEnjoy', label: 'Why does it matter to you?', placeholder: 'e.g., clears my head after a stressful week' },
      { field: 'pastHobby', label: 'Something you used to do but don\'t anymore?', placeholder: 'e.g., played piano as a kid but stopped at uni, or no change' },
      { field: 'wantToTry', label: 'A hobby you\'d love to try but haven\'t yet?', placeholder: 'e.g., rock climbing, pottery, learning guitar' },
    ],
  },
  {
    id: 'food',
    part: 1,
    name: 'Food & Cooking',
    icon: '🍳',
    questions: [
      'What kind of food do you like?',
      'Do you prefer eating at home or in restaurants?',
      'Can you cook? What do you usually make?',
      'Is there any food you dislike?',
    ],
    personalDetailPrompts: [
      { field: 'favoriteFood', label: 'What\'s your favorite food or cuisine?', placeholder: 'e.g., Sichuan hot pot, Japanese ramen' },
      { field: 'dietaryNotes', label: 'Any dietary restrictions or strong preferences?', placeholder: 'e.g., vegetarian, can\'t eat spicy, none' },
      { field: 'cookingSkill', label: 'How well do you cook? What do you actually make?', placeholder: 'e.g., can make a few dishes, love baking, can only make instant noodles' },
      { field: 'eatingPattern', label: 'How often do you eat out vs. cook at home?', placeholder: 'e.g., mostly eat out on weekdays, cook on weekends' },
      { field: 'comfortFood', label: 'A dish that reminds you of home or family?', placeholder: 'e.g., my grandmother\'s dumplings at New Year' },
      { field: 'dislikedFood', label: 'A food you genuinely can\'t stand?', placeholder: 'e.g., durian, coriander, or nothing really' },
    ],
  },
  {
    id: 'travel',
    part: 1,
    name: 'Travel',
    icon: '✈️',
    questions: [
      'Do you like travelling?',
      'Where was the last place you visited?',
      'Do you prefer travelling alone or with others?',
      'What place would you most like to visit in the future?',
    ],
    personalDetailPrompts: [
      { field: 'travelBackground', label: 'How much have you traveled? Mostly within your country or internationally?', placeholder: 'e.g., a few international trips, mostly domestic, barely traveled due to work' },
      { field: 'lastTrip', label: 'Where did you last travel? How was it?', placeholder: 'e.g., Guilin last spring — beautiful but crowded' },
      { field: 'bestTrip', label: 'The trip that meant the most to you (even if it was simple)?', placeholder: 'e.g., a road trip with my family to my grandparents\' village' },
      { field: 'travelStyle', label: 'Alone, with a partner, friends, or family?', placeholder: 'e.g., with my husband, solo backpacking' },
      { field: 'dreamDestination', label: 'Where do you most want to go and why?', placeholder: 'e.g., Scotland — love the landscapes I\'ve seen online' },
      { field: 'travelBarrier', label: 'Is there anything that limits your travel?', placeholder: 'e.g., can\'t take much leave, tight budget, or nothing major' },
    ],
  },
  {
    id: 'technology',
    part: 1,
    name: 'Technology',
    icon: '📱',
    questions: [
      'How often do you use your phone?',
      'What technology do you find most useful?',
      'Do you think people spend too much time on technology?',
      'What technology did you not have as a child?',
    ],
    personalDetailPrompts: [
      { field: 'mainDevices', label: 'What devices do you use most?', placeholder: 'e.g., iPhone for everything, laptop for work' },
      { field: 'screenTime', label: 'Roughly how many hours on screens per day?', placeholder: 'e.g., 6-8 hours including work, maybe 2-3 personal' },
      { field: 'mostUseful', label: 'Technology you genuinely couldn\'t live without?', placeholder: 'e.g., translation apps, video calls to my family' },
      { field: 'annoyance', label: 'Something about technology that bothers or worries you?', placeholder: 'e.g., always being contactable, kids addicted to phones' },
      { field: 'socialMedia', label: 'Do you use social media? Which ones, and how much?', placeholder: 'e.g., WeChat constantly, avoid Instagram, deleted TikTok' },
      { field: 'techChildhood', label: 'What was your relationship with technology growing up?', placeholder: 'e.g., had a family computer at 10, no smartphone until university' },
    ],
  },
  {
    id: 'health',
    part: 1,
    name: 'Health & Fitness',
    icon: '💪',
    questions: [
      'What do you do to stay healthy?',
      'Do you play any sports?',
      'How important is it to eat healthy food?',
      'Has your attitude towards health changed over the years?',
    ],
    personalDetailPrompts: [
      { field: 'currentExercise', label: 'What exercise do you do right now?', placeholder: 'e.g., run 3x/week, barely anything due to work schedule' },
      { field: 'frequency', label: 'How often?', placeholder: 'e.g., 3-4 times a week, almost never recently' },
      { field: 'healthChange', label: 'Has your approach to health changed over time?', placeholder: 'e.g., much healthier since 30, or got lazier since starting work' },
      { field: 'challenge', label: 'Any health challenges or physical limitations?', placeholder: 'e.g., bad back so can\'t run, used to have an injury, nothing major' },
      { field: 'diet', label: 'How do you approach food and nutrition?', placeholder: 'e.g., try to eat vegetables, not strict about it, eat whatever\'s available' },
      { field: 'mentalHealth', label: 'Do you do anything for mental health / stress?', placeholder: 'e.g., meditate, walk in nature, or honestly not enough' },
    ],
  },
  {
    id: 'weather',
    part: 1,
    name: 'Weather',
    icon: '🌤️',
    questions: [
      'What kind of weather do you like?',
      'What is the weather like in your hometown?',
      'Does the weather affect your mood?',
      'What do you usually do on rainy days?',
    ],
    personalDetailPrompts: [
      { field: 'currentClimate', label: 'What\'s the climate like where you live now?', placeholder: 'e.g., very hot and humid, four clear seasons' },
      { field: 'grownUpClimate', label: 'Was it different where you grew up? (if you moved)', placeholder: 'e.g., much colder in the north, or same city so same' },
      { field: 'favoriteWeather', label: 'Your ideal weather?', placeholder: 'e.g., 22°C and sunny with a breeze' },
      { field: 'weatherImpact', label: 'How does the weather actually affect your daily life?', placeholder: 'e.g., too hot to exercise outside in summer' },
      { field: 'rainyDay', label: 'What do you do on rainy or miserable days?', placeholder: 'e.g., stay in with a book and tea, doesn\'t change much' },
      { field: 'extremeWeather', label: 'Any extreme weather you\'ve experienced?', placeholder: 'e.g., typhoon, terrible winter snowstorm, or nothing dramatic' },
    ],
  },
  {
    id: 'shopping',
    part: 1,
    name: 'Shopping',
    icon: '🛍️',
    questions: [
      'Do you like shopping?',
      'Do you prefer shopping online or in stores?',
      'What was the last thing you bought?',
      'Do you ever buy things you don\'t need?',
    ],
    personalDetailPrompts: [
      { field: 'shoppingAttitude', label: 'Do you enjoy shopping or see it as a chore?', placeholder: 'e.g., love browsing, or hate it and buy only what I need' },
      { field: 'shoppingMedium', label: 'Mostly online, in-store, or both?', placeholder: 'e.g., almost everything online since COVID' },
      { field: 'recentPurchase', label: 'Something you bought recently that you were happy about?', placeholder: 'e.g., a good pair of running shoes' },
      { field: 'budget', label: 'Are you careful with money or do you treat yourself?', placeholder: 'e.g., quite frugal, or I tend to impulse-buy online' },
      { field: 'impulse', label: 'Have you ever bought something you regretted?', placeholder: 'e.g., an exercise bike that just collects dust' },
      { field: 'avoidShopping', label: 'Any type of shopping you particularly dislike?', placeholder: 'e.g., grocery shopping, buying clothes online (sizes are wrong)' },
    ],
  },
  {
    id: 'music',
    part: 1,
    name: 'Music',
    icon: '🎵',
    questions: [
      'What kind of music do you enjoy?',
      'Do you play any musical instruments?',
      'Has your taste in music changed over the years?',
      'Do you prefer listening to music alone or with others?',
    ],
    personalDetailPrompts: [
      { field: 'currentGenre', label: 'What kind of music do you listen to most these days?', placeholder: 'e.g., mostly Mandopop and some indie folk' },
      { field: 'favoriteArtist', label: 'An artist or band you genuinely love?', placeholder: 'e.g., Jay Chou, Hozier' },
      { field: 'howListen', label: 'When and how do you listen to music?', placeholder: 'e.g., headphones on the subway, background music while cooking' },
      { field: 'instrument', label: 'Do you play an instrument? (currently or in the past)', placeholder: 'e.g., played piano until 15 then stopped, never learned' },
      { field: 'tasteChange', label: 'Has your taste in music changed? What did you listen to before?', placeholder: 'e.g., used to love rock, now prefer chill acoustic stuff' },
      { field: 'musicRole', label: 'What role does music play in your life?', placeholder: 'e.g., helps me focus, lifts my mood, not that important honestly' },
    ],
  },
  {
    id: 'friends',
    part: 1,
    name: 'Friends',
    icon: '👫',
    questions: [
      'Do you have a lot of friends?',
      'How do you usually spend time with your friends?',
      'Is it easy for you to make new friends?',
      'Do you prefer having a few close friends or many friends?',
    ],
    personalDetailPrompts: [
      { field: 'friendshipStyle', label: 'Are you someone with many friends, or a few close ones?', placeholder: 'e.g., a small tight-knit group, quite shy so fewer friends' },
      { field: 'closestFriend', label: 'Tell me about a close friend', placeholder: 'e.g., my best friend Xiaoli — we\'ve known each other since secondary school' },
      { field: 'howMet', label: 'How did you meet? How long have you been friends?', placeholder: 'e.g., met at university, been close for 8 years' },
      { field: 'keepingTouch', label: 'How do you maintain friendships, especially if you\'ve moved?', placeholder: 'e.g., WeChat every day, meet up monthly, or harder now we\'re in different cities' },
      { field: 'makingFriends', label: 'Is it easy or hard for you to make new friends as an adult?', placeholder: 'e.g., got harder after leaving university, easier now through hobbies' },
    ],
  },
]

export const PART2_TOPICS: Topic[] = [
  {
    id: 'describe_person',
    part: 2,
    name: 'Describe a Person',
    icon: '👤',
    questions: [
      'Describe someone who has had a big influence on your life.',
    ],
    cueCard: {
      topic: 'Describe someone who has had a big influence on your life',
      bullets: [
        'Who this person is',
        'How you know them',
        'What they have done that influenced you',
        'Explain why they had such a big influence',
      ],
    },
    personalDetailPrompts: [
      { field: 'personDescription', label: 'Who is this person? (relationship, e.g., mother, former teacher)', placeholder: 'e.g., my secondary school chemistry teacher, my older sister' },
      { field: 'howKnow', label: 'How did you come to know them? For how long?', placeholder: 'e.g., she taught me for 3 years, she\'s 5 years older than me' },
      { field: 'currentContact', label: 'Are they still in your life? (they may have passed away, moved, etc.)', placeholder: 'e.g., still very close, or she passed away 10 years ago' },
      { field: 'keyInfluence', label: 'What specific thing did they do that influenced you most?', placeholder: 'e.g., believed in me when I failed my first exam, showed me how to stay calm' },
      { field: 'specificStory', label: 'One concrete story or memory that captures who they are?', placeholder: 'e.g., the time she stayed late to help me retake a test I\'d failed' },
      { field: 'lastingImpact', label: 'How has their influence shown up in your life since?', placeholder: 'e.g., I became a teacher myself, I handle stress differently now' },
    ],
  },
  {
    id: 'describe_place',
    part: 2,
    name: 'Describe a Place',
    icon: '🏞️',
    questions: [
      'Describe a place you have visited that you particularly liked.',
    ],
    cueCard: {
      topic: 'Describe a place you have visited that you particularly liked',
      bullets: [
        'Where this place is',
        'When you went there',
        'What you did there',
        'Explain why you liked it so much',
      ],
    },
    personalDetailPrompts: [
      { field: 'placeName', label: 'What place? Be as specific as you like', placeholder: 'e.g., a small village in Yunnan, Koh Lanta island in Thailand' },
      { field: 'context', label: 'Why were you there? (holiday, work, visiting family?)', placeholder: 'e.g., took a week off work, went for a friend\'s wedding' },
      { field: 'whenWho', label: 'When and who did you go with?', placeholder: 'e.g., two years ago with my partner' },
      { field: 'standoutMemory', label: 'One specific moment there that you remember vividly?', placeholder: 'e.g., watching the sunrise from a rice terrace at 5am' },
      { field: 'differentFromHome', label: 'How was it different from your normal life?', placeholder: 'e.g., completely offline and disconnected, totally different pace of life' },
      { field: 'wouldReturn', label: 'Would you go back? Why or why not?', placeholder: 'e.g., absolutely, want to stay longer; or no, once was perfect' },
    ],
  },
  {
    id: 'describe_achievement',
    part: 2,
    name: 'Describe an Achievement',
    icon: '🏆',
    questions: [
      'Describe something you did that made you feel proud.',
    ],
    cueCard: {
      topic: 'Describe something you did that made you feel proud',
      bullets: [
        'What you did',
        'When and where you did it',
        'How you prepared for it',
        'Explain why it made you feel proud',
      ],
    },
    personalDetailPrompts: [
      { field: 'achievement', label: 'What did you achieve? Be specific', placeholder: 'e.g., passed my nursing board exam after failing once, ran my first 10k' },
      { field: 'context', label: 'What made it challenging or meaningful?', placeholder: 'e.g., I was also working full-time, it was something I\'d failed at before' },
      { field: 'effort', label: 'What did you actually do to get there?', placeholder: 'e.g., studied 2 hours every night for 4 months' },
      { field: 'obstacle', label: 'Did anything go wrong or nearly stop you?', placeholder: 'e.g., got sick the week before, almost quit three times' },
      { field: 'moment', label: 'What was the exact moment you realized you\'d succeeded?', placeholder: 'e.g., seeing my name on the pass list, crossing the finish line' },
      { field: 'impact', label: 'How did this achievement change you or what came after it?', placeholder: 'e.g., got my current job, proved to myself I could do hard things' },
    ],
  },
]

export function getAllTopics(part: SpeakingPart): Topic[] {
  if (part === 1) return PART1_TOPICS
  if (part === 2) return PART2_TOPICS
  return [] // Part 3 uses the existing random-question flow
}

export function getTopicById(part: SpeakingPart, topicId: string): Topic | undefined {
  return getAllTopics(part).find(t => t.id === topicId)
}
