import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

const features = [
  'أنشئ متجرك في دقيقتين',
  'شارك رابطك مع عملائك',
  'الطلبات تصلك على واتساب مباشرة',
  'بدون رسوم أو عمولات',
]

const steps = [
  { number: '١', title: 'سجّل حساباً', desc: 'مجاناً بالبريد الإلكتروني' },
  { number: '٢', title: 'أضف منتجاتك', desc: 'صور وأسعار وأوصاف' },
  { number: '٣', title: 'شارك الرابط', desc: 'واستقبل الطلبات فوراً' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">

      {/* Hero */}
      <div className="bg-gradient-to-b from-green-50 to-white px-4 pt-16 pb-12 text-center">
        <div className="text-6xl mb-4">🛍️</div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
          متجرك على واتساب<br />
          <span className="text-green-600">في دقيقتين</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-sm mx-auto mb-8">
          بدون تطبيق، بدون رسوم، بدون تعقيد — فقط رابط تشاركه وطلبات تصلك على واتساب
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/signup" className={cn(buttonVariants(), 'bg-green-600 hover:bg-green-700 px-8 h-12 text-base')}>
            ابدأ مجاناً
          </Link>
          <Link href="/login" className={cn(buttonVariants({ variant: 'outline' }), 'px-8 h-12 text-base')}>
            تسجيل الدخول
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-green-50 rounded-2xl p-6 space-y-3">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-3">
              <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-lg mx-auto px-4 pb-16">
        <h2 className="text-xl font-bold text-center text-gray-900 mb-6">كيف يعمل؟</h2>
        <div className="grid grid-cols-3 gap-4">
          {steps.map((s) => (
            <div key={s.number} className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-3">
                {s.number}
              </div>
              <p className="font-bold text-gray-900 text-sm">{s.title}</p>
              <p className="text-xs text-gray-400 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-green-600 text-white text-center px-4 py-10">
        <h2 className="text-2xl font-bold mb-2">جاهز تبدأ؟</h2>
        <p className="text-green-100 mb-6">انضم لمئات التجار اللي يبيعوا عبر واتساب</p>
        <Link href="/signup" className="bg-white text-green-700 font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors inline-block">
          أنشئ متجرك الآن
        </Link>
      </div>
    </div>
  )
}
