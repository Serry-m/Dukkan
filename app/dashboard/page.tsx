import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { ExternalLink, Package, Store } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user!.id)
    .single()

  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', store?.id ?? '')

  if (!store) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-5xl mb-4">🏪</div>
        <h1 className="text-2xl font-bold mb-2">أهلاً بك!</h1>
        <p className="text-gray-500 mb-6">ابدأ بإنشاء متجرك الأول على واتساب</p>
        <Link href="/dashboard/store" className={cn(buttonVariants(), 'bg-green-600 hover:bg-green-700')}>
          إنشاء متجري
        </Link>
      </div>
    )
  }

  const storeUrl = `/store/${store.slug}`

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">مرحباً 👋</h1>

      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="pt-5">
          <p className="text-sm text-green-700 mb-1">رابط متجرك</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono text-green-900 bg-white rounded px-3 py-2 border border-green-200 truncate">
              /store/{store.slug}
            </code>
            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'border-green-300 text-green-700')}
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Package size={16} /> المنتجات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{productCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Store size={16} /> اسم المتجر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold truncate">{store.name}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
