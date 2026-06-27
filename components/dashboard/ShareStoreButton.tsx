'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'sonner'

// "شارك متجرك" — uses the native share sheet (great for sending the link straight
// to WhatsApp/Instagram on mobile) and falls back to copying the link on desktop.
export default function ShareStoreButton({ slug, storeName }: { slug: string; storeName: string }) {
  async function share() {
    const url = `${window.location.origin}/store/${slug}`
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: storeName, text: `تسوّق من ${storeName} على دكان 🛍️`, url })
        return
      } catch {
        return // user dismissed the share sheet
      }
    }
    await navigator.clipboard.writeText(url)
    toast.success('تم نسخ رابط المتجر')
  }

  return (
    <button
      onClick={share}
      className="inline-flex items-center gap-2 bg-white text-[#1d1b16] border border-[#ECE7DC] font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-[#F4F0E8] transition-colors"
    >
      <Share2 size={16} /> شارك متجرك
    </button>
  )
}
