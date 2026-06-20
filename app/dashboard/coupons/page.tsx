import { createClient } from '@/lib/supabase/server'
import { isPro } from '@/lib/plan'
import { ProUpsell } from '@/components/dashboard/ProLock'
import CouponsManager from '@/components/dashboard/CouponsManager'
import type { Coupon } from '@/types'

export default async function CouponsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('id, currency, plan, plan_expires_at')
    .eq('owner_id', user!.id)
    .single()

  const pro = isPro(store)

  let coupons: Coupon[] = []
  const usageByCode: Record<string, number> = {}
  if (store && pro) {
    const { data } = await supabase.from('coupons').select('*').eq('store_id', store.id).order('created_at', { ascending: false })
    coupons = (data ?? []) as Coupon[]

    // Tally how many orders used each code.
    const { data: usedCodes } = await supabase.from('orders').select('coupon_code').eq('store_id', store.id)
    for (const o of usedCodes ?? []) {
      if (o.coupon_code) usageByCode[o.coupon_code] = (usageByCode[o.coupon_code] ?? 0) + 1
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">أكواد الخصم</h1>
        <p className="text-sm text-gray-500">أنشئ أكواداً يستخدمها عملاؤك عند الطلب</p>
      </div>

      {!pro ? (
        <ProUpsell feature="أكواد الخصم" />
      ) : store ? (
        <CouponsManager storeId={store.id} currency={store.currency} coupons={coupons} usage={usageByCode} />
      ) : (
        <p className="text-sm text-gray-400">أنشئ متجرك أولاً.</p>
      )}
    </div>
  )
}
