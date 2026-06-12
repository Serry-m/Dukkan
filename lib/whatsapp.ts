import type { CartItem, Store } from '@/types'
import { createClient } from '@/lib/supabase/client'

function normalizeEgyptianNumber(number: string): string {
  const digits = number.replace(/\D/g, '')
  if (digits.startsWith('20')) return digits
  if (digits.startsWith('0')) return '20' + digits.slice(1)
  return '20' + digits
}

export function buildWhatsAppOrderUrl(store: Store, cart: CartItem[]): string {
  const whatsappNumber = normalizeEgyptianNumber(store.whatsapp_number)
  const lines = cart.map(
    ({ product, quantity }) =>
      `• ${quantity}x ${product.name} — ${formatPrice(product.price * quantity, store.currency)}`
  )

  const total = cart.reduce(
    (sum, { product, quantity }) => sum + product.price * quantity,
    0
  )

  const message = [
    `مرحباً! أريد أن أطلب من ${store.name} 🛒`,
    ``,
    ...lines,
    ``,
    `الإجمالي: ${formatPrice(total, store.currency)}`,
    ``,
    `من فضلك تأكد طلبي. شكراً!`,
  ].join('\n')

  const encoded = encodeURIComponent(message)
  return `https://wa.me/${whatsappNumber}?text=${encoded}`
}

// Save order to DB so the owner can see it in their dashboard
export async function saveOrder(store: Store, cart: CartItem[]): Promise<void> {
  const supabase = createClient()
  const total = cart.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)
  const items = cart.map(({ product, quantity }) => ({
    name: product.name,
    quantity,
    price: product.price,
  }))
  await supabase.from('orders').insert({ store_id: store.id, items, total })
}

function formatPrice(amount: number, currency: string): string {
  return `${amount.toLocaleString('ar-EG')} ${currency}`
}
