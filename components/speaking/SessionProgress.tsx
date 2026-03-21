'use client'

interface SessionProgressProps {
  current: number
  total: number
}

export default function SessionProgress({ current, total }: SessionProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all ${
            i < current
              ? 'w-8 bg-sky-500'
              : i === current
                ? 'w-8 bg-sky-300'
                : 'w-2 bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}
