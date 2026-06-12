// Store settings page — owner configures brand name, slug, WhatsApp number, logo.
// Runs on server to pre-load current settings, then StoreSettingsForm handles edits.

import { createClient } from '@/lib/supabase/server'
import StoreSettingsForm from '@/components/dashboard/StoreSettingsForm'

export default async function StoreSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user!.id)
    .single()

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">إعدادات المتجر</h1>
      <p className="text-gray-500 text-sm mb-6">اسم المتجر وواتساب والرابط المميز</p>
      <StoreSettingsForm store={store} userId={user!.id} />
    </div>
  )
}
