'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'
import { useCartStore } from '@/lib/cart-store'
import { currencyLabel } from '@/lib/currency'
import { effectivePrice, isOnSale, isLowStock } from '@/lib/price'
import { ProductBadges } from './ProductBadges'
import type { ThemeConfig } from '@/lib/themes'
import { Plus, Check, SlidersHorizontal } from 'lucide-react'
import { ImagePlaceholder } from './ImagePlaceholder'

type Props = {
  product: Product
  slug: string
  themeColor: string
  currency: string
  layout?: 'grid' | 'list'
  theme: ThemeConfig
}

export default function ProductCard({ product, slug, themeColor, currency, layout = 'grid', theme }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  const hasOptions = (product.options?.length ?? 0) > 0
  const outOfStock = !product.in_stock
  const href = `/store/${slug}/product/${product.id}`

  const radius = theme.cardRadius
  const innerRadius = theme.innerRadius

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  // Simplified add control — used by the LIST layout. Variant products route to
  // the detail page to choose options; the grid layout uses an on-image quick-add.
  const addControl = outOfStock ? (
    <div className={`w-full bg-gray-100 text-gray-400 text-xs font-medium ${innerRadius} py-2.5 text-center`}>غير متاح</div>
  ) : hasOptions ? (
    <Link
      href={href}
      className={`block w-full text-center text-sm font-semibold ${innerRadius} py-2.5 border-[1.5px] transition-all active:scale-95`}
      style={{ borderColor: themeColor, color: themeColor }}
    >
      اختر الخيارات
    </Link>
  ) : (
    <button
      onClick={() => addItem(product)}
      className={`w-full text-sm font-semibold ${innerRadius} py-2.5 border-[1.5px] transition-all active:scale-95`}
      style={{ borderColor: themeColor, color: themeColor }}
    >
      أضف للسلة
    </button>
  )

  const onSale = isOnSale(product)
  const eff = effectivePrice(product)
  const priceBlock = (
    <div className="flex items-baseline gap-1.5 flex-wrap">
      <span className={`font-bold text-[15px] tabular-nums ${outOfStock ? 'text-gray-400' : onSale ? 'text-red-600' : 'text-gray-900'}`}>
        {eff.toLocaleString('ar-EG')}
      </span>
      <span className="text-xs text-gray-400 font-normal">{currencyLabel(currency)}</span>
      {onSale && (
        <span className="text-xs text-gray-300 line-through tabular-nums">{product.price.toLocaleString('ar-EG')}</span>
      )}
    </div>
  )

  const lowStock = isLowStock(product) && !outOfStock
  const lowStockTag = lowStock ? (
    <span className="text-[11px] font-bold text-amber-600">متبقّي {product.stock_quantity!.toLocaleString('ar-EG')}</span>
  ) : null

  // ── LIST layout: horizontal row ──
  if (layout === 'list') {
    return (
      <div className={`group bg-white ${radius} overflow-hidden flex items-stretch ${theme.cardSurface} transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${outOfStock ? 'opacity-60' : ''}`}>
        <Link href={href} className="w-24 flex-shrink-0 bg-gray-50 relative overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <ImagePlaceholder size={22} />
          )}
          {hasOptions && !outOfStock && (
            <span className="absolute top-1.5 right-1.5 bg-white/90 text-[9px] font-medium text-gray-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <SlidersHorizontal size={9} /> خيارات
            </span>
          )}
          <div className="absolute top-1.5 left-1.5">
            <ProductBadges product={product} themeColor={themeColor} />
          </div>
        </Link>
        <div className="flex-1 p-3 flex flex-col gap-1.5 min-w-0">
          <Link href={href} className="text-right">
            <p className={`${theme.nameClass} leading-snug line-clamp-1`}>{product.name}</p>
            {product.description && <p className="text-[11px] text-gray-400 line-clamp-1">{product.description}</p>}
          </Link>
          {lowStockTag && <div className="-mt-0.5">{lowStockTag}</div>}
          <div className="flex items-center justify-between gap-2 mt-auto">
            {priceBlock}
            <div className="w-32">{addControl}</div>
          </div>
        </div>
      </div>
    )
  }

  // ── GRID layout: vertical card with on-image quick-add ──
  return (
    <div className={`group bg-white ${radius} overflow-hidden flex flex-col ${theme.cardSurface} transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${outOfStock ? 'opacity-60' : ''}`}>
      <Link href={href} className="aspect-[4/5] bg-gray-50 relative overflow-hidden block w-full text-right">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder size={30} />
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <span className="text-[11px] font-bold text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full shadow-sm tracking-wide">نفد المخزون</span>
          </div>
        )}
        {hasOptions && !outOfStock && (
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-medium text-gray-600 px-2 py-0.5 rounded-full border border-gray-100 flex items-center gap-1">
            <SlidersHorizontal size={10} /> خيارات
          </span>
        )}
        <div className="absolute top-2 right-2">
          <ProductBadges product={product} themeColor={themeColor} />
        </div>

        {/* On-image quick-add — simple in-stock products add directly (one tap = +1) */}
        {!outOfStock && !hasOptions && (
          <button
            onClick={quickAdd}
            aria-label="أضف للسلة"
            className="absolute bottom-2 left-2 w-9 h-9 rounded-full bg-white shadow-md ring-1 ring-black/5 flex items-center justify-center transition-transform active:scale-90 hover:scale-105"
          >
            {added ? <Check size={17} style={{ color: themeColor }} strokeWidth={2.4} /> : <Plus size={18} style={{ color: themeColor }} />}
          </button>
        )}
      </Link>

      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <Link href={href} className="flex-1 text-right">
          <p className={`${theme.nameClass} leading-snug line-clamp-2`}>{product.name}</p>
          {product.description && (
            <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1 leading-relaxed">{product.description}</p>
          )}
        </Link>
        {priceBlock}
        {lowStockTag}
      </div>
    </div>
  )
}
