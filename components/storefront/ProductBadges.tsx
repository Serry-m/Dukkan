import type { Product } from '@/types'
import { isOnSale, discountPercent, isNewProduct } from '@/lib/price'

// "خصم -X%" (sale) + "جديد" (new) badges. Sale red is a deliberate semantic
// exception to the single-accent rule — universally read as a discount.
export function ProductBadges({ product, themeColor }: { product: Product; themeColor: string }) {
  const sale = isOnSale(product)
  const isNew = isNewProduct(product)
  if (!sale && !isNew) return null

  return (
    <div className="flex flex-col items-end gap-1">
      {sale && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
          خصم {discountPercent(product).toLocaleString('ar-EG')}٪
        </span>
      )}
      {isNew && (
        <span
          className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm"
          style={{ backgroundColor: themeColor }}
        >
          جديد
        </span>
      )}
    </div>
  )
}
