import type { Product } from '@/types'
import { isOnSale, discountPercent, isNewProduct } from '@/lib/price'
import { Star } from 'lucide-react'

// "مميز" (featured) + "خصم -X%" (sale) + "جديد" (new) badges. Sale red is a
// deliberate semantic exception to the single-accent rule.
export function ProductBadges({ product, themeColor }: { product: Product; themeColor: string }) {
  const sale = isOnSale(product)
  const isNew = isNewProduct(product)
  const featured = product.featured
  if (!sale && !isNew && !featured) return null

  return (
    <div className="flex flex-col items-end gap-1">
      {featured && (
        <span className="flex items-center gap-0.5 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm" style={{ backgroundColor: themeColor }}>
          <Star size={9} className="fill-white" /> مميز
        </span>
      )}
      {sale && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
          خصم {discountPercent(product).toLocaleString('ar-EG')}٪
        </span>
      )}
      {isNew && (
        <span className="bg-gray-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
          جديد
        </span>
      )}
    </div>
  )
}
