import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPaymobHmac } from '@/lib/paymob'
import { PRO_DURATION_DAYS } from '@/lib/plan'

// Paymob redirects the merchant's browser here after payment (response
// callback), carrying the transaction fields + an HMAC signature.
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const query: Record<string, string> = {}
  sp.forEach((v, k) => { query[k] = v })

  const hmac = sp.get('hmac') ?? ''
  const origin = request.nextUrl.origin

  // Reject tampered callbacks.
  if (!verifyPaymobHmac(query, hmac)) {
    return NextResponse.redirect(`${origin}/dashboard/upgrade?status=failed`)
  }

  const success = sp.get('success') === 'true'
  const paymobOrderId = sp.get('order') ?? ''
  const admin = createAdminClient()

  // Find the payment we created, by Paymob order id.
  const { data: payment } = await admin
    .from('payments')
    .select('id, store_id, status')
    .eq('paymob_order_id', paymobOrderId)
    .single()

  if (!payment) {
    return NextResponse.redirect(`${origin}/dashboard/upgrade?status=failed`)
  }

  if (!success) {
    await admin.from('payments').update({ status: 'failed' }).eq('id', payment.id)
    return NextResponse.redirect(`${origin}/dashboard/upgrade?status=failed`)
  }

  // Idempotent: only grant once.
  if (payment.status !== 'paid') {
    await admin.from('payments').update({ status: 'paid' }).eq('id', payment.id)

    // Extend Pro from the later of (now) or (current expiry).
    const { data: store } = await admin
      .from('stores')
      .select('plan_expires_at')
      .eq('id', payment.store_id)
      .single()

    const base = store?.plan_expires_at && new Date(store.plan_expires_at) > new Date()
      ? new Date(store.plan_expires_at)
      : new Date()
    base.setDate(base.getDate() + PRO_DURATION_DAYS)

    await admin
      .from('stores')
      .update({ plan: 'pro', plan_expires_at: base.toISOString() })
      .eq('id', payment.store_id)
  }

  return NextResponse.redirect(`${origin}/dashboard/upgrade?status=success`)
}
