import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default function StoreNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4" dir="rtl">
      <div className="text-6xl mb-4">🏪</div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">المتجر غير موجود</h1>
      <p className="text-gray-400 mb-2 max-w-xs">
        تأكد من الرابط أو تواصل مع صاحب المتجر للحصول على الرابط الصحيح
      </p>
      <p className="text-xs text-gray-300 mb-8">هل أنت صاحب متجر؟</p>
      <Link href="/signup" className={cn(buttonVariants(), 'bg-green-600 hover:bg-green-700 px-8')}>
        أنشئ متجرك مجاناً
      </Link>
    </div>
  )
}
