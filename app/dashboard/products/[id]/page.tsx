import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/dashboard/ProductForm'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">تعديل المنتج</h1>
      <p className="text-gray-500 text-sm mb-6">{product.name}</p>
      <ProductForm storeId={product.store_id} product={product} />
    </div>
  )
}
