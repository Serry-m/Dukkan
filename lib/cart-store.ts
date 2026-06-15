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
  addItem: (product: Product, selectedOptions?: Record<string, string>) => void
  removeItem: (lineId: string) => void
  updateQuantity: (lineId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, selectedOptions) => {
        const lineId = buildLineId(product.id, selectedOptions)
        const existing = get().items.find((i) => i.lineId === lineId)
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.lineId === lineId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          }))
        } else {
          set((state) => ({
            items: [...state.items, { product, quantity: 1, selectedOptions, lineId }],
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

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    {
      name: 'dukkan-cart',
      // Only persist the items array.
      partialize: (state) => ({ items: state.items }),
    }
  )
)
