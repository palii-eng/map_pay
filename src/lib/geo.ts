import type { FeatureCollection } from 'geojson'
import type { RegionProps } from '../types'

export interface GeoData {
  regions: FeatureCollection // properties: RegionProps
  cityContours: FeatureCollection // properties: CityContourProps
}

let cache: GeoData | null = null

export async function loadGeoData(): Promise<GeoData> {
  if (cache) return cache
  const [regionsRes, cityContoursRes] = await Promise.all([
    fetch(`${import.meta.env.BASE_URL}geo/regions.geojson`),
    fetch(`${import.meta.env.BASE_URL}geo/city-contours.geojson`),
  ])
  if (!regionsRes.ok || !cityContoursRes.ok) {
    throw new Error('Не вдалося завантажити географічні дані карти')
  }
  const regions = (await regionsRes.json()) as FeatureCollection
  const cityContours = (await cityContoursRes.json()) as FeatureCollection
  cache = { regions, cityContours }
  return cache
}

export function regionProps(feature: GeoJSON.Feature): RegionProps {
  return feature.properties as RegionProps
}
