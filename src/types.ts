export type RegionType = 'oblast' | 'republic' | 'special-city'

export interface RegionProps {
  id: string
  name: string
  type: RegionType
}

export type LocationKind = 'region' | 'city'

export interface CityContourProps {
  regionId: string
  cityId: string
  name: string
}

export interface Brand {
  id: string
  name: string
  description: string
  color: string
  logoDataUrl?: string
  website?: string
  address?: string
  phone?: string
  contactEmail?: string
  instagram?: string
  facebook?: string
  ownerUserId: string
  articleCreditsAvailable: number
  articleCreditsUsed: number
  createdAt: number
}

export type BrandProfileInput = Omit<
  Brand,
  'id' | 'ownerUserId' | 'articleCreditsAvailable' | 'articleCreditsUsed' | 'createdAt'
>

export interface PurchaseRecord {
  id: string
  brandId: string
  brandName: string
  price: number
  timestamp: number
  previousBrandId: string | null
  previousBrandName: string | null
}

export interface LocationState {
  id: string
  kind: LocationKind
  name: string
  regionType?: RegionType // лише для kind === 'region'
  parentRegionId?: string // лише для kind === 'city'
  parentRegionName?: string
  ownerBrandId: string | null
  lastPrice: number | null
  nextPrice: number
  history: PurchaseRecord[]
}

export interface ActivityEvent {
  id: string
  type: 'occupy' | 'absorb'
  locationId: string
  locationName: string
  locationKind: LocationKind
  parentRegionId: string | null
  brandId: string
  brandName: string
  brandColor: string
  brandLogoDataUrl?: string
  previousBrandId: string | null
  previousBrandName: string | null
  price: number
  timestamp: number
}

export interface MockUser {
  id: string
  email: string
}

export type ArticleStatus = 'published'

export interface Article {
  id: string
  brandId: string
  title: string
  excerpt: string
  content: string
  coverImageDataUrl?: string
  status: ArticleStatus
  createdAt: number
}

export interface ArticleInput {
  title: string
  excerpt: string
  content: string
  coverImageDataUrl?: string
}
