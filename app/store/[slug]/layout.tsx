import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ShareStoreButton from '@/components/storefront/ShareStoreButton'
import CartBar from '@/components/storefront/CartBar'
import { StoreFooter } from '@/components/storefront/StoreFooter'
import { getTheme } from '@/lib/themes'
import { applyPlanToStore } from '@/lib/storefront'
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

  const { data: rawStore } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!rawStore) notFound()

  // Suspended by an admin — hide the storefront entirely (data preserved).
  if (rawStore.suspended) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">هذا المتجر غير متاح حالياً</h1>
          <p className="text-sm text-gray-500">يرجى المحاولة لاحقاً.</p>
        </div>
      </div>
    )
  }

  // Enforce plan limits for the public view (lapsed Pro → free presentation).
  const store = applyPlanToStore(rawStore)

  const themeColor = store.theme_color ?? '#16a34a'
  const theme = getTheme(store.theme)

  // Theme-driven font for the storefront.
  const fontVar: Record<string, string> = {
    cairo: 'var(--font-cairo)',
    tajawal: 'var(--font-tajawal)',
    almarai: 'var(--font-almarai)',
    amiri: 'var(--font-amiri)',
  }
  // Merchant font override (customization) falls back to the theme's font.
  const fontFamily = (store.font_override && fontVar[store.font_override]) || fontVar[theme.font] || 'var(--font-cairo)'

  return (
    <div
      dir="rtl"
      className="min-h-screen"
      style={{
        fontFamily,
        // Faint theme-tinted glow over the theme's base surface.
        background: `radial-gradient(125% 55% at 50% 0%, ${themeColor}0d, transparent 58%), ${theme.pageBg}`,
      }}
    >

      {/* Announcement bar (Pro, merchant-controlled) — scrolls away above the header.
          A calm theme-tinted strip (not a saturated band) so it reads as a quiet
          note and never fights an elegant brand. */}
      {store.announcement_enabled && store.announcement_text && (
        <div
          className="flex items-center justify-center gap-2 text-center text-xs font-semibold py-2 px-3"
          style={{ backgroundColor: `${themeColor}14`, color: '#44403c' }}
        >
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: themeColor }} />
          {store.announcement_text}
        </div>
      )}

      {/* Sticky header with colored top accent */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
        {/* Theme-colored accent stripe */}
        <div className="h-[3px]" style={{ backgroundColor: themeColor }} />

        <div className="max-w-lg sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-3">
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

          {/* Store name — only when there's no logo (the logo already carries
              the brand, so this avoids repeating the name). */}
          <div className="min-w-0 flex-1">
            {!store.logo_url && (
              <h1 className="font-bold text-gray-900 text-[15px] leading-tight truncate">{store.name}</h1>
            )}
          </div>

          <ShareStoreButton storeName={store.name} themeColor={themeColor} />
        </div>
      </header>

      {children}

      {/* Store footer — about, info, socials, contact, made-with */}
      <StoreFooter store={store} themeColor={themeColor} />

      {/* Cart bar — visible across the storefront whenever the cart has items */}
      <CartBar store={store} />
    </div>
  )
}
