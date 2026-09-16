import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { APP_NAME } from '../../config'
import { useAppStore } from '../../store/useAppStore'
import { Modal } from '../common/Modal'
import { BrandBadge } from '../common/BrandBadge'
import { BrandForm } from '../purchase/BrandForm'
import { LoginForm } from '../auth/LoginForm'

export function TopBar() {
  const navigate = useNavigate()
  const currentUser = useAppStore((s) => s.currentUser)
  const myBrandIds = useAppStore((s) => s.myBrandIds)
  const brands = useAppStore((s) => s.brands)
  const activeBrandId = useAppStore((s) => s.activeBrandId)
  const logout = useAppStore((s) => s.logout)
  const setActiveBrand = useAppStore((s) => s.setActiveBrand)
  const createBrand = useAppStore((s) => s.createBrand)

  const [showLogin, setShowLogin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showCreateBrand, setShowCreateBrand] = useState(false)

  function openMyCompany() {
    const id = activeBrandId ?? myBrandIds[0]
    if (id) {
      if (!activeBrandId) setActiveBrand(id)
      navigate(`/companies/${id}`)
    } else {
      setShowCreateBrand(true)
    }
  }

  return (
    <>
      {/* backdrop-blur тут навмисне НЕ отримує position:fixed нащадків (модалки) —
          воно створює новий containing block для fixed, тож Modal рендериться
          окремо, поза <header>, інакше вікно логіну стискається до висоти хедера */}
      <header className="pointer-events-auto z-[1100] flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3.5 backdrop-blur sm:h-16 sm:px-5">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            К
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">{APP_NAME}</p>
            <p className="hidden truncate text-xs text-slate-400 sm:block">
              Рекламні локації на карті України
            </p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/blog"
            className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:block"
          >
            Блог
          </Link>

          {currentUser && (
            <button
              onClick={openMyCompany}
              title="Моя компанія"
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="7" width="18" height="14" rx="2" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span className="hidden sm:inline">Моя компанія</span>
            </button>
          )}

          {!currentUser ? (
            <button
              onClick={() => setShowLogin(true)}
              className="rounded-full bg-slate-900 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Увійти
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-2.5 transition hover:bg-slate-50"
              >
                {activeBrandId && brands[activeBrandId] ? (
                  <BrandBadge
                    name={brands[activeBrandId].name}
                    color={brands[activeBrandId].color}
                    logoDataUrl={brands[activeBrandId].logoDataUrl}
                    size={26}
                  />
                ) : (
                  <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                    {currentUser.email[0].toUpperCase()}
                  </span>
                )}
                <span className="hidden max-w-[140px] truncate text-sm text-slate-700 sm:inline">
                  {activeBrandId && brands[activeBrandId] ? brands[activeBrandId].name : currentUser.email}
                </span>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-[1150]" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-[1160] mt-2 w-64 rounded-xl border border-slate-100 bg-white p-2 shadow-lg">
                    <p className="truncate px-2 py-1.5 text-xs text-slate-400">{currentUser.email}</p>
                    {myBrandIds.length > 0 && (
                      <div className="mb-1 space-y-0.5">
                        {myBrandIds.map((id) => {
                          const b = brands[id]
                          return (
                            <div
                              key={id}
                              className={`flex items-center gap-1 rounded-lg pr-1 transition hover:bg-slate-50 ${
                                activeBrandId === id ? 'bg-slate-50' : ''
                              }`}
                            >
                              <button
                                onClick={() => {
                                  setActiveBrand(id)
                                  setMenuOpen(false)
                                }}
                                className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${
                                  activeBrandId === id ? 'font-medium text-slate-900' : 'text-slate-600'
                                }`}
                              >
                                <BrandBadge name={b.name} color={b.color} logoDataUrl={b.logoDataUrl} size={22} />
                                <span className="truncate">{b.name}</span>
                              </button>
                              <Link
                                to={`/companies/${id}`}
                                onClick={() => setMenuOpen(false)}
                                title="Переглянути сторінку бренду"
                                className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </Link>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        logout()
                        setMenuOpen(false)
                      }}
                      className="w-full rounded-lg px-2 py-1.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                    >
                      Вийти
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {showLogin && (
        <Modal title="Увійти в акаунт" onClose={() => setShowLogin(false)} width="sm">
          <LoginForm />
        </Modal>
      )}

      {showCreateBrand && (
        <Modal title="Створіть бренд" onClose={() => setShowCreateBrand(false)} width="sm">
          <p className="mb-4 text-sm text-slate-500">
            У вас ще немає бренду. Заповніть базові дані, щоб отримати сторінку компанії — локації для
            карти можна буде купити пізніше.
          </p>
          <BrandForm
            onCancel={() => setShowCreateBrand(false)}
            onSubmit={async (input) => {
              const id = await createBrand(input)
              setShowCreateBrand(false)
              navigate(`/companies/${id}`)
            }}
          />
        </Modal>
      )}
    </>
  )
}
