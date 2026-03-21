// Leitner box intervals in days
const BOX_INTERVALS: Record<number, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
}

export function getNextReviewDate(box: number): string {
  const days = BOX_INTERVALS[box] ?? 1
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

export function processReview(currentBox: number, correct: boolean): { newBox: number; nextReviewDate: string } {
  if (correct) {
    const newBox = Math.min(currentBox + 1, 5)
    return { newBox, nextReviewDate: getNextReviewDate(newBox) }
  }
  return { newBox: 1, nextReviewDate: new Date().toISOString().split('T')[0] }
}
