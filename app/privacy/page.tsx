import Link from 'next/link'
import { BrandMark } from '@/components/BrandMark'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'سياسة الخصوصية — دكان',
}

export default function PrivacyPage() {
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

      <main className="max-w-2xl mx-auto px-5 py-12 prose-sm">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">سياسة الخصوصية</h1>
        <p className="text-sm text-gray-400 mb-8">آخر تحديث: {new Date().getFullYear()}</p>

        <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="font-bold text-gray-900 mb-2">المعلومات التي نجمعها</h2>
            <p>عند إنشاء متجر على دكان نجمع بريدك الإلكتروني ورقم واتساب وبيانات متجرك ومنتجاتك. عند قيام العميل بطلب، تُحفظ بيانات الطلب (الاسم، الهاتف، العنوان، تفاصيل الطلب) لتظهر لصاحب المتجر.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">كيف نستخدم البيانات</h2>
            <p>نستخدم البيانات لتشغيل المتجر وعرض الطلبات لصاحبه وتحسين الخدمة. لا نبيع بياناتك لأطراف ثالثة.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">واتساب</h2>
            <p>يتم إرسال الطلبات عبر واتساب مباشرة بينك وبين العميل. دكان لا يطّلع على محادثاتكما ولا يتدخل في الدفع أو التوصيل.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">حقوقك</h2>
            <p>يمكنك تعديل أو حذف بيانات متجرك في أي وقت من لوحة التحكم. للاستفسار أو حذف الحساب، تواصل معنا.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
