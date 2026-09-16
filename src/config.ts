// Робоча назва платформи. Зміни це значення, щоб перейменувати продукт всюди в інтерфейсі.
export const APP_NAME = 'Карта брендів'
export const APP_TAGLINE = 'Рекламні локації на карті України'

export const START_PRICE = 5
export const PRICE_STEP = 1
export const CURRENCY_SYMBOL = '$'

export const DEFAULT_BRAND_COLOR = '#2563eb'

export const BRAND_COLOR_PRESETS = [
  '#2563eb', // синій
  '#dc2626', // червоний
  '#16a34a', // зелений
  '#d97706', // жовтогарячий
  '#9333ea', // фіолетовий
  '#0891b2', // бірюзовий
  '#db2777', // рожевий
  '#65a30d', // оливковий
]

// Мінімальний масштаб карти, з якого починаємо показувати підписи брендів на дрібних територіях
export const MAP_MIN_ZOOM = 5
export const MAP_MAX_ZOOM = 10
export const UKRAINE_BOUNDS: [[number, number], [number, number]] = [
  [44.2, 21.5],
  [52.5, 40.3],
]
