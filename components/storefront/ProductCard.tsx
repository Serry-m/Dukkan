'use client'

import type { Product } from '@/types'
import { useCartStore } from '@/lib/cart-store'
import { Plus, Minus } from 'lucide-react'

export default function ProductCard({ product }: { product: Product }) {
  const items = useCartStore((s) => s.items)
  const addItem = useCartStore((s) => s.addItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)

  const cartItem = items.find((i) => i.product.id === product.id)
  const quantity = cartItem?.quantity ?? 0

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
      {/* Square product image */}
      <div className="aspect-square bg-gray-50 relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            📦
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
        <p className="text-green-600 font-bold text-sm mt-1">
          {product.price.toLocaleString('ar-EG')} جنيه
        </p>

        {quantity === 0 ? (
          <button
            onClick={() => addItem(product)}
            className="mt-2 w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white text-sm font-medium rounded-xl py-2 transition-all"
          >
            إضافة للسلة
          </button>
        ) : (
          <div className="mt-2 flex items-center justify-between bg-green-50 rounded-xl px-2 py-1.5">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-100 active:scale-90 transition-all"
            >
              <Minus size={15} className="text-green-700" />
            </button>
            <span className="font-bold text-green-700">{quantity}</span>
            <button
              onClick={() => addItem(product)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-100 active:scale-90 transition-all"
            >
              <Plus size={15} className="text-green-700" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
