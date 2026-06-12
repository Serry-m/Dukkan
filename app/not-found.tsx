import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4" dir="rtl">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">الصفحة غير موجودة</h1>
      <p className="text-gray-400 mb-8 max-w-xs">
        تأكد من الرابط أو ابحث عن المتجر مرة أخرى
      </p>
      <Link href="/" className={cn(buttonVariants(), 'bg-green-600 hover:bg-green-700 px-8')}>
        العودة للرئيسية
      </Link>
    </div>
  )
}
