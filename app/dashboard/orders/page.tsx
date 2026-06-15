import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ShoppingBag, Phone, User, MapPin, StickyNote, Wallet, CheckCircle2, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import OrderActions from '@/components/dashboard/OrderActions'
import type { OrderStatus, OrderItem } from '@/types'

const STATUS_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'جديد' },
  { key: 'confirmed', label: 'مؤكد' },
  { key: 'delivered', label: 'مسلّم' },
]

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: statusParam } = await searchParams
  const activeStatus = STATUS_FILTERS.some((f) => f.key === statusParam) ? statusParam! : 'all'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('id, currency')
    .eq('owner_id', user!.id)
    .single()

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', store?.id ?? '')
    .order('created_at', { ascending: false })

  // Revenue is counted only from delivered (completed) orders (across all).
  const allOrders = orders ?? []
  const delivered = allOrders.filter((o) => o.status === 'delivered')
  const pending = allOrders.filter((o) => (o.status ?? 'pending') === 'pending')
  const revenue = delivered.reduce((sum, o) => sum + Number(o.total), 0)

  // The visible list respects the status filter.
  const visibleOrders = activeStatus === 'all'
    ? allOrders
    : allOrders.filter((o) => (o.status ?? 'pending') === activeStatus)

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">الطلبات</h1>
        <p className="text-sm text-gray-500">{allOrders.length.toLocaleString('ar-EG')} طلب</p>
      </div>

      {/* Revenue dashboard */}
      {allOrders.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-4 text-white">
            <Wallet size={18} className="mb-2 opacity-90" />
            <p className="text-xl font-extrabold leading-none">{formatPrice(revenue, store?.currency)}</p>
            <p className="text-[11px] text-green-100 mt-1.5">إيرادات الطلبات المسلّمة</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <CheckCircle2 size={18} className="mb-2 text-green-600" />
            <p className="text-xl font-extrabold text-gray-900 leading-none">{delivered.length.toLocaleString('ar-EG')}</p>
            <p className="text-[11px] text-gray-400 mt-1.5">طلب مسلّم</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <Clock size={18} className="mb-2 text-amber-500" />
            <p className="text-xl font-extrabold text-gray-900 leading-none">{pending.length.toLocaleString('ar-EG')}</p>
            <p className="text-[11px] text-gray-400 mt-1.5">طلب جديد</p>
          </div>
        </div>
      )}

      {/* Status filter */}
      {allOrders.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === 'all' ? '/dashboard/orders' : `/dashboard/orders?status=${f.key}`}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeStatus === f.key
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      )}

      {!allOrders.length ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <ShoppingBag size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500">لا توجد طلبات بعد</p>
          <p className="text-xs text-gray-400 mt-1">ستظهر الطلبات هنا عندما يطلب العملاء عبر واتساب</p>
        </div>
      ) : !visibleOrders.length ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">لا توجد طلبات بهذه الحالة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleOrders.map((order) => {
            const date = new Date(order.created_at)
            const items = order.items as OrderItem[]
            return (
              <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-4">
                {/* Header: date + total */}
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-400">
                    {date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {' — '}
                    {date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="font-bold text-green-600 text-sm">
                    {formatPrice(order.total, store?.currency)}
                  </p>
                </div>

                {/* Customer info */}
                {(order.customer_name || order.customer_phone || order.customer_address || order.notes) && (
                  <div className="mb-3 bg-gray-50 rounded-lg px-3 py-2.5 space-y-2">
                    <div className="flex gap-4 flex-wrap">
                      {order.customer_name && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <User size={13} className="text-gray-400" />
                          {order.customer_name}
                        </div>
                      )}
                      {order.customer_phone && (
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="flex items-center gap-1.5 text-sm text-green-600 hover:underline"
                        >
                          <Phone size={13} />
                          {order.customer_phone}
                        </a>
                      )}
                    </div>
                    {order.customer_address && (
                      <div className="flex items-start gap-1.5 text-sm text-gray-600">
                        <MapPin size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{order.customer_address}</span>
                      </div>
                    )}
                    {order.notes && (
                      <div className="flex items-start gap-1.5 text-sm text-gray-500">
                        <StickyNote size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{order.notes}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Items */}
                <div className="space-y-1">
                  {items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.quantity}× {item.name}
                        {item.options && Object.keys(item.options).length > 0 && (
                          <span className="text-gray-400 text-xs">
                            {' '}({Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join('، ')})
                          </span>
                        )}
                      </span>
                      <span className="text-gray-400">{(item.price * item.quantity).toLocaleString('ar-EG')}</span>
                    </div>
                  ))}
                </div>

                {/* Status + actions */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <OrderActions orderId={order.id} status={(order.status ?? 'pending') as OrderStatus} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
