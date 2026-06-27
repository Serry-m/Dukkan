import { createClient } from '@/lib/supabase/server'
import CustomersView from '@/components/dashboard/CustomersView'
import type { OrderItem, OrderStatus } from '@/types'

export type CustomerRecord = {
  phone: string
  name: string
  city: string
  ordersCount: number
  total: number
  lastIso: string
  firstIso: string
  vip: boolean
  history: { id: string; items: OrderItem[]; status: OrderStatus; total: number; created_at: string }[]
}

// Best-effort "city" from the free-text address (last comma-separated part = governorate).
function cityFromAddress(addr: string | null): string {
  if (!addr) return '—'
  const parts = addr.split(/[،,]/).map((s) => s.trim()).filter(Boolean)
  return parts.length ? parts[parts.length - 1] : '—'
}

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('id, name, currency')
    .eq('owner_id', user!.id)
    .single()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, customer_name, customer_phone, customer_address, items, total, status, created_at')
    .eq('store_id', store?.id ?? '')
    .order('created_at', { ascending: false })

  // Aggregate unique customers by phone (orders arrive newest-first).
  const map = new Map<string, CustomerRecord>()
  for (const o of orders ?? []) {
    if (!o.customer_phone) continue
    let e = map.get(o.customer_phone)
    if (!e) {
      e = {
        phone: o.customer_phone,
        name: o.customer_name?.trim() || 'عميل',
        city: cityFromAddress(o.customer_address),
        ordersCount: 0, total: 0, lastIso: o.created_at, firstIso: o.created_at, vip: false, history: [],
      }
      map.set(o.customer_phone, e)
    }
    e.ordersCount += 1
    e.total += Number(o.total)
    if (new Date(o.created_at) < new Date(e.firstIso)) e.firstIso = o.created_at
    e.history.push({ id: o.id, items: (o.items ?? []) as OrderItem[], status: (o.status ?? 'pending') as OrderStatus, total: Number(o.total), created_at: o.created_at })
  }
  const customers = [...map.values()]
  customers.forEach((c) => { c.vip = c.ordersCount >= 5 || c.total >= 3000 })

  return <CustomersView customers={customers} storeName={store?.name ?? ''} currency={store?.currency ?? 'EGP'} />
}
