import type { Article, ActivityEvent, Brand, LocationState, PurchaseRecord } from '../types'
import { DEMO_LOGOS } from './demoLogos'

interface DemoBrandDef {
  key: string
  name: string
  description: string
  color: string
}

const DEMO_BRAND_DEFS: DemoBrandDef[] = [
  { key: 'novapay', name: 'Nova Pay', description: 'Платіжний сервіс для малого бізнесу', color: '#2563eb' },
  { key: 'smartagro', name: 'SmartAgro', description: 'Агротех-рішення для фермерських господарств', color: '#16a34a' },
  { key: 'ukrbuild', name: 'UkrBuild', description: 'Будівельна компанія повного циклу', color: '#d97706' },
  { key: 'cleanenergy', name: 'CleanEnergy', description: 'Сонячні панелі та енергонезалежність', color: '#0891b2' },
  { key: 'freshmarket', name: 'FreshMarket', description: 'Мережа продуктових магазинів', color: '#db2777' },
  { key: 'quickcourier', name: "QuickCourier", description: "Кур'єрська доставка по всій Україні", color: '#9333ea' },
]

// hoursAgo спадає — список уже у хронологічному порядку (від найстарішої покупки до найновішої)
const DEMO_PURCHASES: { locationId: string; brandKey: string; price: number; hoursAgo: number }[] = [
  { locationId: 'lvivska-oblast', brandKey: 'novapay', price: 5, hoursAgo: 96 },
  { locationId: 'lvivska-oblast__city', brandKey: 'novapay', price: 5, hoursAgo: 95 },
  { locationId: 'kyiv', brandKey: 'quickcourier', price: 5, hoursAgo: 90 },
  { locationId: 'poltavska-oblast', brandKey: 'smartagro', price: 5, hoursAgo: 80 },
  { locationId: 'kharkivska-oblast', brandKey: 'cleanenergy', price: 5, hoursAgo: 75 },
  { locationId: 'dnipropetrovska-oblast', brandKey: 'ukrbuild', price: 5, hoursAgo: 70 },
  { locationId: 'dnipropetrovska-oblast__city', brandKey: 'ukrbuild', price: 5, hoursAgo: 68 },
  { locationId: 'zaporizka-oblast', brandKey: 'ukrbuild', price: 5, hoursAgo: 60 },
  { locationId: 'odeska-oblast', brandKey: 'cleanenergy', price: 5, hoursAgo: 50 },
  { locationId: 'odeska-oblast__city', brandKey: 'cleanenergy', price: 5, hoursAgo: 48 },
  { locationId: 'vinnytska-oblast', brandKey: 'freshmarket', price: 5, hoursAgo: 40 },
  { locationId: 'vinnytska-oblast__city', brandKey: 'freshmarket', price: 5, hoursAgo: 38 },
  { locationId: 'chernivetska-oblast__city', brandKey: 'freshmarket', price: 5, hoursAgo: 30 },
  { locationId: 'cherkaska-oblast', brandKey: 'quickcourier', price: 5, hoursAgo: 24 },
  { locationId: 'kharkivska-oblast__city', brandKey: 'smartagro', price: 5, hoursAgo: 20 },
  { locationId: 'kyiv', brandKey: 'novapay', price: 6, hoursAgo: 10 },
  { locationId: 'kharkivska-oblast', brandKey: 'smartagro', price: 6, hoursAgo: 5 },
]

interface DemoArticleDef {
  brandKey: string
  title: string
  excerpt: string
  content: string
  hoursAgo: number
}

const DEMO_ARTICLES: DemoArticleDef[] = [
  {
    brandKey: 'novapay',
    title: 'Nova Pay виходить на карту реклами',
    excerpt: 'Ми зайняли Львівську область і Київ — розповідаємо, чому саме ці локації.',
    content:
      'Nova Pay розпочинає рекламну кампанію на карті брендів із Львівської області та Києва. ' +
      'Це два наші ключові регіони за кількістю активних користувачів платіжного сервісу, і ми плануємо ' +
      'нарощувати присутність в інших областях протягом наступних місяців.',
    hoursAgo: 8,
  },
  {
    brandKey: 'smartagro',
    title: 'SmartAgro поглинув Харківську область',
    excerpt: 'Агротех-рішення тепер представлені у трьох регіонах Сходу та Центру України.',
    content:
      'Ми поглинули Харківську область, додавши її до Полтавської області та Харкова. SmartAgro продовжує ' +
      'розширювати мережу для фермерських господарств, які використовують наші рішення для моніторингу врожаю.',
    hoursAgo: 4,
  },
  {
    brandKey: 'cleanenergy',
    title: 'Сонячні панелі CleanEnergy тепер і в Одесі',
    excerpt: 'Компанія розповідає про нову рекламну локацію та плани з енергонезалежності регіону.',
    content:
      'CleanEnergy зайняла Одеську область та місто Одесу. Південь України має один із найвищих показників ' +
      'сонячної інсоляції в країні, тож ми бачимо тут значний потенціал для розвитку сонячної енергетики.',
    hoursAgo: 45,
  },
  {
    brandKey: 'freshmarket',
    title: 'FreshMarket відкриває нові магазини на Вінниччині',
    excerpt: 'Мережа продуктових магазинів розповідає про розширення у Вінницькій області та Чернівцях.',
    content:
      'FreshMarket зайняв Вінницьку область, місто Вінницю та Чернівці. Найближчим часом плануємо відкрити ' +
      'ще кілька магазинів у цих регіонах та розширити асортимент локальних виробників.',
    hoursAgo: 28,
  },
]

function uid(prefix: string, n: number) {
  return `demo_${prefix}_${n}`
}

export interface DemoSeed {
  locations: Record<string, LocationState>
  brands: Record<string, Brand>
  activity: ActivityEvent[]
  articles: Record<string, Article>
}

export function buildDemoSeed(baseLocations: Record<string, LocationState>): DemoSeed {
  const now = Date.now()
  const locations: Record<string, LocationState> = { ...baseLocations }

  const brands: Record<string, Brand> = {}
  const brandIdByKey: Record<string, string> = {}
  DEMO_BRAND_DEFS.forEach((def, i) => {
    const id = uid('brand', i)
    brandIdByKey[def.key] = id
    brands[id] = {
      id,
      name: def.name,
      description: def.description,
      color: def.color,
      logoDataUrl: DEMO_LOGOS[def.key],
      ownerUserId: `demo_owner_${def.key}`,
      articleCreditsAvailable: 0,
      articleCreditsUsed: 0,
      createdAt: now - 100 * 3600 * 1000,
    }
  })

  const activity: ActivityEvent[] = []

  DEMO_PURCHASES.forEach((p, i) => {
    const brandId = brandIdByKey[p.brandKey]
    const brand = brands[brandId]
    const loc = locations[p.locationId]
    if (!loc || !brand) return

    const timestamp = now - p.hoursAgo * 3600 * 1000
    const previousBrandId = loc.ownerBrandId
    const previousBrand = previousBrandId ? brands[previousBrandId] : null

    const record: PurchaseRecord = {
      id: uid('purchase', i),
      brandId,
      brandName: brand.name,
      price: p.price,
      timestamp,
      previousBrandId,
      previousBrandName: previousBrand ? previousBrand.name : null,
    }

    locations[p.locationId] = {
      ...loc,
      ownerBrandId: brandId,
      lastPrice: p.price,
      nextPrice: p.price + 1,
      history: [record, ...loc.history],
    }

    activity.push({
      id: uid('event', i),
      type: previousBrandId ? 'absorb' : 'occupy',
      locationId: loc.id,
      locationName: loc.name,
      locationKind: loc.kind,
      parentRegionId: loc.kind === 'city' ? (loc.parentRegionId ?? null) : null,
      brandId,
      brandName: brand.name,
      brandColor: brand.color,
      brandLogoDataUrl: brand.logoDataUrl,
      previousBrandId,
      previousBrandName: previousBrand ? previousBrand.name : null,
      price: p.price,
      timestamp,
    })

    brand.articleCreditsAvailable += 1
  })

  const articles: Record<string, Article> = {}
  DEMO_ARTICLES.forEach((a, i) => {
    const brandId = brandIdByKey[a.brandKey]
    const brand = brands[brandId]
    if (!brand) return
    const id = uid('article', i)
    articles[id] = {
      id,
      brandId,
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      status: 'published',
      createdAt: now - a.hoursAgo * 3600 * 1000,
    }
    brand.articleCreditsAvailable -= 1
    brand.articleCreditsUsed += 1
  })

  activity.sort((a, b) => b.timestamp - a.timestamp)

  return { locations, brands, activity, articles }
}
