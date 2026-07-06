import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail, logAdminAction } from '@/lib/admin'

const ACTIONS = ['suspend', 'unsuspend', 'delete', 'delete-account'] as const
type Action = (typeof ACTIONS)[number]

export async function POST(request: NextRequest) {
  // 1) Admin gate.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const { storeId, userId, action } = (await request.json()) as { storeId?: string; userId?: string; action?: Action }
  if (!action || !ACTIONS.includes(action)) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const admin = createAdminClient()

  // ── Account-level delete: a store-less signup (cleanup test/spam). ──
  if (userId && !storeId) {
    if (action !== 'delete-account') {
      return NextResponse.json({ error: 'bad_request' }, { status: 400 })
    }
    let email: string | null = null
    try { const { data } = await admin.auth.admin.getUserById(userId); email = data.user?.email ?? null } catch { /* ignore */ }
    await admin.auth.admin.deleteUser(userId)
    await logAdminAction(admin, { adminEmail: user!.email!, action: 'delete_account', targetEmail: email })
    return NextResponse.json({ ok: true })
  }

  if (!storeId) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  // Look up the store (owner + email) for the action + audit trail.
  const { data: store } = await admin
    .from('stores')
    .select('id, name, owner_id')
    .eq('id', storeId)
    .single()
  if (!store) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  // Resolve owner email for logging.
  let ownerEmail: string | null = null
  try {
    const { data } = await admin.auth.admin.getUserById(store.owner_id)
    ownerEmail = data.user?.email ?? null
  } catch {
    /* ignore */
  }

  const adminEmail = user!.email!

  if (action === 'suspend' || action === 'unsuspend') {
    await admin.from('stores').update({ suspended: action === 'suspend' }).eq('id', storeId)
  } else if (action === 'delete') {
    // Cascades to products/orders/coupons/payments via FK on delete cascade.
    await admin.from('stores').delete().eq('id', storeId)
  } else if (action === 'delete-account') {
    // Deleting the auth user cascades to the store (owner_id on delete cascade)
    // and from there to all store data.
    await admin.auth.admin.deleteUser(store.owner_id)
  }

  await logAdminAction(admin, {
    adminEmail,
    action: action === 'delete' ? 'delete_store' : action === 'delete-account' ? 'delete_account' : action,
    targetStoreId: action.startsWith('delete') ? null : storeId,
    targetEmail: ownerEmail,
    detail: store.name,
  })

  return NextResponse.json({ ok: true })
}
