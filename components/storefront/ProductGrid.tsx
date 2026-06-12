'use client'

import type { Product, Store } from '@/types'
import { useCartStore } from '@/lib/cart-store'
import ProductCard from './ProductCard'
import CartBar from './CartBar'

type Props = {
  products: Product[]
  store: Store
}

export default function ProductGrid({ products, store }: Props) {
  const totalItems = useCartStore((s) => s.totalItems())

  if (!products.length) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-3">🛒</div>
        <p className="text-gray-400">لا توجد منتجات متاحة حالياً</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 pb-24">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} themeColor={store.theme_color ?? '#16a34a'} />
        ))}
      </div>
      {totalItems > 0 && <CartBar store={store} />}
    </>
  )
}
