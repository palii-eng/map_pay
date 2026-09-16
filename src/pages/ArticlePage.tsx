import { Link, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { BrandBadge } from '../components/common/BrandBadge'
import { formatDateTime } from '../lib/format'

export default function ArticlePage() {
  const { articleId } = useParams<{ articleId: string }>()
  const article = useAppStore((s) => (articleId ? s.articles[articleId] : undefined))
  const brand = useAppStore((s) => (article ? s.brands[article.brandId] : undefined))

  if (!article) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
          <p className="text-3xl">🔍</p>
          <p className="text-base font-semibold text-slate-800">Статтю не знайдено</p>
          <p className="text-sm text-slate-500">
            Можливо, посилання застаріло, або дані цього демо-сеансу вже очищені браузером.
          </p>
          <Link
            to="/blog"
            className="mt-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            До блогу
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <article className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
        <Link to="/blog" className="text-xs font-medium text-slate-400 hover:text-slate-700">
          ← До блогу
        </Link>

        <h1 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">{article.title}</h1>

        <div className="mt-3 flex items-center gap-2.5">
          {brand && (
            <Link to={`/companies/${brand.id}`} className="flex items-center gap-2.5">
              <BrandBadge name={brand.name} color={brand.color} logoDataUrl={brand.logoDataUrl} size={32} />
              <span className="text-sm font-medium text-slate-800 hover:underline">{brand.name}</span>
            </Link>
          )}
          <span className="text-xs text-slate-400">· {formatDateTime(article.createdAt)}</span>
        </div>

        {article.coverImageDataUrl && (
          <img
            src={article.coverImageDataUrl}
            alt=""
            className="mt-6 max-h-96 w-full rounded-2xl object-cover"
          />
        )}

        <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {article.content}
        </div>
      </article>
    </div>
  )
}
