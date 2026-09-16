import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { BrandBadge } from '../common/BrandBadge'

type Tab = 'region' | 'city'

export function Leaderboard() {
  const locations = useAppStore((s) => s.locations)
  const brands = useAppStore((s) => s.brands)
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches,
  )
  const [tab, setTab] = useState<Tab>('region')

  const rows = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const loc of Object.values(locations)) {
      if (loc.kind !== tab || !loc.ownerBrandId) continue
      counts[loc.ownerBrandId] = (counts[loc.ownerBrandId] ?? 0) + 1
    }
    return Object.entries(counts)
      .map(([brandId, count]) => ({ brand: brands[brandId], count }))
      .filter((r) => r.brand)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [locations, brands, tab])

  return (
    <div className="pointer-events-auto w-72 max-w-[85vw] overflow-hidden rounded-xl bg-white/95 shadow-md ring-1 ring-slate-200 backdrop-blur">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left"
      >
        <span className="text-sm font-semibold text-slate-800">Рейтинг брендів</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-slate-400 transition-transform ${collapsed ? '' : 'rotate-180'}`}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {!collapsed && (
        <div className="border-t border-slate-100">
          <div className="flex gap-1 px-3.5 pt-2.5">
            <button
              onClick={() => setTab('region')}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                tab === 'region' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Області
            </button>
            <button
              onClick={() => setTab('city')}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                tab === 'city' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Обласні міста
            </button>
          </div>
          <div className="max-h-56 overflow-y-auto px-2 py-2">
            {rows.length === 0 ? (
              <p className="px-1.5 py-3 text-xs text-slate-400">Поки що немає зайнятих локацій.</p>
            ) : (
              <ol className="space-y-1">
                {rows.map((r, idx) => (
                  <li key={r.brand.id}>
                    <Link
                      to={`/companies/${r.brand.id}`}
                      className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-slate-50"
                    >
                      <span className="w-4 shrink-0 text-center text-xs font-semibold text-slate-400">
                        {idx + 1}
                      </span>
                      <BrandBadge name={r.brand.name} color={r.brand.color} logoDataUrl={r.brand.logoDataUrl} size={26} />
                      <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                        {r.brand.name}
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-slate-500">
                        {r.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
