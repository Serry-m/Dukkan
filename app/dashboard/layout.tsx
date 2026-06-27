import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { isPro } from '@/lib/plan'
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
    .select('name, slug, plan, plan_expires_at')
    .eq('owner_id', user.id)
    .single()

  const pro = store ? isPro(store) : false

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFAF7] text-[#1d1b16]" dir="rtl">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-5 h-[60px] flex-shrink-0 border-b border-[#ECE7DC] bg-[#FBFAF7]/90 backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-[10px] bg-[#16a34a] text-white font-extrabold text-lg flex items-center justify-center flex-shrink-0 shadow-[0_3px_8px_rgba(22,163,74,0.25)]">
            {store?.name?.trim().charAt(0) ?? 'د'}
          </div>
          <div className="min-w-0 flex items-center gap-2">
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
          <DashboardSidebar userEmail={user.email ?? ''} isAdmin={admin} pro={pro} />
        </div>

        <main className="flex-1 min-w-0 p-4 lg:p-8 overflow-auto pb-20 lg:pb-8">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
