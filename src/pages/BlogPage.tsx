import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { ArticleCard } from '../components/blog/ArticleCard'

export default function BlogPage() {
  const articles = useAppStore((s) => s.articles)
  const brands = useAppStore((s) => s.brands)

  const published = useMemo(
    () => Object.values(articles).sort((a, b) => b.createdAt - a.createdAt),
    [articles],
  )

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Блог</h1>
        <p className="mt-1 text-sm text-slate-500">
          Статті від брендів, які зайняли чи поглинули локацію на карті — кожна покупка дає право на
          одну публікацію.
        </p>

        {published.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-2 py-16 text-center text-slate-400">
            <p className="text-3xl">📝</p>
            <p className="text-sm">Поки що жоден бренд не опублікував статтю.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((a) => (
              <ArticleCard key={a.id} article={a} brand={brands[a.brandId]} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
