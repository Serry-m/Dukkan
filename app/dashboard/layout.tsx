import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { isPro } from '@/lib/plan'
import { storeTypeLabel } from '@/lib/store-types'
import { BrandMark } from '@/components/BrandMark'
import DashboardSidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const admin = isAdminEmail(user.email)

  // Lightweight store fetch for the top bar (identity + plan state).
  const { data: store } = await supabase
    .from('stores')
    .select('id, name, slug, plan, plan_expires_at, store_type')
    .eq('owner_id', user.id)
    .single()

  const pro = store ? isPro(store) : false

  // Pending-orders count drives the badge on the "الطلبات" nav item.
  let pendingCount = 0
  if (store?.id) {
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', store.id)
      .or('status.eq.pending,status.is.null')
    pendingCount = count ?? 0
  }

  return (
    <div
      className="flex flex-col min-h-screen bg-[#FBFAF7] text-[#1d1b16] font-sans"
      dir="rtl"
      // Warm-tint the gray ramp for the whole dashboard subtree so every inner page
      // (orders, products, settings, …) inherits the warm neutrals without per-file edits.
      // Scoped here — the storefront and landing are unaffected.
      style={{
        '--color-gray-50': '#F6F2EB',
        '--color-gray-100': '#F1ECE1',
        '--color-gray-200': '#ECE7DC',
        '--color-gray-300': '#DBD4C6',
        '--color-gray-400': '#A8A193',
        '--color-gray-500': '#74716A',
        '--color-gray-600': '#5F5C54',
        '--color-gray-700': '#4A4843',
        '--color-gray-800': '#2E2C27',
        '--color-gray-900': '#1D1B16',
      } as React.CSSProperties}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-5 h-[62px] flex-shrink-0 border-b border-[#ECE7DC] bg-[#FBFAF7]/90 backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <BrandMark size={36} className="rounded-[10px] flex-shrink-0 shadow-[0_3px_8px_rgba(22,163,74,0.22)]" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[15.5px] truncate">{store?.name ?? 'دكان'}</span>
              <span
                className={
                  pro
                    ? 'flex-shrink-0 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#D8F0DE] text-[#15803d]'
                    : 'flex-shrink-0 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#F4F0E8] text-[#74716a] border border-[#ECE7DC]'
                }
              >
                {pro ? 'برو' : 'مجاني'}
              </span>
            </div>
            {storeTypeLabel(store?.store_type) && (
              <span className="block text-[11.5px] text-[#9a9488] font-medium truncate leading-tight">{storeTypeLabel(store?.store_type)}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {store?.slug && (
            <a
              href={`/store/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-[13.5px] font-semibold text-[#74716a] hover:text-[#1d1b16] hover:bg-[#F4F0E8] px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <ExternalLink size={15} /> عرض المتجر
            </a>
          )}
          {!pro && (
            <Link
              href="/dashboard/upgrade"
              className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-[13.5px] px-4 py-2 rounded-[10px] shadow-[0_4px_12px_rgba(22,163,74,0.2)] transition-colors"
            >
              ترقية
            </Link>
          )}
        </div>
      </header>

      {/* Content row */}
      <div className="flex flex-1 min-h-0">
        <div className="hidden lg:block">
          <DashboardSidebar userEmail={user.email ?? ''} isAdmin={admin} pro={pro} pendingCount={pendingCount} />
        </div>

        <main className="flex-1 min-w-0 p-4 lg:p-8 overflow-auto pb-20 lg:pb-8">
          {children}
        </main>
      </div>

      <MobileNav pendingCount={pendingCount} />
    </div>
  )
}
