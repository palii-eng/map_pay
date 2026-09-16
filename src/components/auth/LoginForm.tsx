import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const requestLoginCode = useAppStore((s) => s.requestLoginCode)
  const verifyLoginCode = useAppStore((s) => s.verifyLoginCode)

  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    const res = await requestLoginCode(email.trim())
    setLoading(false)
    if (res.ok) {
      setStep('code')
    } else {
      setError(res.reason ?? 'Не вдалося надіслати код')
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    const res = await verifyLoginCode(email.trim(), code.trim())
    setLoading(false)
    if (res.ok) {
      onSuccess()
    } else {
      setError(res.reason ?? 'Невірний код')
    }
  }

  if (step === 'code') {
    return (
      <form onSubmit={handleVerifyCode} className="space-y-3">
        <p className="text-sm text-slate-500">
          Надіслали 6-значний код на <span className="font-medium text-slate-800">{email}</span>. Встав
          його нижче.
        </p>
        <input
          type="text"
          inputMode="numeric"
          required
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123456"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-center text-lg tracking-[0.3em] outline-none focus:border-slate-400"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Перевіряємо…' : 'Підтвердити'}
        </button>
        <button
          type="button"
          onClick={() => {
            setStep('email')
            setError(null)
          }}
          className="w-full text-center text-xs text-slate-400 hover:text-slate-600"
        >
          Ввести інший email
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleRequestCode} className="space-y-3">
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
        {loading ? 'Надсилаємо…' : 'Отримати код на email'}
      </button>
    </form>
  )
}
