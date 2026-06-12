// Zustand store for cart state.
// Zustand is a tiny (1kb) state manager — think of it as useState
// but shared across the whole component tree without prop-drilling.
// The cart lives entirely in the browser — nothing is saved to the DB.
// When the customer clicks "Order on WhatsApp", the cart is encoded
// into a URL and sent as a message.

import { create } from 'zustand'
import type { CartItem, Product } from '@/types'

type CartStore = {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product) => {
    const existing = get().items.find((i) => i.product.id === product.id)
    if (existing) {
      set((state) => ({
        items: state.items.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      }))
    } else {
      set((state) => ({ items: [...state.items, { product, quantity: 1 }] }))
    }
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    }))
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      ),
    }))
  },

  clearCart: () => set({ items: [] }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
}))
