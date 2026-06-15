import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ShareStoreButton from '@/components/storefront/ShareStoreButton'
import { Store } from 'lucide-react'

type Props = {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: store } = await supabase
    .from('stores')
    .select('name, description, logo_url')
    .eq('slug', slug)
    .single()

  if (!store) return { title: 'متجر غير موجود' }

  const description = store.description ?? `تسوق من ${store.name} عبر واتساب`
  const images = store.logo_url ? [{ url: store.logo_url }] : undefined

  return {
    title: store.name,
    description,
    // Rich preview when the store link is shared on WhatsApp / social.
    openGraph: {
      title: store.name,
      description,
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary',
      title: store.name,
      description,
      images: store.logo_url ? [store.logo_url] : undefined,
    },
  }
}

export default async function StorefrontLayout({ children, params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!store) notFound()

  const themeColor = store.theme_color ?? '#16a34a'

  return (
    <div dir="rtl" className="min-h-screen bg-[#f7f8fa]">

      {/* Sticky header with colored top accent */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
        {/* Theme-colored accent stripe */}
        <div className="h-[3px]" style={{ backgroundColor: themeColor }} />

        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          {/* Logo */}
          {store.logo_url ? (
            <img
              src={store.logo_url}
              alt={store.name}
              className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-gray-100"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${themeColor}15` }}
            >
              <Store size={20} style={{ color: themeColor }} />
            </div>
          )}

          {/* Store info */}
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-gray-900 text-[15px] leading-tight truncate">{store.name}</h1>
            {store.description && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">{store.description}</p>
            )}
          </div>

          <ShareStoreButton storeName={store.name} themeColor={themeColor} />
        </div>
      </header>

      {children}
    </div>
  )
}
