'use client'

// Mobile bottom navigation — shown on small screens instead of the sidebar.
// Stays fixed at the bottom like a native app tab bar. Four primary tabs plus a
// "More" sheet that holds the secondary destinations (settings, coupons, view
// store, admin) and logout — everything the sidebar offers on desktop.

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Package, ShoppingBag, Users, MoreHorizontal, Store, Ticket, ExternalLink, Shield, LogOut, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'المنتجات', icon: Package },
  { href: '/dashboard/orders', label: 'الطلبات', icon: ShoppingBag },
  { href: '/dashboard/customers', label: 'العملاء', icon: Users },
]

// Routes that live inside the "More" sheet — used to light up the More tab.
const moreRoutes = ['/dashboard/coupons', '/dashboard/store', '/admin']

export default function MobileNav({
  pendingCount = 0,
  userEmail = '',
  isAdmin = false,
  storeSlug,
}: {
  pendingCount?: number
  userEmail?: string
  isAdmin?: boolean
  storeSlug?: string | null
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [moreOpen, setMoreOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const moreActive = moreRoutes.some((r) => pathname === r)

  return (
    <>
      {/* More sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/30 dk-fade-in" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#FBFAF7] rounded-t-2xl border-t border-[#ECE7DC] pb-[max(12px,env(safe-area-inset-bottom))] dk-drawer-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <span className="font-extrabold text-[15px] text-[#1d1b16]">المزيد</span>
              <button onClick={() => setMoreOpen(false)} aria-label="إغلاق" className="w-8 h-8 rounded-full border border-[#ECE7DC] bg-white flex items-center justify-center text-[#74716a]">
                <X size={15} />
              </button>
            </div>

            <div className="px-3 py-2 space-y-1">
              <MoreLink href="/dashboard/store" icon={Store} label="إعدادات المتجر" active={pathname === '/dashboard/store'} onNav={() => setMoreOpen(false)} />
              <MoreLink href="/dashboard/coupons" icon={Ticket} label="كوبونات" active={pathname === '/dashboard/coupons'} onNav={() => setMoreOpen(false)} />
              {storeSlug && (
                <a
                  href={`/store/${storeSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-[#74716a] hover:bg-[#F4F0E8] hover:text-[#1d1b16] transition-colors"
                >
                  <ExternalLink size={19} /> عرض المتجر
                </a>
              )}
              {isAdmin && (
                <MoreLink href="/admin" icon={Shield} label="لوحة الإدارة" active={pathname === '/admin'} onNav={() => setMoreOpen(false)} />
              )}
            </div>

            <div className="px-3 pt-2 mt-1 border-t border-[#ECE7DC]">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-sm font-semibold text-[#74716a] hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={19} /> تسجيل الخروج
              </button>
              {userEmail && <p className="text-[11px] text-[#9a9488] px-3.5 pt-1 pb-1 truncate">{userEmail}</p>}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#FBFAF7] border-t border-[#ECE7DC] flex lg:hidden pb-[max(0px,env(safe-area-inset-bottom))]">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          const showBadge = href === '/dashboard/orders' && pendingCount > 0
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors',
                active ? 'text-[#15803d] font-bold' : 'text-[#9a9488] hover:text-[#74716a]'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
              {showBadge && (
                <span className="absolute top-1 left-1/2 mr-[6px] bg-[#16a34a] text-white text-[9px] font-extrabold min-w-[15px] h-[15px] flex items-center justify-center rounded-full px-1">
                  {pendingCount.toLocaleString('ar-EG')}
                </span>
              )}
              <span className="text-[10px]">{label}</span>
            </Link>
          )
        })}

        {/* More */}
        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            'relative flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors',
            moreActive ? 'text-[#15803d] font-bold' : 'text-[#9a9488] hover:text-[#74716a]'
          )}
        >
          <MoreHorizontal size={20} strokeWidth={moreActive ? 2.4 : 1.8} />
          <span className="text-[10px]">المزيد</span>
        </button>
      </nav>
    </>
  )
}

function MoreLink({ href, icon: Icon, label, active, onNav }: { href: string; icon: React.ComponentType<{ size?: number }>; label: string; active: boolean; onNav: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNav}
      className={cn(
        'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors',
        active ? 'bg-[#16a34a] text-white' : 'text-[#74716a] hover:bg-[#F4F0E8] hover:text-[#1d1b16]'
      )}
    >
      <Icon size={19} /> {label}
    </Link>
  )
}
