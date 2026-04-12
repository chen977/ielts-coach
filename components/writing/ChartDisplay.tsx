'use client'

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { Task1ModelData } from '@/lib/writing/types'

interface ChartDisplayProps {
  data: Task1ModelData
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function ChartDisplay({ data }: ChartDisplayProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 text-center">{data.chartTitle}</h3>

      <div className="h-72">
        {data.chartType === 'line' && <LineChartView data={data} />}
        {data.chartType === 'bar' && <BarChartView data={data} />}
        {data.chartType === 'pie' && <PieChartView data={data} />}
        {data.chartType === 'table' && <TableView data={data} />}
        {data.chartType === 'process' && <ProcessView data={data} />}
      </div>
    </div>
  )
}

function LineChartView({ data }: { data: Task1ModelData }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data.chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey={data.xAxisKey} tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {data.dataKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

function BarChartView({ data }: { data: Task1ModelData }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data.chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey={data.xAxisKey} tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {data.dataKeys.map((key, i) => (
          <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

function PieChartView({ data }: { data: Task1ModelData }) {
  const valueKey = data.dataKeys[0] || 'value'
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data.chartData}
          dataKey={valueKey}
          nameKey={data.xAxisKey || 'name'}
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, percent }: { name?: string; percent?: number }) =>
            `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={{ stroke: '#9ca3af' }}
        >
          {data.chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function TableView({ data }: { data: Task1ModelData }) {
  if (!data.chartData.length) return null
  const columns = Object.keys(data.chartData[0])

  return (
    <div className="overflow-x-auto h-full">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col} className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-medium text-gray-700">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.chartData.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
              {columns.map(col => (
                <td key={col} className="border border-gray-200 px-3 py-2 text-gray-600">
                  {String((row as Record<string, unknown>)[col] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ProcessView({ data }: { data: Task1ModelData }) {
  return (
    <div className="flex flex-col gap-2 h-full overflow-y-auto py-2">
      {data.chartData.map((step, i) => {
        const s = step as Record<string, unknown>
        return (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                <span className="text-xs font-bold text-sky-600">{i + 1}</span>
              </div>
              {i < data.chartData.length - 1 && (
                <div className="w-0.5 h-4 bg-sky-200 mt-1" />
              )}
            </div>
            <div className="pt-1">
              <p className="text-sm font-medium text-gray-800">
                {String(s.name || s[data.dataKeys[0]] || `Step ${i + 1}`)}
              </p>
              {typeof s.description === 'string' && s.description && (
                <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
