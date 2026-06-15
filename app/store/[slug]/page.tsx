import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductGrid from '@/components/storefront/ProductGrid'
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

  // Track a store visit (atomic increment, fire-and-forget).
  supabase.rpc('increment_store_views', { store_slug: slug }).then(() => {})

  // Fetch all products — out-of-stock ones are shown with a "نفد" badge
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .order('in_stock', { ascending: false }) // in-stock first
    .order('sort_order', { ascending: true })

  return (
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
  )
}
