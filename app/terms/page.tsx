import Link from 'next/link'
import { BrandMark } from '@/components/BrandMark'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'الشروط والأحكام — دكان',
}

export default function TermsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark size={28} />
            <span className="font-bold text-gray-900 text-sm">دكان</span>
          </Link>
          <Link href="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
            الرئيسية <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-12">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">الشروط والأحكام</h1>
        <p className="text-sm text-gray-400 mb-8">آخر تحديث: {new Date().getFullYear()}</p>

        <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="font-bold text-gray-900 mb-2">استخدام الخدمة</h2>
            <p>دكان أداة لإنشاء متجر على واتساب. أنت مسؤول عن صحة بيانات منتجاتك وأسعارك والتعامل مع عملائك وتنفيذ الطلبات والتوصيل والدفع.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">المحتوى المسموح</h2>
            <p>يُمنع استخدام دكان لبيع منتجات غير قانونية أو مخالفة. نحتفظ بالحق في إيقاف أي متجر يخالف ذلك.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">الدفع والتوصيل</h2>
            <p>دكان لا يتدخل في الدفع أو التوصيل. كل المعاملات تتم مباشرة بينك وبين العميل، وأنت وحدك المسؤول عنها.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">المسؤولية</h2>
            <p>نقدّم الخدمة «كما هي». لا نتحمل مسؤولية أي خسائر ناتجة عن استخدام الخدمة أو تعاملاتك مع العملاء.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
