import { create } from 'zustand'
import type { FeatureCollection } from 'geojson'
import { loadGeoData, regionProps } from '../lib/geo'
import { DEFAULT_BRAND_COLOR, PRICE_STEP, START_PRICE } from '../config'
import { OBLAST_CENTERS } from '../data/oblastCenters'
import { supabase } from '../lib/supabaseClient'
import type {
  ActivityEvent,
  Article,
  ArticleInput,
  Brand,
  BrandProfileInput,
  LocationState,
  MockUser,
  PurchaseRecord,
  RegionProps,
} from '../types'

type Status = 'idle' | 'loading' | 'ready' | 'error'

export interface PurchaseResult {
  ok: boolean
  reason?: string
  record?: PurchaseRecord
}

export interface CreateArticleResult {
  ok: boolean
  reason?: string
  articleId?: string
}

export interface AuthResult {
  ok: boolean
  reason?: string
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

  requestLoginCode: (email: string) => Promise<AuthResult>
  verifyLoginCode: (email: string, code: string) => Promise<AuthResult>
  logout: () => Promise<void>
  createBrand: (input: NewBrandInput) => Promise<string>
  setActiveBrand: (id: string) => void
  updateBrandProfile: (brandId: string, input: BrandProfileInput) => Promise<void>

  purchaseLocation: (locationId: string, brandId: string) => Promise<PurchaseResult>
  createArticle: (brandId: string, input: ArticleInput) => Promise<CreateArticleResult>
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

// ---- мапери рядків Supabase (snake_case) у типи фронтенду (camelCase) ----

function mapBrand(row: Record<string, unknown>): Brand {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    color: row.color as string,
    logoDataUrl: (row.logo_data_url as string) ?? undefined,
    website: (row.website as string) ?? undefined,
    address: (row.address as string) ?? undefined,
    phone: (row.phone as string) ?? undefined,
    contactEmail: (row.contact_email as string) ?? undefined,
    instagram: (row.instagram as string) ?? undefined,
    facebook: (row.facebook as string) ?? undefined,
    ownerUserId: row.owner_user_id as string,
    articleCreditsAvailable: row.article_credits_available as number,
    articleCreditsUsed: row.article_credits_used as number,
    createdAt: new Date(row.created_at as string).getTime(),
  }
}

function mapArticle(row: Record<string, unknown>): Article {
  return {
    id: row.id as string,
    brandId: row.brand_id as string,
    title: row.title as string,
    excerpt: row.excerpt as string,
    content: row.content as string,
    coverImageDataUrl: (row.cover_image_data_url as string) ?? undefined,
    status: 'published',
    createdAt: new Date(row.created_at as string).getTime(),
  }
}

function mapActivity(row: Record<string, unknown>): ActivityEvent {
  return {
    id: row.id as string,
    type: row.type as 'occupy' | 'absorb',
    locationId: row.location_id as string,
    locationName: row.location_name as string,
    locationKind: row.location_kind as 'region' | 'city',
    parentRegionId: (row.parent_region_id as string) ?? null,
    brandId: row.brand_id as string,
    brandName: row.brand_name as string,
    brandColor: row.brand_color as string,
    brandLogoDataUrl: (row.brand_logo_data_url as string) ?? undefined,
    previousBrandId: (row.previous_brand_id as string) ?? null,
    previousBrandName: (row.previous_brand_name as string) ?? null,
    price: row.price as number,
    timestamp: new Date(row.created_at as string).getTime(),
  }
}

function mapPurchase(row: Record<string, unknown>): PurchaseRecord {
  return {
    id: row.id as string,
    brandId: row.brand_id as string,
    brandName: row.brand_name as string,
    price: row.price as number,
    timestamp: new Date(row.created_at as string).getTime(),
    previousBrandId: (row.previous_brand_id as string) ?? null,
    previousBrandName: (row.previous_brand_name as string) ?? null,
  }
}

function currentUserFromSession(user: { id: string; email?: string | null } | null | undefined): MockUser | null {
  if (!user?.email) return null
  return { id: user.id, email: user.email }
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
      if (!supabase) throw new Error('Supabase не налаштовано (відсутні змінні середовища)')

      const geo = await loadGeoData()
      const regionIndex: Record<string, RegionProps> = {}
      const cityIdByRegionId: Record<string, string> = {}
      const skeletons: Record<string, LocationState> = {}

      for (const f of geo.regions.features) {
        const props = regionProps(f)
        regionIndex[props.id] = props
        skeletons[props.id] = {
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
        skeletons[cityId] = {
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

      const [brandsRes, locationsRes, purchasesRes, activityRes, articlesRes, sessionRes] = await Promise.all([
        supabase.from('brands').select('*'),
        supabase.from('locations').select('*'),
        supabase.from('purchases').select('*').order('created_at', { ascending: false }),
        supabase.from('activity_events').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('articles').select('*').order('created_at', { ascending: false }),
        supabase.auth.getSession(),
      ])

      const firstError =
        brandsRes.error || locationsRes.error || purchasesRes.error || activityRes.error || articlesRes.error
      if (firstError) throw new Error(firstError.message)

      const brands: Record<string, Brand> = {}
      for (const row of brandsRes.data ?? []) brands[row.id] = mapBrand(row)

      const locations = { ...skeletons }
      for (const row of locationsRes.data ?? []) {
        const skeleton = locations[row.id as string]
        if (!skeleton) continue
        locations[row.id as string] = {
          ...skeleton,
          ownerBrandId: (row.owner_brand_id as string) ?? null,
          lastPrice: (row.last_price as number) ?? null,
          nextPrice: row.next_price as number,
        }
      }
      for (const row of purchasesRes.data ?? []) {
        const loc = locations[row.location_id as string]
        if (!loc) continue
        loc.history = [...loc.history, mapPurchase(row)]
      }

      const activity = (activityRes.data ?? []).map(mapActivity)

      const articles: Record<string, Article> = {}
      for (const row of articlesRes.data ?? []) articles[row.id] = mapArticle(row)

      const currentUser = currentUserFromSession(sessionRes.data.session?.user)
      const myBrandIds = currentUser
        ? Object.values(brands)
            .filter((b) => b.ownerUserId === currentUser.id)
            .map((b) => b.id)
        : []

      set({
        status: 'ready',
        regionsGeo: geo.regions,
        cityContoursGeo: geo.cityContours,
        regionIndex,
        cityIdByRegionId,
        locations,
        brands,
        activity,
        articles,
        currentUser,
        myBrandIds,
      })

      supabase.auth.onAuthStateChange((_event, newSession) => {
        const user = currentUserFromSession(newSession?.user)
        set((s) => ({
          currentUser: user,
          myBrandIds: user
            ? Object.values(s.brands)
                .filter((b) => b.ownerUserId === user.id)
                .map((b) => b.id)
            : [],
          activeBrandId: user ? s.activeBrandId : null,
        }))
      })
    } catch (err) {
      set({
        status: 'error',
        errorMessage: err instanceof Error ? err.message : 'Невідома помилка завантаження карти',
      })
    }
  },

  selectLocation: (id) => set({ selectedLocationId: id }),

  requestLoginCode: async (email) => {
    if (!supabase) return { ok: false, reason: 'Supabase не налаштовано' }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    if (error) return { ok: false, reason: error.message }
    return { ok: true }
  },

  verifyLoginCode: async (email, code) => {
    if (!supabase) return { ok: false, reason: 'Supabase не налаштовано' }
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
    if (error) return { ok: false, reason: error.message }
    return { ok: true }
  },

  logout: async () => {
    if (supabase) await supabase.auth.signOut()
    set({ currentUser: null, myBrandIds: [], activeBrandId: null })
  },

  createBrand: async (input) => {
    const user = get().currentUser
    if (!user || !supabase) throw new Error('Потрібна автентифікація для створення бренду')
    const { data, error } = await supabase
      .from('brands')
      .insert({
        owner_user_id: user.id,
        name: input.name.trim(),
        description: input.description.trim(),
        color: input.color || DEFAULT_BRAND_COLOR,
        logo_data_url: input.logoDataUrl ?? null,
        website: input.website?.trim() || null,
      })
      .select()
      .single()
    if (error || !data) throw new Error(error?.message ?? 'Не вдалося створити бренд')

    const brand = mapBrand(data)
    set((s) => ({
      brands: { ...s.brands, [brand.id]: brand },
      myBrandIds: [...s.myBrandIds, brand.id],
      activeBrandId: brand.id,
    }))
    return brand.id
  },

  setActiveBrand: (id) => set({ activeBrandId: id }),

  updateBrandProfile: async (brandId, input) => {
    const state = get()
    const brand = state.brands[brandId]
    if (!brand || !state.currentUser || brand.ownerUserId !== state.currentUser.id || !supabase) return
    const { data, error } = await supabase
      .from('brands')
      .update({
        name: input.name.trim(),
        description: input.description.trim(),
        color: input.color || DEFAULT_BRAND_COLOR,
        logo_data_url: input.logoDataUrl ?? null,
        website: input.website?.trim() || null,
        address: input.address?.trim() || null,
        phone: input.phone?.trim() || null,
        contact_email: input.contactEmail?.trim() || null,
        instagram: input.instagram?.trim() || null,
        facebook: input.facebook?.trim() || null,
      })
      .eq('id', brandId)
      .select()
      .single()
    if (error || !data) return
    set((s) => ({ brands: { ...s.brands, [brandId]: mapBrand(data) } }))
  },

  purchaseLocation: async (locationId, brandId) => {
    const state = get()
    const location = state.locations[locationId]
    const brand = state.brands[brandId]
    if (!supabase) return { ok: false, reason: 'Supabase не налаштовано' }
    if (!state.currentUser) return { ok: false, reason: 'Потрібно увійти в акаунт' }
    if (!location) return { ok: false, reason: 'Локацію не знайдено' }
    if (!brand) return { ok: false, reason: 'Бренд не знайдено' }
    if (brand.ownerUserId !== state.currentUser.id) {
      return { ok: false, reason: 'Цей бренд належить іншому акаунту' }
    }
    if (location.ownerBrandId === brandId) {
      return { ok: false, reason: 'Не можна поглинути власну локацію' }
    }

    const { data, error } = await supabase.rpc('purchase_location', {
      p_location_id: locationId,
      p_brand_id: brandId,
      p_kind: location.kind,
      p_name: location.name,
      p_parent_region_id: location.parentRegionId ?? null,
      p_parent_region_name: location.parentRegionName ?? null,
      p_start_price: START_PRICE,
      p_price_step: PRICE_STEP,
    })
    if (error) return { ok: false, reason: error.message }
    const row = (Array.isArray(data) ? data[0] : data) as
      | { price: number; previous_brand_id: string | null; previous_brand_name: string | null; next_price: number }
      | undefined
    if (!row) return { ok: false, reason: 'Невідома помилка' }

    const record: PurchaseRecord = {
      id: uid('purchase'),
      brandId,
      brandName: brand.name,
      price: row.price,
      timestamp: Date.now(),
      previousBrandId: row.previous_brand_id,
      previousBrandName: row.previous_brand_name,
    }

    const updatedLocation: LocationState = {
      ...location,
      ownerBrandId: brandId,
      lastPrice: row.price,
      nextPrice: row.next_price,
      history: [record, ...location.history],
    }

    const event: ActivityEvent = {
      id: uid('event'),
      type: row.previous_brand_id ? 'absorb' : 'occupy',
      locationId: location.id,
      locationName: location.name,
      locationKind: location.kind,
      parentRegionId: location.kind === 'city' ? (location.parentRegionId ?? null) : null,
      brandId,
      brandName: brand.name,
      brandColor: brand.color,
      brandLogoDataUrl: brand.logoDataUrl,
      previousBrandId: row.previous_brand_id,
      previousBrandName: row.previous_brand_name,
      price: row.price,
      timestamp: record.timestamp,
    }

    set((s) => ({
      locations: { ...s.locations, [locationId]: updatedLocation },
      activity: [event, ...s.activity].slice(0, 200),
      brands: {
        ...s.brands,
        [brandId]: { ...brand, articleCreditsAvailable: brand.articleCreditsAvailable + 1 },
      },
    }))

    return { ok: true, record }
  },

  createArticle: async (brandId, input) => {
    const state = get()
    const brand = state.brands[brandId]
    if (!supabase) return { ok: false, reason: 'Supabase не налаштовано' }
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

    const { data, error } = await supabase.rpc('create_article', {
      p_brand_id: brandId,
      p_title: input.title.trim(),
      p_excerpt: input.excerpt.trim(),
      p_content: input.content.trim(),
      p_cover_image_data_url: input.coverImageDataUrl ?? null,
    })
    if (error || !data) return { ok: false, reason: error?.message ?? 'Не вдалося опублікувати статтю' }
    const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown>
    const article = mapArticle(row)

    set((s) => ({
      articles: { ...s.articles, [article.id]: article },
      brands: {
        ...s.brands,
        [brandId]: {
          ...brand,
          articleCreditsAvailable: brand.articleCreditsAvailable - 1,
          articleCreditsUsed: brand.articleCreditsUsed + 1,
        },
      },
    }))

    return { ok: true, articleId: article.id }
  },
}))
