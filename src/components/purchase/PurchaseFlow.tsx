import { useEffect, useState } from 'react'
import { Modal } from '../common/Modal'
import { BrandBadge } from '../common/BrandBadge'
import { BrandForm } from './BrandForm'
import { LoginForm } from '../auth/LoginForm'
import { useAppStore, type WayForPayFields } from '../../store/useAppStore'
import { formatMoney, regionTypeLabel } from '../../lib/format'

interface PurchaseFlowProps {
  locationId: string
  onClose: () => void
}

type Phase = 'confirm' | 'processing' | 'error'

function redirectToWayForPay(fields: WayForPayFields) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = 'https://secure.wayforpay.com/pay'

  function addField(name: string, value: string) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  }

  addField('merchantAccount', fields.merchantAccount)
  addField('merchantDomainName', fields.merchantDomainName)
  addField('orderReference', fields.orderReference)
  addField('orderDate', String(fields.orderDate))
  addField('amount', String(fields.amount))
  addField('currency', fields.currency)
  fields.productName.forEach((v) => addField('productName[]', v))
  fields.productCount.forEach((v) => addField('productCount[]', String(v)))
  fields.productPrice.forEach((v) => addField('productPrice[]', String(v)))
  addField('merchantSignature', fields.merchantSignature)
  addField('returnUrl', fields.returnUrl)
  addField('serviceUrl', fields.serviceUrl)

  document.body.appendChild(form)
  form.submit()
}

export function PurchaseFlow({ locationId, onClose }: PurchaseFlowProps) {
  const location = useAppStore((s) => s.locations[locationId])
  const currentUser = useAppStore((s) => s.currentUser)
  const myBrandIds = useAppStore((s) => s.myBrandIds)
  const brands = useAppStore((s) => s.brands)
  const activeBrandId = useAppStore((s) => s.activeBrandId)
  const createBrand = useAppStore((s) => s.createBrand)
  const setActiveBrand = useAppStore((s) => s.setActiveBrand)
  const createPaymentIntent = useAppStore((s) => s.createPaymentIntent)

  const [showBrandForm, setShowBrandForm] = useState(false)
  const [showBrandPicker, setShowBrandPicker] = useState(false)
  const [phase, setPhase] = useState<Phase>('confirm')
  const [error, setError] = useState<string | null>(null)

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
        <p className="mb-4 text-sm text-slate-500">Для купівлі локації потрібен акаунт із підтвердженим email.</p>
        <LoginForm />
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
          onSubmit={async (input) => {
            await createBrand(input)
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

  // ---- Крок 4: перенаправлення на оплату ----
  if (phase === 'processing') {
    return (
      <Modal title="Перенаправляємо на оплату" onClose={() => {}} width="sm">
        <div className="flex flex-col items-center gap-3 py-6 text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          <p className="text-sm">Зараз відкриється сторінка оплати WayForPay…</p>
        </div>
      </Modal>
    )
  }

  // ---- Крок 5: помилка ----
  if (phase === 'error') {
    return (
      <Modal title="Не вдалося перейти до оплати" onClose={onClose} width="sm">
        <p className="text-sm text-slate-600">{error ?? 'Сталася невідома помилка.'}</p>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Закрити
        </button>
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
          onClick={async () => {
            setPhase('processing')
            const res = await createPaymentIntent(location.id, buyerBrand.id)
            if (res.ok && res.fields) {
              redirectToWayForPay(res.fields)
            } else {
              setError(res.reason ?? 'Сталася невідома помилка.')
              setPhase('error')
            }
          }}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Перейти до оплати · {formatMoney(price)}
        </button>
        <p className="text-center text-[11px] text-slate-400">
          Оплата проходить через WayForPay. Після підтвердження платежу локація одразу з'явиться на
          карті вашого бренду.
        </p>
      </div>
    </Modal>
  )
}
