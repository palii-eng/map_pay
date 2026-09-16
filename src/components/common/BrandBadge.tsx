import { initials } from '../../lib/format'

interface BrandBadgeProps {
  name: string
  color: string
  logoDataUrl?: string
  size?: number
}

export function BrandBadge({ name, color, logoDataUrl, size = 32 }: BrandBadgeProps) {
  if (logoDataUrl) {
    return (
      <img
        src={logoDataUrl}
        alt={name}
        title={name}
        className="shrink-0 rounded-full object-cover ring-1 ring-black/5"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.38 }}
      title={name}
    >
      {initials(name)}
    </span>
  )
}
