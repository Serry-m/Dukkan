'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/types'
import { useCartStore } from '@/lib/cart-store'
import { currencyLabel } from '@/lib/currency'
import { readableText } from '@/lib/color'
import { effectivePrice, isOnSale, discountPercent, isNewProduct } from '@/lib/price'
import { Plus, Minus, ShoppingCart, Check, ChevronRight } from 'lucide-react'
import { ImagePlaceholder } from './ImagePlaceholder'
import { toast } from 'sonner'

type Props = {
  product: Product
  slug: string
  themeColor: string
  currency: string
  related: Product[]
}

export default function ProductDetailView({ product, slug, themeColor, currency, related }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const onTheme = readableText(themeColor)
  const curr = currencyLabel(currency)
  const outOfStock = !product.in_stock

  const photos = product.images?.length ? product.images : product.image_url ? [product.image_url] : []
  const [photoIndex, setPhotoIndex] = useState(0)
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const options = product.options ?? []
  const allChosen = options.every((opt) => selected[opt.name])
  const canAdd = !outOfStock && allChosen
  const onSale = isOnSale(product)
  const eff = effectivePrice(product)

  function handleAdd() {
    if (!canAdd) return
    addItem(product, options.length ? selected : undefined, qty)
    setAdded(true)
    toast.success('تمت الإضافة إلى السلة')
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="max-w-lg lg:max-w-5xl mx-auto px-4 pb-28 pt-3">
      {/* Back */}
      <Link href={`/store/${slug}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3">
        <ChevronRight size={16} /> رجوع للمتجر
      </Link>

      <div className="lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start">
      {/* Gallery */}
      <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-[var(--shadow-soft)] lg:sticky lg:top-24">
        <div className="aspect-square w-full bg-gray-50 relative">
          {photos.length ? (
            <img src={photos[photoIndex]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <ImagePlaceholder size={48} label />
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">نفد المخزون</span>
            </div>
          )}
        </div>
        {/* Thumbnails */}
        {photos.length > 1 && (
          <div className="flex gap-2 p-2.5 overflow-x-auto">
            {photos.map((p, i) => (
              <button
                key={i}
                onClick={() => setPhotoIndex(i)}
                className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all"
                style={{ borderColor: i === photoIndex ? themeColor : 'transparent' }}
              >
                <img src={p} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right column (info + options + qty + add) */}
      <div className="lg:mt-0">
      {/* Info */}
      <div className="mt-4 lg:mt-0">
        <div className="flex items-center gap-2">
          {product.category && (
            <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{product.category}</span>
          )}
          {isNewProduct(product) && (
            <span className="text-[11px] font-bold text-white px-2 py-0.5 rounded-full bg-gray-900">جديد</span>
          )}
          {product.featured && (
            <span className="text-[11px] font-bold text-amber-950 bg-amber-400 px-2 py-0.5 rounded-full">مميز</span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-2 leading-snug tracking-tight">{product.name}</h1>
        <div className="flex items-center gap-2.5 mt-2 flex-wrap">
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-extrabold tabular-nums ${onSale ? 'text-red-600' : 'text-gray-900'}`}>
              {eff.toLocaleString('ar-EG')}
            </span>
            <span className="text-sm text-gray-400">{curr}</span>
          </div>
          {onSale && (
            <>
              <span className="text-base text-gray-400 line-through tabular-nums">{product.price.toLocaleString('ar-EG')}</span>
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">خصم {discountPercent(product).toLocaleString('ar-EG')}٪</span>
            </>
          )}
        </div>
        {product.description && (
          <p className="text-sm text-gray-600 leading-relaxed mt-4 whitespace-pre-line">{product.description}</p>
        )}
      </div>

      {/* Options */}
      {options.map((opt) => (
        <div key={opt.name} className="mt-5">
          <div className="flex items-center justify-between mb-2">
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
                  style={isSel ? { borderColor: themeColor, backgroundColor: `${themeColor}12`, color: themeColor } : { borderColor: '#e5e7eb', color: '#374151' }}
                >
                  {val}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Quantity */}
      {!outOfStock && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">الكمية</p>
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-2 py-1.5">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm active:scale-90 transition-all">
              <Minus size={15} className="text-gray-600" />
            </button>
            <span className="font-bold text-base tabular-nums w-6 text-center">{qty.toLocaleString('ar-EG')}</span>
            <button onClick={() => setQty((q) => q + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm active:scale-90 transition-all">
              <Plus size={15} className="text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Add to cart — button-in-button pill */}
      <div className="mt-6">
        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className="group/cta w-full h-14 rounded-full ps-2 pe-6 text-base font-bold flex items-center justify-between gap-2 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:opacity-40"
          style={{ backgroundColor: themeColor, color: onTheme }}
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/cta:scale-105">
            {added ? <Check size={18} strokeWidth={2.2} /> : <ShoppingCart size={18} strokeWidth={1.8} />}
          </span>
          <span className="flex-1 text-center">
            {added ? 'تمت الإضافة' : outOfStock ? 'غير متاح' : `أضف للسلة · ${(eff * qty).toLocaleString('ar-EG')} ${curr}`}
          </span>
          <span className="w-10" aria-hidden />
        </button>
        {!outOfStock && !allChosen && options.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-2">اختر كل الخيارات لإضافة المنتج</p>
        )}
      </div>
      </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-base font-bold text-gray-900 mb-3">منتجات أخرى</h2>
          <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2">
            {related.map((r) => (
              <Link key={r.id} href={`/store/${slug}/product/${r.id}`} className="w-28 flex-shrink-0">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                  {r.image_url ? (
                    <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlaceholder size={18} />
                  )}
                </div>
                <p className="text-xs font-medium text-gray-800 truncate mt-1.5">{r.name}</p>
                <p className="text-xs font-bold tabular-nums text-gray-900">{effectivePrice(r).toLocaleString('ar-EG')} {curr}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
