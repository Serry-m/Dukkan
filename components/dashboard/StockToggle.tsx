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
      aria-label={current ? 'متاح — اضغط لإيقاف' : 'نفد — اضغط لتفعيل'}
      className="flex items-center gap-2 group disabled:cursor-not-allowed"
    >
      {/* Label */}
      <span className={`text-xs font-medium transition-colors ${current ? 'text-green-600' : 'text-gray-400'}`}>
        {current ? 'متاح' : 'نفد'}
      </span>

      {/* Track */}
      <div
        className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-all duration-200 ${
          current
            ? 'bg-green-500 border-green-500'
            : 'bg-gray-200 border-gray-200'
        } ${loading ? 'opacity-60' : 'group-hover:brightness-95'}`}
      >
        {/* Thumb */}
        <span
          className={`inline-flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 ${
            current ? 'translate-x-[22px]' : 'translate-x-[2px]'
          }`}
        >
          {/* Spinner inside thumb when loading */}
          {loading && (
            <span className="block h-2.5 w-2.5 rounded-full border-[1.5px] border-gray-300 border-t-gray-500 animate-spin" />
          )}
        </span>
      </div>
    </button>
  )
}
