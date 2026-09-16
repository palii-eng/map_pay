import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../common/Modal'
import { BrandBadge } from '../common/BrandBadge'
import { BrandForm } from './BrandForm'
import { useAppStore, type PurchaseResult } from '../../store/useAppStore'
import { formatMoney, regionTypeLabel } from '../../lib/format'

interface PurchaseFlowProps {
  locationId: string
  onClose: () => void
  onSuccess: () => void
}

type Phase = 'confirm' | 'processing' | 'success' | 'error'

export function PurchaseFlow({ locationId, onClose, onSuccess }: PurchaseFlowProps) {
  const navigate = useNavigate()
  const location = useAppStore((s) => s.locations[locationId])
  const currentUser = useAppStore((s) => s.currentUser)
  const myBrandIds = useAppStore((s) => s.myBrandIds)
  const brands = useAppStore((s) => s.brands)
  const activeBrandId = useAppStore((s) => s.activeBrandId)
  const mockLogin = useAppStore((s) => s.mockLogin)
  const createBrand = useAppStore((s) => s.createBrand)
  const setActiveBrand = useAppStore((s) => s.setActiveBrand)
  const purchaseLocation = useAppStore((s) => s.purchaseLocation)

  const [email, setEmail] = useState('')
  const [showBrandForm, setShowBrandForm] = useState(false)
  const [showBrandPicker, setShowBrandPicker] = useState(false)
  const [phase, setPhase] = useState<Phase>('confirm')
  const [result, setResult] = useState<PurchaseResult | null>(null)

  useEffect(() => {
    setShowBrandForm(myBrandIds.length === 0 && !!currentUser)
  }, [currentUser, myBrandIds.length])

  if (!location) return null

  const price = location.nextPrice
  const isAbsorb = !!location.ownerBrandId
  const activeBrand = activeBrandId ? brands[activeBrandId] : null

  // ---- Крок 1: вхід ----
  if (!currentUser) {
    return (
      <Modal title="Увійти в акаунт" onClose={onClose} width="sm">
        <p className="mb-4 text-sm text-slate-500">
          Для купівлі локації потрібен акаунт із підтвердженим email.{' '}
          <span className="font-medium text-amber-600">Демо-режим:</span> вхід миттєвий, без пароля.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (email.trim()) mockLogin(email.trim())
          }}
          className="space-y-3"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Увійти
          </button>
        </form>
      </Modal>
    )
  }

  // ---- Крок 2: бренд ----
  if (showBrandForm || myBrandIds.length === 0) {
    return (
      <Modal title="Створіть бренд" onClose={onClose} width="sm">
        <p className="mb-4 text-sm text-slate-500">
          Локації купує бренд, а не особистий акаунт. Заповніть базові дані — їх можна змінити пізніше.
        </p>
        <BrandForm
          onCancel={myBrandIds.length > 0 ? () => setShowBrandForm(false) : undefined}
          onSubmit={(input) => {
            createBrand(input)
            setShowBrandForm(false)
          }}
        />
      </Modal>
    )
  }

  if (showBrandPicker || !activeBrand) {
    return (
      <Modal title="Від імені якого бренду діяти?" onClose={onClose} width="sm">
        <div className="space-y-2">
          {myBrandIds.map((id) => {
            const b = brands[id]
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveBrand(id)
                  setShowBrandPicker(false)
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-left transition hover:border-slate-400"
              >
                <BrandBadge name={b.name} color={b.color} logoDataUrl={b.logoDataUrl} size={32} />
                <span className="text-sm font-medium text-slate-800">{b.name}</span>
              </button>
            )
          })}
          <button
            onClick={() => {
              setShowBrandPicker(false)
              setShowBrandForm(true)
            }}
            className="w-full rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
          >
            + Створити новий бренд
          </button>
        </div>
      </Modal>
    )
  }

  const buyerBrand = activeBrand

  // ---- Крок 4: обробка ----
  if (phase === 'processing') {
    return (
      <Modal title="Обробка оплати" onClose={() => {}} width="sm">
        <div className="flex flex-col items-center gap-3 py-6 text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          <p className="text-sm">Підтверджуємо оплату на сервері…</p>
        </div>
      </Modal>
    )
  }

  // ---- Крок 5: помилка ----
  if (phase === 'error') {
    return (
      <Modal title="Не вдалося завершити покупку" onClose={onClose} width="sm">
        <p className="text-sm text-slate-600">{result?.reason ?? 'Сталася невідома помилка.'}</p>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Закрити
        </button>
      </Modal>
    )
  }

  // ---- Крок 6: успіх ----
  if (phase === 'success' && result?.ok && result.record) {
    return (
      <Modal title="Локацію отримано" onClose={onClose} width="sm">
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm text-slate-600">
            Бренд <span className="font-semibold text-slate-900">{buyerBrand.name}</span>{' '}
            {isAbsorb ? 'поглинув(ла)' : 'зайняв'} локацію
          </p>
          <p className="text-base font-semibold text-slate-900">{location.name}</p>
          <p className="text-sm text-slate-500">за {formatMoney(result.record.price)}</p>
          <p className="mt-1 text-xs text-slate-400">
            Доступних статей для публікації: {buyerBrand.articleCreditsAvailable}
          </p>
        </div>
        <div className="mt-4 space-y-2">
          <button
            onClick={() => {
              onSuccess()
              onClose()
            }}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Переглянути на карті
          </button>
          <button
            onClick={() => {
              onClose()
              navigate(`/companies/${buyerBrand.id}`, { state: { openArticleEditor: true } })
            }}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Написати статтю
          </button>
        </div>
      </Modal>
    )
  }

  // ---- Крок 3: підсумок і правила ----
  return (
    <Modal title={isAbsorb ? 'Поглинути локацію' : 'Зайняти локацію'} onClose={onClose} width="sm">
      <div className="space-y-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">
            {location.kind === 'region' ? regionTypeLabel(location.regionType) : 'обласний центр'}
          </p>
          <p className="text-sm font-semibold text-slate-900">{location.name}</p>
          {location.kind === 'city' && (
            <p className="text-xs text-slate-500">Область: {location.parentRegionName}</p>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
          <div className="flex items-center gap-2.5">
            <BrandBadge name={buyerBrand.name} color={buyerBrand.color} logoDataUrl={buyerBrand.logoDataUrl} size={32} />
            <div>
              <p className="text-xs text-slate-400">Ваш бренд</p>
              <p className="text-sm font-medium text-slate-800">{buyerBrand.name}</p>
            </div>
          </div>
          {myBrandIds.length > 1 && (
            <button
              onClick={() => setShowBrandPicker(true)}
              className="text-xs font-medium text-slate-500 underline-offset-2 hover:underline"
            >
              Змінити
            </button>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
          <span className="text-sm text-slate-500">До сплати</span>
          <span className="text-lg font-semibold text-slate-900">{formatMoney(price)}</span>
        </div>

        <ul className="space-y-1.5 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          <li>• Наступне поглинання коштуватиме {formatMoney(price + 1)} — на $1 більше.</li>
          <li>• Гарантованого мінімального терміну розміщення немає.</li>
          <li>• Попередній платіж не повертається і не компенсується під час поглинання.</li>
          <li>• Ця покупка дає право на одну статтю в блозі після модерації.</li>
        </ul>

        <button
          onClick={() => {
            setPhase('processing')
            window.setTimeout(() => {
              const res = purchaseLocation(location.id, buyerBrand.id)
              setResult(res)
              setPhase(res.ok ? 'success' : 'error')
            }, 700)
          }}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Перейти до оплати · {formatMoney(price)}
        </button>
        <p className="text-center text-[11px] text-slate-400">
          Демо-режим: платіжні дані Stripe ще не підключені, оплата симулюється.
        </p>
      </div>
    </Modal>
  )
}
