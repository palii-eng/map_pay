import { useRef, useState } from 'react'
import { MapView } from '../components/map/MapView'
import { LocationPanel } from '../components/panels/LocationPanel'
import { ActivityFeed } from '../components/overlays/ActivityFeed'
import { Leaderboard } from '../components/overlays/Leaderboard'
import { PurchaseFlow } from '../components/purchase/PurchaseFlow'
import { AboutSection } from '../components/landing/AboutSection'

export function HomePage() {
  const [purchaseLocationId, setPurchaseLocationId] = useState<string | null>(null)
  const aboutRef = useRef<HTMLElement>(null)
  const mapScreenRef = useRef<HTMLElement>(null)

  return (
    <div className="h-full snap-y snap-mandatory overflow-y-auto scroll-smooth">
      <section ref={mapScreenRef} className="relative h-full w-full shrink-0 snap-start">
        <MapView />

        <div className="pointer-events-none absolute inset-0 z-[900] flex flex-col p-3 sm:p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <ActivityFeed />
            <Leaderboard />
          </div>
        </div>

        <LocationPanel onBuy={(id) => setPurchaseLocationId(id)} />

        <button
          onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="pointer-events-auto absolute bottom-3 left-1/2 z-[900] flex -translate-x-1/2 flex-col items-center gap-0.5 text-slate-500 transition hover:text-slate-800 sm:bottom-4"
        >
          <span className="text-[11px] font-medium">Про проєкт</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {purchaseLocationId && (
          <PurchaseFlow locationId={purchaseLocationId} onClose={() => setPurchaseLocationId(null)} />
        )}
      </section>

      <AboutSection
        ref={aboutRef}
        onBackToMap={() => mapScreenRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />
    </div>
  )
}
