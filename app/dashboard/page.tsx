import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import Link from 'next/link'
import {
  Store, ShoppingBag, Eye, Bell, Receipt, Wallet, Plus, MessageCircle,
  ChevronLeft, Check, Crown, TrendingUp,
} from 'lucide-react'
import ShareButton from '@/components/dashboard/ShareButton'
import { isPro } from '@/lib/plan'
import { normalizeEgyptianNumber } from '@/lib/whatsapp'
import type { OrderItem } from '@/types'

type OrderRow = {
  id: string
  customer_name: string | null
  customer_phone: string | null
  items: OrderItem[] | null
  total: number
  status: string | null
  created_at: string
}

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  pending: { label: 'جديد', cls: 'bg-[#FBEBC8] text-[#92610A]' },
  confirmed: { label: 'مؤكد', cls: 'bg-[#DCE8FB] text-[#1E4FB0]' },
  delivered: { label: 'مسلّم', cls: 'bg-[#D8F0DE] text-[#15803d]' },
}

// Inline 7-day orders sparkline (server-rendered SVG).
function Spark({ data }: { data: number[] }) {
  const w = 300, h = 58, pad = 6
  const max = Math.max(...data, 1), min = Math.min(...data)
  const range = max - min || 1
  const xs = data.map((_, i) => pad + (i * (w - 2 * pad)) / (data.length - 1))
  const ys = data.map((v) => h - pad - ((v - min) / range) * (h - 2 * pad))
  const line = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')
  const area = `${xs[0]},${h} ${line} ${xs[xs.length - 1]},${h}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={58} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="dash-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#dash-spark)" />
      <polyline points={line} fill="none" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="4" fill="#16a34a" stroke="#fff" strokeWidth="2" />
    </svg>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user!.id)
    .single()

  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', store?.id ?? '')

  const { data: orderData } = await supabase
    .from('orders')
    .select('id, customer_name, customer_phone, items, total, status, created_at')
    .eq('store_id', store?.id ?? '')
    .order('created_at', { ascending: false })

  if (!store) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-[#EAF6EC] flex items-center justify-center mx-auto mb-4">
          <Store size={30} className="text-[#15803d]" />
        </div>
        <h1 className="text-2xl font-extrabold mb-2 text-[#1d1b16]">أهلاً بك</h1>
        <p className="text-[#74716a] mb-6">ابدأ بإنشاء متجرك الأول على واتساب</p>
        <Link href="/dashboard/store" className="inline-flex bg-[#16a34a] hover:bg-[#15803d] text-white font-bold px-6 py-3 rounded-xl transition-colors">
          إنشاء متجري
        </Link>
      </div>
    )
  }

  const orders = (orderData ?? []) as OrderRow[]
  const orderCount = orders.length
  const pendingCount = orders.filter((o) => (o.status ?? 'pending') === 'pending').length

  // Revenue from delivered orders in the current calendar month.
  const now = new Date()
  const revenueMonth = orders
    .filter((o) => o.status === 'delivered' && (() => { const d = new Date(o.created_at); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() })())
    .reduce((sum, o) => sum + Number(o.total), 0)

  const recentOrders = orders.slice(0, 3)

  // Top products by quantity ordered.
  const tally = new Map<string, number>()
  for (const o of orders) for (const it of o.items ?? []) tally.set(it.name, (tally.get(it.name) ?? 0) + it.quantity)
  const topProducts = Array.from(tally.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3)
  const topMax = topProducts[0]?.[1] ?? 1

  // 7-day orders sparkline + week-over-week change.
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const buckets = [0, 0, 0, 0, 0, 0, 0]
  let prev7 = 0
  for (const o of orders) {
    const diff = Math.floor((dayStart.getTime() - new Date(o.created_at).setHours(0, 0, 0, 0)) / 86400000)
    if (diff >= 0 && diff <= 6) buckets[6 - diff]++
    else if (diff >= 7 && diff <= 13) prev7++
  }
  const last7 = buckets.reduce((a, b) => a + b, 0)
  const wow = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : null
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(dayStart); d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString('ar-EG', { weekday: 'short' })
  })

  // Onboarding
  const hasWhatsapp = !!store.whatsapp_number?.trim()
  const hasProduct = (productCount ?? 0) > 0
  const setupComplete = hasWhatsapp && hasProduct
  const steps = [
    { done: true, label: 'إنشاء المتجر', href: '/dashboard/store' },
    { done: hasWhatsapp, label: 'ربط رقم الواتساب', href: '/dashboard/store' },
    { done: hasProduct, label: 'إضافة أول منتج', href: '/dashboard/products/new' },
  ]
  const doneCount = steps.filter((s) => s.done).length

  const pro = isPro(store)
  const h = await headers()
  const displayUrl = `${h.get('host') ?? ''}/store/${store.slug}`

  const showChecklist = !setupComplete
  const showTopProducts = pro && topProducts.length > 0
  const showSparkline = pro && orderCount > 0
  const hasRight = showChecklist || showTopProducts

  const statCard = 'flex flex-col gap-4 text-right rounded-2xl p-[17px] transition-all hover:-translate-y-0.5'
  const iconTile = 'w-9 h-9 rounded-[11px] bg-[#F4F0E8] flex items-center justify-center flex-shrink-0'

  return (
    <div className="max-w-[1140px] mx-auto">
      {/* Greeting + actions */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-[26px] font-extrabold tracking-tight text-[#1d1b16] truncate">أهلاً {store.name} 👋</h1>
          <p className="text-[#74716a] text-sm mt-1">دي نظرة سريعة على متجرك النهارده.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white border border-[#ECE7DC] rounded-xl pr-3 pl-2 py-1.5">
            <span className="text-[#9a9488] text-[12.5px] font-semibold whitespace-nowrap">رابط متجرك</span>
            <code dir="ltr" className="text-[13px] font-bold text-[#1d1b16] truncate max-w-[180px]">{displayUrl}</code>
            <ShareButton slug={store.slug} />
          </div>
          <Link href="/dashboard/products/new" className="inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-[0_5px_14px_rgba(22,163,74,0.22)] transition-colors">
            <Plus size={17} /> أضف منتج
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(180px,1fr))] mb-[18px]">
        {/* New orders — highlighted */}
        <Link href="/dashboard/orders?status=pending" className={`${statCard} bg-[#16a34a] text-white shadow-[0_10px_26px_rgba(22,163,74,0.24)] hover:shadow-[0_16px_34px_rgba(22,163,74,0.3)]`}>
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-[11px] bg-white/[0.18] flex items-center justify-center"><Bell size={19} className="text-white" /></div>
            <ChevronLeft size={18} className="text-white/70" />
          </div>
          <div>
            <p className="text-[13px] text-white/90 font-semibold mb-1.5">الطلبات الجديدة</p>
            <p className="flex items-baseline gap-2"><span className="text-[32px] font-extrabold leading-none tabular-nums">{pendingCount.toLocaleString('ar-EG')}</span><span className="text-[12.5px] text-white/85 font-semibold">بانتظار التأكيد</span></p>
          </div>
        </Link>

        {/* Total orders */}
        <Link href="/dashboard/orders" className={`${statCard} bg-white border border-[#ECE7DC] shadow-[0_1px_2px_rgba(29,27,22,0.04)] hover:shadow-[0_12px_26px_rgba(29,27,22,0.07)] hover:border-[#ddd6c6]`}>
          <div className="flex items-center justify-between">
            <div className={iconTile}><Receipt size={19} className="text-[#74716a]" /></div>
            <ChevronLeft size={18} className="text-[#c4bba8]" />
          </div>
          <div>
            <p className="text-[13px] text-[#74716a] font-semibold mb-1.5">إجمالي الطلبات</p>
            <p className="flex items-baseline gap-2"><span className="text-[32px] font-extrabold leading-none tabular-nums text-[#1d1b16]">{orderCount.toLocaleString('ar-EG')}</span><span className="text-[12.5px] text-[#9a9488] font-semibold">كل الوقت</span></p>
          </div>
        </Link>

        {/* Revenue this month */}
        <Link href="/dashboard/orders" className={`${statCard} bg-white border border-[#ECE7DC] shadow-[0_1px_2px_rgba(29,27,22,0.04)] hover:shadow-[0_12px_26px_rgba(29,27,22,0.07)] hover:border-[#ddd6c6]`}>
          <div className="flex items-center justify-between">
            <div className={iconTile}><Wallet size={19} className="text-[#74716a]" /></div>
            <ChevronLeft size={18} className="text-[#c4bba8]" />
          </div>
          <div>
            <p className="text-[13px] text-[#74716a] font-semibold mb-1.5">الإيرادات هذا الشهر</p>
            <p className="flex items-baseline gap-1.5"><span className="text-[32px] font-extrabold leading-none tabular-nums text-[#15803d]">{revenueMonth.toLocaleString('ar-EG')}</span><span className="text-sm text-[#15803d] font-bold">جنيه</span></p>
          </div>
        </Link>

        {/* Visits — Pro */}
        <div className={`${statCard} bg-white border border-[#ECE7DC] shadow-[0_1px_2px_rgba(29,27,22,0.04)]`}>
          <div className="flex items-center justify-between">
            <div className={iconTile}><Eye size={19} className="text-[#74716a]" /></div>
          </div>
          <div>
            <p className="text-[13px] text-[#74716a] font-semibold mb-1.5">الزيارات</p>
            {pro ? (
              <p className="flex items-baseline gap-2"><span className="text-[32px] font-extrabold leading-none tabular-nums text-[#1d1b16]">{(store.view_count ?? 0).toLocaleString('ar-EG')}</span></p>
            ) : (
              <Link href="/dashboard/upgrade" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#15803d]"><Crown size={15} /> ميزة برو</Link>
            )}
          </div>
        </div>
      </div>

      {/* Lower grid */}
      <div className={`grid gap-[18px] items-start ${hasRight ? 'lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]' : 'grid-cols-1'}`}>
        {/* Left: recent orders + sparkline */}
        <section className="flex flex-col gap-[18px] min-w-0">
          <div className="bg-white border border-[#ECE7DC] rounded-2xl shadow-[0_1px_2px_rgba(29,27,22,0.04)] overflow-hidden">
            <div className="flex items-center justify-between px-[18px] pt-4 pb-3">
              <h2 className="text-base font-extrabold text-[#1d1b16]">أحدث الطلبات</h2>
              <Link href="/dashboard/orders" className="text-[13px] font-bold text-[#15803d] inline-flex items-center gap-0.5 hover:underline">عرض الكل <ChevronLeft size={15} /></Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="px-[18px] py-10 text-center border-t border-[#F1ECE1]">
                <ShoppingBag size={32} className="mx-auto text-[#d8d2c5] mb-2" />
                <p className="text-sm text-[#74716a]">لا توجد طلبات بعد</p>
                <p className="text-xs text-[#9a9488] mt-1">شارك رابط متجرك لاستقبال أول طلب 🚀</p>
              </div>
            ) : (
              recentOrders.map((o) => {
                const pill = STATUS_PILL[o.status ?? 'pending'] ?? STATUS_PILL.pending
                const first = o.items?.[0]
                const more = (o.items?.length ?? 0) - 1
                const wa = o.customer_phone
                  ? `https://wa.me/${normalizeEgyptianNumber(o.customer_phone)}?text=${encodeURIComponent(`مرحباً ${o.customer_name ?? ''}، بخصوص طلبك من ${store.name} 🛍️`)}`
                  : null
                return (
                  <div key={o.id} className="flex items-center gap-3 px-[18px] py-3 border-t border-[#F1ECE1] flex-wrap">
                    <div className="w-[42px] h-[42px] rounded-[12px] bg-[#F4F0E8] text-[#5f5c54] flex items-center justify-center font-extrabold text-base flex-shrink-0">
                      {o.customer_name?.trim().charAt(0) ?? '؟'}
                    </div>
                    <div className="flex-1 min-w-[130px]">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-[14.5px] text-[#1d1b16]">{o.customer_name ?? 'عميل'}</span>
                        <span className={`text-[11.5px] font-extrabold px-2.5 py-0.5 rounded-full ${pill.cls}`}>{pill.label}</span>
                      </div>
                      <div className="text-[13px] text-[#74716a] truncate">
                        {first ? `${first.name} ×${first.quantity.toLocaleString('ar-EG')}` : '—'}{more > 0 ? ` +${more.toLocaleString('ar-EG')}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mr-auto">
                      <span className="font-extrabold text-[14.5px] whitespace-nowrap text-[#1d1b16]">{Number(o.total).toLocaleString('ar-EG')} <span className="text-xs text-[#9a9488] font-semibold">ج</span></span>
                      {wa && (
                        <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 bg-white border border-[#bfe3c8] text-[#15803d] font-bold text-[12.5px] px-2.5 py-2 rounded-[10px] hover:bg-[#EAF6EC] hover:border-[#16a34a] transition-colors whitespace-nowrap">
                          <MessageCircle size={15} /> رد عبر واتساب
                        </a>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {showSparkline && (
            <div className="bg-white border border-[#ECE7DC] rounded-2xl shadow-[0_1px_2px_rgba(29,27,22,0.04)] px-[18px] py-4">
              <div className="flex items-center justify-between mb-3.5">
                <h2 className="text-[15px] font-extrabold text-[#1d1b16]">الطلبات آخر ٧ أيام</h2>
                {wow !== null && (
                  <span className={`text-[12.5px] font-bold px-2.5 py-0.5 rounded-full ${wow >= 0 ? 'text-[#15803d] bg-[#EAF6EC]' : 'text-[#b91c1c] bg-[#FBE9E9]'}`}>
                    {wow >= 0 ? '▲' : '▼'} {Math.abs(wow).toLocaleString('ar-EG')}٪
                  </span>
                )}
              </div>
              <Spark data={buckets} />
              <div className="flex justify-between mt-2 text-[11px] text-[#a8a193] font-semibold">
                {dayLabels.map((d, i) => <span key={i}>{d}</span>)}
              </div>
            </div>
          )}
        </section>

        {/* Right: checklist + top products */}
        {hasRight && (
          <aside className="flex flex-col gap-[18px] min-w-0">
            {showChecklist && (
              <div className="bg-[#F4F0E8] border border-[#ECE7DC] rounded-2xl p-[17px]">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-[15px] font-extrabold text-[#1d1b16]">أكمل إعداد متجرك</h2>
                  <span className="text-xs text-[#74716a] font-bold">{doneCount.toLocaleString('ar-EG')} من {steps.length.toLocaleString('ar-EG')}</span>
                </div>
                <div className="h-1.5 bg-[#e4ddcd] rounded-full overflow-hidden my-2 mb-3.5">
                  <div className="h-full bg-[#16a34a] rounded-full" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
                </div>
                <div className="flex flex-col gap-2.5">
                  {steps.map((s) => (
                    <Link key={s.label} href={s.href} className="flex items-center gap-2.5 group">
                      <span className={`w-[22px] h-[22px] rounded-[7px] flex items-center justify-center flex-shrink-0 ${s.done ? 'bg-[#16a34a]' : 'bg-white border-[1.5px] border-dashed border-[#c9c0ad]'}`}>
                        {s.done && <Check size={13} className="text-white" />}
                      </span>
                      <span className={`text-[13.5px] font-semibold ${s.done ? 'text-[#9a9488] line-through' : 'text-[#1d1b16] group-hover:text-[#15803d]'}`}>{s.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {showTopProducts && (
              <div className="bg-white border border-[#ECE7DC] rounded-2xl shadow-[0_1px_2px_rgba(29,27,22,0.04)] p-[17px]">
                <h2 className="text-[15px] font-extrabold text-[#1d1b16] mb-3.5 flex items-center gap-2"><TrendingUp size={16} className="text-[#16a34a]" /> أكثر المنتجات مبيعاً</h2>
                <div className="flex flex-col gap-3.5">
                  {topProducts.map(([name, qty], i) => (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-[13.5px] text-[#1d1b16] truncate">{name}</span>
                        <span className="text-[12.5px] text-[#74716a] font-semibold flex-shrink-0">{qty.toLocaleString('ar-EG')} مبيع</span>
                      </div>
                      <div className="h-[7px] bg-[#F4F0E8] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.max(8, (qty / topMax) * 100)}%`, background: i === 0 ? '#16a34a' : '#cdc4b1' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}
