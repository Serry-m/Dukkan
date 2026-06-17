import Link from 'next/link'
import type { Store } from '@/types'
import { isPro } from '@/lib/plan'
import { normalizeEgyptianNumber } from '@/lib/whatsapp'
import { StoreSocials } from './StoreSocials'
import { BrandMark } from '@/components/BrandMark'
import { MapPin, Clock, MessageCircle } from 'lucide-react'

export function StoreFooter({ store, themeColor }: { store: Store; themeColor: string }) {
  const wa = store.whatsapp_number ? `https://wa.me/${normalizeEgyptianNumber(store.whatsapp_number)}` : null

  return (
    <footer className="mt-10 border-t border-gray-100 bg-white">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
        {/* About */}
        {store.about && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1.5">عن المتجر</h3>
            <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{store.about}</p>
          </div>
        )}

        {/* Info */}
        <div className="space-y-2">
          {store.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={15} style={{ color: themeColor }} /> {store.location}
            </div>
          )}
          {store.working_hours && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={15} style={{ color: themeColor }} /> {store.working_hours}
            </div>
          )}
        </div>

        {/* Contact + socials */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
          <StoreSocials store={store} />
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white px-4 py-2 rounded-full transition-opacity hover:opacity-90"
              style={{ backgroundColor: themeColor }}
            >
              <MessageCircle size={15} /> تواصل معنا
            </a>
          )}
        </div>

        {/* Made with دكان (free plan) */}
        {!isPro(store) && (
          <div className="pt-4 border-t border-gray-100 flex justify-center">
            <Link href="/" target="_blank" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              <BrandMark size={16} className="rounded" /> صُنع بواسطة دكان
            </Link>
          </div>
        )}
      </div>
    </footer>
  )
}
