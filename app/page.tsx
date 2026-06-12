import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-4 text-center" dir="rtl">
      <div className="text-6xl mb-4">🛍️</div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
        متجرك على واتساب
      </h1>
      <p className="text-lg text-gray-500 max-w-sm mb-8">
        أنشئ متجرك الإلكتروني في دقائق وابدأ البيع عبر واتساب مباشرة — بدون رسوم مخفية
      </p>
      <div className="flex gap-3">
        <Link href="/signup" className={cn(buttonVariants(), 'bg-green-600 hover:bg-green-700 px-6 h-11')}>
          ابدأ مجاناً
        </Link>
        <Link href="/login" className={cn(buttonVariants({ variant: 'outline' }), 'px-6 h-11')}>
          تسجيل الدخول
        </Link>
      </div>
      <p className="mt-12 text-xs text-gray-300">
        مثال: /store/mahmoud-shop
      </p>
    </div>
  )
}
