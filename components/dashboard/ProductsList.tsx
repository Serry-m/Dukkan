'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Package, Star, Search, Check, Trash2 } from 'lucide-react'
import StockToggle from './StockToggle'
import ReorderButtons from './ReorderButtons'
import ProductRowActions from './ProductRowActions'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatPrice } from '@/lib/currency'
import { effectivePrice, isOnSale } from '@/lib/price'
import type { Product } from '@/types'

export default function ProductsList({ products, currency }: { products: Product[]; currency: string }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)

  const q = query.trim().toLowerCase()
  const searching = q.length > 0
  const filtered = searching ? products.filter((p) => p.name.toLowerCase().includes(q)) : products

  function toggleSel(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function exitSelect() {
    setSelectMode(false)
    setSelected(new Set())
  }

  async function deleteSelected() {
    setBusy(true)
    const supabase = createClient()
    await supabase.from('products').delete().in('id', [...selected])
    toast.success('تم حذف المنتجات المحددة')
    setBusy(false)
    exitSelect()
    router.refresh()
  }

  return (
    <div>
      {/* Toolbar: search + select toggle */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن منتج..."
            maxLength={80}
            className="w-full bg-white rounded-xl border border-gray-200 pr-10 pl-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40"
          />
        </div>
        <button
          type="button"
          onClick={() => (selectMode ? exitSelect() : setSelectMode(true))}
          className={`flex-shrink-0 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
            selectMode ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {selectMode ? 'تم' : 'تحديد'}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400">لا توجد منتجات مطابقة لبحثك</div>
      ) : (
        <div className={`space-y-2.5 ${selected.size > 0 ? 'pb-20' : ''}`}>
          {filtered.map((product) => {
            const index = products.indexOf(product)
            const isSel = selected.has(product.id)
            const inner = (
              <>
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <Package size={20} className="text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {product.featured && <Star size={13} className="text-amber-500 fill-amber-500 flex-shrink-0" />}
                    <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-green-600 font-bold text-sm tabular-nums">{formatPrice(effectivePrice(product), currency)}</p>
                    {isOnSale(product) && (
                      <span className="text-xs text-gray-400 line-through tabular-nums">{product.price.toLocaleString('ar-EG')}</span>
                    )}
                    {product.category && (
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full truncate max-w-[90px]">{product.category}</span>
                    )}
                  </div>
                </div>
              </>
            )

            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl ring-1 shadow-[var(--shadow-soft)] p-3 flex items-center gap-3 transition-colors ${
                  isSel ? 'ring-green-400' : 'ring-foreground/[0.07]'
                }`}
              >
                {selectMode ? (
                  <button
                    type="button"
                    onClick={() => toggleSel(product.id)}
                    aria-label="تحديد"
                    className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                      isSel ? 'bg-green-600 border-green-600' : 'border-gray-300'
                    }`}
                  >
                    {isSel && <Check size={14} className="text-white" />}
                  </button>
                ) : (
                  !searching && (
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
                  )
                )}

                {selectMode ? (
                  <div onClick={() => toggleSel(product.id)} className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                    {inner}
                  </div>
                ) : (
                  <Link href={`/dashboard/products/${product.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    {inner}
                  </Link>
                )}

                {!selectMode && (
                  <>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-medium hidden sm:inline ${product.in_stock ? 'text-green-600' : 'text-gray-400'}`}>
                        {product.in_stock ? 'متاح' : 'نفد'}
                      </span>
                      <StockToggle productId={product.id} inStock={product.in_stock} />
                    </div>
                    <ProductRowActions productId={product.id} productName={product.name} />
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-4 left-4 right-4 lg:right-auto lg:left-1/2 lg:-translate-x-1/2 z-30 max-w-md mx-auto flex items-center justify-between gap-3 rounded-2xl bg-gray-900 text-white px-4 py-3 shadow-lg">
          <span className="text-sm font-medium">{selected.size.toLocaleString('ar-EG')} محدد</span>
          <ConfirmDialog
            title="حذف المنتجات المحددة"
            description={`حذف ${selected.size.toLocaleString('ar-EG')} منتج نهائياً؟ لا يمكن التراجع.`}
            confirmLabel="حذف"
            onConfirm={deleteSelected}
            trigger={
              <button disabled={busy} className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50">
                <Trash2 size={14} /> حذف
              </button>
            }
          />
        </div>
      )}
    </div>
  )
}
