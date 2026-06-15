import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/dashboard/ProductForm'
import { isPro } from '@/lib/plan'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const { data: store } = await supabase
    .from('stores')
    .select('plan, plan_expires_at')
    .eq('id', product.store_id)
    .single()

  const { data: cats } = await supabase
    .from('products')
    .select('category')
    .eq('store_id', product.store_id)
    .not('category', 'is', null)
  const categories = Array.from(new Set((cats ?? []).map((c) => c.category).filter(Boolean))) as string[]

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">تعديل المنتج</h1>
      <p className="text-gray-500 text-sm mb-6">{product.name}</p>
      <ProductForm storeId={product.store_id} product={product} categories={categories} isPro={isPro(store)} />
    </div>
  )
}
