'use client'

import { Download } from 'lucide-react'
import type { Order, OrderItem } from '@/types'

const STATUS_AR: Record<string, string> = { pending: 'جديد', confirmed: 'مؤكد', delivered: 'مسلّم' }

// Download all orders as CSV — the records merchants keep in a notebook today.
export default function OrderExport({ orders, storeName }: { orders: Order[]; storeName: string }) {
  function exportCsv() {
    const header = ['التاريخ', 'العميل', 'الهاتف', 'العنوان', 'المنتجات', 'كود الخصم', 'الإجمالي', 'الحالة']
    const rows = orders.map((o) => {
      const items = (o.items as OrderItem[] ?? []).map((i) => `${i.quantity}x ${i.name}`).join(' | ')
      return [
        new Date(o.created_at).toISOString().slice(0, 10),
        o.customer_name ?? '',
        o.customer_phone ?? '',
        o.customer_address ?? '',
        items,
        o.coupon_code ?? '',
        o.total,
        STATUS_AR[o.status] ?? o.status,
      ]
    })
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${storeName}-orders.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={exportCsv}
      className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-white ring-1 ring-gray-200 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors flex-shrink-0"
    >
      <Download size={15} /> تصدير
    </button>
  )
}
