'use client'

import type { Product } from '@/types'
import { useCartStore } from '@/lib/cart-store'
import { currencyLabel } from '@/lib/currency'
import { readableText } from '@/lib/color'
import { Plus, Minus, Package, SlidersHorizontal } from 'lucide-react'

type Props = {
  product: Product
  themeColor: string
  currency: string
  layout?: 'grid' | 'list'
  cardStyle?: 'rounded' | 'sharp'
  onSelectVariant: (product: Product) => void
}

export default function ProductCard({ product, themeColor, currency, layout = 'grid', cardStyle = 'rounded', onSelectVariant }: Props) {
  const items = useCartStore((s) => s.items)
  const addItem = useCartStore((s) => s.addItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)

  const hasOptions = (product.options?.length ?? 0) > 0
  const cartItem = items.find((i) => i.lineId === product.id)
  const quantity = cartItem?.quantity ?? 0
  const outOfStock = !product.in_stock

  const radius = cardStyle === 'sharp' ? 'rounded-md' : 'rounded-2xl'
  const innerRadius = cardStyle === 'sharp' ? 'rounded-sm' : 'rounded-xl'
  const onTheme = readableText(themeColor)

  // Shared add/quantity control.
  const addControl = outOfStock ? (
    <div className={`w-full bg-gray-100 text-gray-400 text-xs font-medium ${innerRadius} py-2.5 text-center`}>غير متاح</div>
  ) : hasOptions ? (
    <button
      onClick={() => onSelectVariant(product)}
      className={`w-full text-sm font-semibold ${innerRadius} py-2.5 transition-all active:scale-95`}
      style={{ backgroundColor: themeColor, color: onTheme }}
    >
      اختر الخيارات
    </button>
  ) : quantity === 0 ? (
    <button
      onClick={() => addItem(product)}
      className={`w-full text-sm font-semibold ${innerRadius} py-2.5 transition-all active:scale-95 active:brightness-95`}
      style={{ backgroundColor: themeColor, color: onTheme }}
    >
      أضف للسلة
    </button>
  ) : (
    <div className={`flex items-center justify-between ${innerRadius} px-1 py-1.5`} style={{ backgroundColor: `${themeColor}15` }}>
      <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-90">
        <Minus size={14} style={{ color: themeColor }} />
      </button>
      <span className="font-bold text-sm tabular-nums w-6 text-center" style={{ color: themeColor }}>{quantity}</span>
      <button onClick={() => addItem(product)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-90">
        <Plus size={14} style={{ color: themeColor }} />
      </button>
    </div>
  )

  const priceBlock = (
    <div className="flex items-baseline gap-1">
      <span className="font-bold text-base tabular-nums" style={{ color: outOfStock ? '#9ca3af' : themeColor }}>
        {product.price.toLocaleString('ar-EG')}
      </span>
      <span className="text-xs text-gray-400 font-normal">{currencyLabel(currency)}</span>
    </div>
  )

  // ── LIST layout: horizontal row ──
  if (layout === 'list') {
    return (
      <div className={`bg-white ${radius} overflow-hidden flex items-stretch border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ${outOfStock ? 'opacity-60' : ''}`}>
        <button onClick={() => !outOfStock && onSelectVariant(product)} className="w-24 flex-shrink-0 bg-gray-50 relative" disabled={outOfStock}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${themeColor}10` }}>
              <Package size={24} style={{ color: `${themeColor}60` }} />
            </div>
          )}
          {hasOptions && !outOfStock && (
            <span className="absolute top-1.5 right-1.5 bg-white/90 text-[9px] font-medium text-gray-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <SlidersHorizontal size={9} /> خيارات
            </span>
          )}
        </button>
        <div className="flex-1 p-3 flex flex-col gap-1.5 min-w-0">
          <button onClick={() => !outOfStock && onSelectVariant(product)} className="text-right" disabled={outOfStock}>
            <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1">{product.name}</p>
            {product.description && <p className="text-[11px] text-gray-400 line-clamp-1">{product.description}</p>}
          </button>
          <div className="flex items-center justify-between gap-2 mt-auto">
            {priceBlock}
            <div className="w-32">{addControl}</div>
          </div>
        </div>
      </div>
    )
  }

  // ── GRID layout: vertical card ──
  return (
    <div className={`bg-white ${radius} overflow-hidden flex flex-col border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ${outOfStock ? 'opacity-60' : ''}`}>
      <button onClick={() => !outOfStock && onSelectVariant(product)} className="aspect-square bg-gray-50 relative overflow-hidden block w-full text-right" disabled={outOfStock}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${themeColor}10` }}>
            <Package size={32} style={{ color: `${themeColor}60` }} />
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <span className="text-[11px] font-bold text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full shadow-sm tracking-wide">نفد المخزون</span>
          </div>
        )}
        {hasOptions && !outOfStock && (
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-medium text-gray-600 px-2 py-0.5 rounded-full border border-gray-100 flex items-center gap-1">
            <SlidersHorizontal size={10} /> خيارات
          </span>
        )}
      </button>

      <div className="p-3 flex flex-col flex-1 gap-2">
        <button onClick={() => !outOfStock && onSelectVariant(product)} className="flex-1 text-right" disabled={outOfStock}>
          <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{product.name}</p>
          {product.description && <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1 leading-relaxed">{product.description}</p>}
        </button>
        {priceBlock}
        {addControl}
      </div>
    </div>
  )
}
