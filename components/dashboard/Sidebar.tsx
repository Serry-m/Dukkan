'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Package, Store, LogOut, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/dashboard/store', label: 'إعدادات المتجر', icon: Store },
  { href: '/dashboard/products', label: 'المنتجات', icon: Package },
  { href: '/dashboard/orders', label: 'الطلبات', icon: ShoppingBag },
]

export default function DashboardSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-white border-l border-gray-200 flex flex-col shadow-sm">
      {/* Logo area */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛍️</span>
          <span className="font-bold text-gray-900 text-lg">ستور واتساب</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-green-50 text-green-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User area at bottom */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-2 truncate">{userEmail}</p>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-600 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut size={16} className="ml-2" />
          تسجيل الخروج
        </Button>
      </div>
    </aside>
  )
}
