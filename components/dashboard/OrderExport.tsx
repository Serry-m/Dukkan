'use client'

import { Download } from 'lucide-react'
import type { Order, OrderItem } from '@/types'

const STATUS_AR: Record<string, string> = { pending: 'جديد', confirmed: 'مؤكد', delivered: 'مسلّم' }

// One CSV cell. Quotes the value (doubling internal quotes) AND neutralizes
// spreadsheet formula injection: a cell that starts with = + - @ (or a control
// char) is evaluated as a formula by Excel/Sheets, so a customer who types
// =HYPERLINK(...) as their name could run it on the merchant's machine. Prefix
// such values with a single quote so they're treated as plain text.
function csvCell(v: unknown): string {
  let s = String(v ?? '')
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

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
      .map((r) => r.map(csvCell).join(','))
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
