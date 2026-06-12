'use client'

// ProductGrid is a Client Component because it needs the cart state.
// It receives products from the server (already fetched) and renders them
// with Add-to-Cart buttons. The cart floats at the bottom as a sticky bar.

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
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Cart bar slides up from bottom when cart has items */}
      {totalItems > 0 && <CartBar store={store} />}
    </>
  )
}
