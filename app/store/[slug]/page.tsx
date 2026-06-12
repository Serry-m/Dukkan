import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductGrid from '@/components/storefront/ProductGrid'

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
    // max-w-lg keeps it phone-width on desktop — feels like a real mobile store
    <main className="max-w-lg mx-auto px-3 py-4 pb-32">
      <ProductGrid products={products ?? []} store={store} />
    </main>
  )
}
