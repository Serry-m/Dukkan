import type { Product } from '@/types'
import { isOnSale, discountPercent, isNewProduct } from '@/lib/price'
import { Star } from 'lucide-react'

// Semantic, theme-independent badges so they never clash with the store's
// accent color: featured = gold, sale = red, new = charcoal.
export function ProductBadges({ product }: { product: Product; themeColor?: string }) {
  const sale = isOnSale(product)
  const isNew = isNewProduct(product)
  const featured = product.featured
  if (!sale && !isNew && !featured) return null

  return (
    <div className="flex flex-col items-end gap-1">
      {featured && (
        <span className="flex items-center gap-0.5 bg-amber-400 text-amber-950 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
          <Star size={9} className="fill-amber-950" /> مميز
        </span>
      )}
      {sale && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
          خصم {discountPercent(product).toLocaleString('ar-EG')}٪
        </span>
      )}
      {isNew && (
        <span className="bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
          جديد
        </span>
      )}
    </div>
  )
}
