import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/admin'
import { isPro, PRO_PRICE_EGP } from '@/lib/plan'
import { BrandMark } from '@/components/BrandMark'
import AdminStoreList from '@/components/admin/AdminStoreList'
import { formatPrice } from '@/lib/currency'
import { Store, Crown, Wallet } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // ── Gate: admins only ──
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) notFound()

  const admin = createAdminClient()

  // All stores (bypasses RLS via service role).
  const { data: stores } = await admin
    .from('stores')
    .select('id, name, slug, owner_id, plan, plan_expires_at, created_at, suspended, whatsapp_number')

  // All signed-up accounts. listUsers() returns only 50/page by default, so page
  // through them all — otherwise owner emails (and the store-less list) miss
  // anyone past the first page once signups exceed 50.
  const allUsers: { id: string; email?: string; created_at: string }[] = []
  for (let page = 1; ; page++) {
    const { data } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    const batch = data?.users ?? []
    allUsers.push(...batch.map((u) => ({ id: u.id, email: u.email, created_at: u.created_at })))
    if (batch.length < 1000) break
  }
  const emailById = new Map(allUsers.map((u) => [u.id, u.email ?? '']))

  // Product counts per store.
  const { data: productRows } = await admin.from('products').select('store_id')
  const productCount = new Map<string, number>()
  for (const r of productRows ?? []) productCount.set(r.store_id, (productCount.get(r.store_id) ?? 0) + 1)

  // Order activity per store (total, last-30-days, last order date).
  const { data: orderRows } = await admin.from('orders').select('store_id, created_at')
  const now = Date.now()
  const THIRTY_DAYS = 30 * 86_400_000
  const ordersTotal = new Map<string, number>()
  const orders30 = new Map<string, number>()
  const lastOrderAt = new Map<string, number>()
  for (const r of orderRows ?? []) {
    ordersTotal.set(r.store_id, (ordersTotal.get(r.store_id) ?? 0) + 1)
    const t = new Date(r.created_at).getTime()
    if (now - t <= THIRTY_DAYS) orders30.set(r.store_id, (orders30.get(r.store_id) ?? 0) + 1)
    if (t > (lastOrderAt.get(r.store_id) ?? 0)) lastOrderAt.set(r.store_id, t)
  }

  const list = (stores ?? []).map((s) => {
    const pro = isPro(s)
    const o30 = orders30.get(s.id) ?? 0
    const products = productCount.get(s.id) ?? 0
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      plan_expires_at: s.plan_expires_at,
      suspended: s.suspended,
      created_at: s.created_at,
      email: emailById.get(s.owner_id) ?? '—',
      products,
      pro,
      orders30: o30,
      ordersTotal: ordersTotal.get(s.id) ?? 0,
      lastOrderAt: lastOrderAt.get(s.id) ?? null,
      // Activated = ready to sell: has WhatsApp + at least one product.
      activated: !!s.whatsapp_number?.trim() && products > 0,
      // At risk = paying but no orders in the last 30 days.
      atRisk: pro && o30 === 0,
    }
  })

  // Sort: active Pro first (soonest expiry on top), then the rest by newest.
  list.sort((a, b) => {
    if (a.pro && b.pro) return new Date(a.plan_expires_at!).getTime() - new Date(b.plan_expires_at!).getTime()
    if (a.pro) return -1
    if (b.pro) return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const proCount = list.filter((s) => s.pro).length
  const mrr = proCount * PRO_PRICE_EGP

  // Accounts that signed up but never created a store (activation drop-off).
  // Can't grant Pro here (plan lives on the store) — this is for follow-up.
  const ownerIds = new Set((stores ?? []).map((s) => s.owner_id))
  const noStoreAccounts = allUsers
    .filter((u) => !ownerIds.has(u.id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Recent admin actions (audit trail).
  const { data: auditLog } = await admin
    .from('admin_actions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(15)

  const ACTION_LABELS: Record<string, string> = {
    grant: 'تفعيل Pro',
    extend: 'تمديد Pro',
    revoke: 'إلغاء Pro',
    suspend: 'تعليق متجر',
    unsuspend: 'إلغاء تعليق',
    delete_store: 'حذف متجر',
    delete_account: 'حذف حساب',
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#f7f8fa]">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandMark size={30} />
            <span className="font-bold text-gray-900">لوحة الإدارة</span>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">متجري ←</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl ring-1 ring-foreground/[0.07] p-4">
            <Store size={18} className="text-gray-400 mb-2" />
            <p className="text-2xl font-extrabold text-gray-900">{list.length.toLocaleString('ar-EG')}</p>
            <p className="text-[11px] text-gray-400 mt-1">إجمالي المتاجر</p>
          </div>
          <div className="bg-white rounded-2xl ring-1 ring-foreground/[0.07] p-4">
            <Crown size={18} className="text-green-600 mb-2" />
            <p className="text-2xl font-extrabold text-gray-900">{proCount.toLocaleString('ar-EG')}</p>
            <p className="text-[11px] text-gray-400 mt-1">مشترك Pro نشط</p>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-4 text-white">
            <Wallet size={18} className="mb-2 opacity-90" />
            <p className="text-2xl font-extrabold leading-none">{formatPrice(mrr, 'EGP')}</p>
            <p className="text-[11px] text-green-100 mt-1.5">الإيراد الشهري المتكرر</p>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="bg-white rounded-2xl ring-1 ring-foreground/[0.07] py-16 text-center text-sm text-gray-400">
            لا توجد متاجر بعد
          </div>
        ) : (
          <AdminStoreList stores={list} />
        )}

        {/* Signed-up accounts with no store yet — activation drop-off / follow-up */}
        {noStoreAccounts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-bold text-gray-700 mb-1">حسابات بدون متجر ({noStoreAccounts.length.toLocaleString('ar-EG')})</h2>
            <p className="text-xs text-gray-400 mb-3">سجّلوا ولم ينشئوا متجرًا بعد — تواصل معهم لمساعدتهم على البدء. (Pro يُفعَّل بعد إنشاء المتجر.)</p>
            <div className="bg-white rounded-2xl ring-1 ring-foreground/[0.07] divide-y divide-gray-100">
              {noStoreAccounts.map((u) => (
                <div key={u.id} className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
                  <span className="text-gray-700 truncate" dir="ltr">{u.email ?? '—'}</span>
                  <span className="text-gray-300 tabular-nums flex-shrink-0">
                    {new Date(u.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit log — recent admin actions */}
        {(auditLog?.length ?? 0) > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-bold text-gray-700 mb-3">سجل الإجراءات</h2>
            <div className="bg-white rounded-2xl ring-1 ring-foreground/[0.07] divide-y divide-gray-100">
              {auditLog!.map((a) => (
                <div key={a.id} className="px-4 py-2.5 flex items-center gap-3 text-xs">
                  <span className="font-medium text-gray-700 flex-shrink-0">{ACTION_LABELS[a.action] ?? a.action}</span>
                  <span className="text-gray-500 truncate flex-1">
                    {a.detail ? `${a.detail} · ` : ''}{a.target_email ?? ''}
                  </span>
                  <span className="text-gray-300 flex-shrink-0 tabular-nums">
                    {new Date(a.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
