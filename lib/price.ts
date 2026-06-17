import type { Product } from '@/types'

type Priceable = Pick<Product, 'price' | 'sale_price'>

// True when the product has a valid active discount.
export function isOnSale(p: Priceable): boolean {
  return p.sale_price != null && p.sale_price > 0 && p.sale_price < p.price
}

// The price the customer actually pays (discounted if on sale).
export function effectivePrice(p: Priceable): number {
  return isOnSale(p) ? (p.sale_price as number) : p.price
}

// Discount percentage (rounded), e.g. 25 for "خصم -٢٥٪". 0 when not on sale.
export function discountPercent(p: Priceable): number {
  if (!isOnSale(p)) return 0
  return Math.round((1 - (p.sale_price as number) / p.price) * 100)
}

// True for products created within the last `days` (default 14) — drives the "جديد" badge.
export function isNewProduct(p: Pick<Product, 'created_at'>, days = 14): boolean {
  if (!p.created_at) return false
  return Date.now() - new Date(p.created_at).getTime() < days * 86_400_000
}
