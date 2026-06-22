// Zustand store for cart state.
// The cart lives in the browser and is persisted to localStorage so a
// refresh or accidental navigation never wipes it. When the customer clicks
// "Order on WhatsApp", the cart is encoded into a URL and sent as a message.
//
// Variant support: a line is identified by `lineId` = product id + the chosen
// options. The same product with different options (e.g. size M vs size L) is
// two separate lines.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '@/types'
import { effectivePrice } from '@/lib/price'

// Build a stable line id from a product + its selected options.
function buildLineId(productId: string, selectedOptions?: Record<string, string>): string {
  if (!selectedOptions || Object.keys(selectedOptions).length === 0) return productId
  const sorted = Object.keys(selectedOptions)
    .sort()
    .map((k) => `${k}:${selectedOptions[k]}`)
    .join('|')
  return `${productId}__${sorted}`
}

type CartStore = {
  items: CartItem[]
  storeId: string | null
  setStore: (storeId: string) => void
  addItem: (product: Product, selectedOptions?: Record<string, string>, qty?: number) => void
  removeItem: (lineId: string) => void
  updateQuantity: (lineId: string, quantity: number) => void
  clearCart: () => void
  syncProducts: (products: Product[]) => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      storeId: null,

      // The cart belongs to exactly one store. Opening a different store
      // resets it, so items can never carry over (or be checked out) across stores.
      setStore: (storeId) => {
        if (get().storeId !== storeId) {
          set({ storeId, items: [] })
        }
      },

      addItem: (product, selectedOptions, qty = 1) => {
        const lineId = buildLineId(product.id, selectedOptions)
        const existing = get().items.find((i) => i.lineId === lineId)
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.lineId === lineId ? { ...i, quantity: i.quantity + qty } : i
            ),
          }))
        } else {
          set((state) => ({
            items: [...state.items, { product, quantity: qty, selectedOptions, lineId }],
          }))
        }
      },

      removeItem: (lineId) => {
        set((state) => ({ items: state.items.filter((i) => i.lineId !== lineId) }))
      },

      updateQuantity: (lineId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(lineId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.lineId === lineId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      // Refresh cart snapshots against the current catalog so a price/stock/name
      // change always wins over the stale copy persisted in the browser. Only
      // updates items found in `products` (so a partial list never drops items).
      syncProducts: (products) => {
        const byId = new Map(products.map((p) => [p.id, p]))
        set((state) => ({
          items: state.items.map((i) => {
            const cur = byId.get(i.product.id)
            if (!cur) return i
            return {
              ...i,
              product: {
                ...i.product,
                price: cur.price,
                sale_price: cur.sale_price,
                name: cur.name,
                image_url: cur.image_url,
                in_stock: cur.in_stock,
              },
            }
          }),
        }))
      },

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + effectivePrice(i.product) * i.quantity, 0),
    }),
    {
      name: 'dukkan-cart',
      // Persist the items + which store they belong to.
      partialize: (state) => ({ items: state.items, storeId: state.storeId }),
    }
  )
)
