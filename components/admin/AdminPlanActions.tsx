'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Action = 'grant' | 'extend' | 'revoke'

export default function AdminPlanActions({ storeId, isPro }: { storeId: string; isPro: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState<Action | null>(null)

  async function run(action: Action) {
    setLoading(action)
    const res = await fetch('/api/admin/set-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, action }),
    })
    setLoading(null)
    if (!res.ok) {
      toast.error('فشل تحديث الاشتراك')
      return
    }
    toast.success(
      action === 'revoke' ? 'تم إلغاء Pro' : action === 'extend' ? 'تم تمديد 30 يوم' : 'تم تفعيل Pro 30 يوم'
    )
    router.refresh()
  }

  const btn = 'text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50'

  return (
    <div className="flex items-center gap-1.5">
      {!isPro ? (
        <button onClick={() => run('grant')} disabled={loading !== null} className={`${btn} bg-green-600 text-white hover:bg-green-700`}>
          {loading === 'grant' ? '...' : 'تفعيل Pro'}
        </button>
      ) : (
        <>
          <button onClick={() => run('extend')} disabled={loading !== null} className={`${btn} bg-green-50 text-green-700 hover:bg-green-100`}>
            {loading === 'extend' ? '...' : '+٣٠ يوم'}
          </button>
          <button onClick={() => run('revoke')} disabled={loading !== null} className={`${btn} text-red-500 hover:bg-red-50`}>
            {loading === 'revoke' ? '...' : 'إلغاء'}
          </button>
        </>
      )}
    </div>
  )
}
