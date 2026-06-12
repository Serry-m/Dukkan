// Dashboard layout wraps every /dashboard/* page.
// It runs on the server, checks the session, and renders the sidebar.
// If somehow an unauthenticated user gets here (bypassing middleware),
// we redirect them. The sidebar is shared across all dashboard pages.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <DashboardSidebar userEmail={user.email ?? ''} />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
