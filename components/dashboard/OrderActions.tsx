'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { OrderStatus } from '@/types'
import { Check, Truck, Trash2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  orderId: string
  status: OrderStatus
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending:   { label: 'جديد',       className: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'تم التأكيد', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  delivered: { label: 'تم التسليم', className: 'bg-green-50 text-green-700 border-green-200' },
}

export default function OrderActions({ orderId, status }: Props) {
  const router = useRouter()
  const [current, setCurrent] = useState<OrderStatus>(status)
  const [loading, setLoading] = useState(false)

  async function setStatus(newStatus: OrderStatus) {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    if (!error) {
      setCurrent(newStatus)
      toast.success('تم تحديث حالة الطلب')
    }
    setLoading(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('حذف هذا الطلب نهائياً؟')) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('orders').delete().eq('id', orderId)
    toast.success('تم حذف الطلب')
    setLoading(false)
    router.refresh()
  }

  const badge = STATUS_CONFIG[current]

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Current status badge */}
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${badge.className}`}>
        {badge.label}
      </span>

      <div className="flex-1" />

      {/* Action buttons depending on current status */}
      {current === 'pending' && (
        <button
          onClick={() => setStatus('confirmed')}
          disabled={loading}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <Check size={13} /> تأكيد
        </button>
      )}
      {current === 'confirmed' && (
        <button
          onClick={() => setStatus('delivered')}
          disabled={loading}
          className="flex items-center gap-1 text-xs font-medium text-green-600 hover:bg-green-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <Truck size={13} /> تم التسليم
        </button>
      )}
      {current === 'delivered' && (
        <button
          onClick={() => setStatus('pending')}
          disabled={loading}
          className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCcw size={13} /> إعادة فتح
        </button>
      )}

      <button
        onClick={handleDelete}
        disabled={loading}
        className="flex items-center justify-center w-7 h-7 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        aria-label="حذف الطلب"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
