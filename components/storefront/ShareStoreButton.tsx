'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export default function ShareStoreButton({ storeName, themeColor }: { storeName: string; themeColor: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href

    // Use native share sheet on mobile (Android/iOS), fallback to clipboard on desktop
    if (navigator.share) {
      await navigator.share({ title: storeName, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors"
      style={{ borderColor: `${themeColor}40`, color: themeColor }}
    >
      {copied ? <Check size={13} /> : <Share2 size={13} />}
      {copied ? 'تم النسخ!' : 'شارك المتجر'}
    </button>
  )
}
