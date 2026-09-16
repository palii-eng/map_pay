import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { BrandBadge } from '../components/common/BrandBadge'
import { Modal } from '../components/common/Modal'
import { BrandProfileForm } from '../components/company/BrandProfileForm'
import { ArticleEditor } from '../components/company/ArticleEditor'
import { ArticleCard } from '../components/blog/ArticleCard'
import { formatMoney } from '../lib/format'
import type { LocationState } from '../types'

function ContactRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-slate-600">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        {icon}
      </span>
      {children}
    </div>
  )
}

function LocationRow({ location, onOpen }: { location: LocationState; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 text-left text-sm transition hover:border-slate-300 hover:bg-slate-50"
    >
      <span className="min-w-0 truncate font-medium text-slate-800">{location.name}</span>
      {location.lastPrice !== null && (
        <span className="shrink-0 text-xs font-semibold text-slate-400">
          {formatMoney(location.lastPrice)}
        </span>
      )}
    </button>
  )
}

export default function CompanyPage() {
  const { brandId } = useParams<{ brandId: string }>()
  const navigate = useNavigate()
  const routerLocation = useLocation()
  const brand = useAppStore((s) => (brandId ? s.brands[brandId] : undefined))
  const currentUser = useAppStore((s) => s.currentUser)
  const locations = useAppStore((s) => s.locations)
  const articles = useAppStore((s) => s.articles)
  const selectLocation = useAppStore((s) => s.selectLocation)
  const updateBrandProfile = useAppStore((s) => s.updateBrandProfile)
  const createArticle = useAppStore((s) => s.createArticle)
  const checkPaymentIntent = useAppStore((s) => s.checkPaymentIntent)
  const refreshData = useAppStore((s) => s.refreshData)
  const [editing, setEditing] = useState(false)
  const [writingArticle, setWritingArticle] = useState(false)
  const [articleError, setArticleError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'checking' | 'paid' | 'pending' | null>(null)

  useEffect(() => {
    const state = routerLocation.state as { openArticleEditor?: boolean } | null
    if (state?.openArticleEditor) {
      setWritingArticle(true)
      navigate(routerLocation.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routerLocation.state])

  // повернення з оплати WayForPay (?payment=orderReference) — чекаємо, поки webhook
  // підтвердить платіж, і лише тоді оновлюємо дані бренду/локацій
  useEffect(() => {
    const orderReference = new URLSearchParams(routerLocation.search).get('payment')
    if (!orderReference) return

    let cancelled = false
    setPaymentStatus('checking')

    async function poll(attempt: number) {
      const status = await checkPaymentIntent(orderReference!)
      if (cancelled) return
      if (status === 'paid') {
        await refreshData()
        if (!cancelled) setPaymentStatus('paid')
        return
      }
      if (attempt >= 10) {
        setPaymentStatus('pending')
        return
      }
      setTimeout(() => poll(attempt + 1), 1500)
    }
    poll(0)

    navigate(routerLocation.pathname, { replace: true })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const brandArticles = useMemo(
    () =>
      Object.values(articles)
        .filter((a) => a.brandId === brandId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [articles, brandId],
  )

  const { regionLocations, cityLocations } = useMemo(() => {
    const regionLocations: LocationState[] = []
    const cityLocations: LocationState[] = []
    if (brandId) {
      for (const loc of Object.values(locations)) {
        if (loc.ownerBrandId !== brandId) continue
        if (loc.kind === 'region') regionLocations.push(loc)
        else cityLocations.push(loc)
      }
    }
    return { regionLocations, cityLocations }
  }, [locations, brandId])

  if (!brand) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
          <p className="text-3xl">🔍</p>
          <p className="text-base font-semibold text-slate-800">Бренд не знайдено</p>
          <p className="text-sm text-slate-500">
            Можливо, посилання застаріло, або дані цього демо-сеансу вже очищені браузером.
          </p>
          <Link
            to="/"
            className="mt-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            На карту
          </Link>
        </div>
      </div>
    )
  }

  const isMine = !!currentUser && brand.ownerUserId === currentUser.id

  function openLocation(loc: LocationState) {
    selectLocation(loc.id)
    navigate('/')
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
        {paymentStatus === 'checking' && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
            <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            Перевіряємо оплату WayForPay…
          </div>
        )}
        {paymentStatus === 'paid' && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Оплату підтверджено — локація вже ваша.
          </div>
        )}
        {paymentStatus === 'pending' && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
            <span>⏳</span>
            Оплату ще обробляємо — це може зайняти хвилину. Онови сторінку трохи пізніше.
          </div>
        )}
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <BrandBadge name={brand.name} color={brand.color} logoDataUrl={brand.logoDataUrl} size={64} />
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{brand.name}</h1>
              <p className="mt-1 max-w-md text-sm text-slate-500">{brand.description}</p>
            </div>
          </div>
          {isMine && (
            <button
              onClick={() => setEditing(true)}
              className="shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Редагувати профіль
            </button>
          )}
        </div>

        {(brand.address || brand.phone || brand.contactEmail || brand.website || brand.instagram || brand.facebook) && (
          <div className="mt-6 grid grid-cols-1 gap-2.5 rounded-2xl border border-slate-100 p-4 sm:grid-cols-2">
            {brand.address && (
              <ContactRow
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 21s7-7.4 7-12a7 7 0 1 0-14 0c0 4.6 7 12 7 12Z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                }
              >
                {brand.address}
              </ContactRow>
            )}
            {brand.phone && (
              <ContactRow
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .3 2 .5 3 .7a2 2 0 0 1 1.7 2Z" />
                  </svg>
                }
              >
                <a href={`tel:${brand.phone}`} className="hover:underline">
                  {brand.phone}
                </a>
              </ContactRow>
            )}
            {brand.contactEmail && (
              <ContactRow
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m3 6 9 7 9-7" />
                  </svg>
                }
              >
                <a href={`mailto:${brand.contactEmail}`} className="hover:underline">
                  {brand.contactEmail}
                </a>
              </ContactRow>
            )}
            {brand.website && (
              <ContactRow
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
                  </svg>
                }
              >
                <a href={brand.website} target="_blank" rel="noreferrer" className="hover:underline">
                  {brand.website.replace(/^https?:\/\//, '')}
                </a>
              </ContactRow>
            )}
            {brand.instagram && (
              <ContactRow icon={<span className="text-xs font-semibold">IG</span>}>
                <a href={brand.instagram} target="_blank" rel="noreferrer" className="hover:underline">
                  Instagram
                </a>
              </ContactRow>
            )}
            {brand.facebook && (
              <ContactRow icon={<span className="text-xs font-semibold">FB</span>}>
                <a href={brand.facebook} target="_blank" rel="noreferrer" className="hover:underline">
                  Facebook
                </a>
              </ContactRow>
            )}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Області ({regionLocations.length})
            </h2>
            {regionLocations.length === 0 ? (
              <p className="text-sm text-slate-400">Поточних локацій немає.</p>
            ) : (
              <div className="space-y-1.5">
                {regionLocations.map((l) => (
                  <LocationRow key={l.id} location={l} onOpen={() => openLocation(l)} />
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Обласні міста ({cityLocations.length})
            </h2>
            {cityLocations.length === 0 ? (
              <p className="text-sm text-slate-400">Поточних локацій немає.</p>
            ) : (
              <div className="space-y-1.5">
                {cityLocations.map((l) => (
                  <LocationRow key={l.id} location={l} onOpen={() => openLocation(l)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {regionLocations.length === 0 && cityLocations.length === 0 && (
          <p className="mt-1 text-xs text-slate-400">
            Бренд втратив усі локації, але сторінка та статті залишаються доступними.
          </p>
        )}

        <div className="mt-8 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Статті ({brandArticles.length})
            </h2>
            {isMine && (
              <button
                onClick={() => setWritingArticle(true)}
                disabled={brand.articleCreditsAvailable <= 0}
                title={
                  brand.articleCreditsAvailable <= 0
                    ? 'Купіть чи поглиньте локацію, щоб отримати право на статтю'
                    : undefined
                }
                className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Написати статтю ({brand.articleCreditsAvailable})
              </button>
            )}
          </div>

          {brandArticles.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Цей бренд ще не публікував статей.</p>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {brandArticles.map((a) => (
                <ArticleCard key={a.id} article={a} brand={brand} />
              ))}
            </div>
          )}
        </div>
      </div>

      {editing && (
        <Modal title="Профіль бренду" onClose={() => setEditing(false)} width="lg">
          <BrandProfileForm
            brand={brand}
            onCancel={() => setEditing(false)}
            onSubmit={async (input) => {
              await updateBrandProfile(brand.id, input)
              setEditing(false)
            }}
          />
        </Modal>
      )}

      {writingArticle && (
        <Modal title="Нова стаття" onClose={() => setWritingArticle(false)} width="lg">
          {articleError && <p className="mb-3 text-sm text-red-600">{articleError}</p>}
          <ArticleEditor
            creditsAvailable={brand.articleCreditsAvailable}
            onCancel={() => setWritingArticle(false)}
            onSubmit={async (input) => {
              const res = await createArticle(brand.id, input)
              if (res.ok) {
                setWritingArticle(false)
                setArticleError(null)
              } else {
                setArticleError(res.reason ?? 'Не вдалося опублікувати статтю')
              }
            }}
          />
        </Modal>
      )}
    </div>
  )
}
