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

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#FBFAF7] border-t border-[#ECE7DC] flex lg:hidden pb-[max(0px,env(safe-area-inset-bottom))]">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors',
              active ? 'text-[#15803d] font-bold' : 'text-[#9a9488] hover:text-[#74716a]'
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
            <span className="text-[10px]">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
