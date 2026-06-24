import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/currency'
import { normalizeEgyptianNumber } from '@/lib/whatsapp'
import CustomerExport from '@/components/dashboard/CustomerExport'
import { Users, MessageCircle, ShoppingBag } from 'lucide-react'

type Customer = {
  name: string | null
  phone: string
  orders: number
  total: number
  last: string
}

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('id, name, currency')
    .eq('owner_id', user!.id)
    .single()

  const { data: orders } = await supabase
    .from('orders')
    .select('customer_name, customer_phone, total, created_at')
    .eq('store_id', store?.id ?? '')

  // Aggregate unique customers by phone.
  const map = new Map<string, Customer>()
  for (const o of orders ?? []) {
    if (!o.customer_phone) continue
    const e = map.get(o.customer_phone) ?? { name: o.customer_name, phone: o.customer_phone, orders: 0, total: 0, last: o.created_at }
    e.orders += 1
    e.total += Number(o.total)
    if (new Date(o.created_at) >= new Date(e.last)) {
      e.last = o.created_at
      e.name = o.customer_name ?? e.name
    }
    map.set(o.customer_phone, e)
  }
  const customers = [...map.values()].sort((a, b) => b.orders - a.orders || new Date(b.last).getTime() - new Date(a.last).getTime())

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">العملاء</h1>
          <p className="text-sm text-gray-500">{customers.length.toLocaleString('ar-EG')} عميل · راسلهم لطلبات جديدة</p>
        </div>
        {customers.length > 0 && <CustomerExport customers={customers} storeName={store?.name ?? 'store'} />}
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <Users size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500">لا يوجد عملاء بعد</p>
          <p className="text-xs text-gray-400 mt-1">سيظهر هنا كل من طلب من متجرك — لتتواصل معهم مرة أخرى</p>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => {
            const wa = `https://wa.me/${normalizeEgyptianNumber(c.phone)}?text=${encodeURIComponent(`مرحباً ${c.name ?? ''} 🙂 من ${store?.name ?? ''}`)}`
            return (
              <div key={c.phone} className="bg-white rounded-2xl ring-1 ring-foreground/[0.07] shadow-[var(--shadow-soft)] p-3.5 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 text-sm font-bold text-green-700">
                  {(c.name?.trim()?.[0] ?? '?')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{c.name?.trim() || 'عميل'}</p>
                  <p className="text-xs text-gray-400" dir="ltr">{c.phone}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1"><ShoppingBag size={11} /> {c.orders.toLocaleString('ar-EG')} طلب</span>
                    <span>·</span>
                    <span>{formatPrice(c.total, store?.currency)}</span>
                  </p>
                </div>
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-shrink-0 flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg px-3 py-2 transition-colors"
                >
                  <MessageCircle size={15} /> راسله
                </a>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
