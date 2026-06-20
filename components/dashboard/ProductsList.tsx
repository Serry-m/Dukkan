'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Package, Star, Search } from 'lucide-react'
import StockToggle from './StockToggle'
import ReorderButtons from './ReorderButtons'
import ProductRowActions from './ProductRowActions'
import { formatPrice } from '@/lib/currency'
import { effectivePrice, isOnSale } from '@/lib/price'
import type { Product } from '@/types'

export default function ProductsList({ products, currency }: { products: Product[]; currency: string }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const searching = q.length > 0
  const filtered = searching ? products.filter((p) => p.name.toLowerCase().includes(q)) : products

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن منتج..."
          maxLength={80}
          className="w-full bg-white rounded-xl border border-gray-200 pr-10 pl-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400">لا توجد منتجات مطابقة لبحثك</div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((product) => {
            const index = products.indexOf(product)
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl ring-1 ring-foreground/[0.07] shadow-[var(--shadow-soft)] p-3 flex items-center gap-3"
              >
                {/* Reorder — hidden while searching (order is meaningless in a filtered view) */}
                {!searching && (
                  <ReorderButtons
                    productId={product.id}
                    sortOrder={product.sort_order}
                    isFirst={index === 0}
                    isLast={index === products.length - 1}
                    prevId={products[index - 1]?.id ?? null}
                    prevOrder={products[index - 1]?.sort_order ?? null}
                    nextId={products[index + 1]?.id ?? null}
                    nextOrder={products[index + 1]?.sort_order ?? null}
                  />
                )}

                {/* Clickable area → edit */}
                <Link href={`/dashboard/products/${product.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Package size={20} className="text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {product.featured && <Star size={13} className="text-amber-500 fill-amber-500 flex-shrink-0" />}
                      <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-green-600 font-bold text-sm tabular-nums">{formatPrice(effectivePrice(product), currency)}</p>
                      {isOnSale(product) && (
                        <span className="text-xs text-gray-400 line-through tabular-nums">{product.price.toLocaleString('ar-EG')}</span>
                      )}
                      {product.category && (
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full truncate max-w-[90px]">{product.category}</span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Stock toggle — the one frequent inline quick-action */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium hidden sm:inline ${product.in_stock ? 'text-green-600' : 'text-gray-400'}`}>
                    {product.in_stock ? 'متاح' : 'نفد'}
                  </span>
                  <StockToggle productId={product.id} inStock={product.in_stock} />
                </div>

                {/* Edit / delete tucked into a quiet kebab */}
                <ProductRowActions productId={product.id} productName={product.name} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
