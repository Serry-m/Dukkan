'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Counts a store view at most once per browser per 24h, and only for real
// visitors (runs in the browser, so bots without JS don't inflate it).
export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `dukkan-viewed-${slug}`
    const last = localStorage.getItem(key)
    const now = Date.now()
    const DAY = 24 * 60 * 60 * 1000

    if (last && now - Number(last) < DAY) return

    localStorage.setItem(key, String(now))
    createClient().rpc('increment_store_views', { store_slug: slug }).then(() => {})
  }, [slug])

  return null
}
