'use client'

import { Download } from 'lucide-react'

type Customer = { name: string | null; phone: string; orders: number; total: number; last: string }

// Download the customer list as CSV (for the merchant's own records / re-marketing).
export default function CustomerExport({ customers, storeName }: { customers: Customer[]; storeName: string }) {
  function exportCsv() {
    const header = ['الاسم', 'الهاتف', 'عدد الطلبات', 'الإجمالي', 'آخر طلب']
    const rows = customers.map((c) => [
      (c.name ?? '').replace(/"/g, '""'),
      c.phone,
      c.orders,
      c.total,
      new Date(c.last).toISOString().slice(0, 10),
    ])
    const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    // BOM so Excel reads Arabic correctly.
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${storeName}-customers.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={exportCsv}
      className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-white ring-1 ring-gray-200 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
    >
      <Download size={15} /> تصدير
    </button>
  )
}
