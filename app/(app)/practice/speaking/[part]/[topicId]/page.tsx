import { notFound } from 'next/navigation'
import { getTopicById } from '@/lib/speaking/topics'
import type { SpeakingPart } from '@/lib/speaking/types'
import StudySession from './StudySession'

interface Props {
  params: Promise<{ part: string; topicId: string }>
}

export default async function TopicPage({ params }: Props) {
  const { part, topicId } = await params
  const partNum = parseInt(part)

  if (![1, 2, 3].includes(partNum)) notFound()

  const topic = getTopicById(partNum as SpeakingPart, topicId)
  if (!topic) notFound()

  return <StudySession part={partNum as SpeakingPart} topic={topic} />
}
