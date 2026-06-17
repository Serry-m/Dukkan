import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Pencil, Package } from 'lucide-react'
import DeleteProductButton from '@/components/dashboard/DeleteProductButton'
import StockToggle from '@/components/dashboard/StockToggle'
import ReorderButtons from '@/components/dashboard/ReorderButtons'
import CategoriesManager from '@/components/dashboard/CategoriesManager'
import { formatPrice } from '@/lib/currency'
import { effectivePrice, isOnSale } from '@/lib/price'
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
        <div className="space-y-2.5">
          {products.map((product, index) => (
            <div key={product.id} className="bg-white rounded-2xl ring-1 ring-foreground/[0.07] shadow-[var(--shadow-soft)] p-3 flex items-center gap-3">
              {/* Reorder arrows */}
              <ReorderButtons
                productId={product.id}
                sortOrder={product.sort_order}
                isFirst={index === 0}
                isLast={index === products.length - 1}
                prevId={products[index - 1]?.id ?? null}
                prevOrder={products[index - 1]?.sort_order ?? null}
                nextId={products[index + 1]?.id ?? null}
                nextOrder={products[index + 1]?.sort_order ?? null}
              />

              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Package size={20} className="text-gray-300" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-green-600 font-bold text-sm tabular-nums">{formatPrice(effectivePrice(product), store.currency)}</p>
                  {isOnSale(product) && (
                    <span className="text-xs text-gray-400 line-through tabular-nums">{product.price.toLocaleString('ar-EG')}</span>
                  )}
                  {product.category && (
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full truncate max-w-[90px]">{product.category}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-medium hidden sm:inline ${product.in_stock ? 'text-green-600' : 'text-gray-400'}`}>
                  {product.in_stock ? 'متاح' : 'نفد'}
                </span>
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
