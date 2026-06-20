'use client'

import { useState } from 'react'
import Link from 'next/link'
import AdminPlanActions from './AdminPlanActions'
import AdminDangerMenu from './AdminDangerMenu'
import { Crown, Ban, ExternalLink, Search, AlertTriangle } from 'lucide-react'

export type StoreRow = {
  id: string
  name: string
  slug: string
  email: string
  products: number
  pro: boolean
  plan_expires_at: string | null
  suspended: boolean
  orders30: number
  ordersTotal: number
  lastOrderAt: number | null
  activated: boolean
  atRisk: boolean
}

type Filter = 'all' | 'pro' | 'free' | 'risk' | 'inactive'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'pro', label: 'Pro' },
  { key: 'free', label: 'مجاني' },
  { key: 'risk', label: 'في خطر' },
  { key: 'inactive', label: 'غير مُفعّل' },
]

function lastActivity(ts: number | null): string {
  if (!ts) return '—'
  const days = Math.floor((Date.now() - ts) / 86_400_000)
  if (days <= 0) return 'اليوم'
  if (days === 1) return 'أمس'
  return `منذ ${days.toLocaleString('ar-EG')} يوم`
}

export default function AdminStoreList({ stores }: { stores: StoreRow[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const q = query.trim().toLowerCase()
  const filtered = stores.filter((s) => {
    if (filter === 'pro' && !s.pro) return false
    if (filter === 'free' && s.pro) return false
    if (filter === 'risk' && !s.atRisk) return false
    if (filter === 'inactive' && s.activated) return false
    if (q && !s.name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false
    return true
  })

  function StatusBadges({ s }: { s: StoreRow }) {
    return (
      <div className="flex flex-wrap gap-1">
        {s.pro ? (
          <span className="w-fit text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Crown size={9} /> Pro</span>
        ) : (
          <span className="w-fit text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">مجاني</span>
        )}
        {s.suspended && (
          <span className="w-fit text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Ban size={9} /> معلّق</span>
        )}
        {s.atRisk && (
          <span className="w-fit text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-0.5"><AlertTriangle size={9} /> في خطر</span>
        )}
        {!s.activated && (
          <span className="w-fit text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">غير مُفعّل</span>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Search + filters */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم أو البريد..."
            className="w-full bg-white rounded-xl border border-gray-200 pr-10 pl-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filter === f.key ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl ring-1 ring-foreground/[0.07] py-12 text-center text-sm text-gray-400">
          لا توجد متاجر مطابقة
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl ring-1 ring-foreground/[0.07] shadow-[var(--shadow-soft)] overflow-hidden">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="bg-gray-50/70 text-[11px] font-bold text-gray-400 border-b border-gray-100">
                  <th className="px-4 py-3 font-bold">المتجر</th>
                  <th className="px-4 py-3 font-bold">المالك</th>
                  <th className="px-4 py-3 font-bold">المنتجات</th>
                  <th className="px-4 py-3 font-bold">طلبات ٣٠ يوم</th>
                  <th className="px-4 py-3 font-bold">آخر نشاط</th>
                  <th className="px-4 py-3 font-bold">الحالة</th>
                  <th className="px-4 py-3 font-bold text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => (
                  <tr key={s.id} className={`hover:bg-gray-50/40 transition-colors ${s.atRisk ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1.5">
                        <Link href={`/admin/store/${s.id}`} className="font-bold text-gray-900 hover:text-green-700 truncate max-w-[150px]">{s.name}</Link>
                        <a href={`/store/${s.slug}`} target="_blank" rel="noreferrer" aria-label="عرض المتجر">
                          <ExternalLink size={13} className="text-gray-300 hover:text-gray-500 flex-shrink-0" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 truncate max-w-[180px]">{s.email}</td>
                    <td className="px-4 py-3 tabular-nums text-gray-700">{s.products.toLocaleString('ar-EG')}</td>
                    <td className="px-4 py-3 tabular-nums">
                      <span className={s.orders30 > 0 ? 'font-bold text-gray-900' : 'text-gray-400'}>{s.orders30.toLocaleString('ar-EG')}</span>
                      <span className="text-[10px] text-gray-400"> / {s.ordersTotal.toLocaleString('ar-EG')}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{lastActivity(s.lastOrderAt)}</td>
                    <td className="px-4 py-3"><StatusBadges s={s} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <AdminPlanActions storeId={s.id} isPro={s.pro} />
                        <AdminDangerMenu storeId={s.id} storeName={s.name} suspended={s.suspended} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {filtered.map((s) => (
              <div key={s.id} className={`bg-white rounded-xl ring-1 ring-foreground/[0.07] p-4 ${s.atRisk ? 'ring-amber-200' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/admin/store/${s.id}`} className="font-bold text-gray-900 truncate">{s.name}</Link>
                  <a href={`/store/${s.slug}`} target="_blank" rel="noreferrer" aria-label="عرض المتجر">
                    <ExternalLink size={12} className="text-gray-300 flex-shrink-0" />
                  </a>
                </div>
                <div className="mb-2"><StatusBadges s={s} /></div>
                <p className="text-xs text-gray-400 truncate">{s.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {s.products.toLocaleString('ar-EG')} منتج · {s.orders30.toLocaleString('ar-EG')} طلب (٣٠ يوم) · آخر نشاط {lastActivity(s.lastOrderAt)}
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end gap-1">
                  <AdminPlanActions storeId={s.id} isPro={s.pro} />
                  <AdminDangerMenu storeId={s.id} storeName={s.name} suspended={s.suspended} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
