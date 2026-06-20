import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Package } from 'lucide-react'
import CategoriesManager from '@/components/dashboard/CategoriesManager'
import ProductsList from '@/components/dashboard/ProductsList'
import { orderCategories } from '@/lib/categories'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('id, currency, category_order')
    .eq('owner_id', user!.id)
    .single()

  if (!store) {
    return (
      <div className="max-w-xl text-center py-20">
        <p className="text-gray-500 mb-4">أنشئ متجرك أولاً قبل إضافة المنتجات</p>
        <Link href="/dashboard/store" className={cn(buttonVariants(), 'bg-green-600 hover:bg-green-700')}>
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

  // Distinct categories, ordered by the owner's saved order.
  const distinctCats = Array.from(
    new Set((products ?? []).map((p) => p.category?.trim()).filter(Boolean))
  ) as string[]
  const orderedCats = orderCategories(distinctCats, store.category_order ?? [])

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المنتجات</h1>
          <p className="text-sm text-gray-500">{products?.length ?? 0} منتج</p>
        </div>
        <Link href="/dashboard/products/new" className={cn(buttonVariants(), 'bg-green-600 hover:bg-green-700')}>
          <Plus size={16} className="ml-1" />
          إضافة منتج
        </Link>
      </div>

      {/* Categories management */}
      {orderedCats.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-gray-700">التصنيفات</h2>
            <span className="text-xs text-gray-400">اسحب لإعادة الترتيب</span>
          </div>
          <CategoriesManager storeId={store.id} categories={orderedCats} />
        </div>
      )}

      {!products?.length ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Package size={26} className="text-gray-300" />
          </div>
          <p className="text-gray-500 mb-4">لا توجد منتجات بعد</p>
          <Link href="/dashboard/products/new" className={cn(buttonVariants({ variant: 'outline' }))}>
            أضف أول منتج
          </Link>
        </div>
      ) : (
        <ProductsList products={products} currency={store.currency} />
      )}
    </div>
  )
}
