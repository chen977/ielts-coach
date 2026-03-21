'use client'

import type { VocabularyWord } from '@/lib/supabase/types'

const POS_COLORS: Record<string, string> = {
  noun: 'bg-blue-100 text-blue-700',
  verb: 'bg-green-100 text-green-700',
  adjective: 'bg-purple-100 text-purple-700',
  adverb: 'bg-orange-100 text-orange-700',
  phrase: 'bg-pink-100 text-pink-700',
}

function BoxIndicator({ box }: { box: number }) {
  return (
    <div className="flex gap-1" title={`SRS Box ${box}`}>
      {[1, 2, 3, 4, 5].map(b => (
        <div
          key={b}
          className={`w-1.5 h-1.5 rounded-full ${b <= box ? 'bg-violet-500' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  )
}

export default function WordCard({ word, compact }: { word: VocabularyWord; compact?: boolean }) {
  const posColor = POS_COLORS[word.part_of_speech?.toLowerCase() ?? ''] ?? 'bg-gray-100 text-gray-600'

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-gray-900">{word.word}</span>
          <BoxIndicator box={word.srs_box} />
        </div>
        {word.definition && (
          <p className="text-sm text-gray-500 line-clamp-1">{word.definition}</p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{word.word}</h3>
          {word.pronunciation && (
            <p className="text-sm text-gray-400 font-mono">{word.pronunciation}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {word.part_of_speech && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${posColor}`}>
              {word.part_of_speech}
            </span>
          )}
          <BoxIndicator box={word.srs_box} />
        </div>
      </div>

      {word.definition && (
        <p className="text-sm text-gray-700">{word.definition}</p>
      )}

      {word.example_sentence && (
        <p className="text-sm text-gray-500 italic border-l-2 border-violet-200 pl-3">
          {word.example_sentence}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        {word.ielts_topic && (
          <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">
            {word.ielts_topic}
          </span>
        )}
        {word.source_type && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${word.source_type === 'speaking' ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {word.source_type}
          </span>
        )}
      </div>
    </div>
  )
}
