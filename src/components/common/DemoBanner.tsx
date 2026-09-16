import { useState } from 'react'

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('demo-banner-dismissed') === '1'
    } catch {
      return false
    }
  })

  if (dismissed) return null

  return (
    <div className="pointer-events-auto flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800 shadow-md ring-1 ring-amber-200 backdrop-blur">
      <span className="mt-0.5 text-sm">⚠️</span>
      <p className="flex-1">
        <span className="font-semibold">Тестовий режим.</span> Дані бренду, покупки й статті вже
        зберігаються в реальній базі даних — але оплата поки симулюється, платіжний провайдер ще не
        підключено.
      </p>
      <button
        onClick={() => {
          setDismissed(true)
          try {
            sessionStorage.setItem('demo-banner-dismissed', '1')
          } catch {
            /* ignore */
          }
        }}
        className="shrink-0 rounded-full p-1 text-amber-500 transition hover:bg-amber-100"
        aria-label="Приховати"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
