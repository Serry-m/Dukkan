import type { Store } from '@/types'
import { Store as StoreIcon, MapPin, Clock } from 'lucide-react'
import ShareStoreButton from './ShareStoreButton'
import { StoreSocials } from './StoreSocials'

export function StoreHero({ store, themeColor }: { store: Store; themeColor: string }) {
  return (
    <div className="max-w-lg mx-auto">
      {/* Cover */}
      <div className="relative h-36 sm:h-44 w-full overflow-hidden">
        {store.banner_url ? (
          <img src={store.banner_url} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
      </div>

      {/* Profile */}
      <div className="px-4 -mt-12 relative">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <div className="w-24 h-24 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${themeColor}15` }}>
                <StoreIcon size={32} style={{ color: themeColor }} />
              </div>
            )}
          </div>

          {/* Name + status */}
          <div className="mt-3 flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{store.name}</h1>
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
            <p className="text-sm text-gray-500 mt-2 max-w-sm leading-relaxed">{store.description}</p>
          )}

          {/* Info chips */}
          {(store.location || store.working_hours) && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
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

          {/* Socials + share */}
          <div className="flex items-center gap-3 mt-4">
            <StoreSocials store={store} />
            <ShareStoreButton storeName={store.name} themeColor={themeColor} />
          </div>
        </div>
      </div>
    </div>
  )
}
