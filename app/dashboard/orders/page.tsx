import { createClient } from '@/lib/supabase/server'
import OrdersView from '@/components/dashboard/OrdersView'
import type { Order } from '@/types'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('id, currency, name')
    .eq('owner_id', user!.id)
    .single()

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', store?.id ?? '')
    .order('created_at', { ascending: false })

  return (
    <OrdersView
      orders={(orders ?? []) as Order[]}
      storeName={store?.name ?? ''}
      currency={store?.currency ?? 'EGP'}
    />
  )
}
