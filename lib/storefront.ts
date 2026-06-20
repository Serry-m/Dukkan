import type { Product, Store } from '@/types'
import { isPro, FREE_PRODUCT_LIMIT } from '@/lib/plan'
import { getTheme } from '@/lib/themes'

// Downgrade enforcement for the PUBLIC storefront. When a store is free (or its
// Pro plan has lapsed), strip the Pro-only presentation so the downgrade
// actually takes effect — instead of the store keeping paid features forever.
// Data is never mutated in the DB; this only normalizes what the storefront renders.

export function applyPlanToStore(store: Store): Store {
  if (isPro(store)) return store
  const themeIsPro = getTheme(store.theme).pro
  return {
    ...store,
    theme: themeIsPro ? 'modern' : store.theme, // premium theme → free default
    banner_url: null,                            // cover image is Pro
    delivery_fee: 0,                             // delivery fee is Pro
  }
}

// Free stores show only the first N products (stock first, then the owner's
// sort order), with Pro-only product attributes (featured, category, extra
// photos) stripped so badges/sections/galleries don't leak paid features.
export function limitProducts(products: Product[], store: Pick<Store, 'plan' | 'plan_expires_at'>): Product[] {
  if (isPro(store)) return products
  const sorted = [...products].sort((a, b) => {
    if (a.in_stock !== b.in_stock) return a.in_stock ? -1 : 1
    return a.sort_order - b.sort_order
  })
  return sorted.slice(0, FREE_PRODUCT_LIMIT).map((p) => ({
    ...p,
    featured: false,
    category: null,
    images: p.image_url ? [p.image_url] : [],
  }))
}
