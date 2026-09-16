import { useState } from 'react'
import { BRAND_COLOR_PRESETS, DEFAULT_BRAND_COLOR } from '../../config'
import { LogoUpload } from '../common/LogoUpload'
import type { Brand, BrandProfileInput } from '../../types'

interface BrandProfileFormProps {
  brand: Brand
  onSubmit: (input: BrandProfileInput) => void
  onCancel: () => void
}

export function BrandProfileForm({ brand, onSubmit, onCancel }: BrandProfileFormProps) {
  const [name, setName] = useState(brand.name)
  const [description, setDescription] = useState(brand.description)
  const [color, setColor] = useState(brand.color || DEFAULT_BRAND_COLOR)
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(brand.logoDataUrl)
  const [website, setWebsite] = useState(brand.website ?? '')
  const [address, setAddress] = useState(brand.address ?? '')
  const [phone, setPhone] = useState(brand.phone ?? '')
  const [contactEmail, setContactEmail] = useState(brand.contactEmail ?? '')
  const [instagram, setInstagram] = useState(brand.instagram ?? '')
  const [facebook, setFacebook] = useState(brand.facebook ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Вкажіть назву бренду')
    if (!description.trim()) return setError('Додайте короткий опис')
    setError(null)
    onSubmit({
      name,
      description,
      color,
      logoDataUrl,
      website: website || undefined,
      address: address || undefined,
      phone: phone || undefined,
      contactEmail: contactEmail || undefined,
      instagram: instagram || undefined,
      facebook: facebook || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <LogoUpload value={logoDataUrl} onChange={setLogoDataUrl} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Назва бренду *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Сайт</label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Короткий опис *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Адреса</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Телефон</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+380"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Публічний контактний email
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="hello@brand.com"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </div>
        <div />
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Instagram</label>
          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Facebook</label>
          <input
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="https://facebook.com/…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Колір територій</label>
        <div className="flex flex-wrap items-center gap-2">
          {BRAND_COLOR_PRESETS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className="h-7 w-7 rounded-full transition"
              style={{ backgroundColor: c, ...(color === c ? { boxShadow: '0 0 0 2px #0f172a' } : {}) }}
              aria-label={c}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-7 w-9 cursor-pointer rounded border border-slate-200"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Скасувати
        </button>
        <button
          type="submit"
          className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Зберегти
        </button>
      </div>
    </form>
  )
}
