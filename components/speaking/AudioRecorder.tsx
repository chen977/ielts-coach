'use client'

import { useEffect, useCallback, useState } from 'react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useTimer } from '@/hooks/useTimer'
import TranscriptDisplay from './TranscriptDisplay'

interface AudioRecorderProps {
  maxDuration: number // seconds
  onComplete: (transcript: string) => void
  autoStart?: boolean
}

export default function AudioRecorder({ maxDuration, onComplete, autoStart }: AudioRecorderProps) {
  const recorder = useAudioRecorder()
  const speech = useSpeechRecognition()
  const timer = useTimer({ mode: 'countup', duration: maxDuration, onComplete: handleTimeUp })
  const [manualTranscript, setManualTranscript] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // If neither recording nor speech recognition is supported, show text-only mode
  const textOnlyMode = !recorder.isSupported

  function handleTimeUp() {
    handleStop()
  }

  const handleStop = useCallback(() => {
    if (recorder.isSupported) {
      recorder.stop()
    }
    speech.stop()
    timer.stop()
  }, [recorder, speech, timer])

  const handleStart = useCallback(async () => {
    setSubmitted(false)
    if (recorder.isSupported) {
      await recorder.start()
    }
    speech.start()
    timer.start()
  }, [recorder, speech, timer])

  // Auto-start if requested
  useEffect(() => {
    if (autoStart) {
      handleStart()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart])

  // When recording stops and we have a transcript, submit
  useEffect(() => {
    const isRecordingStopped = textOnlyMode ? !timer.isRunning : !recorder.isRecording
    if (isRecordingStopped && (speech.transcript || manualTranscript) && !submitted && timer.seconds > 0) {
      const finalTranscript = speech.isSupported ? speech.transcript : manualTranscript
      if (finalTranscript.trim()) {
        setSubmitted(true)
        onComplete(finalTranscript.trim())
      }
    }
  }, [recorder.isRecording, speech.transcript, speech.isSupported, manualTranscript, onComplete, submitted, timer.seconds, timer.isRunning, textOnlyMode])

  // Manual submit handler for text-only mode
  const handleManualSubmit = useCallback(() => {
    const finalTranscript = manualTranscript.trim()
    if (finalTranscript && !submitted) {
      setSubmitted(true)
      timer.stop()
      speech.stop()
      onComplete(finalTranscript)
    }
  }, [manualTranscript, submitted, timer, speech, onComplete])

  if (recorder.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-red-800 font-medium mb-1">Microphone Error</p>
        <p className="text-red-600 text-sm mb-4">{recorder.error}</p>
        {/* Still allow manual text entry on error */}
        <div className="text-left">
          <p className="text-xs text-gray-600 font-medium mb-2">You can still type your response:</p>
          <textarea
            value={manualTranscript}
            onChange={e => setManualTranscript(e.target.value)}
            placeholder="Type what you would say..."
            rows={4}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
          />
          <button
            onClick={handleManualSubmit}
            disabled={!manualTranscript.trim()}
            className="mt-2 w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition"
          >
            Submit Response
          </button>
        </div>
      </div>
    )
  }

  // Text-only mode: no microphone available (e.g. iOS Chrome)
  if (textOnlyMode) {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">Microphone not available</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Audio recording isn&apos;t supported in this browser. Please type your response below, or use Safari for full audio support on iOS.
              </p>
            </div>
          </div>
        </div>

        {/* Timer */}
        {timer.isRunning && (
          <div className="text-center">
            <p className={`text-2xl font-mono font-bold text-sky-600`}>
              {timer.formatted}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              max {Math.floor(maxDuration / 60)}:{(maxDuration % 60).toString().padStart(2, '0')}
            </p>
          </div>
        )}

        <textarea
          value={manualTranscript}
          onChange={e => setManualTranscript(e.target.value)}
          placeholder="Type your response here as you would say it aloud..."
          rows={6}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
        />
        <button
          onClick={handleManualSubmit}
          disabled={!manualTranscript.trim()}
          className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition"
        >
          Submit Response
        </button>
      </div>
    )
  }

  // Level meter bars
  const bars = 5
  const levelBars = Array.from({ length: bars }, (_, i) => {
    const threshold = (i + 1) / bars
    const active = recorder.audioLevel >= threshold * 0.6
    return active
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-6">
        {/* Record/Stop Button */}
        <button
          onClick={recorder.isRecording ? handleStop : handleStart}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            recorder.isRecording
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200'
              : 'bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-200'
          }`}
        >
          {recorder.isRecording && (
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
          )}
          {recorder.isRecording ? (
            <svg className="w-6 h-6 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        {/* Timer */}
        <div className="text-center min-w-[60px]">
          <p className={`text-2xl font-mono font-bold ${
            recorder.isRecording ? 'text-red-600' : 'text-gray-400'
          }`}>
            {timer.formatted}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            max {Math.floor(maxDuration / 60)}:{(maxDuration % 60).toString().padStart(2, '0')}
          </p>
        </div>

        {/* Audio Level Meter */}
        <div className="flex items-end gap-1 h-10">
          {levelBars.map((active, i) => (
            <div
              key={i}
              className={`w-2 rounded-full transition-all duration-100 ${
                active && recorder.isRecording
                  ? i < 2 ? 'bg-emerald-400' : i < 4 ? 'bg-sky-400' : 'bg-amber-400'
                  : 'bg-gray-200'
              }`}
              style={{ height: `${(i + 1) * 8}px` }}
            />
          ))}
        </div>
      </div>

      {/* Status text */}
      <p className="text-center text-sm text-gray-500">
        {recorder.isRecording
          ? 'Recording... Speak clearly into your microphone'
          : timer.seconds > 0
            ? 'Recording complete'
            : 'Click the microphone to start recording'}
      </p>

      {/* Transcript */}
      {(recorder.isRecording || timer.seconds > 0) && (
        <TranscriptDisplay
          transcript={speech.transcript}
          interimTranscript={speech.interimTranscript}
          isSupported={speech.isSupported}
          fallbackValue={manualTranscript}
          onFallbackChange={setManualTranscript}
        />
      )}

      {/* Manual submit when speech recognition is not supported and recording stopped */}
      {!speech.isSupported && !recorder.isRecording && timer.seconds > 0 && !submitted && (
        <button
          onClick={handleManualSubmit}
          disabled={!manualTranscript.trim()}
          className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition"
        >
          Submit Response
        </button>
      )}
    </div>
  )
}
