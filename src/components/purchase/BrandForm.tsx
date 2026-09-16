import { useState } from 'react'
import { BRAND_COLOR_PRESETS, DEFAULT_BRAND_COLOR } from '../../config'
import { LogoUpload } from '../common/LogoUpload'

interface BrandFormProps {
  onSubmit: (input: {
    name: string
    description: string
    color: string
    logoDataUrl?: string
    website?: string
  }) => void
  onCancel?: () => void
}

export function BrandForm({ onSubmit, onCancel }: BrandFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [color, setColor] = useState(DEFAULT_BRAND_COLOR)
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Вкажіть назву бренду')
      return
    }
    if (!description.trim()) {
      setError('Додайте короткий опис')
      return
    }
    setError(null)
    onSubmit({ name, description, color, logoDataUrl, website: website || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <LogoUpload value={logoDataUrl} onChange={setLogoDataUrl} />
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Назва бренду *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Наприклад, Ads Quiz"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Короткий опис *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Чим займається ваша компанія"
          rows={2}
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Сайт (необов'язково)</label>
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Колір територій</label>
        <div className="flex flex-wrap items-center gap-2">
          {BRAND_COLOR_PRESETS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className="h-7 w-7 rounded-full ring-2 ring-offset-2 transition"
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
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Скасувати
          </button>
        )}
        <button
          type="submit"
          className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Створити бренд
        </button>
      </div>
    </form>
  )
}
