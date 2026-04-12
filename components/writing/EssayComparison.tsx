'use client'

import { useState } from 'react'

interface EssayComparisonProps {
  userEssay: string
  modelEssay: string
}

export default function EssayComparison({ userEssay, modelEssay }: EssayComparisonProps) {
  const [activeTab, setActiveTab] = useState<'user' | 'model'>('user')

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <h4 className="text-sm font-semibold text-gray-900">Essay Comparison</h4>
      </div>

      {/* Desktop: side by side */}
      <div className="hidden sm:grid sm:grid-cols-2 divide-x divide-gray-100">
        <div className="p-5">
          <p className="text-xs font-medium text-gray-500 mb-3">Your Essay</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{userEssay}</p>
        </div>
        <div className="p-5 bg-emerald-50/30">
          <p className="text-xs font-medium text-emerald-600 mb-3">Model Essay (Band 7)</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{modelEssay}</p>
        </div>
      </div>

      {/* Mobile: tabbed view */}
      <div className="sm:hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('user')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'user'
                ? 'text-sky-600 border-b-2 border-sky-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Your Essay
          </button>
          <button
            onClick={() => setActiveTab('model')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'model'
                ? 'text-emerald-600 border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Model Essay
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {activeTab === 'user' ? userEssay : modelEssay}
          </p>
        </div>
      </div>
    </div>
  )
}
