'use client'

import type { Product, Store } from '@/types'
import { useCartStore } from '@/lib/cart-store'
import { Plus, Minus } from 'lucide-react'

type Props = {
  product: Product
  themeColor: string
}

export default function ProductCard({ product, themeColor }: Props) {
  const items = useCartStore((s) => s.items)
  const addItem = useCartStore((s) => s.addItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)

  const cartItem = items.find((i) => i.product.id === product.id)
  const quantity = cartItem?.quantity ?? 0

  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-sm border flex flex-col ${!product.in_stock ? 'border-gray-100 opacity-70' : 'border-gray-100'}`}>
      {/* Image with out-of-stock overlay */}
      <div className="aspect-square bg-gray-50 relative">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full">نفد المخزون</span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1 gap-1">
        <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">
          {product.name}
        </p>
        {product.description && (
          <p className="text-xs text-gray-400 line-clamp-1">{product.description}</p>
        )}
        <p className="font-bold text-sm mt-1" style={{ color: product.in_stock ? themeColor : '#9ca3af' }}>
          {product.price.toLocaleString('ar-EG')} جنيه
        </p>

        {!product.in_stock ? (
          <div className="mt-2 w-full bg-gray-100 text-gray-400 text-sm font-medium rounded-xl py-2 text-center">
            غير متاح
          </div>
        ) : quantity === 0 ? (
          <button
            onClick={() => addItem(product)}
            className="mt-2 w-full text-white text-sm font-medium rounded-xl py-2 active:scale-95 transition-all"
            style={{ backgroundColor: themeColor }}
          >
            إضافة للسلة
          </button>
        ) : (
          <div className="mt-2 flex items-center justify-between rounded-xl px-2 py-1.5" style={{ backgroundColor: `${themeColor}15` }}>
            <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg active:scale-90 transition-all hover:opacity-80">
              <Minus size={15} style={{ color: themeColor }} />
            </button>
            <span className="font-bold" style={{ color: themeColor }}>{quantity}</span>
            <button onClick={() => addItem(product)} className="w-8 h-8 flex items-center justify-center rounded-lg active:scale-90 transition-all hover:opacity-80">
              <Plus size={15} style={{ color: themeColor }} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
