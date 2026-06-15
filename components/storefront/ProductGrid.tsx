'use client'

import type { Product, Store } from '@/types'
import { useCartStore } from '@/lib/cart-store'
import ProductCard from './ProductCard'
import CartBar from './CartBar'
import { ShoppingBag } from 'lucide-react'

type Props = {
  products: Product[]
  store: Store
}

export default function ProductGrid({ products, store }: Props) {
  const totalItems = useCartStore((s) => s.totalItems())
  const themeColor = store.theme_color ?? '#16a34a'

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: `${themeColor}12` }}
        >
          <ShoppingBag size={28} style={{ color: `${themeColor}90` }} />
        </div>
        <p className="font-semibold text-gray-700">لا توجد منتجات حالياً</p>
        <p className="text-sm text-gray-400 mt-1">تفقّد المتجر مرة أخرى لاحقاً</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 pb-32">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} themeColor={themeColor} currency={store.currency} />
        ))}
      </div>
      {totalItems > 0 && <CartBar store={store} />}
    </>
  )
}
