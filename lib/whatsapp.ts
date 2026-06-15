import type { CartItem, Store } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/currency'

function normalizeEgyptianNumber(number: string): string {
  const digits = number.replace(/\D/g, '')
  if (digits.startsWith('20')) return digits
  if (digits.startsWith('0')) return '20' + digits.slice(1)
  return '20' + digits
}

// Renders a cart line, including any chosen variant options, e.g.
// "• 2x تيشيرت (المقاس: M، اللون: أحمر) — ٣٠٠ جنيه"
function lineLabel(item: CartItem, currency: string): string {
  const { product, quantity, selectedOptions } = item
  const opts = selectedOptions && Object.keys(selectedOptions).length
    ? ` (${Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join('، ')})`
    : ''
  return `• ${quantity}x ${product.name}${opts} — ${formatPrice(product.price * quantity, currency)}`
}

type Customer = {
  name: string
  phone: string
  address?: string
  notes?: string
}

export function buildWhatsAppOrderUrl(
  store: Store,
  cart: CartItem[],
  customer: Customer
): string {
  const whatsappNumber = normalizeEgyptianNumber(store.whatsapp_number)
  const lines = cart.map((item) => lineLabel(item, store.currency))
  const total = cart.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)

  // Owner can customise the greeting; otherwise use a sensible default.
  const greeting = store.message_template?.trim()
    ? store.message_template.trim()
    : `مرحباً! أريد أن أطلب من ${store.name} 🛒`

  const message = [
    greeting,
    ``,
    ...lines,
    ``,
    `الإجمالي: ${formatPrice(total, store.currency)}`,
    ``,
    `━━━━━━━━━━━━━━`,
    `👤 الاسم: ${customer.name}`,
    `📞 الهاتف: ${customer.phone}`,
    ...(customer.address?.trim() ? [`📍 العنوان: ${customer.address.trim()}`] : []),
    ...(customer.notes?.trim() ? [`📝 ملاحظات: ${customer.notes.trim()}`] : []),
    `━━━━━━━━━━━━━━`,
    `من فضلك تأكد طلبي. شكراً!`,
  ].join('\n')

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}

export async function saveOrder(
  store: Store,
  cart: CartItem[],
  customer: Customer
): Promise<void> {
  const supabase = createClient()
  const total = cart.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)
  const items = cart.map(({ product, quantity, selectedOptions }) => ({
    name: product.name,
    quantity,
    price: product.price,
    options: selectedOptions && Object.keys(selectedOptions).length ? selectedOptions : null,
  }))
  const { error } = await supabase.from('orders').insert({
    store_id: store.id,
    items,
    total,
    customer_name: customer.name,
    customer_phone: customer.phone,
    customer_address: customer.address?.trim() || null,
    notes: customer.notes?.trim() || null,
  })
  // Surface the failure to the caller so the UI can react.
  if (error) throw error
}
