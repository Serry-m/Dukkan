import Link from 'next/link'
import { BrandMark } from '@/components/BrandMark'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'سياسة الخصوصية — دكان',
}

export default function PrivacyPage() {
  const support = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '201000000000'
  const waLink = `https://wa.me/${support}`
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
            <p>عند إنشاء متجر على دكان نجمع بريدك الإلكتروني ورقم واتساب وبيانات متجرك ومنتجاتك والصور التي ترفعها (الشعار، صورة الغلاف، صور المنتجات)، بالإضافة إلى إحصائيات بسيطة عن زيارات متجرك. عند قيام أحد العملاء بطلب، تُحفظ بيانات الطلب (الاسم، رقم الهاتف، العنوان، تفاصيل الطلب) لتظهر لصاحب المتجر في لوحته.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">كيف نستخدم البيانات</h2>
            <p>نستخدم البيانات لتشغيل متجرك وعرض طلباتك لك وتحسين الخدمة فقط. <strong>لا نبيع بياناتك</strong> ولا بيانات عملائك لأي طرف ثالث، ولا نستخدمها في إعلانات.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">بيانات عملائك (مهم)</h2>
            <p>بيانات العملاء (الاسم والهاتف والعنوان) التي تصلك عبر الطلبات تخص متجرك، وأنت المسؤول عنها. دكان يحفظها ويعرضها لك نيابةً عنك فقط لتتمكن من تنفيذ الطلب والتواصل مع العميل. يجب استخدامها لهذا الغرض فقط وبما يتوافق مع القانون — دكان لا يستخدمها لأي غرض آخر.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">واتساب والدفع</h2>
            <p>تُرسَل الطلبات عبر واتساب مباشرة بينك وبين العميل. دكان لا يطّلع على محادثاتكما، ولا يتدخل في الدفع أو التوصيل، ولا يجمع أي بيانات بطاقات أو حسابات بنكية — كل ذلك يتم خارج المنصة.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">أين تُحفظ البيانات وأمانها</h2>
            <p>تُحفظ البيانات على بنية تحتية سحابية موثوقة مع إجراءات حماية معقولة. نستخدم ملف تعريف ارتباط (كوكي) واحد لإبقائك مسجّل الدخول فقط — لا نستخدم أدوات تتبّع إعلانية.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">الاحتفاظ بالبيانات وحقوقك</h2>
            <p>نحتفظ ببياناتك طالما حسابك نشط. يمكنك تعديل أو حذف بيانات متجرك في أي وقت من لوحة التحكم، وطلب حذف حسابك وكل بياناته بالتواصل معنا.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">تواصل معنا</h2>
            <p>لأي استفسار عن الخصوصية أو لحذف حسابك، راسلنا على <a href={waLink} target="_blank" rel="noreferrer" className="text-green-700 font-semibold hover:underline">واتساب</a>.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
