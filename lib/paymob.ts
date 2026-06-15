// Paymob (Accept) classic checkout flow — server-side only.
// Flow: auth token -> register order -> request payment key -> iframe URL.
// Docs: https://docs.paymob.com/

import crypto from 'crypto'

const BASE = 'https://accept.paymob.com/api'

type StartArgs = {
  amountEgp: number
  storeId: string
  merchantOrderId: string // our own unique id to correlate the callback
  email: string
  name: string
  phone: string
}

// Returns the iframe URL to redirect the merchant to for payment.
export async function startPaymobCheckout(args: StartArgs): Promise<{ iframeUrl: string; paymobOrderId: string }> {
  const apiKey = process.env.PAYMOB_API_KEY
  const integrationId = process.env.PAYMOB_INTEGRATION_ID
  const iframeId = process.env.PAYMOB_IFRAME_ID
  if (!apiKey || !integrationId || !iframeId) {
    throw new Error('Paymob env vars are not configured')
  }

  const amountCents = Math.round(args.amountEgp * 100)

  // 1) Auth token
  const authRes = await fetch(`${BASE}/auth/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey }),
  })
  if (!authRes.ok) throw new Error('Paymob auth failed')
  const { token: authToken } = await authRes.json()

  // 2) Register order
  const orderRes = await fetch(`${BASE}/ecommerce/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: 'EGP',
      merchant_order_id: args.merchantOrderId,
      items: [],
    }),
  })
  if (!orderRes.ok) throw new Error('Paymob order registration failed')
  const order = await orderRes.json()

  // 3) Payment key
  const [firstName, ...rest] = args.name.trim().split(' ')
  const lastName = rest.join(' ') || firstName
  const keyRes = await fetch(`${BASE}/acceptance/payment_keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: order.id,
      currency: 'EGP',
      integration_id: Number(integrationId),
      billing_data: {
        first_name: firstName || 'Merchant',
        last_name: lastName,
        email: args.email,
        phone_number: args.phone || '+201000000000',
        apartment: 'NA', floor: 'NA', street: 'NA', building: 'NA',
        shipping_method: 'NA', postal_code: 'NA', city: 'NA',
        country: 'EG', state: 'NA',
      },
    }),
  })
  if (!keyRes.ok) throw new Error('Paymob payment key failed')
  const { token: paymentToken } = await keyRes.json()

  return {
    iframeUrl: `${BASE}/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`,
    paymobOrderId: String(order.id),
  }
}

// Verifies the HMAC Paymob sends with the transaction callback.
// The HMAC is computed over a fixed, ordered set of fields.
export function verifyPaymobHmac(query: Record<string, string>, receivedHmac: string): boolean {
  const secret = process.env.PAYMOB_HMAC_SECRET
  if (!secret) return false

  const keys = [
    'amount_cents', 'created_at', 'currency', 'error_occured', 'has_parent_transaction',
    'id', 'integration_id', 'is_3d_secure', 'is_auth', 'is_capture', 'is_refunded',
    'is_standalone_payment', 'is_voided', 'order', 'owner', 'pending',
    'source_data.pan', 'source_data.sub_type', 'source_data.type', 'success',
  ]
  const concatenated = keys.map((k) => query[k] ?? '').join('')
  const computed = crypto.createHmac('sha512', secret).update(concatenated).digest('hex')
  return computed === receivedHmac
}
