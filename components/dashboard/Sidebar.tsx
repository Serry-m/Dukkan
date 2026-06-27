'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Package, Store, LogOut, ShoppingBag, Ticket, Users, Shield } from 'lucide-react'
import { BrandMark } from '@/components/BrandMark'

const navItems = [
  { href: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'المنتجات', icon: Package },
  { href: '/dashboard/orders', label: 'الطلبات', icon: ShoppingBag },
  { href: '/dashboard/customers', label: 'العملاء', icon: Users },
  { href: '/dashboard/coupons', label: 'أكواد الخصم', icon: Ticket },
  { href: '/dashboard/store', label: 'إعدادات المتجر', icon: Store },
]

export default function DashboardSidebar({
  userEmail,
  isAdmin,
  pro,
}: {
  userEmail: string
  isAdmin?: boolean
  pro?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-[#FBFAF7] border-l border-[#ECE7DC] flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5 flex items-center gap-2.5">
        <BrandMark size={32} className="rounded-[10px]" />
        <span className="font-extrabold text-[#1d1b16] text-lg">دكان</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3.5 overflow-y-auto">
        <p className="text-[11px] font-bold text-[#a8a193] tracking-wider px-3 pt-1 pb-2.5">القائمة</p>
        <div className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors',
                  active
                    ? 'bg-[#16a34a] text-white font-bold shadow-[0_6px_16px_rgba(22,163,74,0.22)]'
                    : 'text-[#74716a] font-semibold hover:bg-[#F4F0E8] hover:text-[#1d1b16]'
                )}
              >
                <Icon size={19} strokeWidth={active ? 2.2 : 1.9} />
                {label}
              </Link>
            )
          })}

          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors mt-1.5 border-t border-[#ECE7DC] pt-3.5',
                pathname === '/admin' ? 'text-[#15803d]' : 'text-[#74716a] hover:bg-[#F4F0E8] hover:text-[#1d1b16]'
              )}
            >
              <Shield size={19} />
              لوحة الإدارة
            </Link>
          )}
        </div>

        {/* Upgrade card — free plans only */}
        {!pro && (
          <div className="mt-5 bg-[#F4F0E8] border border-[#ECE7DC] rounded-2xl p-3.5">
            <p className="font-extrabold text-[13.5px] text-[#1d1b16] mb-1">أنت على الخطة المجانية</p>
            <p className="text-[12.5px] text-[#74716a] leading-relaxed mb-3">ترقَّ إلى برو لمنتجات بلا حدود وتقارير أعمق.</p>
            <Link
              href="/dashboard/upgrade"
              className="block text-center bg-white text-[#15803d] border border-[#bfe3c8] rounded-[10px] py-2 font-bold text-[13px] hover:bg-[#EAF6EC] transition-colors"
            >
              ترقية إلى برو
            </Link>
          </div>
        )}
      </nav>

      {/* User area */}
      <div className="px-4 py-4 border-t border-[#ECE7DC]">
        <p className="text-xs text-[#9a9488] mb-2 truncate">{userEmail}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full text-sm font-medium text-[#74716a] hover:text-red-600 transition-colors"
        >
          <LogOut size={16} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}
