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
    <div className="max-w-[1120px] mx-auto">
      <div className="mb-5">
        <h1 className="text-[26px] font-extrabold tracking-tight text-[#1d1b16]">إعدادات المتجر</h1>
        <p className="text-[#74716a] text-sm mt-1">عدّل بيانات متجرك وطرق الدفع والتوصيل والمظهر.</p>
      </div>
      <StoreSettingsForm store={store} userId={user!.id} />
    </div>
  )
}
