import Link from 'next/link'

const features = [
  {
    icon: '🎙️',
    title: 'Speaking Practice',
    description: 'Practise all 3 IELTS Speaking parts with AI feedback on fluency, vocabulary, grammar, and pronunciation.',
  },
  {
    icon: '🎧',
    title: 'Listening Tests',
    description: 'All 4 listening sections with AI-generated audio and automatic marking — just like the real exam.',
  },
  {
    icon: '📚',
    title: 'Vocabulary Builder',
    description: 'Words from your sessions reviewed using spaced repetition so they stick for the long term.',
  },
  {
    icon: '📈',
    title: 'Score Tracking',
    description: 'Monitor your estimated band score over time and see exactly where to improve.',
  },
]

const bandJourney = ['5.0', '5.5', '6.0', '6.5', '7.0']

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      {/* Nav */}
      <header className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">I</span>
          </div>
          <span className="font-semibold text-gray-900">IELTS Coach</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm font-semibold py-2 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition"
          >
            Get started free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-24">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-100 text-sky-700 rounded-full text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
            Targeting Band 7.0
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Your personal IELTS
            <br />
            <span className="text-sky-500">practice coach</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-8">
            AI-powered Speaking and Listening practice with instant band score feedback.
            Built for learners at IELTS 5–5.5 aiming for 7.0.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/auth/signup"
              className="py-3.5 px-8 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition text-base shadow-sm shadow-sky-200"
            >
              Start practising free
            </Link>
            <Link
              href="/auth/login"
              className="py-3.5 px-8 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl transition text-base"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 gap-5">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-4">
              <div className="text-3xl mt-0.5">{f.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Band journey */}
        <div className="mt-16 bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-sm font-medium text-gray-500 mb-5">Your journey to Band 7</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {bandJourney.map((band, i) => (
              <div key={band} className="flex items-center gap-3">
                <div className={`flex flex-col items-center ${
                  band === '7.0' ? 'text-emerald-600' : i === 0 ? 'text-amber-500' : 'text-gray-400'
                }`}>
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                    band === '7.0'
                      ? 'border-emerald-500 bg-emerald-50'
                      : i === 0
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    {band}
                  </div>
                  <span className="text-xs mt-1 font-medium">
                    {band === '5.0' ? 'Start' : band === '7.0' ? 'Goal ✓' : ''}
                  </span>
                </div>
                {i < bandJourney.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-200 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-sm text-gray-400">
        © {new Date().getFullYear()} IELTS Coach. Built to help you reach Band 7.
      </footer>
    </div>
  )
}
