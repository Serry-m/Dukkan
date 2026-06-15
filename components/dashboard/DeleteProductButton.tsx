'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', productId)
    toast.success('تم حذف المنتج')
    router.refresh()
  }

  return (
    <ConfirmDialog
      title="حذف المنتج"
      description="هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء."
      confirmLabel="حذف"
      onConfirm={handleDelete}
      trigger={
        <Button
          size="icon"
          variant="ghost"
          className="text-red-400 hover:text-red-600 hover:bg-red-50"
          disabled={loading}
        >
          <Trash2 size={15} />
        </Button>
      }
    />
  )
}
