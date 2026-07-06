'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

const DURATIONS = [
  { d: 30, l: '٣٠ يوم' },
  { d: 90, l: '٩٠ يوم' },
  { d: 365, l: 'سنة كاملة' },
]

export default function AdminPlanActions({ storeId, isPro }: { storeId: string; isPro: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function run(action: 'grant' | 'extend' | 'revoke', days?: number) {
    setLoading(true)
    const res = await fetch('/api/admin/set-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, action, days }),
    })
    setLoading(false)
    if (!res.ok) {
      toast.error('فشل تحديث الاشتراك')
      return
    }
    toast.success(
      action === 'revoke' ? 'تم إلغاء Pro'
      : action === 'extend' ? `تم التمديد ${days} يوم`
      : `تم تفعيل Pro ${days} يوم`
    )
    router.refresh()
  }

  const btn = 'text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50'

  return (
    <div className="flex items-center gap-1.5">
      {!isPro ? (
        <DropdownMenu>
          <DropdownMenuTrigger disabled={loading} className={`${btn} bg-green-600 text-white hover:bg-green-700 inline-flex items-center gap-1`}>
            {loading ? '...' : 'تفعيل Pro'} <ChevronDown size={12} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {DURATIONS.map((x) => (
              <DropdownMenuItem key={x.d} onClick={() => run('grant', x.d)}>{x.l}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger disabled={loading} className={`${btn} bg-green-50 text-green-700 hover:bg-green-100 inline-flex items-center gap-1`}>
              {loading ? '...' : 'تمديد'} <ChevronDown size={12} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {DURATIONS.map((x) => (
                <DropdownMenuItem key={x.d} onClick={() => run('extend', x.d)}>+ {x.l}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button onClick={() => run('revoke')} disabled={loading} className={`${btn} text-red-500 hover:bg-red-50`}>إلغاء</button>
        </>
      )}
    </div>
  )
}
