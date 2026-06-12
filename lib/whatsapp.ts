import type { CartItem, Store } from '@/types'

// Builds a wa.me deep-link that opens WhatsApp with a pre-filled order message.
// wa.me/{number}?text={encoded_message}
// When the customer taps "Order via WhatsApp", this URL opens their WhatsApp
// app directly in a chat with the store owner — no app switching needed.

// Normalize Egyptian numbers: strip leading 0 and ensure 20 prefix
// e.g. 01147087935 → 201147087935, 201147087935 → 201147087935
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

function formatPrice(amount: number, currency: string): string {
  return `${amount.toLocaleString('ar-EG')} ${currency}`
}
