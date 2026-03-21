'use client'

interface StreakTrackerProps {
  streakDays: number
  practiceDays: string[]
}

export default function StreakTracker({ streakDays, practiceDays }: StreakTrackerProps) {
  // Build a 4-week calendar (28 days)
  const today = new Date()
  const days: { date: string; practiced: boolean; isToday: boolean }[] = []

  for (let i = 27; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      practiced: practiceDays.includes(dateStr),
      isToday: i === 0,
    })
  }

  // Split into weeks of 7
  const weeks: typeof days[] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Practice Streak</h3>
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-bold text-gray-900">{streakDays}</span>
          <span className="text-orange-400 text-lg">🔥</span>
        </div>
      </div>

      {/* Calendar heatmap */}
      <div className="space-y-1.5">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1.5 mb-1">
          {dayLabels.map((label, i) => (
            <div key={i} className="text-center text-[10px] text-gray-400 font-medium">
              {label}
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1.5">
            {week.map((day) => (
              <div
                key={day.date}
                title={day.date}
                className={`aspect-square rounded-md transition ${
                  day.practiced
                    ? 'bg-violet-500'
                    : day.isToday
                    ? 'bg-gray-200 ring-1 ring-gray-300'
                    : 'bg-gray-100'
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-gray-100" />
          No practice
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-violet-500" />
          Practiced
        </div>
      </div>
    </div>
  )
}
