import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProductForm from '@/components/dashboard/ProductForm'
import { isPro, FREE_PRODUCT_LIMIT } from '@/lib/plan'
import { Crown } from 'lucide-react'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('id, plan, plan_expires_at')
    .eq('owner_id', user!.id)
    .single()

  if (!store) redirect('/dashboard/store')

  // Enforce the free-plan product limit.
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', store.id)

  if (!isPro(store) && (count ?? 0) >= FREE_PRODUCT_LIMIT) {
    return (
      <div className="max-w-xl">
        <div className="bg-white rounded-2xl ring-1 ring-foreground/[0.07] shadow-[var(--shadow-soft)] p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Crown size={26} className="text-green-700" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">وصلت إلى حد الخطة المجانية</h1>
          <p className="text-gray-500 text-sm mb-6">
            الخطة المجانية تسمح بحتى {FREE_PRODUCT_LIMIT.toLocaleString('ar-EG')} منتج. رقّ إلى Pro لإضافة منتجات بلا حدود.
          </p>
          <Link
            href="/dashboard/upgrade"
            className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors"
          >
            الترقية إلى Pro
          </Link>
        </div>
      </div>
    )
  }

  const { data: cats } = await supabase
    .from('products')
    .select('category')
    .eq('store_id', store.id)
    .not('category', 'is', null)
  const categories = Array.from(new Set((cats ?? []).map((c) => c.category).filter(Boolean))) as string[]

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="mb-5">
        <h1 className="text-[26px] font-extrabold tracking-tight text-[#1d1b16]">إضافة منتج جديد</h1>
        <p className="text-[#74716a] text-sm mt-1">أضف منتجاً لمتجرك</p>
      </div>
      <ProductForm storeId={store.id} product={null} categories={categories} isPro={isPro(store)} />
    </div>
  )
}
