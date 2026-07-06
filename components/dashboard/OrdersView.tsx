'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Search, MessageCircle, X, MapPin, Phone, Printer, Bell, ShoppingBag, StickyNote, Package, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import OrderExport from '@/components/dashboard/OrderExport'
import { normalizeEgyptianNumber, orderRef } from '@/lib/whatsapp'
import { useLockScroll } from '@/lib/use-lock-scroll'
import { formatPrice } from '@/lib/currency'
import type { Order, OrderItem, OrderStatus } from '@/types'

const STATUS: Record<OrderStatus, { label: string; pill: string }> = {
  pending: { label: 'جديد', pill: 'bg-[#FBEBC8] text-[#92610A]' },
  confirmed: { label: 'مؤكد', pill: 'bg-[#DCE8FB] text-[#1E4FB0]' },
  delivered: { label: 'مسلّم', pill: 'bg-[#D8F0DE] text-[#15803d]' },
}
// Avatars identify the customer, not the status — keep them a calm neutral tint
// (the status pill already carries the state).
const AVATAR = 'bg-[#F4F0E8] text-[#5f5c54]'
const STEPS: OrderStatus[] = ['pending', 'confirmed', 'delivered']
const TABS: { key: 'all' | OrderStatus; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'جديد' },
  { key: 'confirmed', label: 'مؤكد' },
  { key: 'delivered', label: 'مسلّم' },
]
const RANK: Record<OrderStatus, number> = { pending: 0, confirmed: 1, delivered: 2 }

// Escape user-controlled text before it goes into the print window's raw HTML.
// Customer name/address/notes and product names are attacker-controllable (a
// customer types them at checkout), and the print popup is about:blank — which
// inherits this dashboard's origin — so an unescaped <img onerror> would run in
// the merchant's logged-in session. React escapes everything else for us; this
// is the one place we hand-build HTML.
function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const ar = (n: number) => n.toLocaleString('ar-EG')
const initialOf = (name: string | null) => name?.trim().charAt(0) ?? '؟'
const itemsSummary = (items: OrderItem[] | null) => (items ?? []).map((i) => `${i.name} ×${ar(i.quantity)}`).join(' · ') || '—'

function relTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'الآن'
  if (diff < 3600) return `من ${ar(Math.floor(diff / 60))} دقيقة`
  if (diff < 86400) return `من ${ar(Math.floor(diff / 3600))} ساعة`
  const days = Math.floor(diff / 86400)
  if (days === 1) return 'أمس'
  if (days < 7) return `من ${ar(days)} أيام`
  return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })
}

export default function OrdersView({ orders, storeName, currency, initialFilter = 'all' }: { orders: Order[]; storeName: string; currency: string; initialFilter?: 'all' | OrderStatus }) {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | OrderStatus>(initialFilter)
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  useLockScroll(openId !== null)
  const [overrides, setOverrides] = useState<Record<string, OrderStatus>>({})
  const [busy, setBusy] = useState(false)

  const stat = (o: Order): OrderStatus => overrides[o.id] ?? ((o.status ?? 'pending') as OrderStatus)

  const counts = { all: orders.length, pending: 0, confirmed: 0, delivered: 0 }
  orders.forEach((o) => { counts[stat(o)]++ })

  const q = query.trim()
  const list = orders.filter((o) => {
    if (filter !== 'all' && stat(o) !== filter) return false
    if (q && !(o.customer_name ?? '').includes(q) && !orderRef(o).includes(q) && !String(o.order_number ?? '').includes(q) && !(o.customer_phone ?? '').includes(q)) return false
    return true
  })

  async function setStatus(id: string, s: OrderStatus) {
    setOverrides((p) => ({ ...p, [id]: s }))
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status: s }).eq('id', id)
    if (error) toast.error('تعذّر تحديث الحالة')
    else toast.success('تم تحديث حالة الطلب')
    router.refresh()
  }

  async function remove(id: string) {
    setBusy(true)
    const supabase = createClient()
    await supabase.from('orders').delete().eq('id', id)
    toast.success('تم حذف الطلب')
    setOpenId(null)
    setBusy(false)
    router.refresh()
  }

  const waLink = (o: Order) =>
    o.customer_phone
      ? `https://wa.me/${normalizeEgyptianNumber(o.customer_phone)}?text=${encodeURIComponent(`مرحباً ${o.customer_name ?? ''}، بخصوص طلبك ${orderRef(o)} من ${storeName} 🛍️`)}`
      : null

  function printOrder(o: Order) {
    const w = window.open('', '_blank', 'width=480,height=680')
    if (!w) return
    const items = (o.items ?? []) as OrderItem[]
    const rows = items
      .map((i) => `<tr><td>${esc(i.name)}${i.options ? ` <span style="color:#888;font-size:11px">(${Object.entries(i.options).map(([k, v]) => `${esc(k)}: ${esc(v)}`).join('، ')})</span>` : ''}</td><td style="text-align:center">×${ar(i.quantity)}</td><td style="text-align:left">${ar(i.price * i.quantity)}</td></tr>`)
      .join('')
    w.document.write(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>طلب ${esc(orderRef(o))}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>body{font-family:'Cairo',system-ui,sans-serif;color:#1d1b16;padding:26px;max-width:480px;margin:0 auto}h1{font-size:20px;margin:0 0 2px}.muted{color:#777;font-size:12px}hr{border:none;border-top:1px dashed #ddd;margin:14px 0}table{width:100%;border-collapse:collapse;margin-top:8px}td,th{padding:7px 0;border-bottom:1px solid #eee;font-size:13px;text-align:right}.tot{text-align:left;font-weight:800;font-size:15px;margin-top:12px}.info{font-size:13px;line-height:1.9}</style></head>
<body><h1>${esc(storeName)}</h1><div class="muted">طلب ${esc(orderRef(o))} · ${esc(new Date(o.created_at).toLocaleString('ar-EG'))}</div><hr/>
<div class="info"><b>العميل:</b> ${esc(o.customer_name ?? '—')}<br/><b>الهاتف:</b> ${esc(o.customer_phone ?? '—')}<br/><b>العنوان:</b> ${esc(o.customer_address ?? '—')}${o.notes ? `<br/><b>ملاحظات:</b> ${esc(o.notes)}` : ''}</div>
<table><tr><th>المنتج</th><th style="text-align:center">الكمية</th><th style="text-align:left">الإجمالي</th></tr>${rows}</table>
<div class="tot">الإجمالي: ${formatPrice(o.total, currency)}</div>
<script>window.onload=function(){window.print()}</script></body></html>`)
    w.document.close()
  }

  const open = orders.find((o) => o.id === openId) || null

  // ── No orders at all ──
  if (orders.length === 0) {
    return (
      <div className="max-w-[1180px] mx-auto">
        <h1 className="text-[26px] font-extrabold tracking-tight text-[#1d1b16] mb-1.5">الطلبات</h1>
        <p className="text-[#74716a] text-sm mb-6">ستظهر الطلبات هنا فور أن يطلب عملاؤك عبر واتساب.</p>
        <div className="bg-white border border-dashed border-[#e0d9c9] rounded-2xl py-16 text-center">
          <ShoppingBag size={40} className="mx-auto text-[#d8d2c5] mb-3" />
          <p className="font-bold text-[#1d1b16]">لا توجد طلبات بعد</p>
          <p className="text-sm text-[#9a9488] mt-1">شارك رابط متجرك لاستقبال أول طلب 🚀</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1180px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-[18px]">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-[#1d1b16]">الطلبات</h1>
          <p className="text-[#74716a] text-sm mt-1">{ar(counts.pending)} جديدة · {ar(counts.all)} إجمالي الطلبات</p>
        </div>
        <OrderExport orders={orders} storeName={storeName} />
      </div>

      {/* New-orders banner */}
      {filter === 'all' && !q && counts.pending > 0 && (
        <div className="flex items-center gap-3 bg-[#FFF8EC] border border-[#F3E2BC] rounded-2xl px-4 py-3 mb-4">
          <div className="w-[34px] h-[34px] rounded-[10px] bg-[#FBEBC8] flex items-center justify-center flex-shrink-0">
            <Bell size={18} className="text-[#92610A]" />
          </div>
          <p className="flex-1 min-w-0 text-sm">
            <span className="font-extrabold text-[#1d1b16]">عندك {ar(counts.pending)} طلبات جديدة بانتظار التأكيد</span>
            <span className="text-[#92610A] font-semibold"> · رد على عملائك بسرعة عشان تأكّد الطلب.</span>
          </p>
          <button onClick={() => setFilter('pending')} className="bg-[#92610A] hover:bg-[#744d08] text-white font-bold text-xs px-3 py-2 rounded-[10px] whitespace-nowrap flex-shrink-0 transition-colors">
            عرض الجديدة
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <div className="flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap">
          {TABS.map((t) => {
            const active = filter === t.key
            return (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-[11px] font-bold text-[13px] border transition-colors ${active ? 'bg-[#1d1b16] border-[#1d1b16] text-white' : 'bg-white border-[#ECE7DC] text-[#74716a] hover:bg-[#F4F0E8] hover:text-[#1d1b16]'}`}
              >
                {t.label}
                <span className={`text-[11px] font-extrabold px-1.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-[#F4F0E8] text-[#9a9488]'}`}>
                  {ar(counts[t.key])}
                </span>
              </button>
            )
          })}
        </div>
        <div className="relative flex items-center">
          <Search size={16} className="absolute right-3 text-[#a8a193] pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم العميل أو رقم الطلب…"
            maxLength={60}
            className="w-full lg:w-[240px] bg-white border border-[#ECE7DC] rounded-[11px] py-2.5 pr-9 pl-3 text-[13px] text-[#1d1b16] outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/15"
          />
        </div>
      </div>

      {/* Empty (filtered) */}
      {list.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e0d9c9] rounded-2xl py-12 text-center">
          <ShoppingBag size={30} className="mx-auto text-[#d8d2c5] mb-2" />
          <p className="font-bold text-[#1d1b16]">لا توجد طلبات مطابقة</p>
          <p className="text-sm text-[#74716a] mt-1">جرّب تغيير الفلتر أو كلمة البحث.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block bg-white border border-[#ECE7DC] rounded-2xl shadow-[0_1px_2px_rgba(29,27,22,0.04)] overflow-hidden">
            <div className="grid grid-cols-[96px_1.5fr_1.7fr_96px_110px_140px] gap-3 px-[18px] py-3 bg-[#FBFAF7] border-b border-[#ECE7DC] text-xs font-extrabold text-[#a8a193]">
              <span>الطلب</span><span>العميل</span><span>المنتجات</span><span>الإجمالي</span><span>الحالة</span><span className="text-left">إجراء</span>
            </div>
            {list.map((o) => {
              const s = stat(o)
              const wa = waLink(o)
              return (
                <div
                  key={o.id}
                  onClick={() => setOpenId(o.id)}
                  className="grid grid-cols-[96px_1.5fr_1.7fr_96px_110px_140px] gap-3 px-[18px] py-3 items-center border-t border-[#F1ECE1] cursor-pointer hover:bg-[#FBFAF7] transition-colors"
                >
                  <span className="font-extrabold text-[13px] text-[#74716a]" dir="ltr">{orderRef(o)}</span>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-base flex-shrink-0 ${AVATAR}`}>{initialOf(o.customer_name)}</div>
                    <div className="min-w-0">
                      <div className="font-bold text-[13.5px] truncate">{o.customer_name ?? 'عميل'}</div>
                      <div className="text-[11.5px] text-[#a8a193] font-semibold">{relTime(o.created_at)}</div>
                    </div>
                  </div>
                  <div className="text-[13px] text-[#5f5c54] truncate">{itemsSummary(o.items)}</div>
                  <span className="font-extrabold text-[13.5px] whitespace-nowrap">{ar(Number(o.total))} <span className="text-[11px] text-[#9a9488] font-bold">ج</span></span>
                  <span><span className={`text-[11.5px] font-extrabold px-2.5 py-0.5 rounded-full ${STATUS[s].pill}`}>{STATUS[s].label}</span></span>
                  <div className="flex justify-start">
                    {wa && (
                      <a href={wa} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 bg-white border border-[#bfe3c8] text-[#15803d] font-bold text-xs px-2.5 py-1.5 rounded-[9px] hover:bg-[#EAF6EC] hover:border-[#16a34a] transition-colors whitespace-nowrap">
                        <MessageCircle size={14} /> رد
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden flex flex-col gap-2.5">
            {list.map((o) => {
              const s = stat(o)
              const wa = waLink(o)
              return (
                <div key={o.id} onClick={() => setOpenId(o.id)} className="bg-white border border-[#ECE7DC] rounded-2xl p-3.5 shadow-[0_1px_2px_rgba(29,27,22,0.04)] cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-base flex-shrink-0 ${AVATAR}`}>{initialOf(o.customer_name)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[14.5px]">{o.customer_name ?? 'عميل'}</span>
                        <span className={`text-[11.5px] font-extrabold px-2.5 py-0.5 rounded-full ${STATUS[s].pill}`}>{STATUS[s].label}</span>
                      </div>
                      <div className="text-xs text-[#a8a193] font-semibold" dir="rtl">{orderRef(o)} · {relTime(o.created_at)}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-[#F1ECE1]">
                    <span className="text-[13px] text-[#5f5c54] truncate">{itemsSummary(o.items)}</span>
                    <span className="font-extrabold text-[15px] whitespace-nowrap">{ar(Number(o.total))} <span className="text-[11px] text-[#9a9488] font-bold">ج</span></span>
                  </div>
                  {wa && (
                    <a href={wa} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-white border border-[#bfe3c8] text-[#15803d] font-bold text-[13px] py-2.5 rounded-[11px] hover:bg-[#EAF6EC] transition-colors">
                      <MessageCircle size={15} /> رد عبر واتساب
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Detail drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] flex justify-start">
          <div onClick={() => setOpenId(null)} className="absolute inset-0 bg-[#1d1b16]/30 dk-fade-in" />
          <div className="relative w-[430px] max-w-[92vw] h-[100dvh] bg-[#FBFAF7] border-l border-[#ECE7DC] shadow-[-18px_0_50px_rgba(29,27,22,0.16)] flex flex-col dk-drawer-in">
            {/* head */}
            <div className="flex items-center justify-between gap-2.5 px-[18px] py-4 border-b border-[#ECE7DC] flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-base flex-shrink-0 ${AVATAR}`}>{initialOf(open.customer_name)}</div>
                <div className="min-w-0">
                  <div className="font-extrabold text-base">{open.customer_name ?? 'عميل'}</div>
                  <div className="text-xs text-[#a8a193] font-semibold" dir="rtl">{orderRef(open)} · {relTime(open.created_at)}</div>
                </div>
              </div>
              <button onClick={() => setOpenId(null)} aria-label="إغلاق" className="w-[34px] h-[34px] rounded-[10px] border border-[#ECE7DC] bg-white text-[#74716a] flex items-center justify-center flex-shrink-0 hover:bg-[#F4F0E8] transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* body */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-[18px] flex flex-col gap-4">
              {/* items */}
              <div className="bg-white border border-[#ECE7DC] rounded-2xl overflow-hidden">
                <div className="px-[15px] py-3 font-extrabold text-[13.5px] border-b border-[#F1ECE1]">تفاصيل الطلب</div>
                {(open.items ?? []).map((li, i) => (
                  <div key={i} className="flex items-center justify-between gap-2.5 px-[15px] py-2.5 border-b border-[#F1ECE1]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-[34px] h-[34px] rounded-[9px] bg-[#F4F0E8] flex items-center justify-center flex-shrink-0"><Package size={16} className="text-[#a8a193]" /></div>
                      <div className="min-w-0">
                        <div className="font-bold text-[13.5px] truncate">{li.name}</div>
                        <div className="text-xs text-[#a8a193] font-semibold">
                          الكمية: {ar(li.quantity)}
                          {li.options && Object.keys(li.options).length > 0 && <span> · {Object.entries(li.options).map(([k, v]) => `${k}: ${v}`).join('، ')}</span>}
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-[13.5px] whitespace-nowrap">{ar(li.price * li.quantity)} <span className="text-[11px] text-[#9a9488]">ج</span></span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-[15px] py-3 bg-[#FBFAF7]">
                  <span className="font-extrabold text-sm">الإجمالي</span>
                  <span className="font-extrabold text-base text-[#15803d]">{formatPrice(open.total, currency)}</span>
                </div>
              </div>

              {/* customer info */}
              <div className="bg-white border border-[#ECE7DC] rounded-2xl px-[15px] py-3.5 flex flex-col gap-3">
                {open.customer_address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin size={18} className="text-[#9a9488] mt-px flex-shrink-0" />
                    <div><div className="text-xs text-[#a8a193] font-bold mb-px">التوصيل</div><div className="text-[13.5px] font-semibold">{open.customer_address}</div></div>
                  </div>
                )}
                {open.customer_phone && (
                  <div className="flex items-start gap-2.5">
                    <Phone size={18} className="text-[#9a9488] mt-px flex-shrink-0" />
                    <div><div className="text-xs text-[#a8a193] font-bold mb-px">رقم العميل</div><a href={`tel:${open.customer_phone}`} className="text-[13.5px] font-semibold text-[#15803d]" dir="ltr">{open.customer_phone}</a></div>
                  </div>
                )}
                {open.coupon_code && (
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#9a9488] mt-px flex-shrink-0 text-base">🎟</span>
                    <div><div className="text-xs text-[#a8a193] font-bold mb-px">كوبون</div><div className="text-[13.5px] font-semibold" dir="ltr">{open.coupon_code}</div></div>
                  </div>
                )}
                {open.notes && (
                  <div className="flex items-start gap-2.5">
                    <StickyNote size={18} className="text-[#9a9488] mt-px flex-shrink-0" />
                    <div><div className="text-xs text-[#a8a193] font-bold mb-px">ملاحظات</div><div className="text-[13.5px] font-semibold">{open.notes}</div></div>
                  </div>
                )}
              </div>

              {/* status stepper */}
              <div className="bg-white border border-[#ECE7DC] rounded-2xl p-[15px]">
                <div className="font-extrabold text-[13.5px] mb-3">حدّث حالة الطلب</div>
                <div className="flex gap-2">
                  {STEPS.map((step) => {
                    const cur = stat(open)
                    const active = cur === step
                    const done = RANK[cur] > RANK[step]
                    return (
                      <button
                        key={step}
                        onClick={() => setStatus(open.id, step)}
                        className={`flex-1 py-2.5 px-1.5 rounded-[10px] font-bold text-[12.5px] border transition-colors ${active ? 'bg-[#16a34a] border-[#16a34a] text-white shadow-[0_4px_12px_rgba(22,163,74,0.2)]' : done ? 'bg-[#EAF6EC] border-[#cfe8d5] text-[#15803d]' : 'bg-white border-[#ECE7DC] text-[#74716a] hover:bg-[#F4F0E8]'}`}
                      >
                        {STATUS[step].label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* delete */}
              <ConfirmDialog
                title="حذف الطلب"
                description="حذف هذا الطلب نهائياً؟ لا يمكن التراجع."
                confirmLabel="حذف"
                onConfirm={() => remove(open.id)}
                trigger={
                  <button disabled={busy} className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[#9a9488] hover:text-red-600 transition-colors disabled:opacity-50 py-1">
                    <Trash2 size={14} /> حذف الطلب
                  </button>
                }
              />
            </div>

            {/* footer */}
            <div className="flex-shrink-0 border-t border-[#ECE7DC] px-[18px] pt-3.5 pb-[max(14px,env(safe-area-inset-bottom))] flex gap-2.5 bg-[#FBFAF7]">
              {waLink(open) && (
                <a href={waLink(open)!} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-sm py-3 rounded-xl shadow-[0_5px_14px_rgba(22,163,74,0.22)] transition-colors">
                  <MessageCircle size={17} /> رد عبر واتساب
                </a>
              )}
              <button onClick={() => printOrder(open)} className="inline-flex items-center justify-center gap-2 bg-white border border-[#ECE7DC] text-[#74716a] font-bold text-[13.5px] px-4 py-3 rounded-xl hover:bg-[#F4F0E8] transition-colors">
                <Printer size={16} /> طباعة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
