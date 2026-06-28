import type { CartItem, Store } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/currency'
import { effectivePrice } from '@/lib/price'

const ar = (n: number) => n.toLocaleString('ar-EG')

export function normalizeEgyptianNumber(number: string): string {
  const digits = number.replace(/\D/g, '')
  if (digits.startsWith('20')) return digits
  if (digits.startsWith('0')) return '20' + digits.slice(1)
  return '20' + digits
}

// Legacy fallback ref (pre-v23 orders with no sequential number).
export function orderCode(id: string): string {
  return '#' + id.replace(/-/g, '').slice(0, 4).toUpperCase()
}

// The display reference for an order — the human "#1001" when present, else the
// legacy id-derived code. Same value in the dashboard and the WhatsApp message.
export function orderRef(o: { order_number?: number | null; id: string }): string {
  return o.order_number != null ? `#${o.order_number}` : orderCode(o.id)
}

// Renders a cart line, e.g. "• ٢× تيشيرت (المقاس: M) — ٣٠٠ جنيه"
function lineLabel(item: CartItem, currency: string): string {
  const { product, quantity, selectedOptions } = item
  const opts = selectedOptions && Object.keys(selectedOptions).length
    ? ` (${Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join('، ')})`
    : ''
  return `• ${ar(quantity)}× ${product.name}${opts} — ${formatPrice(effectivePrice(product) * quantity, currency)}`
}

type Customer = {
  name: string
  phone: string
  address?: string
  notes?: string
  payment?: string
  discount?: { code: string; amount: number }
}

export function buildWhatsAppOrderUrl(
  store: Store,
  cart: CartItem[],
  customer: Customer,
  orderRef?: string
): string {
  const whatsappNumber = normalizeEgyptianNumber(store.whatsapp_number)
  const lines = cart.map((item) => lineLabel(item, store.currency))
  const subtotal = cart.reduce((sum, { product, quantity }) => sum + effectivePrice(product) * quantity, 0)
  const deliveryFee = Number(store.delivery_fee || 0)
  const discount = customer.discount?.amount ?? 0
  const total = Math.max(0, subtotal - discount) + deliveryFee
  const showBreakdown = deliveryFee > 0 || discount > 0

  // The customer's opening line — the merchant can customise it; default otherwise.
  const greeting = store.message_template?.trim()
    ? store.message_template.trim()
    : `مرحباً! حابب أطلب من ${store.name}`

  // A Left-to-Right mark keeps the Latin order code (#A1B2) from being flipped
  // when it sits inside an Arabic (right-to-left) line.
  const refLine = orderRef ? [`رقم الطلب: ‎${orderRef}‎`] : []

  // Clean, WhatsApp-native message (uses *bold* for scannability). No emojis —
  // they render as broken boxes on some devices. We also do NOT echo the merchant's
  // own payment methods back to them — the customer saw those in the cart, and the
  // closing line asks the merchant to confirm the payment method.
  const message = [
    greeting,
    ``,
    `*تفاصيل الطلب*`,
    ...refLine,
    ...lines,
    ``,
    ...(showBreakdown ? [`المجموع الفرعي: ${formatPrice(subtotal, store.currency)}`] : []),
    ...(discount > 0 ? [`خصم (${customer.discount!.code}): −${formatPrice(discount, store.currency)}`] : []),
    ...(deliveryFee > 0 ? [`الشحن: ${formatPrice(deliveryFee, store.currency)}`] : []),
    `*الإجمالي: ${formatPrice(total, store.currency)}*`,
    ``,
    `*بياناتي*`,
    `الاسم: ${customer.name}`,
    `الهاتف: ‎${customer.phone}`,
    ...(customer.address?.trim() ? [`العنوان: ${customer.address.trim()}`] : []),
    ...(customer.payment?.trim() ? [`طريقة الدفع المفضّلة: ${customer.payment.trim()}`] : []),
    ...(customer.notes?.trim() ? [`ملاحظات: ${customer.notes.trim()}`] : []),
    ``,
    // If the customer already picked a payment method, the merchant just confirms;
    // otherwise we still ask them to say how they'd like to pay.
    customer.payment?.trim() ? `من فضلك أكّد الطلب.` : `من فضلك أكّد الطلب وقول لي طريقة الدفع.`,
  ].join('\n')

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}

// Saves the order and returns its per-store sequential number (so the WhatsApp
// message can show the same "#1001" the merchant sees). Uses the place_order
// function (which assigns the number server-side); falls back to a plain insert
// if that function isn't there yet (migration not run). Throws on real failure.
export async function saveOrder(
  store: Store,
  cart: CartItem[],
  customer: Customer
): Promise<number | null> {
  const supabase = createClient()
  const subtotal = cart.reduce((sum, { product, quantity }) => sum + effectivePrice(product) * quantity, 0)
  const discount = customer.discount?.amount ?? 0
  const total = Math.max(0, subtotal - discount) + Number(store.delivery_fee || 0)
  const items = cart.map(({ product, quantity, selectedOptions }) => ({
    name: product.name,
    quantity,
    price: effectivePrice(product),
    options: selectedOptions && Object.keys(selectedOptions).length ? selectedOptions : null,
  }))

  const { data, error } = await supabase.rpc('place_order', {
    p_store_id: store.id,
    p_items: items,
    p_total: total,
    p_customer_name: customer.name,
    p_customer_phone: customer.phone,
    p_customer_address: customer.address?.trim() || null,
    p_notes: customer.notes?.trim() || null,
    p_coupon_code: customer.discount?.code ?? null,
  })
  if (!error) return typeof data === 'number' ? data : null

  // Fallback: migration not run yet — save without a sequential number.
  const { error: insErr } = await supabase.from('orders').insert({
    store_id: store.id,
    items,
    total,
    customer_name: customer.name,
    customer_phone: customer.phone,
    customer_address: customer.address?.trim() || null,
    notes: customer.notes?.trim() || null,
    coupon_code: customer.discount?.code ?? null,
  })
  if (insErr) throw insErr
  return null
}
