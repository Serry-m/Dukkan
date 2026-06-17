'use client'

import { useState, useMemo } from 'react'
import type { Product, Store } from '@/types'
import type { ThemeConfig } from '@/lib/themes'
import ProductCard from './ProductCard'
import { orderCategories } from '@/lib/categories'
import { getTheme } from '@/lib/themes'
import { isNewProduct } from '@/lib/price'
import { ShoppingBag, Search } from 'lucide-react'

type Props = {
  products: Product[]
  store: Store
}

const ALL = '__all__'

export default function ProductGrid({ products, store }: Props) {
  const themeColor = store.theme_color ?? '#16a34a'
  const theme = getTheme(store.theme)
  const layout = store.layout ?? 'grid'

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

  const featured = useMemo(() => products.filter((p) => p.featured), [products])
  const newArrivals = useMemo(() => products.filter((p) => isNewProduct(p)), [products])

  const showSearch = products.length >= 6
  // Curated homepage (rows + full grid) only on the unfiltered view of a stocked store.
  const showSections = activeCategory === ALL && !query.trim() && products.length >= 6

  const cardProps = { slug: store.slug, themeColor, currency: store.currency, layout, theme }

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
        <div className="relative mb-3 sm:max-w-md">
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

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-none">
          <CategoryChip label="الكل" active={activeCategory === ALL} onClick={() => setActiveCategory(ALL)} />
          {categories.map((cat) => (
            <CategoryChip key={cat} label={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
          ))}
        </div>
      )}

      {showSections ? (
        <div className="pb-32 space-y-8">
          {featured.length > 0 && <ProductRow title="مميز" products={featured} cardProps={cardProps} />}
          {newArrivals.length > 0 && <ProductRow title="وصل حديثاً" products={newArrivals} cardProps={cardProps} />}
          <section>
            <SectionHeading title="كل المنتجات" />
            <Grid products={products} layout={layout} cardProps={cardProps} />
          </section>
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">لا توجد منتجات مطابقة</p>
        </div>
      ) : (
        <div className="pb-32">
          <Grid products={visible} layout={layout} cardProps={cardProps} />
        </div>
      )}
    </>
  )
}

type CardProps = { slug: string; themeColor: string; currency: string; layout: 'grid' | 'list'; theme: ThemeConfig }

function Grid({ products, layout, cardProps }: { products: Product[]; layout: 'grid' | 'list'; cardProps: CardProps }) {
  return (
    <div className={layout === 'list' ? 'grid grid-cols-1 md:grid-cols-2 gap-2.5' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} {...cardProps} />
      ))}
    </div>
  )
}

function ProductRow({ title, products, cardProps }: { title: string; products: Product[]; cardProps: CardProps }) {
  return (
    <section>
      <SectionHeading title={title} />
      <div className="flex gap-3 sm:gap-4 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 scrollbar-none snap-x">
        {products.map((product) => (
          <div key={product.id} className="w-40 sm:w-52 flex-shrink-0 snap-start">
            <ProductCard product={product} {...cardProps} layout="grid" />
          </div>
        ))}
      </div>
    </section>
  )
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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
