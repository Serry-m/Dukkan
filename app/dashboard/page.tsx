import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { Package, Store, ShoppingBag, Eye, TrendingUp, Check, ArrowLeft, Crown } from 'lucide-react'
import ShareButton from '@/components/dashboard/ShareButton'
import { isPro, FREE_PRODUCT_LIMIT } from '@/lib/plan'
import type { OrderItem } from '@/types'

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

  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', store?.id ?? '')

  // Aggregate top-selling products from order items.
  const { data: orderRows } = await supabase
    .from('orders')
    .select('items')
    .eq('store_id', store?.id ?? '')

  const productTally = new Map<string, number>()
  for (const row of orderRows ?? []) {
    for (const item of (row.items as OrderItem[]) ?? []) {
      productTally.set(item.name, (productTally.get(item.name) ?? 0) + item.quantity)
    }
  }
  const topProducts = Array.from(productTally.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  if (!store) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Store size={30} className="text-green-700" />
        </div>
        <h1 className="text-2xl font-bold mb-2">أهلاً بك</h1>
        <p className="text-gray-500 mb-6">ابدأ بإنشاء متجرك الأول على واتساب</p>
        <Link href="/dashboard/store" className={cn(buttonVariants(), 'bg-green-600 hover:bg-green-700')}>
          إنشاء متجري
        </Link>
      </div>
    )
  }

  // Onboarding state
  const hasWhatsapp = !!store.whatsapp_number?.trim()
  const hasProduct = (productCount ?? 0) > 0
  const setupComplete = hasWhatsapp && hasProduct
  const steps = [
    { done: true, label: 'إنشاء المتجر', href: '/dashboard/store' },
    { done: hasWhatsapp, label: 'ربط رقم الواتساب', href: '/dashboard/store' },
    { done: hasProduct, label: 'إضافة أول منتج', href: '/dashboard/products/new' },
  ]
  const doneCount = steps.filter((s) => s.done).length

  const pro = isPro(store)

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">مرحباً</h1>

      {/* Plan banner */}
      {pro ? (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white px-4 py-3">
          <Crown size={18} />
          <span className="font-bold text-sm">خطة Pro نشطة</span>
          <Link href="/dashboard/upgrade" className="mr-auto text-xs text-green-100 hover:text-white underline">
            التفاصيل
          </Link>
        </div>
      ) : (
        <Link
          href="/dashboard/upgrade"
          className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 hover:bg-green-100/70 transition-colors"
        >
          <Crown size={18} className="text-green-700 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-green-800">الخطة المجانية</p>
            <p className="text-xs text-green-700/80">
              {(productCount ?? 0).toLocaleString('ar-EG')} / {FREE_PRODUCT_LIMIT.toLocaleString('ar-EG')} منتج · رقّ إلى Pro لإزالة الحدود
            </p>
          </div>
          <span className="text-xs font-bold text-green-700 flex-shrink-0">ترقية ←</span>
        </Link>
      )}

      {/* Onboarding checklist — shown until the store is set up */}
      {!setupComplete && (
        <Card className="mb-6 border-green-100">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-gray-900">أكمل إعداد متجرك</p>
              <span className="text-xs text-gray-400">{doneCount.toLocaleString('ar-EG')} من {steps.length.toLocaleString('ar-EG')}</span>
            </div>
            <div className="space-y-2">
              {steps.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                    s.done ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                  )}
                >
                  <span className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                    s.done ? 'bg-green-600' : 'border-2 border-gray-300'
                  )}>
                    {s.done && <Check size={14} className="text-white" />}
                  </span>
                  <span className={cn('flex-1 text-sm font-medium', s.done ? 'text-green-700 line-through' : 'text-gray-700')}>
                    {s.label}
                  </span>
                  {!s.done && <ArrowLeft size={15} className="text-gray-400" />}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Store URL card with share button */}
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="pt-5">
          <p className="text-sm text-green-700 mb-2">رابط متجرك</p>
          <div className="flex items-center gap-2 flex-wrap">
            <code className="flex-1 text-sm font-mono text-green-900 bg-white rounded px-3 py-2 border border-green-200 truncate min-w-0">
              /store/{store.slug}
            </code>
            <ShareButton slug={store.slug} />
            <a
              href={`/store/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'border-green-300 text-green-700 flex-shrink-0')}
            >
              معاينة
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <Eye size={14} /> الزيارات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{(store.view_count ?? 0).toLocaleString('ar-EG')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <ShoppingBag size={14} /> الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{(orderCount ?? 0).toLocaleString('ar-EG')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <Package size={14} /> المنتجات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{(productCount ?? 0).toLocaleString('ar-EG')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top products */}
      {topProducts.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-green-600" /> الأكثر طلباً
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {topProducts.map(([productName, qty], i) => (
              <div key={productName} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-green-50 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {(i + 1).toLocaleString('ar-EG')}
                </span>
                <span className="flex-1 text-sm text-gray-700 truncate">{productName}</span>
                <span className="text-sm font-bold text-gray-900">{qty.toLocaleString('ar-EG')}</span>
                <span className="text-xs text-gray-400">مرة</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
