'use client'

import { useState } from 'react'
import { useLockScroll } from '@/lib/use-lock-scroll'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Search, ChevronDown, ChevronUp, Plus, Pencil, MoreVertical, Trash2, Star, Package, ArrowDownUp, Tags, X, Check } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import ShareStoreButton from '@/components/dashboard/ShareStoreButton'
import CategoriesManager from '@/components/dashboard/CategoriesManager'
import { effectivePrice, isOnSale } from '@/lib/price'
import type { Product } from '@/types'

const ar = (n: number) => n.toLocaleString('ar-EG')
const TINTS = ['#F4F0E8', '#EFE7DA', '#F1EAE3', '#EDE9DD']

type Patch = { hidden?: boolean; in_stock?: boolean; featured?: boolean }
type Tab = 'all' | 'published' | 'hidden' | 'low'

function stockPill(p: Product): { label: string; cls: string } {
  const sq = p.stock_quantity
  if (sq != null) {
    if (sq === 0) return { label: 'نفذ', cls: 'bg-[#F6E4E1] text-[#B4453A]' }
    if (sq <= 3) return { label: `منخفض · ${ar(sq)}`, cls: 'bg-[#FBEBC8] text-[#92610A]' }
    return { label: `متوفر · ${ar(sq)}`, cls: 'bg-[#E7F3EA] text-[#15803d]' }
  }
  return p.in_stock ? { label: 'متاح', cls: 'bg-[#E7F3EA] text-[#15803d]' } : { label: 'نفذ', cls: 'bg-[#F6E4E1] text-[#B4453A]' }
}
function isLow(p: Product) {
  return (p.stock_quantity != null && p.stock_quantity <= 3) || (p.stock_quantity == null && !p.in_stock)
}

export default function ProductsView({
  products, sold, storeName, storeSlug, storeId, categories,
}: { products: Product[]; sold: Record<string, number>; storeName: string; storeSlug: string; storeId: string; categories: string[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'sold' | 'new' | 'phi' | 'plo'>('sold')
  const [patch, setPatch] = useState<Record<string, Patch>>({})
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [busy, setBusy] = useState(false)
  const [catsOpen, setCatsOpen] = useState(false)
  useLockScroll(catsOpen)
  const [arrangeMode, setArrangeMode] = useState(false)
  const [arrangeList, setArrangeList] = useState<Product[]>([])

  function enterArrange() { setArrangeList([...products]); setArrangeMode(true) }
  async function moveItem(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= arrangeList.length) return
    const A = arrangeList[i], B = arrangeList[j]
    setArrangeList((prev) => {
      const next = [...prev]
      next[i] = { ...B, sort_order: A.sort_order }
      next[j] = { ...A, sort_order: B.sort_order }
      return next
    })
    const supabase = createClient()
    await supabase.from('products').update({ sort_order: B.sort_order }).eq('id', A.id)
    await supabase.from('products').update({ sort_order: A.sort_order }).eq('id', B.id)
    router.refresh()
  }

  const eff = (p: Product): Product => ({ ...p, ...patch[p.id] })

  async function update(id: string, fields: Patch, msg: string) {
    setPatch((s) => ({ ...s, [id]: { ...s[id], ...fields } }))
    const supabase = createClient()
    const { error } = await supabase.from('products').update(fields).eq('id', id)
    if (error) toast.error('تعذّر الحفظ — تأكد من تشغيل التحديث')
    else toast.success(msg)
    router.refresh()
  }
  async function del() {
    if (!deleteTarget) return
    setBusy(true)
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', deleteTarget.id)
    toast.success('تم حذف المنتج')
    setDeleteTarget(null)
    setBusy(false)
    router.refresh()
  }

  const items = products.map(eff)
  const counts = {
    all: items.length,
    published: items.filter((p) => !p.hidden).length,
    hidden: items.filter((p) => p.hidden).length,
    low: items.filter(isLow).length,
  }

  const q = query.trim()
  let list = items.filter((p) => {
    if (filter === 'published' && p.hidden) return false
    if (filter === 'hidden' && !p.hidden) return false
    if (filter === 'low' && !isLow(p)) return false
    if (q && !p.name.includes(q) && !(p.category ?? '').includes(q)) return false
    return true
  })
  list = [...list].sort((a, b) => {
    if (sort === 'sold') return (sold[b.name] ?? 0) - (sold[a.name] ?? 0)
    if (sort === 'new') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    if (sort === 'phi') return effectivePrice(b) - effectivePrice(a)
    return effectivePrice(a) - effectivePrice(b)
  })

  return (
    <div className="max-w-[1180px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">المنتجات</h1>
          <p className="text-[#74716a] text-sm mt-1">{ar(counts.all)} منتج · {ar(counts.published)} منشور</p>
        </div>
        <div className="flex items-center gap-2.5">
          <ShareStoreButton slug={storeSlug} storeName={storeName} />
          <Link href="/dashboard/products/new" className="inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-[0_5px_14px_rgba(22,163,74,0.22)] transition-colors">
            <Plus size={17} /> أضف منتج
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      {!arrangeMode && (
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-[18px]">
        {/* Filter tabs — scroll horizontally on mobile instead of wrapping */}
        <div className="flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap">
          {([['all', 'الكل'], ['published', 'منشور'], ['hidden', 'مخفي'], ['low', 'مخزون منخفض']] as [Tab, string][]).map(([key, label]) => {
            const active = filter === key
            return (
              <button key={key} onClick={() => setFilter(key)} className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-[11px] font-bold text-[13px] border transition-colors ${active ? 'bg-[#1d1b16] border-[#1d1b16] text-white' : 'bg-white border-[#ECE7DC] text-[#74716a] hover:bg-[#F4F0E8] hover:text-[#1d1b16]'}`}>
                {label}
                <span className={`text-[11px] font-extrabold px-1.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-[#F4F0E8] text-[#9a9488]'}`}>{ar(counts[key])}</span>
              </button>
            )
          })}
        </div>
        {/* Search grows on mobile; category/arrange collapse to icons */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center flex-1 lg:flex-none">
            <Search size={16} className="absolute right-3 text-[#a8a193] pointer-events-none" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن منتج…" maxLength={80} className="w-full lg:w-[200px] bg-white border border-[#ECE7DC] rounded-[11px] py-2.5 pr-9 pl-3 text-[13px] outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/15" />
          </div>
          <div className="relative flex items-center flex-shrink-0">
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="appearance-none bg-white border border-[#ECE7DC] rounded-[11px] py-2.5 pr-3.5 pl-8 text-[13px] font-semibold cursor-pointer outline-none focus:border-[#16a34a]">
              <option value="sold">الأكثر مبيعاً</option>
              <option value="new">الأحدث</option>
              <option value="phi">السعر: من الأعلى</option>
              <option value="plo">السعر: من الأقل</option>
            </select>
            <ChevronDown size={16} className="absolute left-2.5 text-[#9a9488] pointer-events-none" />
          </div>
          <button type="button" onClick={() => setCatsOpen(true)} aria-label="التصنيفات" className="flex-shrink-0 inline-flex items-center gap-1.5 bg-white border border-[#ECE7DC] text-[#74716a] rounded-[11px] px-3 py-2.5 text-[13px] font-bold hover:bg-[#F4F0E8] hover:text-[#1d1b16] transition-colors"><Tags size={15} /> <span className="hidden sm:inline">التصنيفات</span></button>
          {products.length > 1 && <button type="button" onClick={enterArrange} aria-label="ترتيب المنتجات" className="flex-shrink-0 inline-flex items-center gap-1.5 bg-white border border-[#ECE7DC] text-[#74716a] rounded-[11px] px-3 py-2.5 text-[13px] font-bold hover:bg-[#F4F0E8] hover:text-[#1d1b16] transition-colors"><ArrowDownUp size={15} /> <span className="hidden sm:inline">ترتيب</span></button>}
        </div>
      </div>
      )}

      {/* Arrange mode — reorder how products appear in the store */}
      {arrangeMode && (
        <div className="bg-white border border-[#ECE7DC] rounded-2xl shadow-[0_1px_2px_rgba(29,27,22,0.04)] overflow-hidden">
          <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-[#ECE7DC]">
            <div><div className="font-extrabold text-[15px]">ترتيب المنتجات</div><div className="text-xs text-[#74716a] mt-0.5">رتّب ظهور المنتجات في متجرك بالأسهم.</div></div>
            <button onClick={() => setArrangeMode(false)} className="inline-flex items-center gap-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-[13px] px-4 py-2 rounded-[10px] transition-colors"><Check size={15} /> تم</button>
          </div>
          {arrangeList.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 px-[18px] py-2.5 border-t border-[#F1ECE1] first:border-t-0">
              <div className="flex flex-col">
                <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="w-7 h-6 flex items-center justify-center rounded text-[#9a9488] hover:text-[#1d1b16] hover:bg-[#F4F0E8] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"><ChevronUp size={16} /></button>
                <button onClick={() => moveItem(i, 1)} disabled={i === arrangeList.length - 1} className="w-7 h-6 flex items-center justify-center rounded text-[#9a9488] hover:text-[#1d1b16] hover:bg-[#F4F0E8] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"><ChevronDown size={16} /></button>
              </div>
              <div className="w-11 h-11 rounded-[10px] bg-[#F4F0E8] overflow-hidden flex items-center justify-center flex-shrink-0">
                {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <Package size={18} className="text-[#c9bfa9]" />}
              </div>
              <div className="flex-1 min-w-0"><div className="font-bold text-[14px] truncate">{p.name}</div>{p.category && <div className="text-xs text-[#a8a193] font-semibold">{p.category}</div>}</div>
              <span className="text-xs text-[#9a9488] font-bold tabular-nums">{ar(i + 1)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Grid / empty */}
      {!arrangeMode && (list.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e0d9c9] rounded-2xl py-14 text-center">
          <Package size={34} className="mx-auto text-[#d8d2c5] mb-2" />
          <p className="font-bold">{products.length === 0 ? 'لا توجد منتجات بعد' : 'لا توجد منتجات مطابقة'}</p>
          <p className="text-sm text-[#74716a] mt-1">{products.length === 0 ? 'أضف أول منتج لمتجرك.' : 'جرّب تغيير الفلتر أو كلمة البحث.'}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-[15px] grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(214px,1fr))]">
          {list.map((p, i) => {
            const pill = stockPill(p)
            const out = (p.stock_quantity != null && p.stock_quantity === 0) || (p.stock_quantity == null && !p.in_stock)
            const low = isLow(p) && !out
            const visible = !p.hidden
            const soldN = sold[p.name] ?? 0
            return (
              <div key={p.id} className={`bg-white border border-[#ECE7DC] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(29,27,22,0.04)] flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(29,27,22,0.08)] ${!visible ? 'opacity-85' : ''}`}>
                {/* image */}
                <div className="relative aspect-[16/11] flex items-center justify-center" style={{ background: TINTS[i % TINTS.length] }}>
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={38} className="text-[#c9bfa9]" strokeWidth={1.4} />
                  )}
                  {(out || low) && (
                    <span className={`absolute top-2.5 right-2.5 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full text-white ${out ? 'bg-[#B4453A]' : 'bg-[#D9920A]'}`}>{out ? 'نفذ' : 'منخفض'}</span>
                  )}
                  {!visible && (
                    <span className="absolute top-2.5 left-2.5 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#1d1b16]/60 text-white backdrop-blur-sm">مخفي</span>
                  )}
                </div>

                {/* body */}
                <div className="p-2.5 sm:p-3.5 flex flex-col gap-2 sm:gap-2.5 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-extrabold text-[13.5px] sm:text-[14.5px] leading-tight truncate">{p.name}</div>
                      {p.category && <div className="text-xs text-[#a8a193] font-semibold mt-0.5 truncate">{p.category}</div>}
                    </div>
                    <div className="text-left whitespace-nowrap flex-shrink-0">
                      <span className="font-extrabold text-[14px] sm:text-[15px]">{ar(effectivePrice(p))}</span>
                      <span className="text-[11.5px] text-[#9a9488] font-bold"> ج</span>
                      {isOnSale(p) && <div className="text-[11px] text-[#a8a193] line-through">{ar(p.price)}</div>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-[11.5px] font-extrabold px-2.5 py-0.5 rounded-full ${pill.cls}`}>{pill.label}</span>
                    <span className="text-xs text-[#74716a] font-semibold whitespace-nowrap">{ar(soldN)} مبيع</span>
                  </div>

                  {/* footer */}
                  <div className="mt-auto pt-2.5 sm:pt-3 border-t border-[#F1ECE1] flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/dashboard/products/${p.id}`} className="inline-flex items-center gap-1.5 bg-[#F4F0E8] text-[#5f5c54] rounded-[9px] px-2 sm:px-3 py-2 font-bold text-[12.5px] hover:bg-[#e9e3d6] hover:text-[#1d1b16] transition-colors">
                        <Pencil size={14} /> <span className="hidden sm:inline">تعديل</span>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger aria-label="خيارات" className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9a9488] hover:text-[#1d1b16] hover:bg-[#F4F0E8] transition-colors">
                          <MoreVertical size={16} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-40">
                          <DropdownMenuItem onClick={() => update(p.id, { featured: !p.featured }, p.featured ? 'أُلغي التمييز' : 'تم تمييز المنتج')}>
                            <Star size={14} className={p.featured ? 'fill-amber-400 text-amber-400' : ''} /> {p.featured ? 'إلغاء التمييز' : 'تمييز المنتج'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => update(p.id, { in_stock: !p.in_stock }, p.in_stock ? 'صار نافد المخزون' : 'صار متاحاً')}>
                            <Package size={14} /> {p.in_stock ? 'وضع: نفد المخزون' : 'وضع: متاح'}
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(p)}>
                            <Trash2 size={14} /> حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <button
                      onClick={() => update(p.id, { hidden: visible }, visible ? 'تم إخفاء المنتج' : 'تم نشر المنتج')}
                      aria-label={visible ? 'إخفاء من المتجر' : 'إظهار في المتجر'}
                      title={visible ? 'منشور — اضغط للإخفاء' : 'مخفي — اضغط للنشر'}
                      className="relative w-[42px] h-[24px] rounded-full flex-shrink-0 transition-colors"
                      style={{ background: visible ? '#16a34a' : '#d8d2c4' }}
                    >
                      <span className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-all" style={{ [visible ? 'left' : 'right']: '3px' } as React.CSSProperties} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}

      {/* Categories drawer */}
      {catsOpen && (
        <div className="fixed inset-0 z-[60] flex justify-start">
          <div onClick={() => setCatsOpen(false)} className="absolute inset-0 bg-[#1d1b16]/30 dk-fade-in" />
          <div className="relative w-[420px] max-w-[92vw] h-[100dvh] bg-[#FBFAF7] border-l border-[#ECE7DC] shadow-[-18px_0_50px_rgba(29,27,22,0.16)] flex flex-col dk-drawer-in">
            <div className="flex items-center justify-between gap-2.5 px-[18px] py-4 border-b border-[#ECE7DC] flex-shrink-0">
              <div><div className="font-extrabold text-[17px]">التصنيفات</div><div className="text-xs text-[#74716a] mt-0.5">رتّب أو عدّل تصنيفات متجرك — تظهر للعملاء كفلاتر في المتجر.</div></div>
              <button onClick={() => setCatsOpen(false)} aria-label="إغلاق" className="w-[34px] h-[34px] rounded-[10px] border border-[#ECE7DC] bg-white text-[#74716a] flex items-center justify-center hover:bg-[#F4F0E8] transition-colors"><X size={18} /></button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-[18px]">
              <CategoriesManager storeId={storeId} categories={categories} />
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent showCloseButton={false} dir="rtl" className="text-right">
          <DialogHeader>
            <DialogTitle>حذف المنتج</DialogTitle>
            <DialogDescription>حذف «{deleteTarget?.name}»؟ لا يمكن التراجع.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={busy}>إلغاء</Button>
            <Button onClick={del} disabled={busy} className="bg-red-600 hover:bg-red-700 text-white">{busy ? '...' : 'حذف'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
