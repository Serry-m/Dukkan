import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
import DeleteProductButton from '@/components/dashboard/DeleteProductButton'
import StockToggle from '@/components/dashboard/StockToggle'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('id')
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

      {!products?.length ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-gray-500 mb-4">لا توجد منتجات بعد</p>
          <Link href="/dashboard/products/new" className={cn(buttonVariants({ variant: 'outline' }))}>
            أضف أول منتج
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-2xl">📦</div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-green-600 font-bold text-sm">{product.price.toLocaleString('ar-EG')} جنيه</p>
              </div>

              {/* Quick stock toggle */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400">{product.in_stock ? 'متاح' : 'نفد'}</span>
                <StockToggle productId={product.id} inStock={product.in_stock} />
              </div>

              <div className="flex gap-1 flex-shrink-0">
                <Link href={`/dashboard/products/${product.id}`} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
                  <Pencil size={15} />
                </Link>
                <DeleteProductButton productId={product.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
