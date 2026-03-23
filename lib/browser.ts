/**
 * Browser feature detection for Web APIs used in the app.
 * Handles SSR (typeof window === 'undefined') and missing APIs on mobile browsers.
 *
 * Key incompatibilities:
 * - SpeechRecognition: NOT supported on iOS Chrome (only Safari on iOS)
 * - MediaRecorder: iOS uses audio/mp4 instead of audio/webm
 * - SpeechSynthesis: requires user interaction on iOS before playing
 * - AudioContext: may need webkit prefix on older iOS
 */

export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function hasSpeechRecognition(): boolean {
  if (!isBrowser()) return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition)
}

export function hasSpeechSynthesis(): boolean {
  if (!isBrowser()) return false
  return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
}

export function hasMediaRecorder(): boolean {
  if (!isBrowser()) return false
  return typeof MediaRecorder !== 'undefined'
}

export function hasGetUserMedia(): boolean {
  if (!isBrowser()) return false
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

export function hasAudioContext(): boolean {
  if (!isBrowser()) return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(window.AudioContext || (window as any).webkitAudioContext)
}

export function getAudioContextClass(): typeof AudioContext | null {
  if (!isBrowser()) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return window.AudioContext || (window as any).webkitAudioContext || null
}

/**
 * Get the best supported MIME type for MediaRecorder.
 * iOS Safari supports audio/mp4, desktop Chrome supports audio/webm;codecs=opus.
 */
export function getRecorderMimeType(): string {
  if (!hasMediaRecorder()) return ''
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus'
  if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm'
  if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4'
  if (MediaRecorder.isTypeSupported('audio/aac')) return 'audio/aac'
  return '' // let browser pick default
}

/** Safe wrapper around speechSynthesis calls */
export function safeSpeechSynthesis() {
  if (!hasSpeechSynthesis()) return null
  return window.speechSynthesis
}
