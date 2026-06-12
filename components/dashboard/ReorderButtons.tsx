'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronUp, ChevronDown } from 'lucide-react'

type Props = {
  productId: string
  sortOrder: number
  isFirst: boolean
  isLast: boolean
  prevId: string | null
  prevOrder: number | null
  nextId: string | null
  nextOrder: number | null
}

export default function ReorderButtons({ productId, sortOrder, isFirst, isLast, prevId, prevOrder, nextId, nextOrder }: Props) {
  const router = useRouter()

  async function moveUp() {
    if (!prevId || prevOrder === null) return
    const supabase = createClient()
    // Swap sort_order with the item above
    await supabase.from('products').update({ sort_order: prevOrder }).eq('id', productId)
    await supabase.from('products').update({ sort_order: sortOrder }).eq('id', prevId)
    router.refresh()
  }

  async function moveDown() {
    if (!nextId || nextOrder === null) return
    const supabase = createClient()
    await supabase.from('products').update({ sort_order: nextOrder }).eq('id', productId)
    await supabase.from('products').update({ sort_order: sortOrder }).eq('id', nextId)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        onClick={moveUp}
        disabled={isFirst}
        className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronUp size={14} />
      </button>
      <button
        onClick={moveDown}
        disabled={isLast}
        className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronDown size={14} />
      </button>
    </div>
  )
}
