import type { Store } from '@/types'

// ── Plan configuration ──
export const PRO_PRICE_EGP = 149          // monthly Pro price
export const FREE_PRODUCT_LIMIT = 15      // max products on the free plan
export const PRO_DURATION_DAYS = 30       // days of Pro granted per payment

// True when the store has an active Pro subscription.
export function isPro(store: Pick<Store, 'plan' | 'plan_expires_at'> | null | undefined): boolean {
  if (!store) return false
  if (store.plan !== 'pro') return false
  if (!store.plan_expires_at) return false
  return new Date(store.plan_expires_at).getTime() > Date.now()
}

// Pro features marketed on the upgrade page.
export const PRO_FEATURES = [
  'منتجات بلا حدود (الخطة المجانية حتى ١٥ منتج)',
  'إزالة شعار «صُنع بواسطة دكان» من متجرك',
  'لوحة التحليلات: الزيارات والأكثر طلباً',
  'خيارات المنتج (مقاسات وألوان)',
  'حتى ٣ صور لكل منتج',
  'التصنيفات ورسوم التوصيل وصورة الغلاف',
]
