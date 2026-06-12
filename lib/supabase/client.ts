// Browser-side Supabase client.
// Used in Client Components ("use client") for things like
// auth sign-in, sign-up, and real-time subscriptions.
// createBrowserClient keeps the session in localStorage automatically.

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
