'use client'

import { useState, useMemo, useEffect } from 'react'
import type { Product, Store } from '@/types'
import type { ThemeConfig } from '@/lib/themes'
import ProductCard from './ProductCard'
import { orderCategories } from '@/lib/categories'
import { getTheme } from '@/lib/themes'
import { isNewProduct, effectivePrice } from '@/lib/price'
import { useCartStore } from '@/lib/cart-store'
import { ShoppingBag, Search, ChevronDown, ArrowLeft, Package } from 'lucide-react'

type SortKey = 'default' | 'newest' | 'price-asc' | 'price-desc'

// Universal: client-side sort for the product grid. 'default' keeps the
// merchant's own arrangement (in-stock first, then sort_order).
function sortProducts(list: Product[], key: SortKey): Product[] {
  if (key === 'default') return list
  const arr = [...list]
  if (key === 'newest') arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  else if (key === 'price-asc') arr.sort((a, b) => effectivePrice(a) - effectivePrice(b))
  else if (key === 'price-desc') arr.sort((a, b) => effectivePrice(b) - effectivePrice(a))
  return arr
}

// Only worth showing the sort control once a catalog is big enough to browse.
const SORT_MIN = 8

type Props = {
  products: Product[]
  store: Store
}

const ALL = '__all__'

export default function ProductGrid({ products, store }: Props) {
  const themeColor = store.theme_color ?? '#16a34a'
  const baseTheme = getTheme(store.theme)
  // Card-shape override (merchant customization): sharp = square corners.
  const theme = store.card_style === 'sharp'
    ? { ...baseTheme, cardRadius: 'rounded-none', innerRadius: 'rounded-none' }
    : baseTheme
  const layout = store.layout ?? 'grid'

  const [activeCategory, setActiveCategory] = useState<string>(ALL)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('default')

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

  // Keep the customer's persisted cart in sync with current prices/stock so a
  // price edit always wins over a stale snapshot in their browser.
  const syncProducts = useCartStore((s) => s.syncProducts)
  useEffect(() => { syncProducts(products) }, [products, syncProducts])

  const featured = useMemo(() => products.filter((p) => p.featured), [products])
  // New-arrivals excludes featured so the same item never sits in both rows.
  const newArrivals = useMemo(() => products.filter((p) => isNewProduct(p) && !p.featured), [products])

  // A curated row only earns its place when it's a genuine *highlight* — a
  // minority of the catalog. If (nearly) everything is featured/new, the row
  // would just duplicate the grid, so we hide it and show one clean grid.
  const half = Math.max(2, Math.ceil(products.length / 2))
  const showFeaturedRow = featured.length >= 2 && featured.length <= half
  const showNewRow = newArrivals.length >= 2 && newArrivals.length <= half

  const showSearch = products.length >= 6
  const showSections =
    activeCategory === ALL && !query.trim() && products.length >= 6 && (showFeaturedRow || showNewRow)

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

      {/* Category filter — hidden on the unfiltered home when collection tiles
          are on (the tiles handle browsing); shown once filtered so the
          customer can switch or clear. */}
      {categories.length > 0 && !(store.show_collection_tiles && activeCategory === ALL && !query.trim()) && (
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-none">
          <CategoryChip label="الكل" active={activeCategory === ALL} onClick={() => setActiveCategory(ALL)} />
          {categories.map((cat) => (
            <CategoryChip key={cat} label={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
          ))}
        </div>
      )}

      {/* Collection tiles (Pro, merchant-controlled) — visual category browse on the unfiltered home */}
      {store.show_collection_tiles && categories.length > 0 && activeCategory === ALL && !query.trim() && (
        <section className="mb-7">
          <SectionHeading title="تصفّح حسب الفئة" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const cover = products.find((p) => p.category?.trim() === cat && p.image_url)?.image_url
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)} className="group text-right">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 relative">
                    {cover ? (
                      <img src={cover} alt={cat} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <Package size={24} strokeWidth={1.25} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-gray-800 flex items-center gap-1">
                    {cat} <ArrowLeft size={13} className="text-gray-400" />
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {showSections ? (
        <div className="pb-32 space-y-8">
          {showFeaturedRow && <ProductRow title="مميز" products={featured} cardProps={cardProps} />}
          {showNewRow && <ProductRow title="وصل حديثاً" products={newArrivals} cardProps={cardProps} />}
          <section>
            <SectionHeading title="كل المنتجات" />
            {products.length >= SORT_MIN && <SortBar count={products.length} sort={sort} onSort={setSort} />}
            <Grid products={sortProducts(products, sort)} layout={layout} cardProps={cardProps} />
          </section>
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">لا توجد منتجات مطابقة</p>
        </div>
      ) : (
        <div className="pb-32">
          {products.length >= SORT_MIN && <SortBar count={visible.length} sort={sort} onSort={setSort} />}
          <Grid products={sortProducts(visible, sort)} layout={layout} cardProps={cardProps} />
        </div>
      )}
    </>
  )
}

type CardProps = { slug: string; themeColor: string; currency: string; layout: 'grid' | 'list'; theme: ThemeConfig }

function Grid({ products, layout, cardProps }: { products: Product[]; layout: 'grid' | 'list'; cardProps: CardProps }) {
  return (
    <div className={layout === 'list' ? 'grid grid-cols-1 md:grid-cols-2 gap-2.5' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4'}>
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
      <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

// Universal product-count + sort control (Shopify-style). Plain <select> so it
// works natively on mobile.
function SortBar({ count, sort, onSort }: { count: number; sort: SortKey; onSort: (s: SortKey) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <span className="text-sm text-gray-500 tabular-nums">{count.toLocaleString('ar-EG')} منتج</span>
      <div className="relative">
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as SortKey)}
          aria-label="ترتيب المنتجات"
          className="appearance-none bg-white border border-gray-200 rounded-full text-sm text-gray-700 ps-4 pe-9 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <option value="default">الأكثر صلة</option>
          <option value="newest">الأحدث</option>
          <option value="price-asc">السعر: الأقل أولاً</option>
          <option value="price-desc">السعر: الأعلى أولاً</option>
        </select>
        <ChevronDown size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
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
