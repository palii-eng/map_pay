import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

const REDIRECT_DELAY_MS = 2500

export default function AuthConfirmedPage() {
  const navigate = useNavigate()
  const currentUser = useAppStore((s) => s.currentUser)
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(REDIRECT_DELAY_MS / 1000))

  useEffect(() => {
    const redirectTimer = setTimeout(() => navigate('/', { replace: true }), REDIRECT_DELAY_MS)
    const tickTimer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => {
      clearTimeout(redirectTimer)
      clearInterval(tickTimer)
    }
  }, [navigate])

  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-50 px-4">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-slate-900">Дякуємо! Email підтверджено</h1>
        <p className="text-sm text-slate-500">
          {currentUser ? (
            <>
              Ви увійшли як <span className="font-medium text-slate-700">{currentUser.email}</span>.
            </>
          ) : (
            'Акаунт активовано.'
          )}{' '}
          Зараз перенаправимо на карту…
        </p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="mt-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          На карту зараз ({secondsLeft})
        </button>
      </div>
    </div>
  )
}
