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
    <div className="max-w-[1000px] mx-auto">
      <div className="mb-5">
        <h1 className="text-[26px] font-extrabold tracking-tight text-[#1d1b16]">تعديل المنتج</h1>
        <p className="text-[#74716a] text-sm mt-1">{product.name}</p>
      </div>
      <ProductForm storeId={product.store_id} product={product} categories={categories} isPro={isPro(store)} />
    </div>
  )
}
