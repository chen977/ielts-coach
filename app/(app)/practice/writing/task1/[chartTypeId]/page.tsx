import { getChartTypeById } from '@/lib/writing/topics'
import { redirect } from 'next/navigation'
import WritingTask1Session from './WritingTask1Session'

interface PageProps {
  params: Promise<{ chartTypeId: string }>
}

export default async function WritingTask1Page({ params }: PageProps) {
  const { chartTypeId } = await params
  const chartType = getChartTypeById(chartTypeId)

  if (!chartType) {
    redirect('/practice/writing')
  }

  return <WritingTask1Session chartTypeConfig={chartType} />
}
