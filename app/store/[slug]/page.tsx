import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import ProductGrid from '@/components/storefront/ProductGrid'
import ViewTracker from '@/components/storefront/ViewTracker'
import { StoreHero } from '@/components/storefront/StoreHero'
import { applyPlanToStore, limitProducts } from '@/lib/storefront'
import { storeJsonLd, storeSocialLinks } from '@/lib/structured-data'
import { isPro } from '@/lib/plan'
import { Clock } from 'lucide-react'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function StorefrontPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: rawStore } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!rawStore) notFound()

  // Enforce plan limits for the public view (lapsed Pro → free presentation).
  const store = applyPlanToStore(rawStore)

  // Fetch all products — out-of-stock ones are shown with a "نفد" badge
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .order('in_stock', { ascending: false }) // in-stock first
    .order('featured', { ascending: false }) // featured next
    .order('sort_order', { ascending: true })

  // Store JSON-LD (socials only when Pro, since they're hidden on free storefronts).
  const h = await headers()
  const host = h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  const storeUrl = host ? `${proto}://${host}/store/${store.slug}` : undefined
  const jsonLd = storeJsonLd({
    store,
    url: storeUrl,
    sameAs: isPro(store) ? storeSocialLinks(store) : [],
  })
  const jsonLdHtml = JSON.stringify(jsonLd).replace(/</g, '\\u003c')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml }} />
      <ViewTracker slug={slug} />
      <StoreHero store={store} themeColor={store.theme_color ?? '#16a34a'} />

      <main id="products" className="max-w-lg sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-[1400px] mx-auto px-3 sm:px-5 py-4 pb-32 scroll-mt-16">
        {/* Closed banner */}
        {!store.is_open && (
          <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
            <Clock size={16} className="flex-shrink-0" />
            <span>المتجر مغلق مؤقتاً — يمكنك التصفح والطلب لاحقاً</span>
          </div>
        )}

        <ProductGrid products={limitProducts((products ?? []).filter((p) => !p.hidden), store)} store={store} />
      </main>
    </>
  )
}
