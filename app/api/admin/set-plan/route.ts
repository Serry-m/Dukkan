import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/admin'
import { PRO_DURATION_DAYS } from '@/lib/plan'

export async function POST(request: NextRequest) {
  // 1) Verify the caller is an admin.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const { storeId, action } = await request.json()
  if (!storeId || !['grant', 'extend', 'revoke'].includes(action)) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const admin = createAdminClient()

  if (action === 'revoke') {
    await admin.from('stores').update({ plan: 'free', plan_expires_at: null }).eq('id', storeId)
    return NextResponse.json({ ok: true })
  }

  // grant = 30 days from now; extend = 30 days on top of current (if still active)
  let base = new Date()
  if (action === 'extend') {
    const { data: store } = await admin.from('stores').select('plan_expires_at').eq('id', storeId).single()
    if (store?.plan_expires_at && new Date(store.plan_expires_at) > base) {
      base = new Date(store.plan_expires_at)
    }
  }
  base.setDate(base.getDate() + PRO_DURATION_DAYS)

  await admin.from('stores').update({ plan: 'pro', plan_expires_at: base.toISOString() }).eq('id', storeId)
  return NextResponse.json({ ok: true })
}
