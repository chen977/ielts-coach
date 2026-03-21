import { notFound } from 'next/navigation'
import SpeakingSession from './SpeakingSession'

interface Props {
  params: Promise<{ part: string }>
}

export default async function SpeakingSessionPage({ params }: Props) {
  const { part } = await params
  const partNum = parseInt(part)

  if (![1, 2, 3].includes(partNum)) notFound()

  return <SpeakingSession part={partNum as 1 | 2 | 3} />
}
