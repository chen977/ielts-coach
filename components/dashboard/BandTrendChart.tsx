'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface BandTrendPoint {
  date: string
  speaking?: number
  listening?: number
}

export default function BandTrendChart({ data, targetBand }: { data: BandTrendPoint[]; targetBand: number }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Band Score Trend</h3>
        <div className="h-48 flex items-center justify-center text-sm text-gray-400">
          Complete some sessions to see your progress over time
        </div>
      </div>
    )
  }

  const formatted = data.map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  }))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-900 mb-1">Band Score Trend</h3>
      <p className="text-xs text-gray-400 mb-4">Last 30 days</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              domain={[4.5, 9]}
              ticks={[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9]}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [Number(value).toFixed(1), name === 'speaking' ? 'Speaking' : 'Listening']}
            />
            <ReferenceLine
              y={targetBand}
              stroke="#d1d5db"
              strokeDasharray="6 4"
              label={{ value: `Target: ${targetBand}`, fontSize: 11, fill: '#9ca3af', position: 'right' }}
            />
            <Line
              type="monotone"
              dataKey="speaking"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 4, fill: '#0ea5e9' }}
              connectNulls
              name="speaking"
            />
            <Line
              type="monotone"
              dataKey="listening"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4, fill: '#10b981' }}
              connectNulls
              name="listening"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 justify-center mt-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-3 h-0.5 bg-sky-500 rounded" />
          Speaking
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-3 h-0.5 bg-emerald-500 rounded" />
          Listening
        </div>
      </div>
    </div>
  )
}
