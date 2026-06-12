import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProductForm from '@/components/dashboard/ProductForm'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user!.id)
    .single()

  if (!store) redirect('/dashboard/store')

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">إضافة منتج جديد</h1>
      <p className="text-gray-500 text-sm mb-6">أضف منتجاً لمتجرك</p>
      <ProductForm storeId={store.id} product={null} />
    </div>
  )
}
