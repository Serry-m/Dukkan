import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/admin'
import { isPro, PRO_PRICE_EGP } from '@/lib/plan'
import { BrandMark } from '@/components/BrandMark'
import AdminPlanActions from '@/components/admin/AdminPlanActions'
import { formatPrice } from '@/lib/currency'
import { Store, Crown, Wallet, ExternalLink } from 'lucide-react'

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
    .select('id, name, slug, owner_id, plan, plan_expires_at, created_at')

  // Owner emails.
  const { data: usersData } = await admin.auth.admin.listUsers()
  const emailById = new Map((usersData?.users ?? []).map((u) => [u.id, u.email ?? '']))

  // Product counts per store.
  const { data: productRows } = await admin.from('products').select('store_id')
  const productCount = new Map<string, number>()
  for (const r of productRows ?? []) productCount.set(r.store_id, (productCount.get(r.store_id) ?? 0) + 1)

  const list = (stores ?? []).map((s) => ({
    ...s,
    email: emailById.get(s.owner_id) ?? '—',
    products: productCount.get(s.id) ?? 0,
    pro: isPro(s),
  }))

  // Sort: active Pro first (soonest expiry on top), then the rest by newest.
  list.sort((a, b) => {
    if (a.pro && b.pro) return new Date(a.plan_expires_at!).getTime() - new Date(b.plan_expires_at!).getTime()
    if (a.pro) return -1
    if (b.pro) return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const proCount = list.filter((s) => s.pro).length
  const mrr = proCount * PRO_PRICE_EGP

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

        {/* Stores */}
        <div className="space-y-2">
          {list.map((s) => (
            <div key={s.id} className="bg-white rounded-xl ring-1 ring-foreground/[0.07] p-4 flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 truncate">{s.name}</p>
                  {s.pro ? (
                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Crown size={9} /> Pro</span>
                  ) : (
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">مجاني</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{s.email} · {s.products.toLocaleString('ar-EG')} منتج</p>
                {s.pro && s.plan_expires_at && (
                  <p className="text-[11px] text-gray-400 mt-0.5">ينتهي: {new Date(s.plan_expires_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                )}
              </div>
              <a href={`/store/${s.slug}`} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-gray-600">
                <ExternalLink size={15} />
              </a>
              <AdminPlanActions storeId={s.id} isPro={s.pro} />
            </div>
          ))}
          {list.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-12">لا توجد متاجر بعد</p>
          )}
        </div>
      </main>
    </div>
  )
}
