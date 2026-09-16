import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

const REDIRECT_DELAY_MS = 2500
const MAX_POLL_ATTEMPTS = 10
const POLL_INTERVAL_MS = 1500

export default function PaymentConfirmedPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const checkPaymentIntent = useAppStore((s) => s.checkPaymentIntent)
  const refreshData = useAppStore((s) => s.refreshData)

  const [status, setStatus] = useState<'checking' | 'paid' | 'pending'>('checking')
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(REDIRECT_DELAY_MS / 1000))

  useEffect(() => {
    const orderReference = searchParams.get('payment')
    if (!orderReference) {
      setStatus('paid')
      return
    }

    let cancelled = false

    async function poll(attempt: number) {
      const result = await checkPaymentIntent(orderReference!)
      if (cancelled) return
      if (result === 'paid') {
        await refreshData()
        if (!cancelled) setStatus('paid')
        return
      }
      if (attempt >= MAX_POLL_ATTEMPTS) {
        setStatus('pending')
        return
      }
      setTimeout(() => poll(attempt + 1), POLL_INTERVAL_MS)
    }
    poll(0)

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (status === 'checking') return
    const redirectTimer = setTimeout(() => navigate('/', { replace: true }), REDIRECT_DELAY_MS)
    const tickTimer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => {
      clearTimeout(redirectTimer)
      clearInterval(tickTimer)
    }
  }, [status, navigate])

  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-50 px-4">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        {status === 'checking' && (
          <>
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            <h1 className="text-xl font-semibold text-slate-900">Перевіряємо оплату…</h1>
            <p className="text-sm text-slate-500">Це займе кілька секунд.</p>
          </>
        )}

        {status === 'paid' && (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Дякуємо за оплату!</h1>
            <p className="text-sm text-slate-500">Локація вже ваша. Зараз повернемо на карту…</p>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 text-2xl">
              ⏳
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Оплату ще обробляємо</h1>
            <p className="text-sm text-slate-500">
              Це може зайняти хвилину — перевір карту трохи пізніше, якщо локація ще не з'явилась.
            </p>
          </>
        )}

        {status !== 'checking' && (
          <button
            onClick={() => navigate('/', { replace: true })}
            className="mt-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            На карту зараз ({secondsLeft})
          </button>
        )}
      </div>
    </div>
  )
}
