import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'

export function LoginForm() {
  const requestLoginLink = useAppStore((s) => s.requestLoginLink)

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    const res = await requestLoginLink(email.trim())
    setLoading(false)
    if (res.ok) {
      setSent(true)
    } else {
      setError(res.reason ?? 'Не вдалося надіслати лист')
    }
  }

  if (sent) {
    return (
      <div className="space-y-3 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m3 6 9 7 9-7" />
          </svg>
        </div>
        <p className="text-sm text-slate-600">
          Надіслали лист на <span className="font-medium text-slate-800">{email}</span>. Відкрий пошту й
          клікни на посилання для входу.
        </p>
        <button
          onClick={() => setSent(false)}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Ввести інший email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        required
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? 'Надсилаємо…' : 'Надіслати посилання для входу'}
      </button>
    </form>
  )
}
