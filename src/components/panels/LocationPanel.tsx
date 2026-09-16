import { Link } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { BrandBadge } from '../common/BrandBadge'
import { formatMoney, formatRelativeTime, regionTypeLabel } from '../../lib/format'

interface LocationPanelProps {
  onBuy: (locationId: string) => void
}

export function LocationPanel({ onBuy }: LocationPanelProps) {
  const selectedLocationId = useAppStore((s) => s.selectedLocationId)
  const locations = useAppStore((s) => s.locations)
  const brands = useAppStore((s) => s.brands)
  const currentUser = useAppStore((s) => s.currentUser)
  const myBrandIds = useAppStore((s) => s.myBrandIds)
  const selectLocation = useAppStore((s) => s.selectLocation)

  if (!selectedLocationId) return null
  const location = locations[selectedLocationId]
  if (!location) return null

  const owner = location.ownerBrandId ? brands[location.ownerBrandId] : null
  const isMine = !!owner && !!currentUser && myBrandIds.includes(owner.id)
  const typeLabel =
    location.kind === 'region' ? regionTypeLabel(location.regionType) : 'обласний центр'

  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-[1000] max-h-[78vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl ring-1 ring-black/5 sm:inset-x-auto sm:top-16 sm:right-0 sm:h-[calc(100%-4rem)] sm:max-h-none sm:w-[400px] sm:rounded-none">
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {typeLabel}
          </p>
          <h2 className="text-lg font-semibold text-slate-900">{location.name}</h2>
          {location.kind === 'city' && (
            <p className="mt-0.5 text-sm text-slate-500">
              Область: {location.parentRegionName}
            </p>
          )}
        </div>
        <button
          onClick={() => selectLocation(null)}
          className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Закрити"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="space-y-5 px-5 py-4">
        <div>
          {owner ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
              Зайнята
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
              Вільна
            </span>
          )}
          {isMine && (
            <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
              Ваша локація
            </span>
          )}
        </div>

        {owner && (
          <Link
            to={`/companies/${owner.id}`}
            className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-slate-100"
          >
            <BrandBadge name={owner.name} color={owner.color} logoDataUrl={owner.logoDataUrl} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{owner.name}</p>
              {owner.description && (
                <p className="truncate text-xs text-slate-500">{owner.description}</p>
              )}
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="shrink-0 text-slate-400"
            >
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        )}

        {isMine && owner && (
          <Link
            to={`/companies/${owner.id}`}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Керувати брендом
          </Link>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-slate-100 p-3">
            <p className="text-xs text-slate-400">Остання покупка</p>
            <p className="mt-0.5 font-semibold text-slate-900">
              {location.lastPrice !== null ? formatMoney(location.lastPrice) : '—'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 p-3">
            <p className="text-xs text-slate-400">Наступна ціна</p>
            <p className="mt-0.5 font-semibold text-slate-900">{formatMoney(location.nextPrice)}</p>
          </div>
        </div>

        {!isMine && (
          <button
            onClick={() => onBuy(location.id)}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            {owner
              ? `Поглинути за ${formatMoney(location.nextPrice)}`
              : `Зайняти за ${formatMoney(location.nextPrice)}`}
          </button>
        )}

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Історія покупок
          </p>
          {location.history.length === 0 ? (
            <p className="text-sm text-slate-400">Покупок ще не було.</p>
          ) : (
            <ul className="space-y-2">
              {location.history.map((h) => (
                <li
                  key={h.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{h.brandName}</p>
                    <p className="text-xs text-slate-400">{formatRelativeTime(h.timestamp)}</p>
                  </div>
                  <span className="shrink-0 font-semibold text-slate-700">
                    {formatMoney(h.price)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
