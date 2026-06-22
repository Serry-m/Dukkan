import type { ReactNode } from 'react'
import type { Product } from '@/types'
import { isOnSale, discountPercent, isNewProduct } from '@/lib/price'
import { Star } from 'lucide-react'

// Semantic, theme-independent badges. At most a discount + ONE secondary badge
// (featured preferred over new) — so cards never carry both مميز and جديد and
// the grid stays calm even when a merchant features everything.
export function ProductBadges({ product }: { product: Product; themeColor?: string }) {
  const badges: ReactNode[] = []

  if (isOnSale(product)) {
    badges.push(
      <span key="sale" className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
        خصم {discountPercent(product).toLocaleString('ar-EG')}٪
      </span>
    )
  }

  // One secondary badge only: featured wins, otherwise new.
  if (product.featured) {
    badges.push(
      <span key="feat" className="flex items-center gap-0.5 bg-amber-400 text-amber-950 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
        <Star size={9} className="fill-amber-950" /> مميز
      </span>
    )
  } else if (isNewProduct(product)) {
    badges.push(
      <span key="new" className="bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
        جديد
      </span>
    )
  }

  if (!badges.length) return null
  return <div className="flex flex-col items-end gap-1">{badges}</div>
}
