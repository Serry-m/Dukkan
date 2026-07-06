'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Crown } from 'lucide-react'

// Grant/revoke Pro for an account that has NOT created a store yet. The grant is
// parked (pending_pro) and auto-applied by a DB trigger when they create it.
export default function AdminAccountPro({ userId, pending }: { userId: string; pending: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function run(action: 'grant' | 'revoke') {
    setLoading(true)
    const res = await fetch('/api/admin/set-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action }),
    })
    setLoading(false)
    if (!res.ok) { toast.error('فشل تحديث الاشتراك — تأكد من تشغيل migration v24'); return }
    toast.success(action === 'grant' ? 'تم تفعيل Pro — سيُطبَّق فور إنشاء المتجر' : 'تم إلغاء التفعيل')
    router.refresh()
  }

  const btn = 'text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50'

  if (pending) {
    return (
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded flex items-center gap-1"><Crown size={9} /> Pro بانتظار الإنشاء</span>
        <button onClick={() => run('revoke')} disabled={loading} className={`${btn} text-red-500 hover:bg-red-50`}>
          {loading ? '...' : 'إلغاء'}
        </button>
      </div>
    )
  }
  return (
    <button onClick={() => run('grant')} disabled={loading} className={`${btn} bg-green-600 text-white hover:bg-green-700 flex-shrink-0`}>
      {loading ? '...' : 'تفعيل Pro'}
    </button>
  )
}
