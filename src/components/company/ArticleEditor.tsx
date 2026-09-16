import { useState } from 'react'
import { LogoUpload } from '../common/LogoUpload'
import type { ArticleInput } from '../../types'

interface ArticleEditorProps {
  creditsAvailable: number
  onSubmit: (input: ArticleInput) => void
  onCancel: () => void
}

export function ArticleEditor({ creditsAvailable, onSubmit, onCancel }: ArticleEditorProps) {
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImageDataUrl, setCoverImageDataUrl] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return setError('Вкажіть заголовок статті')
    if (!content.trim()) return setError('Додайте текст статті')
    setError(null)
    onSubmit({
      title,
      excerpt: excerpt.trim() || content.trim().slice(0, 160),
      content,
      coverImageDataUrl,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <span className="font-medium">Демо-режим:</span> модерація ще не підключена — стаття публікується
        одразу й використає одне право на публікацію ({creditsAvailable} доступно).
      </p>

      <LogoUpload value={coverImageDataUrl} onChange={setCoverImageDataUrl} label="Обкладинка" />

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Заголовок *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Про що стаття"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Короткий опис для списку статей
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="Якщо лишити порожнім — візьмемо початок тексту"
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Текст статті *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          placeholder="Повний текст статті"
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
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
          Опублікувати
        </button>
      </div>
    </form>
  )
}
