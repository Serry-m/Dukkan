'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', productId)
    toast.success('تم حذف المنتج')
    router.refresh()
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      className="text-red-400 hover:text-red-600 hover:bg-red-50"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 size={15} />
    </Button>
  )
}
