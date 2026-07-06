'use client'

import { useState } from 'react'
import { useLockScroll } from '@/lib/use-lock-scroll'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Search, X, Copy, Check, Calendar, Ticket } from 'lucide-react'
import { currencyLabel } from '@/lib/currency'
import type { Coupon } from '@/types'

const ar = (n: number) => n.toLocaleString('ar-EG')

type Status = 'active' | 'paused' | 'expired'
function statusOf(c: Coupon): Status {
  if (c.expires_at && new Date(c.expires_at) < new Date()) return 'expired'
  return c.active ? 'active' : 'paused'
}
const STATUS_PILL: Record<Status, { label: string; cls: string }> = {
  active: { label: 'نشط', cls: 'bg-[#D8F0DE] text-[#15803d]' },
  paused: { label: 'موقوف', cls: 'bg-[#FBEBC8] text-[#92610A]' },
  expired: { label: 'منتهٍ', cls: 'bg-[#EDE9E1] text-[#8a8478]' },
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })
}

type Tab = 'all' | 'active' | 'expired'

export default function CouponsView({
  storeId, currency, coupons: initial, usage,
}: { storeId: string; currency: string; coupons: Coupon[]; usage: Record<string, number> }) {
  const curr = currencyLabel(currency)
  const [coupons, setCoupons] = useState(initial)
  const [filter, setFilter] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  useLockScroll(createOpen)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  // create form
  const [fCode, setFCode] = useState('')
  const [fType, setFType] = useState<'percent' | 'fixed'>('percent')
  const [fValue, setFValue] = useState('')
  const [fLimit, setFLimit] = useState('')
  const [fExpiry, setFExpiry] = useState('')

  const used = (c: Coupon) => usage[c.code] ?? 0
  const counts = {
    all: coupons.length,
    active: coupons.filter((c) => statusOf(c) === 'active').length,
    expired: coupons.filter((c) => statusOf(c) === 'expired').length,
  }
  const totalUses = Object.values(usage).reduce((a, b) => a + b, 0)
  const mostUsed = Object.entries(usage).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  const q = query.trim().toUpperCase()
  const list = coupons.filter((c) => {
    const st = statusOf(c)
    if (filter === 'active' && st !== 'active') return false
    if (filter === 'expired' && st !== 'expired') return false
    if (q && !c.code.toUpperCase().includes(q)) return false
    return true
  })

  async function add() {
    const code = fCode.trim().toUpperCase()
    const value = parseFloat(fValue)
    if (!code || !value || value <= 0) { toast.error('أدخل كوداً وقيمة صحيحة'); return }
    if (fType === 'percent' && value > 100) { toast.error('النسبة لا تتجاوز ١٠٠٪'); return }
    setBusy(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('coupons').insert({
      store_id: storeId, code, type: fType, value,
      usage_limit: fLimit ? parseInt(fLimit, 10) : null,
      expires_at: fExpiry ? new Date(fExpiry).toISOString() : null,
    }).select().single()
    setBusy(false)
    if (error) { toast.error(error.code === '23505' ? 'هذا الكود موجود بالفعل' : 'تعذّر الإضافة — تأكد من تشغيل التحديث'); return }
    setCoupons((p) => [data as Coupon, ...p])
    setFCode(''); setFValue(''); setFLimit(''); setFExpiry('')
    setCreateOpen(false)
    toast.success('تمت إضافة الكوبون')
  }
  async function toggle(c: Coupon) {
    if (statusOf(c) === 'expired') return
    const supabase = createClient()
    await supabase.from('coupons').update({ active: !c.active }).eq('id', c.id)
    setCoupons((p) => p.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)))
  }
  function copy(c: Coupon) {
    try { navigator.clipboard?.writeText(c.code) } catch { /* ignore */ }
    setCopiedId(c.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const preview = { main: fValue ? (fType === 'percent' ? `${ar(Number(fValue))}٪` : ar(Number(fValue))) : (fType === 'percent' ? '٪' : '٠'), sub: fType === 'percent' ? 'خصم' : curr }

  return (
    <div className="max-w-[1180px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-[18px]">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">كوبونات</h1>
          <p className="text-[#74716a] text-sm mt-1">{ar(counts.active)} نشط · {ar(counts.all)} إجمالي الكوبونات</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-[0_5px_14px_rgba(22,163,74,0.22)] transition-colors">
          <Plus size={17} /> كوبون جديد
        </button>
      </div>

      {/* Stat strip */}
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(160px,1fr))] mb-[18px]">
        {[
          { label: 'كوبونات نشطة', value: ar(counts.active), green: true },
          { label: 'مرات الاستخدام', value: ar(totalUses) },
          { label: 'الأكثر استخداماً', value: mostUsed, ltr: true },
          { label: 'إجمالي الكوبونات', value: ar(counts.all) },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#ECE7DC] rounded-2xl px-4 py-3.5">
            <div className="text-[12.5px] text-[#74716a] font-semibold mb-1.5">{s.label}</div>
            <div className={`font-extrabold tracking-tight ${s.ltr ? 'text-[18px]' : 'text-2xl'} ${s.green ? 'text-[#15803d]' : 'text-[#1d1b16]'}`} dir={s.ltr ? 'ltr' : undefined} style={s.ltr ? { textAlign: 'right' } : undefined}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <div className="flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap">
          {([['all', 'الكل'], ['active', 'نشط'], ['expired', 'منتهٍ']] as [Tab, string][]).map(([key, label]) => {
            const active = filter === key
            return (
              <button key={key} onClick={() => setFilter(key)} className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-[11px] font-bold text-[13px] border transition-colors ${active ? 'bg-[#1d1b16] border-[#1d1b16] text-white' : 'bg-white border-[#ECE7DC] text-[#74716a] hover:bg-[#F4F0E8] hover:text-[#1d1b16]'}`}>
                {label}
                <span className={`text-[11px] font-extrabold px-1.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-[#F4F0E8] text-[#9a9488]'}`}>{ar(counts[key])}</span>
              </button>
            )
          })}
        </div>
        <div className="relative flex items-center">
          <Search size={16} className="absolute right-3 text-[#a8a193] pointer-events-none" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث بكود الكوبون…" maxLength={40} className="w-full lg:w-[220px] bg-white border border-[#ECE7DC] rounded-[11px] py-2.5 pr-9 pl-3 text-[13px] outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/15" dir="ltr" />
        </div>
      </div>

      {/* Grid / empty */}
      {list.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e0d9c9] rounded-2xl py-12 text-center">
          <Ticket size={30} className="mx-auto text-[#d8d2c5] mb-2" />
          <p className="font-bold">{coupons.length === 0 ? 'لا توجد كوبونات بعد' : 'لا توجد كوبونات مطابقة'}</p>
          <p className="text-sm text-[#74716a] mt-1 mb-4">أنشئ كوبون خصم لتشجيع عملائك على الشراء.</p>
          {coupons.length === 0 && (
            <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-[13.5px] px-4 py-2.5 rounded-xl transition-colors"><Plus size={16} /> كوبون جديد</button>
          )}
        </div>
      ) : (
        <div className="grid gap-[15px] grid-cols-[repeat(auto-fill,minmax(290px,1fr))]">
          {list.map((c) => {
            const st = statusOf(c)
            const on = st === 'active'
            const dim = st === 'expired'
            const pct = c.type === 'percent'
            const u = used(c)
            const usedPct = c.usage_limit ? Math.min(100, Math.round((u / c.usage_limit) * 100)) : 0
            return (
              <div key={c.id} className={`bg-white border border-[#ECE7DC] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(29,27,22,0.04)] ${dim ? 'opacity-75' : ''}`}>
                <div className="flex items-stretch">
                  {/* value box */}
                  <div className="flex-shrink-0 w-[90px] flex flex-col items-center justify-center text-white border-l-2 border-dashed border-white/50" style={{ background: dim ? '#b6ae9e' : on ? '#16a34a' : '#cdb88a' }}>
                    <div className="text-[26px] font-black leading-none tracking-tight">{pct ? `${ar(c.value)}٪` : ar(c.value)}</div>
                    <div className="text-xs font-bold opacity-90 mt-1">{pct ? 'خصم' : curr}</div>
                  </div>
                  {/* body */}
                  <div className="flex-1 min-w-0 p-3.5 flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-base tracking-wide" dir="ltr">{c.code}</span>
                          <button onClick={() => copy(c)} aria-label="نسخ الكود" className="inline-flex items-center bg-[#F4F0E8] rounded-md p-1 text-[#5f5c54] hover:bg-[#e9e3d6] hover:text-[#1d1b16] transition-colors">
                            {copiedId === c.id ? <Check size={14} className="text-[#15803d]" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="text-xs text-[#a8a193] font-semibold mt-0.5">خصم على إجمالي الطلب</div>
                      </div>
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${STATUS_PILL[st].cls}`}>{STATUS_PILL[st].label}</span>
                    </div>

                    {/* usage */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11.5px] text-[#74716a] font-bold">الاستخدام</span>
                        <span className="text-[11.5px] text-[#74716a] font-bold">{c.usage_limit ? `${ar(u)} / ${ar(c.usage_limit)}` : `${ar(u)} مرة`}</span>
                      </div>
                      {c.usage_limit ? (
                        <div className="h-1.5 bg-[#F4F0E8] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${usedPct}%`, background: usedPct >= 90 ? '#D9920A' : '#16a34a' }} />
                        </div>
                      ) : (
                        <div className="h-1.5 bg-[#F4F0E8] rounded-full" />
                      )}
                    </div>

                    {/* footer */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#F1ECE1]">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#74716a] font-semibold">
                        <Calendar size={14} className="text-[#a8a193]" />
                        {c.expires_at ? (dim ? `انتهى ${fmtDate(c.expires_at)}` : `حتى ${fmtDate(c.expires_at)}`) : 'بدون انتهاء'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: dim ? '#a8a193' : on ? '#15803d' : '#9a9488' }}>{dim ? 'منتهٍ' : on ? 'مفعّل' : 'موقوف'}</span>
                        <button onClick={() => toggle(c)} aria-label="تفعيل/إيقاف" disabled={dim} className="relative w-10 h-[23px] rounded-full flex-shrink-0 transition-colors disabled:cursor-not-allowed" style={{ background: dim ? '#e0dacd' : on ? '#16a34a' : '#d8d2c4' }}>
                          <span className="absolute top-[3px] w-[17px] h-[17px] rounded-full bg-white shadow transition-all" style={{ [on ? 'left' : 'right']: '3px' } as React.CSSProperties} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create drawer */}
      {createOpen && (
        <div className="fixed inset-0 z-40 flex justify-start">
          <div onClick={() => setCreateOpen(false)} className="absolute inset-0 bg-[#1d1b16]/30 dk-fade-in" />
          <div className="relative w-[420px] max-w-[92vw] h-[100dvh] bg-[#FBFAF7] border-l border-[#ECE7DC] shadow-[-18px_0_50px_rgba(29,27,22,0.16)] flex flex-col dk-drawer-in">
            <div className="flex items-center justify-between gap-2.5 px-[18px] py-4 border-b border-[#ECE7DC] flex-shrink-0">
              <div className="font-extrabold text-[17px]">كوبون جديد</div>
              <button onClick={() => setCreateOpen(false)} aria-label="إغلاق" className="w-[34px] h-[34px] rounded-[10px] border border-[#ECE7DC] bg-white text-[#74716a] flex items-center justify-center hover:bg-[#F4F0E8] transition-colors"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-[18px] flex flex-col gap-[18px]">
              <div>
                <label className="block text-[13px] font-bold mb-2">كود الكوبون</label>
                <input value={fCode} onChange={(e) => setFCode(e.target.value.toUpperCase())} placeholder="مثال: EID25" dir="ltr" className="w-full bg-white border border-[#ECE7DC] rounded-[11px] px-3 py-2.5 text-sm font-bold tracking-wide outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/15 text-right" />
              </div>
              <div>
                <label className="block text-[13px] font-bold mb-2">نوع الخصم</label>
                <div className="flex gap-2">
                  {(['percent', 'fixed'] as const).map((t) => (
                    <button key={t} onClick={() => setFType(t)} className={`flex-1 py-2.5 rounded-[11px] font-bold text-[13.5px] border transition-colors ${fType === t ? 'bg-[#1d1b16] border-[#1d1b16] text-white' : 'bg-white border-[#ECE7DC] text-[#74716a]'}`}>
                      {t === 'percent' ? 'نسبة ٪' : 'مبلغ ثابت'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold mb-2">{fType === 'percent' ? 'نسبة الخصم (٪)' : `قيمة الخصم (${curr})`}</label>
                <input value={fValue} onChange={(e) => setFValue(e.target.value)} type="number" min="0" placeholder={fType === 'percent' ? 'مثال: 25' : 'مثال: 50'} dir="ltr" className="w-full bg-white border border-[#ECE7DC] rounded-[11px] px-3 py-2.5 text-sm font-bold outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/15 text-right" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-bold mb-2">حد الاستخدام</label>
                  <input value={fLimit} onChange={(e) => setFLimit(e.target.value)} type="number" min="0" placeholder="بدون حد" dir="ltr" className="w-full bg-white border border-[#ECE7DC] rounded-[11px] px-3 py-2.5 text-sm font-bold outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/15 text-right" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold mb-2">ينتهي في</label>
                  <input value={fExpiry} onChange={(e) => setFExpiry(e.target.value)} type="date" className="w-full bg-white border border-[#ECE7DC] rounded-[11px] px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/15" />
                </div>
              </div>

              {/* preview */}
              <div>
                <div className="text-xs text-[#a8a193] font-bold mb-2">معاينة</div>
                <div className="flex items-stretch border border-[#ECE7DC] rounded-2xl overflow-hidden bg-white">
                  <div className="bg-[#16a34a] text-white px-4 py-3.5 flex flex-col items-center justify-center min-w-[84px]">
                    <div className="text-2xl font-black leading-none">{preview.main}</div>
                    <div className="text-[11px] font-bold opacity-90 mt-1">{preview.sub}</div>
                  </div>
                  <div className="flex-1 px-4 py-3.5 flex flex-col justify-center">
                    <div className="font-extrabold text-base" dir="ltr">{fCode.trim() ? fCode.trim().toUpperCase() : 'CODE'}</div>
                    <div className="text-xs text-[#a8a193] font-semibold mt-0.5">خصم على إجمالي الطلب</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 border-t border-[#ECE7DC] px-[18px] py-3.5 flex gap-2.5 bg-[#FBFAF7]">
              <button onClick={add} disabled={busy} className="flex-1 bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-sm py-3 rounded-xl shadow-[0_5px_14px_rgba(22,163,74,0.22)] transition-colors disabled:opacity-60">{busy ? '...' : 'حفظ الكوبون'}</button>
              <button onClick={() => setCreateOpen(false)} className="bg-white border border-[#ECE7DC] text-[#74716a] font-bold text-[13.5px] px-5 py-3 rounded-xl hover:bg-[#F4F0E8] transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
