import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ProductsView from '@/components/dashboard/ProductsView'
import { orderCategories } from '@/lib/categories'
import type { Product, OrderItem } from '@/types'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('id, currency, name, slug, category_order')
    .eq('owner_id', user!.id)
    .single()

  if (!store) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <p className="text-[#74716a] mb-4">أنشئ متجرك أولاً قبل إضافة المنتجات</p>
        <Link href="/dashboard/store" className="inline-flex bg-[#16a34a] hover:bg-[#15803d] text-white font-bold px-6 py-3 rounded-xl transition-colors">
          إنشاء المتجر
        </Link>
      </div>
    )
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .order('sort_order', { ascending: true })

  // Sold-count per product (by name) from order items.
  const { data: orderRows } = await supabase.from('orders').select('items').eq('store_id', store.id)
  const sold: Record<string, number> = {}
  for (const r of orderRows ?? []) for (const it of ((r.items as OrderItem[]) ?? [])) sold[it.name] = (sold[it.name] ?? 0) + it.quantity

  // Distinct categories in the merchant's saved display order.
  const distinctCats = Array.from(new Set((products ?? []).map((p) => p.category?.trim()).filter(Boolean))) as string[]
  const categories = orderCategories(distinctCats, store.category_order ?? [])

  return (
    <ProductsView
      products={(products ?? []) as Product[]}
      sold={sold}
      storeName={store.name}
      storeSlug={store.slug}
      storeId={store.id}
      categories={categories}
    />
  )
}
