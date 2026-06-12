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
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
        current ? 'bg-green-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          current ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
