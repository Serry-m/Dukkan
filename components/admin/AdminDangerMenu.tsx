'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MoreVertical, Ban, RotateCcw, Trash2, UserX } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

type Confirmable = 'suspend' | 'delete' | 'delete-account'

const COPY: Record<Confirmable, { title: string; desc: (n: string) => string; confirm: string }> = {
  suspend: {
    title: 'تعليق المتجر',
    desc: (n) => `سيختفي متجر «${n}» من العرض العام فوراً (تُحفظ البيانات). يمكنك إلغاء التعليق لاحقاً.`,
    confirm: 'تعليق',
  },
  delete: {
    title: 'حذف المتجر',
    desc: (n) => `حذف متجر «${n}» وكل منتجاته وطلباته نهائياً. لا يمكن التراجع. (يبقى حساب المالك).`,
    confirm: 'حذف المتجر',
  },
  'delete-account': {
    title: 'حذف حساب المالك',
    desc: (n) => `حذف حساب مالك «${n}» وكل بياناته (المتجر، المنتجات، الطلبات) نهائياً. لا يمكن التراجع.`,
    confirm: 'حذف الحساب',
  },
}

export default function AdminDangerMenu({
  storeId,
  storeName,
  suspended,
}: {
  storeId: string
  storeName: string
  suspended: boolean
}) {
  const router = useRouter()
  const [confirm, setConfirm] = useState<Confirmable | null>(null)
  const [loading, setLoading] = useState(false)

  async function run(action: 'suspend' | 'unsuspend' | 'delete' | 'delete-account') {
    setLoading(true)
    const res = await fetch('/api/admin/store-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, action }),
    })
    setLoading(false)
    setConfirm(null)
    if (!res.ok) {
      toast.error('فشل تنفيذ الإجراء')
      return
    }
    toast.success(
      action === 'unsuspend' ? 'تم إلغاء التعليق'
      : action === 'suspend' ? 'تم تعليق المتجر'
      : action === 'delete' ? 'تم حذف المتجر'
      : 'تم حذف الحساب'
    )
    router.refresh()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="إجراءات إدارية"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <MoreVertical size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          {suspended ? (
            <DropdownMenuItem onClick={() => run('unsuspend')}>
              <RotateCcw size={14} /> إلغاء التعليق
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setConfirm('suspend')}>
              <Ban size={14} /> تعليق المتجر
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirm('delete')}>
            <Trash2 size={14} /> حذف المتجر
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setConfirm('delete-account')}>
            <UserX size={14} /> حذف حساب المالك
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent showCloseButton={false} dir="rtl" className="text-right">
          {confirm && (
            <>
              <DialogHeader>
                <DialogTitle>{COPY[confirm].title}</DialogTitle>
                <DialogDescription>{COPY[confirm].desc(storeName)}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirm(null)} disabled={loading}>
                  إلغاء
                </Button>
                <Button
                  onClick={() => run(confirm)}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {loading ? '...' : COPY[confirm].confirm}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
