'use client'

interface WeeklyGoalsProps {
  speakingCurrent: number
  speakingGoal: number
  listeningCurrent: number
  listeningGoal: number
  writingCurrent?: number
  writingGoal?: number
  vocabReviewed?: number
  vocabGoal?: number
}

function GoalProgress({
  label,
  current,
  goal,
  color,
}: {
  label: string
  current: number
  goal: number
  color: 'sky' | 'emerald' | 'amber' | 'violet'
}) {
  const pct = Math.min((current / goal) * 100, 100)
  const done = current >= goal
  const trackColors = {
    sky: 'bg-sky-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    violet: 'bg-violet-500',
  }
  const textColors = {
    sky: 'text-sky-600',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    violet: 'text-violet-600',
  }
  const textColor = done ? textColors[color] : 'text-gray-500'

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-700">{label}</span>
        <span className={`text-sm font-medium ${textColor}`}>
          {current}/{goal}
          {done && ' ✓'}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${trackColors[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function WeeklyGoals(props: WeeklyGoalsProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">This week&apos;s goals</h3>
      <div className="space-y-4">
        <GoalProgress
          label="Speaking sessions"
          current={props.speakingCurrent}
          goal={props.speakingGoal}
          color="sky"
        />
        <GoalProgress
          label="Listening tests"
          current={props.listeningCurrent}
          goal={props.listeningGoal}
          color="emerald"
        />
        {props.writingGoal && props.writingGoal > 0 && (
          <GoalProgress
            label="Writing sessions"
            current={props.writingCurrent ?? 0}
            goal={props.writingGoal}
            color="amber"
          />
        )}
        {props.vocabGoal && props.vocabGoal > 0 && (
          <GoalProgress
            label="Words reviewed"
            current={props.vocabReviewed ?? 0}
            goal={props.vocabGoal}
            color="violet"
          />
        )}
      </div>
    </div>
  )
}
