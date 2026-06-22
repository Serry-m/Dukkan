import type { Store } from '@/types'
import { Store as StoreIcon, MapPin, Clock } from 'lucide-react'
import { StoreSocials } from './StoreSocials'

export function StoreHero({ store, themeColor }: { store: Store; themeColor: string }) {
  return (
    <div className="max-w-lg sm:max-w-2xl md:max-w-4xl lg:max-w-6xl mx-auto">
      {/* Cover */}
      <div className="relative h-32 sm:h-48 lg:h-56 w-full overflow-hidden sm:rounded-b-3xl">
        {store.banner_url ? (
          <img src={store.banner_url} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: `radial-gradient(120% 120% at 30% 0%, ${themeColor}, ${themeColor}b0 60%, ${themeColor}80)` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-transparent to-black/10" />

        {/* Promo overlay (Pro, merchant-controlled) */}
        {store.promo_enabled && store.promo_title && (
          <div className="absolute inset-0 flex flex-col items-start justify-center gap-1.5 px-6 sm:px-10 bg-gradient-to-l from-black/50 via-black/15 to-transparent">
            {store.promo_subtitle && (
              <span className="text-white/90 text-xs sm:text-sm tracking-wide">{store.promo_subtitle}</span>
            )}
            <span className="text-white text-2xl sm:text-4xl font-extrabold leading-tight max-w-[65%]">{store.promo_title}</span>
            <a href="#products" className="mt-1 inline-block bg-white text-gray-900 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
              تسوّقي الآن
            </a>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="px-4 -mt-11 sm:-mt-14 relative">
        <div className="flex flex-col items-center text-center">
          {/* Logo — double-bezel (machined). Smaller on mobile so products surface sooner. */}
          <div className="w-[74px] h-[74px] sm:w-[104px] sm:h-[104px] rounded-[1.3rem] sm:rounded-[1.6rem] bg-white p-1.5 shadow-[var(--shadow-lift)] ring-1 ring-gray-900/[0.06]">
            <div className="w-full h-full rounded-[1.1rem] sm:rounded-[1.2rem] overflow-hidden flex items-center justify-center bg-gray-50">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${themeColor}12` }}>
                  <StoreIcon size={34} strokeWidth={1.5} style={{ color: themeColor }} />
                </div>
              )}
            </div>
          </div>

          {/* Name + status */}
          <div className="mt-2 flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{store.name}</h1>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                store.is_open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${store.is_open ? 'bg-green-500' : 'bg-gray-400'}`} />
              {store.is_open ? 'مفتوح' : 'مغلق'}
            </span>
          </div>

          {store.description && (
            <p className="text-sm text-gray-500 mt-1 max-w-sm leading-relaxed">{store.description}</p>
          )}

          {/* Info chips */}
          {(store.location || store.working_hours) && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              {store.location && (
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                  <MapPin size={13} style={{ color: themeColor }} /> {store.location}
                </span>
              )}
              {store.working_hours && (
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                  <Clock size={13} style={{ color: themeColor }} /> {store.working_hours}
                </span>
              )}
            </div>
          )}

          {/* Socials (share lives in the sticky header — no duplicate here).
              empty:hidden keeps free stores (no socials) from leaving a gap. */}
          <div className="flex items-center justify-center gap-3 mt-2.5 empty:hidden">
            <StoreSocials store={store} />
          </div>
        </div>
      </div>
    </div>
  )
}
