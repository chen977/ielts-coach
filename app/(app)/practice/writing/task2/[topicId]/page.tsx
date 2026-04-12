import { getTask2TopicById } from '@/lib/writing/topics'
import { redirect } from 'next/navigation'
import WritingStudySession from './WritingStudySession'

interface PageProps {
  params: Promise<{ topicId: string }>
}

export default async function WritingTask2Page({ params }: PageProps) {
  const { topicId } = await params
  const topic = getTask2TopicById(topicId)

  if (!topic) {
    redirect('/practice/writing')
  }

  return <WritingStudySession topic={topic} />
}
