'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Crown, ChevronDown, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const DURATIONS = [
  { d: 30, l: '٣٠ يوم' },
  { d: 90, l: '٩٠ يوم' },
  { d: 365, l: 'سنة كاملة' },
]

// Controls for an account with NO store yet: grant Pro (parked until they create
// their store), revoke a pending grant, or delete the account (cleanup).
export default function AdminAccountPro({ userId, email, pending }: { userId: string; email: string; pending: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  async function setPlan(action: 'grant' | 'revoke', days?: number) {
    setLoading(true)
    const res = await fetch('/api/admin/set-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, days }),
    })
    setLoading(false)
    if (!res.ok) { toast.error('فشل — تأكد من تشغيل migration v24'); return }
    toast.success(action === 'grant' ? 'تم تفعيل Pro — سيُطبَّق فور إنشاء المتجر' : 'تم إلغاء التفعيل')
    router.refresh()
  }

  async function del() {
    setLoading(true)
    const res = await fetch('/api/admin/store-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'delete-account' }),
    })
    setLoading(false)
    setConfirmDel(false)
    if (!res.ok) { toast.error('فشل حذف الحساب'); return }
    toast.success('تم حذف الحساب')
    router.refresh()
  }

  const btn = 'text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50'

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      {pending ? (
        <>
          <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded flex items-center gap-1"><Crown size={9} /> Pro بانتظار الإنشاء</span>
          <button onClick={() => setPlan('revoke')} disabled={loading} className={`${btn} text-red-500 hover:bg-red-50`}>إلغاء</button>
        </>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger disabled={loading} className={`${btn} bg-green-600 text-white hover:bg-green-700 inline-flex items-center gap-1`}>
            {loading ? '...' : 'تفعيل Pro'} <ChevronDown size={12} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {DURATIONS.map((x) => (
              <DropdownMenuItem key={x.d} onClick={() => setPlan('grant', x.d)}>{x.l}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <button onClick={() => setConfirmDel(true)} aria-label="حذف الحساب" className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
        <Trash2 size={14} />
      </button>

      <Dialog open={confirmDel} onOpenChange={(o) => !o && setConfirmDel(false)}>
        <DialogContent showCloseButton={false} dir="rtl" className="text-right">
          <DialogHeader>
            <DialogTitle>حذف الحساب</DialogTitle>
            <DialogDescription>حذف حساب «{email || '—'}» نهائيًا. لا يمكن التراجع.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDel(false)} disabled={loading}>إلغاء</Button>
            <Button onClick={del} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">{loading ? '...' : 'حذف الحساب'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
