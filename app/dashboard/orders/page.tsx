import { createClient } from '@/lib/supabase/server'
import { ShoppingBag, Phone, User, MapPin, StickyNote } from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import OrderActions from '@/components/dashboard/OrderActions'
import type { OrderStatus, OrderItem } from '@/types'

export default async function OrdersPage() {
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

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">الطلبات</h1>
        <p className="text-sm text-gray-500">{orders?.length ?? 0} طلب</p>
      </div>

      {!orders?.length ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <ShoppingBag size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500">لا توجد طلبات بعد</p>
          <p className="text-xs text-gray-400 mt-1">ستظهر الطلبات هنا عندما يطلب العملاء عبر واتساب</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
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
