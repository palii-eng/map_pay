import { Link } from 'react-router-dom'
import { BrandBadge } from '../common/BrandBadge'
import { formatDateTime } from '../../lib/format'
import type { Article, Brand } from '../../types'

export function ArticleCard({ article, brand }: { article: Article; brand?: Brand }) {
  return (
    <Link
      to={`/blog/${article.id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 transition hover:border-slate-300 hover:shadow-sm"
    >
      {article.coverImageDataUrl ? (
        <img src={article.coverImageDataUrl} alt="" className="h-40 w-full object-cover" />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-slate-50 text-slate-300">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M7 8h10M7 12h10M7 16h6" strokeLinecap="round" />
          </svg>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{article.title}</h3>
        <p className="line-clamp-2 flex-1 text-sm text-slate-500">{article.excerpt}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          {brand && (
            <span className="flex min-w-0 items-center gap-1.5">
              <BrandBadge name={brand.name} color={brand.color} logoDataUrl={brand.logoDataUrl} size={20} />
              <span className="truncate text-xs font-medium text-slate-600">{brand.name}</span>
            </span>
          )}
          <span className="shrink-0 text-xs text-slate-400">{formatDateTime(article.createdAt)}</span>
        </div>
      </div>
    </Link>
  )
}
