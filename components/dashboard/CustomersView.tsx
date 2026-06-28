'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MessageCircle, X, MapPin, Calendar, ChevronDown, Users, Ticket } from 'lucide-react'
import CustomerExport from '@/components/dashboard/CustomerExport'
import { normalizeEgyptianNumber, orderRef } from '@/lib/whatsapp'
import type { OrderItem, OrderStatus } from '@/types'
import type { CustomerRecord } from '@/app/dashboard/customers/page'

const ar = (n: number) => n.toLocaleString('ar-EG')
const monthYear = (iso: string) => new Date(iso).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })
const itemsSummary = (items: OrderItem[]) => items.map((i) => `${i.name} ×${ar(i.quantity)}`).join(' · ') || '—'

const STATUS: Record<OrderStatus, { label: string; pill: string }> = {
  pending: { label: 'جديد', pill: 'bg-[#FBEBC8] text-[#92610A]' },
  confirmed: { label: 'مؤكد', pill: 'bg-[#DCE8FB] text-[#1E4FB0]' },
  delivered: { label: 'مسلّم', pill: 'bg-[#D8F0DE] text-[#15803d]' },
}
const AVATARS = [
  'bg-[#F4F0E8] text-[#7a5a2a]', 'bg-[#E8EEF6] text-[#2c4a7a]', 'bg-[#EAF1EA] text-[#2f6a3f]',
  'bg-[#F3EBE6] text-[#7a4a3a]', 'bg-[#EFEAF4] text-[#5a4a7a]',
]

function relTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 3600) return `من ${ar(Math.max(1, Math.floor(diff / 60)))} دقيقة`
  if (diff < 86400) return `من ${ar(Math.floor(diff / 3600))} ساعة`
  const days = Math.floor(diff / 86400)
  if (days === 1) return 'أمس'
  if (days < 7) return `من ${ar(days)} أيام`
  return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })
}

type Tab = 'all' | 'repeat' | 'new' | 'vip'
const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'الكل' }, { key: 'repeat', label: 'متكرر' }, { key: 'new', label: 'جديد' }, { key: 'vip', label: 'VIP' },
]

export default function CustomersView({ customers, storeName }: { customers: CustomerRecord[]; storeName: string }) {
  const [filter, setFilter] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'spent' | 'orders' | 'recent' | 'name'>('spent')
  const [openPhone, setOpenPhone] = useState<string | null>(null)

  const idx = (phone: string) => customers.findIndex((c) => c.phone === phone)
  const seg = (c: CustomerRecord): 'repeat' | 'new' => (c.ordersCount >= 2 ? 'repeat' : 'new')

  const now = new Date()
  const isThisMonth = (iso: string) => { const d = new Date(iso); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() }

  const counts = {
    all: customers.length,
    repeat: customers.filter((c) => seg(c) === 'repeat').length,
    new: customers.filter((c) => seg(c) === 'new').length,
    vip: customers.filter((c) => c.vip).length,
  }
  const newThisMonth = customers.filter((c) => isThisMonth(c.firstIso)).length
  const totalOrders = customers.reduce((s, c) => s + c.ordersCount, 0)
  const totalSpent = customers.reduce((s, c) => s + c.total, 0)
  const avgOrder = totalOrders ? Math.round(totalSpent / totalOrders) : 0

  const q = query.trim()
  let list = customers.filter((c) => {
    if (filter === 'repeat' && seg(c) !== 'repeat') return false
    if (filter === 'new' && seg(c) !== 'new') return false
    if (filter === 'vip' && !c.vip) return false
    if (q && !c.name.includes(q) && !c.city.includes(q) && !c.phone.includes(q)) return false
    return true
  })
  list = [...list].sort((a, b) => {
    if (sort === 'spent') return b.total - a.total
    if (sort === 'orders') return b.ordersCount - a.ordersCount
    if (sort === 'recent') return new Date(b.lastIso).getTime() - new Date(a.lastIso).getTime()
    return a.name.localeCompare(b.name, 'ar')
  })

  const waLink = (c: CustomerRecord) =>
    `https://wa.me/${normalizeEgyptianNumber(c.phone)}?text=${encodeURIComponent(`مرحباً ${c.name} 🙂 من ${storeName}`)}`

  const open = customers.find((c) => c.phone === openPhone) || null

  // ── No customers ──
  if (customers.length === 0) {
    return (
      <div className="max-w-[1180px] mx-auto">
        <h1 className="text-[26px] font-extrabold tracking-tight mb-1.5">العملاء</h1>
        <p className="text-[#74716a] text-sm mb-6">سيظهر هنا كل من طلب من متجرك — لتتواصل معهم مرة أخرى.</p>
        <div className="bg-white border border-dashed border-[#e0d9c9] rounded-2xl py-16 text-center">
          <Users size={40} className="mx-auto text-[#d8d2c5] mb-3" />
          <p className="font-bold">لا يوجد عملاء بعد</p>
          <p className="text-sm text-[#9a9488] mt-1">أول ما يجيلك طلب، هيظهر العميل هنا.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1180px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-[18px]">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">العملاء</h1>
          <p className="text-[#74716a] text-sm mt-1">{ar(counts.all)} عميل · {ar(counts.repeat)} متكرر</p>
        </div>
        <CustomerExport
          customers={customers.map((c) => ({ name: c.name, phone: c.phone, orders: c.ordersCount, total: c.total, last: c.lastIso }))}
          storeName={storeName}
        />
      </div>

      {/* Stat strip */}
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(150px,1fr))] mb-[18px]">
        {[
          { label: 'إجمالي العملاء', value: ar(counts.all), green: false },
          { label: 'عملاء متكررون', value: ar(counts.repeat), green: false },
          { label: 'جدد هذا الشهر', value: ar(newThisMonth), green: true },
          { label: 'متوسط الطلب', value: ar(avgOrder), unit: 'ج', green: false },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#ECE7DC] rounded-2xl px-4 py-3.5">
            <div className="text-[12.5px] text-[#74716a] font-semibold mb-1.5">{s.label}</div>
            <div className={`text-2xl font-extrabold tracking-tight ${s.green ? 'text-[#15803d]' : 'text-[#1d1b16]'}`}>{s.value}{s.unit && <span className="text-[13px] text-[#9a9488] font-bold"> {s.unit}</span>}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-1.5 flex-wrap">
          {TABS.map((t) => {
            const active = filter === t.key
            return (
              <button key={t.key} onClick={() => setFilter(t.key)} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-[11px] font-bold text-[13px] border transition-colors ${active ? 'bg-[#1d1b16] border-[#1d1b16] text-white' : 'bg-white border-[#ECE7DC] text-[#74716a] hover:bg-[#F4F0E8] hover:text-[#1d1b16]'}`}>
                {t.label}
                <span className={`text-[11px] font-extrabold px-1.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-[#F4F0E8] text-[#9a9488]'}`}>{ar(counts[t.key])}</span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative flex items-center">
            <Search size={16} className="absolute right-3 text-[#a8a193] pointer-events-none" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث باسم العميل…" maxLength={60} className="bg-white border border-[#ECE7DC] rounded-[11px] py-2.5 pr-9 pl-3 text-[13px] w-[212px] max-w-[60vw] outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/15" />
          </div>
          <div className="relative flex items-center">
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="appearance-none bg-white border border-[#ECE7DC] rounded-[11px] py-2.5 pr-3.5 pl-8 text-[13px] font-semibold cursor-pointer outline-none focus:border-[#16a34a]">
              <option value="spent">الأكثر إنفاقاً</option>
              <option value="orders">الأكثر طلباً</option>
              <option value="recent">الأحدث نشاطاً</option>
              <option value="name">الاسم</option>
            </select>
            <ChevronDown size={16} className="absolute left-2.5 text-[#9a9488] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Empty (filtered) */}
      {list.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e0d9c9] rounded-2xl py-12 text-center">
          <Users size={30} className="mx-auto text-[#d8d2c5] mb-2" />
          <p className="font-bold">لا يوجد عملاء مطابقون</p>
          <p className="text-sm text-[#74716a] mt-1">جرّب تغيير الفلتر أو كلمة البحث.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block bg-white border border-[#ECE7DC] rounded-2xl shadow-[0_1px_2px_rgba(29,27,22,0.04)] overflow-hidden">
            <div className="grid grid-cols-[2fr_1.4fr_90px_110px_120px_120px] gap-3 px-[18px] py-3 bg-[#FBFAF7] border-b border-[#ECE7DC] text-xs font-extrabold text-[#a8a193]">
              <span>العميل</span><span>المدينة</span><span>الطلبات</span><span>إجمالي الإنفاق</span><span>آخر طلب</span><span className="text-left">إجراء</span>
            </div>
            {list.map((c) => (
              <div key={c.phone} onClick={() => setOpenPhone(c.phone)} className="grid grid-cols-[2fr_1.4fr_90px_110px_120px_120px] gap-3 px-[18px] py-3 items-center border-t border-[#F1ECE1] cursor-pointer hover:bg-[#FBFAF7] transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-base flex-shrink-0 ${AVATARS[idx(c.phone) % AVATARS.length]}`}>{c.name.charAt(0)}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5"><span className="font-bold text-[13.5px] truncate">{c.name}</span>{c.vip && <span className="bg-[#F3E8D0] text-[#92610A] text-[10px] font-extrabold px-1.5 py-px rounded-full flex-shrink-0">VIP</span>}</div>
                    <div className="text-[11.5px] text-[#a8a193] font-semibold" dir="ltr">{c.phone}</div>
                  </div>
                </div>
                <span className="text-[13px] text-[#5f5c54] truncate">{c.city}</span>
                <span className="font-bold text-[13.5px]">{ar(c.ordersCount)}</span>
                <span className="font-extrabold text-[13.5px] whitespace-nowrap">{ar(c.total)} <span className="text-[11px] text-[#9a9488] font-bold">ج</span></span>
                <span className="text-[12.5px] text-[#74716a] font-semibold whitespace-nowrap">{relTime(c.lastIso)}</span>
                <div className="flex justify-start">
                  <a href={waLink(c)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 bg-white border border-[#bfe3c8] text-[#15803d] font-bold text-xs px-2.5 py-1.5 rounded-[9px] hover:bg-[#EAF6EC] hover:border-[#16a34a] transition-colors whitespace-nowrap">
                    <MessageCircle size={14} /> رسالة
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden flex flex-col gap-2.5">
            {list.map((c) => (
              <div key={c.phone} onClick={() => setOpenPhone(c.phone)} className="bg-white border border-[#ECE7DC] rounded-2xl p-3.5 shadow-[0_1px_2px_rgba(29,27,22,0.04)] cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-base flex-shrink-0 ${AVATARS[idx(c.phone) % AVATARS.length]}`}>{c.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5"><span className="font-extrabold text-[14.5px]">{c.name}</span>{c.vip && <span className="bg-[#F3E8D0] text-[#92610A] text-[10px] font-extrabold px-1.5 py-px rounded-full">VIP</span>}</div>
                    <div className="text-xs text-[#a8a193] font-semibold">{c.city} · <span dir="ltr">{c.phone}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-[#F1ECE1]">
                  <div className="flex-1"><div className="text-[11px] text-[#a8a193] font-bold">الطلبات</div><div className="font-extrabold text-[15px]">{ar(c.ordersCount)}</div></div>
                  <div className="flex-1"><div className="text-[11px] text-[#a8a193] font-bold">الإنفاق</div><div className="font-extrabold text-[15px]">{ar(c.total)} <span className="text-[11px] text-[#9a9488]">ج</span></div></div>
                  <a href={waLink(c)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-center gap-1.5 bg-white border border-[#bfe3c8] text-[#15803d] font-bold text-[13px] px-3.5 py-2 rounded-[10px] flex-shrink-0 hover:bg-[#EAF6EC] transition-colors">
                    <MessageCircle size={15} /> رسالة
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Profile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 flex justify-start">
          <div onClick={() => setOpenPhone(null)} className="absolute inset-0 bg-[#1d1b16]/30 dk-fade-in" />
          <div className="relative w-[430px] max-w-[92vw] h-full bg-[#FBFAF7] border-l border-[#ECE7DC] shadow-[-18px_0_50px_rgba(29,27,22,0.16)] flex flex-col dk-drawer-in">
            <div className="flex items-center justify-between gap-2.5 px-[18px] py-4 border-b border-[#ECE7DC] flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-[46px] h-[46px] rounded-[13px] flex items-center justify-center font-extrabold text-lg flex-shrink-0 ${AVATARS[idx(open.phone) % AVATARS.length]}`}>{open.name.charAt(0)}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5"><span className="font-extrabold text-base">{open.name}</span>{open.vip && <span className="bg-[#F3E8D0] text-[#92610A] text-[10px] font-extrabold px-1.5 py-px rounded-full">VIP</span>}</div>
                  <div className="text-xs text-[#a8a193] font-semibold" dir="ltr">{open.phone}</div>
                </div>
              </div>
              <button onClick={() => setOpenPhone(null)} aria-label="إغلاق" className="w-[34px] h-[34px] rounded-[10px] border border-[#ECE7DC] bg-white text-[#74716a] flex items-center justify-center flex-shrink-0 hover:bg-[#F4F0E8] transition-colors"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-[18px] flex flex-col gap-4">
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-white border border-[#ECE7DC] rounded-[13px] p-3 text-center"><div className="text-xl font-extrabold">{ar(open.ordersCount)}</div><div className="text-[11.5px] text-[#74716a] font-semibold mt-0.5">طلب</div></div>
                <div className="bg-white border border-[#ECE7DC] rounded-[13px] p-3 text-center"><div className="text-xl font-extrabold text-[#15803d]">{ar(open.total)}</div><div className="text-[11.5px] text-[#74716a] font-semibold mt-0.5">جنيه إنفاق</div></div>
                <div className="bg-white border border-[#ECE7DC] rounded-[13px] p-3 text-center"><div className="text-xl font-extrabold">{ar(Math.round(open.total / open.ordersCount))}</div><div className="text-[11.5px] text-[#74716a] font-semibold mt-0.5">متوسط الطلب</div></div>
              </div>

              {/* info */}
              <div className="bg-white border border-[#ECE7DC] rounded-2xl px-[15px] py-3.5 flex flex-col gap-3">
                <div className="flex items-start gap-2.5"><MapPin size={18} className="text-[#9a9488] mt-px flex-shrink-0" /><div><div className="text-xs text-[#a8a193] font-bold mb-px">المدينة</div><div className="text-[13.5px] font-semibold">{open.city}</div></div></div>
                <div className="flex items-start gap-2.5"><Calendar size={18} className="text-[#9a9488] mt-px flex-shrink-0" /><div><div className="text-xs text-[#a8a193] font-bold mb-px">عميل منذ</div><div className="text-[13.5px] font-semibold">{monthYear(open.firstIso)}</div></div></div>
              </div>

              {/* history */}
              <div className="bg-white border border-[#ECE7DC] rounded-2xl overflow-hidden">
                <div className="px-[15px] py-3 font-extrabold text-[13.5px] border-b border-[#F1ECE1]">سجل الطلبات</div>
                {open.history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between gap-2.5 px-[15px] py-2.5 border-b border-[#F1ECE1]">
                    <div className="min-w-0">
                      <div className="font-bold text-[13.5px] truncate">{itemsSummary(h.items)}</div>
                      <div className="text-[11.5px] text-[#a8a193] font-semibold" dir="rtl">{orderRef(h)} · {relTime(h.created_at)}</div>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${STATUS[h.status].pill}`}>{STATUS[h.status].label}</span>
                      <span className="font-extrabold text-[13.5px] whitespace-nowrap">{ar(h.total)} <span className="text-[10px] text-[#9a9488]">ج</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0 border-t border-[#ECE7DC] px-[18px] py-3.5 flex gap-2.5 bg-[#FBFAF7]">
              <a href={waLink(open)} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-sm py-3 rounded-xl shadow-[0_5px_14px_rgba(22,163,74,0.22)] transition-colors">
                <MessageCircle size={17} /> راسل العميل
              </a>
              <Link href="/dashboard/coupons" className="inline-flex items-center justify-center gap-2 bg-white border border-[#ECE7DC] text-[#74716a] font-bold text-[13.5px] px-4 py-3 rounded-xl hover:bg-[#F4F0E8] transition-colors">
                <Ticket size={16} /> كوبون خاص
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
