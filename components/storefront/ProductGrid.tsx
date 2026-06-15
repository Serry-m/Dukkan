'use client'

import { useState, useMemo, useEffect } from 'react'
import type { Product, Store } from '@/types'
import { useCartStore } from '@/lib/cart-store'
import ProductCard from './ProductCard'
import ProductDetailSheet from './ProductDetailSheet'
import CartBar from './CartBar'
import { orderCategories } from '@/lib/categories'
import { ShoppingBag } from 'lucide-react'

type Props = {
  products: Product[]
  store: Store
}

const ALL = '__all__'

export default function ProductGrid({ products, store }: Props) {
  const totalItems = useCartStore((s) => s.totalItems())
  const themeColor = store.theme_color ?? '#16a34a'

  const [detailProduct, setDetailProduct] = useState<Product | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>(ALL)

  // Distinct categories, ordered by the owner's saved order.
  const categories = useMemo(() => {
    const seen = new Set<string>()
    for (const p of products) {
      if (p.category?.trim()) seen.add(p.category.trim())
    }
    return orderCategories(Array.from(seen), store.category_order ?? [])
  }, [products, store.category_order])

  const visible = useMemo(() => {
    if (activeCategory === ALL) return products
    return products.filter((p) => p.category?.trim() === activeCategory)
  }, [products, activeCategory])

  function openDetail(product: Product) {
    setDetailProduct(product)
    setDetailOpen(true)
  }

  // Defensive: when the variant sheet closes, make sure base-ui hasn't left
  // the page locked with pointer-events:none (which would block checkout).
  useEffect(() => {
    if (!detailOpen) {
      const t = setTimeout(() => {
        if (document.body.style.pointerEvents === 'none') {
          document.body.style.pointerEvents = ''
        }
      }, 100)
      return () => clearTimeout(t)
    }
  }, [detailOpen])

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${themeColor}12` }}>
          <ShoppingBag size={28} style={{ color: `${themeColor}90` }} />
        </div>
        <p className="font-semibold text-gray-700">لا توجد منتجات حالياً</p>
        <p className="text-sm text-gray-400 mt-1">تفقّد المتجر مرة أخرى لاحقاً</p>
      </div>
    )
  }

  return (
    <>
      {/* Category filter — only when there is more than one category */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-none">
          <CategoryChip label="الكل" active={activeCategory === ALL} themeColor={themeColor} onClick={() => setActiveCategory(ALL)} />
          {categories.map((cat) => (
            <CategoryChip key={cat} label={cat} active={activeCategory === cat} themeColor={themeColor} onClick={() => setActiveCategory(cat)} />
          ))}
        </div>
      )}

      <div className={`${store.layout === 'list' ? 'grid grid-cols-1 gap-2.5' : 'grid grid-cols-2 gap-3'} pb-32`}>
        {visible.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            themeColor={themeColor}
            currency={store.currency}
            layout={store.layout ?? 'grid'}
            cardStyle={store.card_style ?? 'rounded'}
            onSelectVariant={openDetail}
          />
        ))}
      </div>

      <ProductDetailSheet
        product={detailProduct}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        themeColor={themeColor}
        currency={store.currency}
      />

      {totalItems > 0 && <CartBar store={store} />}
    </>
  )
}

function CategoryChip({ label, active, themeColor, onClick }: { label: string; active: boolean; themeColor: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all active:scale-95 whitespace-nowrap"
      style={
        active
          ? { backgroundColor: themeColor, borderColor: themeColor, color: '#fff' }
          : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#4b5563' }
      }
    >
      {label}
    </button>
  )
}
