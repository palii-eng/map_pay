import { useEffect, useMemo, useRef, useState } from 'react'
import type { Feature } from 'geojson'
import L from 'leaflet'
import { GeoJSON as RLGeoJSON, MapContainer, useMap, useMapEvents } from 'react-leaflet'
import { useAppStore } from '../../store/useAppStore'
import { MAP_MAX_ZOOM, MAP_MIN_ZOOM, UKRAINE_BOUNDS } from '../../config'
import { baseStyleFor } from './mapStyle'
import { CityMarkersLayer } from './CityMarkersLayer'
import { BrandMarkersLayer } from './BrandMarkersLayer'
import { CityContourLayer } from './CityContourLayer'
import type { CityContourProps, RegionProps } from '../../types'

const LABEL_ZOOM_THRESHOLD = 6

function MapController({
  onZoomChange,
  onMapReady,
}: {
  onZoomChange: (z: number) => void
  onMapReady: (map: L.Map) => void
}) {
  const map = useMap()
  useEffect(() => {
    onMapReady(map)
    onZoomChange(map.getZoom())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])
  useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  })
  return null
}

export function MapView() {
  const status = useAppStore((s) => s.status)
  const regionsGeo = useAppStore((s) => s.regionsGeo)
  const cityContoursGeo = useAppStore((s) => s.cityContoursGeo)
  const locations = useAppStore((s) => s.locations)
  const brands = useAppStore((s) => s.brands)
  const selectedLocationId = useAppStore((s) => s.selectedLocationId)
  const selectLocation = useAppStore((s) => s.selectLocation)

  const mapRef = useRef<L.Map | null>(null)
  const layersRef = useRef<Record<string, L.Path>>({})
  const [zoom, setZoom] = useState(MAP_MIN_ZOOM)
  const [baseZoom, setBaseZoom] = useState(MAP_MIN_ZOOM)

  const zoomBucket = zoom >= LABEL_ZOOM_THRESHOLD ? 'labels' : 'nolabels'

  const regionIdsWithContour = useMemo(() => {
    if (!cityContoursGeo) return new Set<string>()
    return new Set(
      cityContoursGeo.features.map((f) => (f.properties as CityContourProps).regionId),
    )
  }, [cityContoursGeo])

  const regionsSignature = useMemo(() => {
    if (!regionsGeo) return ''
    return regionsGeo.features
      .map((f) => {
        const id = (f.properties as RegionProps).id
        const loc = locations[id]
        const brand = loc?.ownerBrandId ? brands[loc.ownerBrandId] : null
        return `${id}:${loc?.ownerBrandId ?? ''}:${brand?.color ?? ''}`
      })
      .join('|')
  }, [regionsGeo, locations, brands])

  // фіксує загальний вигляд України одразу, коли карта готова (а не в окремому
  // ефекті MapView — той монтується ще під час екрана завантаження, тобто до
  // появи самої карти, і onMapReady ніколи не перезапускається з порожніми deps);
  // ×1 (весь вигляд України) — мінімальний рівень, можна наближувати до ×4.
  // На мобільних (< 640px, межа Tailwind sm:) стартуємо одразу з ×3 — на такому
  // екрані вся країна відразу занадто дрібна, щоб тицяти по локаціях
  function handleMapReady(map: L.Map) {
    mapRef.current = map
    // animate: false — fitBounds інакше анімований і getZoom() одразу після виклику
    // повертає СТАРИЙ zoom (ще до завершення переходу), а не реальний підсумковий
    map.fitBounds(UKRAINE_BOUNDS, { padding: [16, 16], animate: false })
    const z = map.getZoom()
    map.setMinZoom(z)
    map.setMaxZoom(z + 1.5)
    setBaseZoom(z)

    const isMobile = window.innerWidth < 640
    if (isMobile) {
      map.setZoom(z + 1, { animate: false })
    }
  }

  const zoomStep = Math.round((zoom - baseZoom) / 0.5) + 1

  // highlight selection without remounting layers
  useEffect(() => {
    for (const [id, layer] of Object.entries(layersRef.current)) {
      const loc = locations[id]
      const brand = loc?.ownerBrandId ? brands[loc.ownerBrandId] : undefined
      layer.setStyle(baseStyleFor(loc, brand, id === selectedLocationId))
      if (id === selectedLocationId) layer.bringToFront()
    }
  }, [selectedLocationId, locations, brands])

  function onEachFeature(feature: Feature, layer: L.Layer) {
    const props = feature.properties as RegionProps
    const id = props.id
    const loc = locations[id]
    const brand = loc?.ownerBrandId ? brands[loc.ownerBrandId] : undefined
    const path = layer as L.Path
    layersRef.current[id] = path
    path.setStyle(baseStyleFor(loc, brand, id === selectedLocationId))

    path.on('click', () => selectLocation(id))
    path.on('mouseover', () => {
      if (id !== selectedLocationId) path.setStyle({ weight: 2 })
    })
    path.on('mouseout', () => {
      if (id !== selectedLocationId) path.setStyle(baseStyleFor(loc, brand, false))
    })
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          <p className="text-sm">Завантаження карти України…</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50">
        <div className="max-w-sm text-center text-sm text-slate-600">
          <p className="mb-2 text-2xl">⚠️</p>
          <p className="font-medium text-slate-800">Не вдалося завантажити карту</p>
          <p className="mt-1 text-slate-500">
            Перевірте з'єднання з інтернетом і оновіть сторінку.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[48.8, 31.2]}
        zoom={MAP_MIN_ZOOM}
        minZoom={MAP_MIN_ZOOM}
        maxZoom={MAP_MAX_ZOOM}
        zoomSnap={0.5}
        zoomDelta={0.5}
        zoomControl={false}
        style={{ height: '100%', width: '100%', background: '#cbdaea' }}
        attributionControl={false}
      >
        <MapController onZoomChange={setZoom} onMapReady={handleMapReady} />
        <CityMarkersLayer zoom={zoom} excludeRegionIds={regionIdsWithContour} />

        {regionsGeo && (
          <RLGeoJSON
            key={`regions-${regionsSignature}-${zoomBucket}`}
            data={regionsGeo}
            onEachFeature={onEachFeature}
          />
        )}

        {cityContoursGeo && <CityContourLayer cityContoursGeo={cityContoursGeo} />}

        {regionsGeo && cityContoursGeo && (
          <BrandMarkersLayer regionsGeo={regionsGeo} cityContoursGeo={cityContoursGeo} zoom={zoom} />
        )}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-[900] flex flex-col justify-end p-3 sm:p-4">
        <div className="flex items-end justify-end">
          <div className="pointer-events-auto flex flex-col overflow-hidden rounded-lg bg-white/95 shadow-md ring-1 ring-slate-200 backdrop-blur">
            <button
              onClick={() => mapRef.current?.zoomIn()}
              className="px-3 py-2 text-lg font-medium text-slate-700 transition hover:bg-slate-50"
              aria-label="Наблизити"
            >
              +
            </button>
            <div className="h-px bg-slate-200" />
            <span className="select-none px-3 py-1.5 text-center text-[11px] font-medium tabular-nums text-slate-500">
              ×{zoomStep}
            </span>
            <div className="h-px bg-slate-200" />
            <button
              onClick={() => mapRef.current?.zoomOut()}
              className="px-3 py-2 text-lg font-medium text-slate-700 transition hover:bg-slate-50"
              aria-label="Віддалити"
            >
              −
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
