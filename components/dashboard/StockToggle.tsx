'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Props = {
  productId: string
  inStock: boolean
}

export default function StockToggle({ productId, inStock }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState(inStock)

  async function handleToggle() {
    setLoading(true)
    const supabase = createClient()
    const newValue = !current
    await supabase.from('products').update({ in_stock: newValue }).eq('id', productId)
    setCurrent(newValue)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed ${
        current ? 'bg-green-500' : 'bg-gray-200'
      }`}
    >
      {/* Thumb — absolutely positioned to stay inside the track */}
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 flex items-center justify-center ${
          current ? 'translate-x-6' : 'translate-x-1'
        }`}
      >
        {loading && (
          <span className="block h-2.5 w-2.5 rounded-full border-[1.5px] border-gray-300 border-t-gray-500 animate-spin" />
        )}
      </span>
    </button>
  )
}
