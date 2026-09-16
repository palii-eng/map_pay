import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { BrandBadge } from '../common/BrandBadge'
import { formatMoney, formatRelativeTime } from '../../lib/format'

export function ActivityFeed() {
  const activity = useAppStore((s) => s.activity)
  const selectLocation = useAppStore((s) => s.selectLocation)
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches,
  )

  return (
    <div className="pointer-events-auto w-72 max-w-[85vw] overflow-hidden rounded-xl bg-white/95 shadow-md ring-1 ring-slate-200 backdrop-blur">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left"
      >
        <span className="text-sm font-semibold text-slate-800">Стрічка активності</span>
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
        <div className="max-h-64 overflow-y-auto border-t border-slate-100">
          {activity.length === 0 ? (
            <p className="px-3.5 py-4 text-xs text-slate-400">
              Тут з'являтимуться покупки та поглинання локацій.
            </p>
          ) : (
            <ul>
              {activity.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => selectLocation(e.locationId)}
                    className="flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left transition hover:bg-slate-50"
                  >
                    <BrandBadge name={e.brandName} color={e.brandColor} logoDataUrl={e.brandLogoDataUrl} size={26} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-snug text-slate-700">
                        <span className="font-semibold">{e.brandName}</span>{' '}
                        {e.type === 'absorb' ? (
                          <>
                            поглинув(ла) <span className="font-medium">{e.locationName}</span>
                            {e.previousBrandName ? ` у ${e.previousBrandName}` : ''}
                          </>
                        ) : (
                          <>
                            зайняв <span className="font-medium">{e.locationName}</span>
                          </>
                        )}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {formatMoney(e.price)} · {formatRelativeTime(e.timestamp)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
