'use client'

import { useState, useMemo } from 'react'
import type { Product, Store } from '@/types'
import ProductCard from './ProductCard'
import { orderCategories } from '@/lib/categories'
import { ShoppingBag, Search } from 'lucide-react'

type Props = {
  products: Product[]
  store: Store
}

const ALL = '__all__'

export default function ProductGrid({ products, store }: Props) {
  const themeColor = store.theme_color ?? '#16a34a'

  const [activeCategory, setActiveCategory] = useState<string>(ALL)
  const [query, setQuery] = useState('')

  // Distinct categories, ordered by the owner's saved order.
  const categories = useMemo(() => {
    const seen = new Set<string>()
    for (const p of products) {
      if (p.category?.trim()) seen.add(p.category.trim())
    }
    return orderCategories(Array.from(seen), store.category_order ?? [])
  }, [products, store.category_order])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const matchesCat = activeCategory === ALL || p.category?.trim() === activeCategory
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || (p.description?.toLowerCase().includes(q) ?? false)
      return matchesCat && matchesQuery
    })
  }, [products, activeCategory, query])

  // Only show the search box when there are enough products to warrant it.
  const showSearch = products.length >= 6

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
      {/* Search */}
      {showSearch && (
        <div className="relative mb-3">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
      )}

      {/* Category filter — only when there is more than one category */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-none">
          <CategoryChip label="الكل" active={activeCategory === ALL} themeColor={themeColor} onClick={() => setActiveCategory(ALL)} />
          {categories.map((cat) => (
            <CategoryChip key={cat} label={cat} active={activeCategory === cat} themeColor={themeColor} onClick={() => setActiveCategory(cat)} />
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">لا توجد منتجات مطابقة</p>
        </div>
      ) : (
        <div className={`${store.layout === 'list' ? 'grid grid-cols-1 gap-2.5' : 'grid grid-cols-2 gap-3'} pb-32`}>
          {visible.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              slug={store.slug}
              themeColor={themeColor}
              currency={store.currency}
              layout={store.layout ?? 'grid'}
              cardStyle={store.card_style ?? 'rounded'}
            />
          ))}
        </div>
      )}
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
          ? { backgroundColor: '#111827', borderColor: '#111827', color: '#fff' }
          : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#4b5563' }
      }
    >
      {label}
    </button>
  )
}
