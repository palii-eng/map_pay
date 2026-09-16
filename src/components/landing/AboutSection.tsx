import { forwardRef } from 'react'
import { CURRENCY_SYMBOL, PRICE_STEP, START_PRICE } from '../../config'

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 20l-6-3V4l6 3m0 13 6-3m-6 3V7m6 10 6 3V6l-6-3m0 14V4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Дві незалежні локації',
    text: 'Область і обласний центр купуються окремо — можна зайняти лише місто, лише область, або обидві локації одразу.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Поглинання конкурентів',
    text: `Вільна локація коштує від ${CURRENCY_SYMBOL}${START_PRICE}. Кожне наступне поглинання дорожче на ${CURRENCY_SYMBOL}${PRICE_STEP} — і попередній платіж не повертається.`,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M7 8h10M7 12h10M7 16h6" strokeLinecap="round" />
      </svg>
    ),
    title: 'Стаття за кожну покупку',
    text: 'Будь-яка покупка чи поглинання дає бренду право опублікувати одну статтю в блозі платформи.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 20V10M12 20V4M20 20v-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Рейтинг і стрічка активності',
    text: 'Видно, хто зараз лідирує по областях і містах, і в реальному часі — хто кого щойно поглинув.',
  },
]

interface AboutSectionProps {
  onBackToMap: () => void
}

export const AboutSection = forwardRef<HTMLElement, AboutSectionProps>(function AboutSection(
  { onBackToMap },
  ref,
) {
  return (
    <section ref={ref} className="relative flex h-full w-full shrink-0 snap-start overflow-y-auto bg-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-12 text-center sm:py-16">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-500">
          Про проєкт
        </span>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900 sm:text-4xl">
          Рекламні локації на живій карті України
        </h1>
        <p className="mt-4 max-w-xl text-sm text-slate-500 sm:text-base">
          Компанії купують області та обласні центри як рекламні локації, можуть поглинати вже зайняті
          локації конкурентів за вищу ціну — і публікують статті про свій бренд, отримуючи право на
          публікацію за кожну покупку.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-100 p-4 sm:p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
                {f.icon}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onBackToMap}
          className="mt-10 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Перейти до карти
        </button>

        <p className="mt-4 text-xs text-slate-400">
          Тестовий режим: оплата, авторизація і бренди зберігаються лише локально у вашому браузері.
        </p>
      </div>
    </section>
  )
})
