import { useRef, useState } from 'react'

interface LogoUploadProps {
  value?: string
  onChange: (dataUrl: string | undefined) => void
  label?: string
}

const MAX_SIZE_BYTES = 2 * 1024 * 1024

export function LogoUpload({ value, onChange, label = 'Логотип' }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Оберіть файл зображення')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('Файл завеликий (максимум 2 МБ)')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {value ? (
            <img src={value} alt="Логотип" className="h-full w-full object-cover" />
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-5-5-9 9" />
            </svg>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {value ? 'Змінити' : 'Завантажити'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(undefined)}
                className="rounded-lg px-2 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-50 hover:text-red-600"
              >
                Прибрати
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-400">PNG/JPG, до 2 МБ</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
