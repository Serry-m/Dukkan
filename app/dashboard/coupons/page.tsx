import { createClient } from '@/lib/supabase/server'
import { isPro } from '@/lib/plan'
import { ProUpsell } from '@/components/dashboard/ProLock'
import CouponsView from '@/components/dashboard/CouponsView'
import type { Coupon } from '@/types'

export default async function CouponsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('id, currency, plan, plan_expires_at')
    .eq('owner_id', user!.id)
    .single()

  if (!store) return <p className="max-w-[1180px] mx-auto text-sm text-[#9a9488]">أنشئ متجرك أولاً.</p>

  const pro = isPro(store)
  if (!pro) {
    return (
      <div className="max-w-[1180px] mx-auto">
        <div className="mb-6">
          <h1 className="text-[26px] font-extrabold tracking-tight">كوبونات</h1>
          <p className="text-[#74716a] text-sm mt-1">أنشئ أكواداً يستخدمها عملاؤك عند الطلب</p>
        </div>
        <ProUpsell feature="أكواد الخصم" />
      </div>
    )
  }

  const { data } = await supabase.from('coupons').select('*').eq('store_id', store.id).order('created_at', { ascending: false })
  const coupons = (data ?? []) as Coupon[]

  const { data: usedCodes } = await supabase.from('orders').select('coupon_code').eq('store_id', store.id)
  const usage: Record<string, number> = {}
  for (const o of usedCodes ?? []) { if (o.coupon_code) usage[o.coupon_code] = (usage[o.coupon_code] ?? 0) + 1 }

  return <CouponsView storeId={store.id} currency={store.currency} coupons={coupons} usage={usage} />
}
