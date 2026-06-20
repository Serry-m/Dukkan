'use client'

import { useState } from 'react'
import { Clock, User, Phone, MapPin, StickyNote, MessageCircle, Search } from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { normalizeEgyptianNumber } from '@/lib/whatsapp'
import OrderActions from '@/components/dashboard/OrderActions'
import CopyAddressButton from '@/components/dashboard/CopyAddressButton'
import type { Order, OrderItem, OrderStatus } from '@/types'

export default function OrdersList({
  orders,
  currency,
  storeName,
}: {
  orders: Order[]
  currency: string
  storeName: string
}) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const filtered = q
    ? orders.filter(
        (o) =>
          (o.customer_name ?? '').toLowerCase().includes(q) ||
          (o.customer_phone ?? '').includes(q)
      )
    : orders

  return (
    <div>
      {/* Search by customer name or phone */}
      <div className="relative mb-4">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث بالاسم أو رقم الهاتف..."
          maxLength={60}
          className="w-full bg-white rounded-xl border border-gray-200 pr-10 pl-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400">لا توجد طلبات مطابقة لبحثك</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const date = new Date(order.created_at)
            const items = order.items as OrderItem[]
            const waReply = order.customer_phone
              ? `https://wa.me/${normalizeEgyptianNumber(order.customer_phone)}?text=${encodeURIComponent(
                  `مرحباً ${order.customer_name ?? ''}، بخصوص طلبك من ${storeName} 🛍️`
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
                      {formatPrice(order.total, currency)}
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
