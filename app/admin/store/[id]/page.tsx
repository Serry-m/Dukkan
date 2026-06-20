import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/admin'
import { isPro } from '@/lib/plan'
import { formatPrice } from '@/lib/currency'
import { normalizeEgyptianNumber } from '@/lib/whatsapp'
import type { Product, Order } from '@/types'
import { ArrowRight, ExternalLink, MessageCircle, Mail, Crown, Ban, Package, ShoppingBag, Wallet } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-800 text-left" dir="auto">{value}</span>
    </div>
  )
}

export default async function AdminStoreDetail({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminEmail(user?.email)) notFound()

  const admin = createAdminClient()
  const { data: store } = await admin.from('stores').select('*').eq('id', id).single()
  if (!store) notFound()

  let ownerEmail = '—'
  try {
    const { data } = await admin.auth.admin.getUserById(store.owner_id)
    ownerEmail = data.user?.email ?? '—'
  } catch { /* ignore */ }

  const [{ data: products }, { data: orders }, { data: payments }] = await Promise.all([
    admin.from('products').select('*').eq('store_id', id).order('sort_order', { ascending: true }),
    admin.from('orders').select('*').eq('store_id', id).order('created_at', { ascending: false }).limit(20),
    admin.from('payments').select('*').eq('store_id', id).order('created_at', { ascending: false }),
  ])

  const productList = (products ?? []) as Product[]
  const orderList = (orders ?? []) as Order[]
  const pro = isPro(store)
  const wa = store.whatsapp_number ? `https://wa.me/${normalizeEgyptianNumber(store.whatsapp_number)}` : null

  const payMethods = [
    store.payment_instapay && `إنستاباي: ${store.payment_instapay}`,
    store.payment_vodafone && `فودافون كاش: ${store.payment_vodafone}`,
    store.payment_cod && 'الدفع عند الاستلام',
  ].filter(Boolean).join(' · ') || null

  const socials = [store.instagram && 'إنستجرام', store.facebook && 'فيسبوك', store.tiktok && 'تيك توك'].filter(Boolean).join(' · ') || null

  return (
    <div dir="rtl" className="min-h-screen bg-[#f7f8fa]">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
            <ArrowRight size={15} /> لوحة الإدارة
          </Link>
          <a href={`/store/${store.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-green-700 font-medium">
            عرض المتجر <ExternalLink size={13} />
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8 space-y-5">
        {/* Title + status */}
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
          {pro ? (
            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Crown size={9} /> Pro</span>
          ) : (
            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">مجاني</span>
          )}
          {store.suspended && (
            <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Ban size={9} /> معلّق</span>
          )}
        </div>

        {/* Contact */}
        <div className="flex gap-2">
          {wa && (
            <a href={wa} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl py-2.5 transition-colors">
              <MessageCircle size={15} /> واتساب المالك
            </a>
          )}
          {ownerEmail !== '—' && (
            <a href={`mailto:${ownerEmail}`} className="flex-1 flex items-center justify-center gap-2 bg-white ring-1 ring-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl py-2.5 transition-colors">
              <Mail size={15} /> بريد إلكتروني
            </a>
          )}
        </div>

        {/* Config */}
        <section className="bg-white rounded-2xl ring-1 ring-foreground/[0.07] p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-2">الإعدادات</h2>
          <Row label="المالك" value={ownerEmail} />
          <Row label="الرابط" value={<span dir="ltr">/store/{store.slug}</span>} />
          <Row label="واتساب" value={<span dir="ltr">{store.whatsapp_number}</span>} />
          <Row label="الخطة" value={pro ? `Pro${store.plan_expires_at ? ` — حتى ${new Date(store.plan_expires_at).toLocaleDateString('ar-EG')}` : ''}` : 'مجاني'} />
          <Row label="طرق الدفع" value={payMethods} />
          <Row label="رسوم التوصيل" value={store.delivery_fee ? formatPrice(store.delivery_fee, store.currency) : null} />
          <Row label="القالب" value={store.theme} />
          <Row label="الموقع" value={store.location} />
          <Row label="مواعيد العمل" value={store.working_hours} />
          <Row label="التواصل الاجتماعي" value={socials} />
          <Row label="أُنشئ في" value={new Date(store.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })} />
        </section>

        {/* Products */}
        <section className="bg-white rounded-2xl ring-1 ring-foreground/[0.07] p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Package size={15} className="text-gray-400" /> المنتجات ({productList.length.toLocaleString('ar-EG')})
          </h2>
          {productList.length === 0 ? (
            <p className="text-sm text-gray-400">لا توجد منتجات</p>
          ) : (
            <div className="space-y-1.5">
              {productList.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-800 truncate flex items-center gap-2">
                    {!p.in_stock && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">نفد</span>}
                    {p.name}
                  </span>
                  <span className="text-gray-500 tabular-nums flex-shrink-0">{formatPrice(p.price, store.currency)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent orders */}
        <section className="bg-white rounded-2xl ring-1 ring-foreground/[0.07] p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <ShoppingBag size={15} className="text-gray-400" /> آخر الطلبات
          </h2>
          {orderList.length === 0 ? (
            <p className="text-sm text-gray-400">لا توجد طلبات</p>
          ) : (
            <div className="space-y-1.5">
              {orderList.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500 text-xs flex-shrink-0">{new Date(o.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</span>
                  <span className="text-gray-700 truncate flex-1 text-center">{o.customer_name ?? '—'}</span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{o.status}</span>
                  <span className="text-gray-800 font-medium tabular-nums flex-shrink-0">{formatPrice(o.total, store.currency)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Payments history (#18) */}
        <section className="bg-white rounded-2xl ring-1 ring-foreground/[0.07] p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Wallet size={15} className="text-gray-400" /> سجل المدفوعات
          </h2>
          {(payments?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-400">لا توجد مدفوعات مسجّلة (الترقية يدوية حالياً).</p>
          ) : (
            <div className="space-y-1.5">
              {payments!.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500 text-xs flex-shrink-0">{new Date(p.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${p.status === 'paid' ? 'text-green-700 bg-green-100' : p.status === 'failed' ? 'text-red-700 bg-red-100' : 'text-gray-500 bg-gray-100'}`}>{p.status}</span>
                  <span className="text-gray-800 font-medium tabular-nums flex-shrink-0">{formatPrice(Number(p.amount), 'EGP')}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
