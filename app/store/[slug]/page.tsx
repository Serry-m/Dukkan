import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductGrid from '@/components/storefront/ProductGrid'
import ViewTracker from '@/components/storefront/ViewTracker'
import { StoreHero } from '@/components/storefront/StoreHero'
import { Clock } from 'lucide-react'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function StorefrontPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!store) notFound()

  // Fetch all products — out-of-stock ones are shown with a "نفد" badge
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .order('in_stock', { ascending: false }) // in-stock first
    .order('sort_order', { ascending: true })

  return (
    <>
      <ViewTracker slug={slug} />
      <StoreHero store={store} themeColor={store.theme_color ?? '#16a34a'} />

      <main className="max-w-lg mx-auto px-3 py-4 pb-32">
        {/* Closed banner */}
        {!store.is_open && (
          <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
            <Clock size={16} className="flex-shrink-0" />
            <span>المتجر مغلق مؤقتاً — يمكنك التصفح والطلب لاحقاً</span>
          </div>
        )}

        <ProductGrid products={products ?? []} store={store} />
      </main>
    </>
  )
}
