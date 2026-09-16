import L from 'leaflet'
import { Marker, Tooltip } from 'react-leaflet'
import { OBLAST_CENTERS } from '../../data/oblastCenters'
import { useAppStore } from '../../store/useAppStore'
import { initials } from '../../lib/format'

const LABEL_ZOOM_THRESHOLD = 6
const FREE_MARKER_SIZE = 10
// Той самий розмір, що й у великого знаку купленої області (BrandMarkersLayer) —
// лого області й обласного міста рівнозначні.
const OWNED_MARKER_SIZE = 46

export interface CityMarkersLayerProps {
  zoom: number
  excludeRegionIds: Set<string>
}

// Крапка-маркер лише для обласних центрів, яким ще бракує реального контуру
// міста (наприклад, Сімферополь) — решта показані як справжні форми
// через CityContourLayer.
export function CityMarkersLayer({ zoom, excludeRegionIds }: CityMarkersLayerProps) {
  const locations = useAppStore((s) => s.locations)
  const brands = useAppStore((s) => s.brands)
  const cityIdByRegionId = useAppStore((s) => s.cityIdByRegionId)
  const selectLocation = useAppStore((s) => s.selectLocation)

  return (
    <>
      {OBLAST_CENTERS.filter((c) => !excludeRegionIds.has(c.regionId)).map((c) => {
        const cityId = cityIdByRegionId[c.regionId]
        const loc = cityId ? locations[cityId] : undefined
        const brand = loc?.ownerBrandId ? brands[loc.ownerBrandId] : undefined

        let html: string
        let size: number
        if (brand) {
          html = brand.logoDataUrl
            ? `<img src="${brand.logoDataUrl.replace(/"/g, '&quot;')}" alt="" />`
            : `<span class="city-logo-marker__initial" style="background:${brand.color}">${initials(brand.name)}</span>`
          size = OWNED_MARKER_SIZE
        } else {
          html = ''
          size = FREE_MARKER_SIZE
        }

        const icon = L.divIcon({
          html,
          className: brand ? 'city-logo-marker' : 'city-free-marker',
          iconSize: [size, size],
        })

        return (
          <Marker
            key={c.regionId}
            position={[c.lat, c.lon]}
            icon={icon}
            title={brand ? `${brand.name} · ${c.name}` : c.name}
            eventHandlers={cityId ? { click: () => selectLocation(cityId) } : undefined}
          >
            {zoom >= LABEL_ZOOM_THRESHOLD && (
              <Tooltip
                permanent
                direction="right"
                offset={[size / 2 + 3, 0]}
                className="city-label-tooltip"
              >
                {c.name}
              </Tooltip>
            )}
          </Marker>
        )
      })}
    </>
  )
}
