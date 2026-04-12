'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [targetBand, setTargetBand] = useState('7.0')
  const [speakingGoal, setSpeakingGoal] = useState('3')
  const [listeningGoal, setListeningGoal] = useState('2')
  const [writingGoal, setWritingGoal] = useState('2')
  const [vocabGoal, setVocabGoal] = useState('20')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        const p = data as Profile | null
        if (p) {
          setProfile(p)
          setDisplayName(p.display_name ?? '')
          setTargetBand(String(p.target_band ?? 7.0))
          setSpeakingGoal(String(p.weekly_speaking_goal ?? 3))
          setListeningGoal(String(p.weekly_listening_goal ?? 2))
          setWritingGoal(String((p as Record<string, unknown>).weekly_writing_goal ?? 2))
          setVocabGoal(String(p.weekly_vocab_goal ?? 20))
        }
      })
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase.from('profiles') as any).update({
      display_name: displayName.trim(),
      target_band: parseFloat(targetBand),
      weekly_speaking_goal: parseInt(speakingGoal),
      weekly_listening_goal: parseInt(listeningGoal),
      weekly_writing_goal: parseInt(writingGoal),
      weekly_vocab_goal: parseInt(vocabGoal),
    }).eq('id', user.id)

    setSaving(false)
    if (err) {
      setError(err.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-100 rounded-xl w-48 animate-pulse" />
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const bandOptions = ['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0']

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-500">Manage your profile and practice goals.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
        <h2 className="font-semibold text-gray-900">Profile</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 transition"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Target band score</label>
          <select
            value={targetBand}
            onChange={e => setTargetBand(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 bg-white transition"
          >
            {bandOptions.map(b => (
              <option key={b} value={b}>Band {b}</option>
            ))}
          </select>
        </div>

        <hr className="border-gray-100" />
        <h2 className="font-semibold text-gray-900">Weekly goals</h2>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Speaking</label>
            <input
              type="number"
              min={1}
              max={14}
              value={speakingGoal}
              onChange={e => setSpeakingGoal(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Listening</label>
            <input
              type="number"
              min={1}
              max={14}
              value={listeningGoal}
              onChange={e => setListeningGoal(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Writing</label>
            <input
              type="number"
              min={1}
              max={14}
              value={writingGoal}
              onChange={e => setWritingGoal(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 transition"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Vocabulary reviews per week</label>
          <input
            type="number"
            min={0}
            max={100}
            value={vocabGoal}
            onChange={e => setVocabGoal(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 transition"
          />
          <p className="mt-1 text-xs text-gray-400">Number of words to review each week</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-semibold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
