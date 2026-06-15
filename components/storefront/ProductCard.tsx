'use client'

import type { Product } from '@/types'
import { useCartStore } from '@/lib/cart-store'
import { currencyLabel } from '@/lib/currency'
import { Plus, Minus, Package, SlidersHorizontal } from 'lucide-react'

type Props = {
  product: Product
  themeColor: string
  currency: string
  onSelectVariant: (product: Product) => void
}

export default function ProductCard({ product, themeColor, currency, onSelectVariant }: Props) {
  const items = useCartStore((s) => s.items)
  const addItem = useCartStore((s) => s.addItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)

  const hasOptions = (product.options?.length ?? 0) > 0
  // For simple products the line id equals the product id.
  const cartItem = items.find((i) => i.lineId === product.id)
  const quantity = cartItem?.quantity ?? 0
  const outOfStock = !product.in_stock

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden flex flex-col border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ${outOfStock ? 'opacity-60' : ''}`}
    >
      {/* Image */}
      <button
        onClick={() => !outOfStock && onSelectVariant(product)}
        className="aspect-square bg-gray-50 relative overflow-hidden block w-full text-right"
        disabled={outOfStock}
      >
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${themeColor}10` }}>
            <Package size={32} style={{ color: `${themeColor}60` }} />
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <span className="text-[11px] font-bold text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full shadow-sm tracking-wide">
              نفد المخزون
            </span>
          </div>
        )}
        {hasOptions && !outOfStock && (
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-medium text-gray-600 px-2 py-0.5 rounded-full border border-gray-100 flex items-center gap-1">
            <SlidersHorizontal size={10} /> خيارات
          </span>
        )}
      </button>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <button onClick={() => !outOfStock && onSelectVariant(product)} className="flex-1 text-right" disabled={outOfStock}>
          <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{product.name}</p>
          {product.description && (
            <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1 leading-relaxed">{product.description}</p>
          )}
        </button>

        <div className="flex items-baseline gap-1">
          <span className="font-bold text-base tabular-nums" style={{ color: outOfStock ? '#9ca3af' : themeColor }}>
            {product.price.toLocaleString('ar-EG')}
          </span>
          <span className="text-xs text-gray-400 font-normal">{currencyLabel(currency)}</span>
        </div>

        {outOfStock ? (
          <div className="w-full bg-gray-100 text-gray-400 text-xs font-medium rounded-xl py-2.5 text-center">
            غير متاح
          </div>
        ) : hasOptions ? (
          // Variant products: open the selector instead of adding directly.
          <button
            onClick={() => onSelectVariant(product)}
            className="w-full text-white text-sm font-semibold rounded-xl py-2.5 transition-all active:scale-95"
            style={{ backgroundColor: themeColor }}
          >
            اختر الخيارات
          </button>
        ) : quantity === 0 ? (
          <button
            onClick={() => addItem(product)}
            className="w-full text-white text-sm font-semibold rounded-xl py-2.5 transition-all active:scale-95 active:brightness-95"
            style={{ backgroundColor: themeColor }}
          >
            أضف للسلة
          </button>
        ) : (
          <div className="flex items-center justify-between rounded-xl px-1 py-1.5" style={{ backgroundColor: `${themeColor}15` }}>
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-90"
            >
              <Minus size={14} style={{ color: themeColor }} />
            </button>
            <span className="font-bold text-sm tabular-nums w-6 text-center" style={{ color: themeColor }}>
              {quantity}
            </span>
            <button
              onClick={() => addItem(product)}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-90"
            >
              <Plus size={14} style={{ color: themeColor }} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
