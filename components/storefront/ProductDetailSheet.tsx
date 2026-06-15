'use client'

import { useState, useEffect } from 'react'
import type { Product } from '@/types'
import { useCartStore } from '@/lib/cart-store'
import { currencyLabel } from '@/lib/currency'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Package, ShoppingCart } from 'lucide-react'

type Props = {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  themeColor: string
  currency: string
}

export default function ProductDetailSheet({ product, open, onOpenChange, themeColor, currency }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [selected, setSelected] = useState<Record<string, string>>({})

  // Reset selections whenever a new product opens.
  useEffect(() => {
    setSelected({})
  }, [product?.id])

  if (!product) return null

  const options = product.options ?? []
  const allChosen = options.every((opt) => selected[opt.name])
  const curr = currencyLabel(currency)

  function handleAdd() {
    if (!allChosen) return
    addItem(product!, options.length ? selected : undefined)
    // Close immediately. Holding the modal open on a timer can race with
    // base-ui's pointer-lock cleanup and leave the page unclickable.
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[88vh] overflow-auto px-0 pb-8" dir="rtl">
        <SheetHeader className="sr-only">
          <SheetTitle>{product.name}</SheetTitle>
        </SheetHeader>

        {/* Hero image */}
        <div className="aspect-square w-full bg-gray-50 relative">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${themeColor}10` }}>
              <Package size={48} style={{ color: `${themeColor}60` }} />
            </div>
          )}
        </div>

        <div className="px-4 pt-4 space-y-5">
          {/* Name + price */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-snug">{product.name}</h2>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold tabular-nums" style={{ color: themeColor }}>
                {product.price.toLocaleString('ar-EG')}
              </span>
              <span className="text-sm text-gray-400">{curr}</span>
            </div>
          </div>

          {product.description && (
            <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
          )}

          {/* Option groups */}
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

        {/* Add to cart */}
        <div className="px-4 pt-6">
          <button
            onClick={handleAdd}
            disabled={!allChosen}
            className="w-full h-12 rounded-2xl text-white text-base font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ backgroundColor: themeColor }}
          >
            <ShoppingCart size={18} /> أضف للسلة
          </button>
          {!allChosen && options.length > 0 && (
            <p className="text-center text-xs text-gray-400 mt-2">اختر كل الخيارات لإضافة المنتج</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
