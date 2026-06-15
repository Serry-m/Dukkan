'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import type { Product } from '@/types'
import { useCartStore } from '@/lib/cart-store'
import { currencyLabel } from '@/lib/currency'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Package, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  products: Product[]        // the currently visible products (for sibling navigation)
  startProduct: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  themeColor: string
  currency: string
}

export default function ProductDetailSheet({ products, startProduct, open, onOpenChange, themeColor, currency }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [currentId, setCurrentId] = useState<string | null>(startProduct?.id ?? null)
  const [selected, setSelected] = useState<Record<string, string>>({})
  const touchStartX = useRef<number | null>(null)

  // Siblings = products sharing the opened product's category (or all uncategorised).
  const siblings = useMemo(() => {
    if (!startProduct) return []
    const cat = startProduct.category?.trim() || null
    return products.filter((p) => (p.category?.trim() || null) === cat)
  }, [products, startProduct])

  // When a new product opens, sync the current id.
  useEffect(() => {
    if (startProduct) setCurrentId(startProduct.id)
  }, [startProduct])

  // Reset chosen options whenever the displayed product changes.
  useEffect(() => {
    setSelected({})
  }, [currentId])

  const current = siblings.find((p) => p.id === currentId) ?? startProduct
  if (!current) return null

  const index = siblings.findIndex((p) => p.id === current.id)
  const hasNav = siblings.length > 1
  const options = current.options ?? []
  const allChosen = options.every((opt) => selected[opt.name])
  const curr = currencyLabel(currency)
  const outOfStock = !current.in_stock

  function goPrev() {
    if (index > 0) setCurrentId(siblings[index - 1].id)
  }
  function goNext() {
    if (index < siblings.length - 1) setCurrentId(siblings[index + 1].id)
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    // RTL: swipe left -> next, swipe right -> previous
    if (dx < -50) goNext()
    else if (dx > 50) goPrev()
    touchStartX.current = null
  }

  function handleAdd() {
    if (outOfStock || !allChosen) return
    addItem(current!, options.length ? selected : undefined)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-w-lg mx-auto rounded-t-2xl max-h-[92vh] flex flex-col p-0"
        dir="rtl"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{current.name}</SheetTitle>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {/* Hero image with sibling navigation */}
          <div className="relative h-52 sm:h-60 w-full bg-gray-50">
            {current.image_url ? (
              <img src={current.image_url} alt={current.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${themeColor}10` }}>
                <Package size={48} style={{ color: `${themeColor}60` }} />
              </div>
            )}

            {hasNav && (
              <>
                {/* Previous (right side in RTL) */}
                <button
                  onClick={goPrev}
                  disabled={index === 0}
                  className="absolute top-1/2 -translate-y-1/2 right-3 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center disabled:opacity-0 transition-opacity"
                >
                  <ChevronRight size={20} className="text-gray-700" />
                </button>
                {/* Next (left side in RTL) */}
                <button
                  onClick={goNext}
                  disabled={index === siblings.length - 1}
                  className="absolute top-1/2 -translate-y-1/2 left-3 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center disabled:opacity-0 transition-opacity"
                >
                  <ChevronLeft size={20} className="text-gray-700" />
                </button>
                {/* Counter */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/55 text-white text-[11px] font-medium px-2.5 py-1 rounded-full tabular-nums">
                  {(index + 1).toLocaleString('ar-EG')} / {siblings.length.toLocaleString('ar-EG')}
                </div>
              </>
            )}

            {outOfStock && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">نفد المخزون</span>
              </div>
            )}
          </div>

          <div className="px-4 pt-4 space-y-5 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-snug">{current.name}</h2>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold tabular-nums" style={{ color: themeColor }}>
                  {current.price.toLocaleString('ar-EG')}
                </span>
                <span className="text-sm text-gray-400">{curr}</span>
              </div>
            </div>

            {current.description && (
              <p className="text-sm text-gray-500 leading-relaxed">{current.description}</p>
            )}

            {options.map((opt) => (
              <div key={opt.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800">{opt.name}</p>
                  {!selected[opt.name] && <span className="text-[11px] text-gray-400">اختر واحداً</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {opt.values.map((val) => {
                    const isSel = selected[opt.name] === val
                    return (
                      <button
                        key={val}
                        onClick={() => setSelected((prev) => ({ ...prev, [opt.name]: val }))}
                        className="px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all active:scale-95"
                        style={
                          isSel
                            ? { borderColor: themeColor, backgroundColor: `${themeColor}12`, color: themeColor }
                            : { borderColor: '#e5e7eb', color: '#374151' }
                        }
                      >
                        {val}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky footer: add to cart */}
        <div className="border-t border-gray-100 bg-white p-4">
          <button
            onClick={handleAdd}
            disabled={outOfStock || !allChosen}
            className="w-full h-12 rounded-2xl text-white text-base font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ backgroundColor: themeColor }}
          >
            <ShoppingCart size={18} /> {outOfStock ? 'غير متاح' : 'أضف للسلة'}
          </button>
          {!outOfStock && !allChosen && options.length > 0 && (
            <p className="text-center text-xs text-gray-400 mt-2">اختر كل الخيارات لإضافة المنتج</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
