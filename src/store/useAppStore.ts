import { create } from 'zustand'
import type { FeatureCollection } from 'geojson'
import { loadGeoData, regionProps } from '../lib/geo'
import { nextPriceAfter } from '../lib/pricing'
import { DEFAULT_BRAND_COLOR, START_PRICE } from '../config'
import { OBLAST_CENTERS } from '../data/oblastCenters'
import { buildDemoSeed } from '../data/demoSeed'
import type {
  ActivityEvent,
  Article,
  ArticleInput,
  Brand,
  BrandProfileInput,
  LocationState,
  MockUser,
  RegionProps,
} from '../types'

type Status = 'idle' | 'loading' | 'ready' | 'error'

export interface PurchaseResult {
  ok: boolean
  reason?: string
  record?: LocationState['history'][number]
}

export interface CreateArticleResult {
  ok: boolean
  reason?: string
  articleId?: string
}

interface NewBrandInput {
  name: string
  description: string
  color: string
  logoDataUrl?: string
  website?: string
}

interface AppState {
  status: Status
  errorMessage: string | null

  regionsGeo: FeatureCollection | null
  cityContoursGeo: FeatureCollection | null
  regionIndex: Record<string, RegionProps>
  cityIdByRegionId: Record<string, string>
  locations: Record<string, LocationState>

  brands: Record<string, Brand>
  currentUser: MockUser | null
  myBrandIds: string[]
  activeBrandId: string | null

  activity: ActivityEvent[]

  articles: Record<string, Article>

  selectedLocationId: string | null

  init: () => Promise<void>
  selectLocation: (id: string | null) => void

  mockLogin: (email: string) => void
  mockLogout: () => void
  createBrand: (input: NewBrandInput) => string
  setActiveBrand: (id: string) => void
  updateBrandProfile: (brandId: string, input: BrandProfileInput) => void

  purchaseLocation: (locationId: string, brandId: string) => PurchaseResult
  createArticle: (brandId: string, input: ArticleInput) => CreateArticleResult
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

export const useAppStore = create<AppState>((set, get) => ({
  status: 'idle',
  errorMessage: null,

  regionsGeo: null,
  cityContoursGeo: null,
  regionIndex: {},
  cityIdByRegionId: {},
  locations: {},

  brands: {},
  currentUser: null,
  myBrandIds: [],
  activeBrandId: null,

  activity: [],

  articles: {},

  selectedLocationId: null,

  init: async () => {
    if (get().status === 'ready' || get().status === 'loading') return
    set({ status: 'loading', errorMessage: null })
    try {
      const geo = await loadGeoData()
      const regionIndex: Record<string, RegionProps> = {}
      const cityIdByRegionId: Record<string, string> = {}
      const locations: Record<string, LocationState> = {}

      for (const f of geo.regions.features) {
        const props = regionProps(f)
        regionIndex[props.id] = props
        locations[props.id] = {
          id: props.id,
          kind: 'region',
          name: props.name,
          regionType: props.type,
          ownerBrandId: null,
          lastPrice: null,
          nextPrice: START_PRICE,
          history: [],
        }
      }

      for (const center of OBLAST_CENTERS) {
        const cityId = `${center.regionId}__city`
        cityIdByRegionId[center.regionId] = cityId
        locations[cityId] = {
          id: cityId,
          kind: 'city',
          name: center.name,
          parentRegionId: center.regionId,
          parentRegionName: regionIndex[center.regionId]?.name,
          ownerBrandId: null,
          lastPrice: null,
          nextPrice: START_PRICE,
          history: [],
        }
      }

      const demo = buildDemoSeed(locations)

      set({
        status: 'ready',
        regionsGeo: geo.regions,
        cityContoursGeo: geo.cityContours,
        regionIndex,
        cityIdByRegionId,
        locations: demo.locations,
        brands: demo.brands,
        activity: demo.activity,
        articles: demo.articles,
      })
    } catch (err) {
      set({
        status: 'error',
        errorMessage: err instanceof Error ? err.message : 'Невідома помилка завантаження карти',
      })
    }
  },

  selectLocation: (id) => set({ selectedLocationId: id }),

  mockLogin: (email) => {
    const id = `user_${email.toLowerCase()}`
    set({ currentUser: { id, email } })
  },

  mockLogout: () =>
    set({
      currentUser: null,
      myBrandIds: [],
      activeBrandId: null,
    }),

  createBrand: (input) => {
    const user = get().currentUser
    if (!user) throw new Error('Потрібна автентифікація для створення бренду')
    const id = uid('brand')
    const brand: Brand = {
      id,
      name: input.name.trim(),
      description: input.description.trim(),
      color: input.color || DEFAULT_BRAND_COLOR,
      logoDataUrl: input.logoDataUrl,
      website: input.website?.trim() || undefined,
      ownerUserId: user.id,
      articleCreditsAvailable: 0,
      articleCreditsUsed: 0,
      createdAt: Date.now(),
    }
    set((s) => ({
      brands: { ...s.brands, [id]: brand },
      myBrandIds: [...s.myBrandIds, id],
      activeBrandId: id,
    }))
    return id
  },

  setActiveBrand: (id) => set({ activeBrandId: id }),

  updateBrandProfile: (brandId, input) => {
    const state = get()
    const brand = state.brands[brandId]
    if (!brand || !state.currentUser || brand.ownerUserId !== state.currentUser.id) return
    set((s) => ({
      brands: {
        ...s.brands,
        [brandId]: {
          ...brand,
          name: input.name.trim(),
          description: input.description.trim(),
          color: input.color || DEFAULT_BRAND_COLOR,
          logoDataUrl: input.logoDataUrl,
          website: input.website?.trim() || undefined,
          address: input.address?.trim() || undefined,
          phone: input.phone?.trim() || undefined,
          contactEmail: input.contactEmail?.trim() || undefined,
          instagram: input.instagram?.trim() || undefined,
          facebook: input.facebook?.trim() || undefined,
        },
      },
    }))
  },

  purchaseLocation: (locationId, brandId) => {
    const state = get()
    const location = state.locations[locationId]
    const brand = state.brands[brandId]
    if (!state.currentUser) return { ok: false, reason: 'Потрібно увійти в акаунт' }
    if (!location) return { ok: false, reason: 'Локацію не знайдено' }
    if (!brand) return { ok: false, reason: 'Бренд не знайдено' }
    if (brand.ownerUserId !== state.currentUser.id) {
      return { ok: false, reason: 'Цей бренд належить іншому акаунту' }
    }
    if (location.ownerBrandId === brandId) {
      return { ok: false, reason: 'Не можна поглинути власну локацію' }
    }

    const price = location.nextPrice
    const previousBrandId = location.ownerBrandId
    const previousBrand = previousBrandId ? state.brands[previousBrandId] : null

    const record = {
      id: uid('purchase'),
      brandId,
      brandName: brand.name,
      price,
      timestamp: Date.now(),
      previousBrandId: previousBrandId,
      previousBrandName: previousBrand ? previousBrand.name : null,
    }

    const updatedLocation: LocationState = {
      ...location,
      ownerBrandId: brandId,
      lastPrice: price,
      nextPrice: nextPriceAfter(price),
      history: [record, ...location.history],
    }

    const event: ActivityEvent = {
      id: uid('event'),
      type: previousBrandId ? 'absorb' : 'occupy',
      locationId: location.id,
      locationName: location.name,
      locationKind: location.kind,
      parentRegionId: location.kind === 'city' ? (location.parentRegionId ?? null) : null,
      brandId,
      brandName: brand.name,
      brandColor: brand.color,
      brandLogoDataUrl: brand.logoDataUrl,
      previousBrandId,
      previousBrandName: previousBrand ? previousBrand.name : null,
      price,
      timestamp: record.timestamp,
    }

    set((s) => ({
      locations: { ...s.locations, [locationId]: updatedLocation },
      activity: [event, ...s.activity].slice(0, 200),
      brands: {
        ...s.brands,
        [brandId]: {
          ...brand,
          articleCreditsAvailable: brand.articleCreditsAvailable + 1,
        },
      },
    }))

    return { ok: true, record }
  },

  createArticle: (brandId, input) => {
    const state = get()
    const brand = state.brands[brandId]
    if (!state.currentUser) return { ok: false, reason: 'Потрібно увійти в акаунт' }
    if (!brand) return { ok: false, reason: 'Бренд не знайдено' }
    if (brand.ownerUserId !== state.currentUser.id) {
      return { ok: false, reason: 'Цей бренд належить іншому акаунту' }
    }
    if (brand.articleCreditsAvailable <= 0) {
      return { ok: false, reason: 'Немає доступних прав на публікацію статті' }
    }
    if (!input.title.trim() || !input.content.trim()) {
      return { ok: false, reason: 'Заповніть заголовок і текст статті' }
    }

    const id = uid('article')
    const article: Article = {
      id,
      brandId,
      title: input.title.trim(),
      excerpt: input.excerpt.trim(),
      content: input.content.trim(),
      coverImageDataUrl: input.coverImageDataUrl,
      status: 'published',
      createdAt: Date.now(),
    }

    set((s) => ({
      articles: { ...s.articles, [id]: article },
      brands: {
        ...s.brands,
        [brandId]: {
          ...brand,
          articleCreditsAvailable: brand.articleCreditsAvailable - 1,
          articleCreditsUsed: brand.articleCreditsUsed + 1,
        },
      },
    }))

    return { ok: true, articleId: id }
  },
}))
