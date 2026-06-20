import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ShoppingBag, Phone, User, MapPin, StickyNote, Wallet, CheckCircle2, Clock, MessageCircle } from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { normalizeEgyptianNumber } from '@/lib/whatsapp'
import OrderActions from '@/components/dashboard/OrderActions'
import CopyAddressButton from '@/components/dashboard/CopyAddressButton'
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
    .select('id, currency, name')
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
            // One-tap WhatsApp reply to the customer — the core merchant action.
            const waReply = order.customer_phone
              ? `https://wa.me/${normalizeEgyptianNumber(order.customer_phone)}?text=${encodeURIComponent(
                  `مرحباً ${order.customer_name ?? ''}، بخصوص طلبك من ${store?.name ?? ''} 🛍️`
                )}`
              : null
            return (
              <div key={order.id} className="bg-white rounded-2xl ring-1 ring-foreground/[0.07] shadow-[var(--shadow-soft)] overflow-hidden">
                {/* Header: date + total */}
                <div className="bg-gradient-to-bl from-green-50 to-white px-4 py-3.5 border-b border-green-100/70 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock size={13} className="text-green-600/70" />
                    {date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                    {' · '}
                    {date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-extrabold text-green-700 tabular-nums leading-none">
                      {formatPrice(order.total, store?.currency)}
                    </p>
                    {order.coupon_code && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded" dir="ltr">
                        🎟 {order.coupon_code}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  {/* Customer info panel */}
                  {(order.customer_name || order.customer_phone || order.customer_address || order.notes) && (
                    <div className="mb-4 rounded-xl border border-green-100 bg-green-50/50 p-3.5 space-y-2.5">
                      {order.customer_name && (
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <User size={14} className="text-green-700" />
                          </span>
                          <span className="text-sm font-medium text-gray-800">{order.customer_name}</span>
                        </div>
                      )}
                      {order.customer_phone && (
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Phone size={14} className="text-green-700" />
                          </span>
                          <a href={`tel:${order.customer_phone}`} className="text-sm font-medium text-green-700 hover:underline" dir="ltr">
                            {order.customer_phone}
                          </a>
                        </div>
                      )}
                      {order.customer_address && (
                        <div className="flex items-start gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <MapPin size={14} className="text-green-700" />
                          </span>
                          <span className="text-sm text-gray-700 leading-relaxed">{order.customer_address}</span>
                          <CopyAddressButton text={order.customer_address} />
                        </div>
                      )}
                      {order.notes && (
                        <div className="flex items-start gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <StickyNote size={14} className="text-green-700" />
                          </span>
                          <span className="text-sm text-gray-500 leading-relaxed">{order.notes}</span>
                        </div>
                      )}

                      {/* Primary action: reply to the customer on WhatsApp */}
                      {waReply && (
                        <a
                          href={waReply}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
                        >
                          <MessageCircle size={15} /> رد عبر واتساب
                        </a>
                      )}
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-1.5">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-gray-500 tabular-nums">
                            ×{item.quantity.toLocaleString('ar-EG')}
                          </span>
                          <span className="text-sm text-gray-800 truncate">
                            {item.name}
                            {item.options && Object.keys(item.options).length > 0 && (
                              <span className="text-gray-400 text-xs"> ({Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join('، ')})</span>
                            )}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 tabular-nums flex-shrink-0">
                          {(item.price * item.quantity).toLocaleString('ar-EG')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Status + actions */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <OrderActions orderId={order.id} status={(order.status ?? 'pending') as OrderStatus} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
