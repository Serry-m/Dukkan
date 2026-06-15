import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { startPaymobCheckout } from '@/lib/paymob'
import { PRO_PRICE_EGP } from '@/lib/plan'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: store } = await supabase
    .from('stores')
    .select('id, name, whatsapp_number')
    .eq('owner_id', user.id)
    .single()
  if (!store) return NextResponse.json({ error: 'no_store' }, { status: 400 })

  // Log a pending payment (its id is our merchant_order_id).
  const admin = createAdminClient()
  const { data: payment, error: payErr } = await admin
    .from('payments')
    .insert({ store_id: store.id, amount: PRO_PRICE_EGP, status: 'pending' })
    .select('id')
    .single()
  if (payErr || !payment) {
    return NextResponse.json({ error: 'payment_init_failed' }, { status: 500 })
  }

  try {
    const { iframeUrl, paymobOrderId } = await startPaymobCheckout({
      amountEgp: PRO_PRICE_EGP,
      storeId: store.id,
      merchantOrderId: payment.id,
      email: user.email ?? 'merchant@dukkan.app',
      name: store.name,
      phone: store.whatsapp_number,
    })

    await admin.from('payments').update({ paymob_order_id: paymobOrderId }).eq('id', payment.id)
    return NextResponse.json({ iframeUrl })
  } catch (err) {
    await admin.from('payments').update({ status: 'failed' }).eq('id', payment.id)
    console.error('Paymob checkout error:', err)
    return NextResponse.json({ error: 'paymob_error' }, { status: 500 })
  }
}
