import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      {/* Sidebar — hidden on mobile, visible on lg+ */}
      <div className="hidden lg:block">
        <DashboardSidebar userEmail={user.email ?? ''} />
      </div>

      {/* Main content — add bottom padding on mobile so content isn't hidden behind nav */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto pb-20 lg:pb-8">
        {children}
      </main>

      {/* Bottom nav — visible on mobile only */}
      <MobileNav />
    </div>
  )
}
