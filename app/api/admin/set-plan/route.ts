import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail, logAdminAction } from '@/lib/admin'
import { PRO_DURATION_DAYS } from '@/lib/plan'

export async function POST(request: NextRequest) {
  // 1) Verify the caller is an admin.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const { storeId, userId, action } = await request.json()
  if (!['grant', 'extend', 'revoke'].includes(action) || (!storeId && !userId)) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const admin = createAdminClient()
  const adminEmail = user!.email!

  // ── Account-level grant (owner has no store yet) → park in pending_pro.
  // A DB trigger applies it automatically when they create their store.
  if (userId && !storeId) {
    let targetEmail: string | null = null
    try { const { data } = await admin.auth.admin.getUserById(userId); targetEmail = data.user?.email ?? null } catch { /* ignore */ }

    if (action === 'revoke') {
      await admin.from('pending_pro').delete().eq('user_id', userId)
      await logAdminAction(admin, { adminEmail, action: 'revoke', targetEmail, detail: 'قبل إنشاء المتجر' })
      return NextResponse.json({ ok: true })
    }
    // grant / extend (pre-store: both = 30 days from now)
    const exp = new Date()
    exp.setDate(exp.getDate() + PRO_DURATION_DAYS)
    const { error } = await admin
      .from('pending_pro')
      .upsert({ user_id: userId, plan_expires_at: exp.toISOString(), granted_by: adminEmail })
    if (error) return NextResponse.json({ error: 'pending_table_missing' }, { status: 500 })
    await logAdminAction(admin, { adminEmail, action: 'grant', targetEmail, detail: 'قبل إنشاء المتجر' })
    return NextResponse.json({ ok: true })
  }

  // ── Store-level grant/extend/revoke (store already exists).
  if (action === 'revoke') {
    await admin.from('stores').update({ plan: 'free', plan_expires_at: null }).eq('id', storeId)
    await logAdminAction(admin, { adminEmail, action: 'revoke', targetStoreId: storeId })
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
  await logAdminAction(admin, { adminEmail, action, targetStoreId: storeId, detail: `حتى ${base.toLocaleDateString('ar-EG')}` })
  return NextResponse.json({ ok: true })
}
