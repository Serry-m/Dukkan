'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { PRO_PRICE_EGP } from '@/lib/plan'

export default function UpgradeButton({ label }: { label?: string }) {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/paymob/checkout', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.iframeUrl) {
        toast.error('تعذّر بدء الدفع، حاول مرة أخرى')
        setLoading(false)
        return
      }
      // Redirect to Paymob's secure payment page.
      window.location.href = data.iframeUrl
    } catch {
      toast.error('حدث خطأ في الاتصال')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-base flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : null}
      {label ?? `الترقية إلى Pro — ${PRO_PRICE_EGP} جنيه/شهر`}
    </button>
  )
}
