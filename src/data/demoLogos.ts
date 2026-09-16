// Прості іконки-лого для демо-брендів у вигляді inline SVG (data URL) —
// без мережевих запитів і без залежності від зовнішніх сервісів.
function svgLogo(bgColor: string, iconPath: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <circle cx="48" cy="48" r="48" fill="${bgColor}" />
    <g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${iconPath}</g>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const DEMO_LOGOS: Record<string, string> = {
  // Nova Pay — платіжна картка
  novapay: svgLogo(
    '#2563eb',
    '<rect x="24" y="32" width="48" height="34" rx="5" /><path d="M24 44h48" /><path d="M32 56h14" />',
  ),
  // SmartAgro — паросток
  smartagro: svgLogo(
    '#16a34a',
    '<path d="M48 70V40" /><path d="M48 40c0-12 10-18 20-18 0 12-8 20-20 18Z" fill="#fff" stroke="none" /><path d="M48 48c0-10-9-15-18-15 0 11 7 18 18 15Z" fill="#fff" stroke="none" />',
  ),
  // UkrBuild — будівельний кран
  ukrbuild: svgLogo(
    '#d97706',
    '<path d="M28 70V30" /><path d="M28 30h30" /><path d="M50 30l8 10" /><path d="M28 40h14" /><path d="M60 40v10h-8" />',
  ),
  // CleanEnergy — сонце
  cleanenergy: svgLogo(
    '#0891b2',
    '<circle cx="48" cy="48" r="14" /><path d="M48 22v8M48 66v8M22 48h8M66 48h8M30 30l6 6M60 60l6 6M66 30l-6 6M36 60l-6 6" />',
  ),
  // FreshMarket — кошик
  freshmarket: svgLogo(
    '#db2777',
    '<path d="M28 42h40l-5 26H33l-5-26Z" /><path d="M38 42l4-12h12l4 12" /><path d="M40 50v10M56 50v10" />',
  ),
  // QuickCourier — блискавка доставки
  quickcourier: svgLogo('#9333ea', '<path d="M52 24 32 54h14l-4 18 22-30H50l2-18Z" fill="#fff" stroke="none" />'),
}
