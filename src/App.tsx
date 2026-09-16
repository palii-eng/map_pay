import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { TopBar } from './components/layout/TopBar'
import { DemoBanner } from './components/common/DemoBanner'
import { HomePage } from './pages/HomePage'
import CompanyPage from './pages/CompanyPage'
import BlogPage from './pages/BlogPage'
import ArticlePage from './pages/ArticlePage'
import { useAppStore } from './store/useAppStore'

export default function App() {
  const init = useAppStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-slate-100">
      <TopBar />
      <div className="pointer-events-none px-3 pt-3 sm:px-4">
        <DemoBanner />
      </div>
      <div className="relative min-h-0 flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/companies/:brandId" element={<CompanyPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:articleId" element={<ArticlePage />} />
        </Routes>
      </div>
    </div>
  )
}
