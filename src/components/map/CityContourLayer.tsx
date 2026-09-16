import { useEffect, useMemo, useRef } from 'react'
import type { Feature, FeatureCollection } from 'geojson'
import L from 'leaflet'
import { GeoJSON as RLGeoJSON, useMap } from 'react-leaflet'
import { useAppStore } from '../../store/useAppStore'
import { baseStyleFor } from './mapStyle'
import type { CityContourProps } from '../../types'

// Власний pane з z-index вищим за стандартний overlayPane (400): гарантує, що
// контур міста завжди клікабельний ПОВЕРХ області, незалежно від порядку
// монтування шарів (регіони перемонтовуються при зміні зуму чи власника і
// інакше могли б опинитися ПОВЕРХ міста в DOM-порядку, блокуючи клік).
const CITY_CONTOUR_PANE = 'city-contour-pane'

interface CityContourLayerProps {
  cityContoursGeo: FeatureCollection
}

// Реальні контури обласних міст (як у Києва) — окрема локація від самої
// області, з власним статусом і кольором, поверх території області.
// Знаки-мітки (лого/крапка+назва) для цих контурів малює BrandMarkersLayer,
// щоб узгоджено розводити їх із мітками самих областей.
export function CityContourLayer({ cityContoursGeo }: CityContourLayerProps) {
  const map = useMap()
  const locations = useAppStore((s) => s.locations)
  const brands = useAppStore((s) => s.brands)
  const selectedLocationId = useAppStore((s) => s.selectedLocationId)
  const selectLocation = useAppStore((s) => s.selectLocation)

  const layersRef = useRef<Record<string, L.Path>>({})

  // синхронно (не в ефекті!), щоб pane точно існував ще до монтування шару нижче
  if (!map.getPane(CITY_CONTOUR_PANE)) {
    const pane = map.createPane(CITY_CONTOUR_PANE)
    pane.style.zIndex = '450'
  }

  const signature = useMemo(() => {
    return cityContoursGeo.features
      .map((f) => {
        const id = (f.properties as CityContourProps).cityId
        const loc = locations[id]
        const brand = loc?.ownerBrandId ? brands[loc.ownerBrandId] : null
        return `${id}:${loc?.ownerBrandId ?? ''}:${brand?.color ?? ''}`
      })
      .join('|')
  }, [cityContoursGeo, locations, brands])

  useEffect(() => {
    for (const [id, layer] of Object.entries(layersRef.current)) {
      const loc = locations[id]
      const brand = loc?.ownerBrandId ? brands[loc.ownerBrandId] : undefined
      layer.setStyle(baseStyleFor(loc, brand, id === selectedLocationId))
      if (id === selectedLocationId) layer.bringToFront()
    }
  }, [selectedLocationId, locations, brands])

  function onEachFeature(feature: Feature, layer: L.Layer) {
    const props = feature.properties as CityContourProps
    const id = props.cityId
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

  return (
    <RLGeoJSON
      key={`city-contours-${signature}`}
      data={cityContoursGeo}
      onEachFeature={onEachFeature}
      pane={CITY_CONTOUR_PANE}
    />
  )
}
