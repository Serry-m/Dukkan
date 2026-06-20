'use client'

import { Copy } from 'lucide-react'
import { toast } from 'sonner'

// Quick copy for the delivery address — merchants paste it into a delivery app.
export default function CopyAddressButton({ text }: { text: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('تم نسخ العنوان')
    } catch {
      toast.error('تعذّر النسخ')
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="نسخ العنوان"
      className="mr-auto text-gray-400 hover:text-green-600 transition-colors flex-shrink-0"
    >
      <Copy size={13} />
    </button>
  )
}
