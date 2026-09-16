import { useMemo } from 'react'
import type { FeatureCollection } from 'geojson'
import L from 'leaflet'
import { Marker, Tooltip, useMap } from 'react-leaflet'
import { useAppStore } from '../../store/useAppStore'
import { initials } from '../../lib/format'
import type { CityContourProps, LocationState, RegionProps } from '../../types'

const LABEL_ZOOM_THRESHOLD = 6
const REGION_MARKER_SIZE = 46
// Лого куплених області й обласного міста мають бути однакового розміру —
// це рівнозначні, незалежні локації, різниця в розмірі знаку тут недоречна.
const CITY_OWNED_MARKER_SIZE = REGION_MARKER_SIZE
const CITY_FREE_MARKER_SIZE = 8
const GAP = 4

interface RegionMarker {
  id: string
  name: string
  center: L.LatLng
  html: string
}

interface CityMarker {
  id: string
  name: string
  center: L.LatLng
  html: string
  size: number
}

interface BrandMarkersLayerProps {
  regionsGeo: FeatureCollection
  cityContoursGeo: FeatureCollection
  zoom: number
}

// Знак області (великий) і знак обласного міста (менший) — це дві окремі
// локації, тож обидва можуть мати власний бренд-знак одночасно. Щоб вони не
// налягали одне на одне, коли місто географічно близько до центру області,
// відштовхуємо мітку міста від мітки області в напрямку, де воно й так є,
// рівно настільки, щоб кола не перекривались. Розрахунок — у "світових
// пікселях" проєкції (map.project/unproject із фіксованим zoom), тому не
// залежить від поточного панорамування — лише від масштабу.
export function BrandMarkersLayer({ regionsGeo, cityContoursGeo, zoom }: BrandMarkersLayerProps) {
  const map = useMap()
  const locations = useAppStore((s) => s.locations)
  const brands = useAppStore((s) => s.brands)

  const cityContourByRegionId = useMemo(() => {
    const map = new Map<string, GeoJSON.Feature>()
    for (const f of cityContoursGeo.features) {
      map.set((f.properties as CityContourProps).regionId, f)
    }
    return map
  }, [cityContoursGeo])

  const { regionMarkers, cityMarkers } = useMemo(() => {
    const regionMarkers: RegionMarker[] = []
    const cityMarkers: CityMarker[] = []

    for (const f of regionsGeo.features) {
      const regionProps = f.properties as RegionProps
      const regionLoc = locations[regionProps.id]
      const regionBrand = regionLoc?.ownerBrandId ? brands[regionLoc.ownerBrandId] : undefined
      const regionBounds = L.geoJSON(f).getBounds()
      if (!regionBounds.isValid()) continue
      const regionLatLng = regionBounds.getCenter()

      const cityFeature = cityContourByRegionId.get(regionProps.id)
      let cityLatLng: L.LatLng | undefined
      let cityLoc: LocationState | undefined
      let cityBrand
      let cityProps: CityContourProps | undefined
      if (cityFeature) {
        const cityBounds = L.geoJSON(cityFeature).getBounds()
        if (cityBounds.isValid()) {
          cityLatLng = cityBounds.getCenter()
          cityProps = cityFeature.properties as CityContourProps
          cityLoc = locations[cityProps.cityId]
          cityBrand = cityLoc?.ownerBrandId ? brands[cityLoc.ownerBrandId] : undefined
        }
      }

      // розсовуємо лише коли в області буде показано великий знак і поруч є місто
      if (regionBrand && cityLatLng && cityProps) {
        const citySize = cityBrand ? CITY_OWNED_MARKER_SIZE : CITY_FREE_MARKER_SIZE
        const minDist = REGION_MARKER_SIZE / 2 + citySize / 2 + GAP

        const regionPx = map.project(regionLatLng, zoom)
        const cityPx = map.project(cityLatLng, zoom)
        let dx = cityPx.x - regionPx.x
        let dy = cityPx.y - regionPx.y
        let dist = Math.hypot(dx, dy)

        if (dist < minDist) {
          if (dist < 0.5) {
            dx = 0
            dy = 1
            dist = 1
          }
          const ux = dx / dist
          const uy = dy / dist
          const pushedPx = L.point(regionPx.x + ux * minDist, regionPx.y + uy * minDist)
          cityLatLng = map.unproject(pushedPx, zoom)
        }
      }

      if (regionBrand) {
        const html = regionBrand.logoDataUrl
          ? `<img src="${regionBrand.logoDataUrl.replace(/"/g, '&quot;')}" alt="" />`
          : `<span class="region-logo-marker__initial" style="background:${regionBrand.color}">${initials(regionBrand.name)}</span>`
        regionMarkers.push({ id: regionProps.id, name: regionProps.name, center: regionLatLng, html })
      }

      if (cityLatLng && cityProps && cityLoc) {
        const html = cityBrand
          ? cityBrand.logoDataUrl
            ? `<img src="${cityBrand.logoDataUrl.replace(/"/g, '&quot;')}" alt="" />`
            : `<span class="city-logo-marker__initial" style="background:${cityBrand.color}">${initials(cityBrand.name)}</span>`
          : ''
        cityMarkers.push({
          id: cityProps.cityId,
          name: cityLoc.name,
          center: cityLatLng,
          html,
          size: cityBrand ? CITY_OWNED_MARKER_SIZE : CITY_FREE_MARKER_SIZE,
        })
      }
    }

    return { regionMarkers, cityMarkers }
  }, [regionsGeo, cityContourByRegionId, locations, brands, map, zoom])

  if (zoom < LABEL_ZOOM_THRESHOLD) return null

  return (
    <>
      {regionMarkers.map((m) => {
        const icon = L.divIcon({
          html: m.html,
          className: 'region-logo-marker',
          iconSize: [REGION_MARKER_SIZE, REGION_MARKER_SIZE],
        })
        return (
          <Marker
            key={`region-${m.id}`}
            position={m.center}
            icon={icon}
            interactive={false}
            title={m.name}
          >
            <Tooltip
              permanent
              direction="bottom"
              offset={[0, REGION_MARKER_SIZE / 2 + 2]}
              className="region-name-tooltip"
            >
              {m.name}
            </Tooltip>
          </Marker>
        )
      })}
      {cityMarkers.map((m) => {
        const icon = L.divIcon({
          html: m.html,
          className: m.html ? 'city-logo-marker' : 'city-free-marker',
          iconSize: [m.size, m.size],
        })
        return (
          <Marker
            key={`city-${m.id}`}
            position={m.center}
            icon={icon}
            interactive={false}
            title={m.name}
          >
            <Tooltip
              permanent
              direction="right"
              offset={[m.size / 2 + 3, 0]}
              className="city-label-tooltip"
            >
              {m.name}
            </Tooltip>
          </Marker>
        )
      })}
    </>
  )
}
