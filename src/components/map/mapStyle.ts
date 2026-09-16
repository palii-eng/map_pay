import type { PathOptions } from 'leaflet'
import type { Brand, LocationState } from '../../types'

export const FREE_FILL = '#f5f7fa'
export const FREE_STROKE = '#94a3b8'
export const BASE_STROKE_WEIGHT = 1.2

export function baseStyleFor(
  location: LocationState | undefined,
  brand: Brand | undefined,
  selected: boolean,
): PathOptions {
  if (location?.ownerBrandId && brand) {
    return {
      fillColor: brand.color,
      fillOpacity: 0.55,
      color: selected ? '#0f172a' : brand.color,
      weight: selected ? 3 : BASE_STROKE_WEIGHT,
      opacity: 1,
    }
  }
  return {
    fillColor: FREE_FILL,
    fillOpacity: 0.9,
    color: selected ? '#0f172a' : FREE_STROKE,
    weight: selected ? 3 : BASE_STROKE_WEIGHT,
    opacity: 1,
  }
}
