import { CURRENCY_SYMBOL } from '../config'

export function formatMoney(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount}`
}

const RTF = new Intl.RelativeTimeFormat('uk', { numeric: 'auto' })

export function formatRelativeTime(timestamp: number): string {
  const diffMs = timestamp - Date.now()
  const diffSec = Math.round(diffMs / 1000)
  const abs = Math.abs(diffSec)

  if (abs < 60) return 'щойно'
  const diffMin = Math.round(diffSec / 60)
  if (Math.abs(diffMin) < 60) return RTF.format(diffMin, 'minute')
  const diffHour = Math.round(diffMin / 60)
  if (Math.abs(diffHour) < 24) return RTF.format(diffHour, 'hour')
  const diffDay = Math.round(diffHour / 24)
  return RTF.format(diffDay, 'day')
}

export function formatDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function regionTypeLabel(type?: string): string {
  switch (type) {
    case 'oblast':
      return 'область'
    case 'republic':
      return 'автономна республіка'
    case 'special-city':
      return 'місто зі спеціальним статусом'
    default:
      return ''
  }
}
