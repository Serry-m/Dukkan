import type { Store } from '@/types'
import { Store as StoreIcon, MapPin, Clock, CreditCard } from 'lucide-react'
import { StoreSocials } from './StoreSocials'

export function StoreHero({ store, themeColor }: { store: Store; themeColor: string }) {
  // The payment methods the merchant accepts, surfaced as a single hero chip so
  // the shopper's "how do I pay?" is answered before they even scroll.
  const payLabels: string[] = []
  if (store.payment_instapay) payLabels.push('إنستاباي')
  if (store.payment_vodafone) payLabels.push('فودافون كاش')
  if (store.payment_cod) payLabels.push('عند الاستلام')

  const chip = 'inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-100 px-3 py-1.5 rounded-full'

  return (
    <div className="max-w-lg sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-[1400px] mx-auto">
      {/* Cover — a controlled, professional header height (object-cover). A tall
          banner is cropped to this wide strip; for the whole image to show, the
          merchant should upload a wide (~3:1) banner. */}
      <div className="relative w-full overflow-hidden sm:rounded-b-3xl h-44 sm:h-56 lg:h-72 xl:h-80">
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

      {/* Profile — right-anchored for native RTL reading (logo on the right). */}
      <div className="px-4 -mt-12 sm:-mt-16 relative">
        <div className="flex items-end gap-3.5">
          {/* Logo — double-bezel (machined). Smaller on mobile so products surface sooner. */}
          <div className="w-[74px] h-[74px] sm:w-[104px] sm:h-[104px] rounded-[1.3rem] sm:rounded-[1.6rem] bg-white p-1.5 shadow-[var(--shadow-lift)] ring-1 ring-gray-900/[0.06] flex-shrink-0">
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

          {/* Name + status, beside the logo */}
          <div className="pb-1 min-w-0 flex flex-col gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-none truncate">{store.name}</h1>
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full w-fit ${
                store.is_open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${store.is_open ? 'bg-green-500' : 'bg-gray-400'}`} />
              {store.is_open ? 'مفتوح الآن' : 'مغلق الآن'}
            </span>
          </div>
        </div>

        {store.description && (
          <p className="text-sm text-gray-500 mt-3 max-w-xl leading-relaxed">{store.description}</p>
        )}

        {/* Info chips — location · hours · payment */}
        {(store.location || store.working_hours || payLabels.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {store.location && (
              <span className={chip}>
                <MapPin size={13} style={{ color: themeColor }} /> {store.location}
              </span>
            )}
            {store.working_hours && (
              <span className={chip}>
                <Clock size={13} style={{ color: themeColor }} /> {store.working_hours}
              </span>
            )}
            {payLabels.length > 0 && (
              <span className={chip}>
                <CreditCard size={13} style={{ color: themeColor }} /> {payLabels.join(' · ')}
              </span>
            )}
          </div>
        )}

        {/* Socials — right-aligned; empty:hidden keeps free stores from leaving a gap. */}
        <div className="flex items-center gap-3 mt-3.5 empty:hidden">
          <StoreSocials store={store} />
        </div>
      </div>
    </div>
  )
}
