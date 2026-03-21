'use client'

interface TranscriptDisplayProps {
  transcript: string
  interimTranscript: string
  isSupported: boolean
  fallbackValue: string
  onFallbackChange: (val: string) => void
}

export default function TranscriptDisplay({
  transcript,
  interimTranscript,
  isSupported,
  fallbackValue,
  onFallbackChange,
}: TranscriptDisplayProps) {
  if (!isSupported) {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <p className="text-xs text-amber-600 font-medium mb-2">
          Speech recognition is not available in your browser. Please type your response:
        </p>
        <textarea
          value={fallbackValue}
          onChange={e => onFallbackChange(e.target.value)}
          placeholder="Type what you said..."
          rows={4}
          className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
        />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 min-h-[80px]">
      <p className="text-xs text-gray-400 font-medium mb-2">Transcript</p>
      <p className="text-sm text-gray-700 leading-relaxed">
        {transcript}
        {interimTranscript && (
          <span className="text-gray-400 italic">{transcript ? ' ' : ''}{interimTranscript}</span>
        )}
        {!transcript && !interimTranscript && (
          <span className="text-gray-300">Listening...</span>
        )}
      </p>
    </div>
  )
}
