import { createClient } from '@/lib/supabase/server'
import { ShoppingBag } from 'lucide-react'

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
            const items = order.items as { name: string; quantity: number; price: number }[]
            return (
              <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400">
                      {date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {' — '}
                      {date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="font-bold text-green-600 text-sm">
                    {order.total.toLocaleString('ar-EG')} {store?.currency ?? 'EGP'}
                  </p>
                </div>
                <div className="space-y-1">
                  {items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.quantity}× {item.name}</span>
                      <span className="text-gray-400">{(item.price * item.quantity).toLocaleString('ar-EG')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
