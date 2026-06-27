'use client'

// Mobile bottom navigation — shown on small screens instead of the sidebar.
// Stays fixed at the bottom like a native app tab bar.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Store, ShoppingBag, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'المنتجات', icon: Package },
  { href: '/dashboard/orders', label: 'الطلبات', icon: ShoppingBag },
  { href: '/dashboard/customers', label: 'العملاء', icon: Users },
  { href: '/dashboard/store', label: 'المتجر', icon: Store },
]

export default function MobileNav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname()

  return (
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
    </nav>
  )
}
