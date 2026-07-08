import Link from 'next/link'
import { BrandMark } from '@/components/BrandMark'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'الشروط والأحكام — دكان',
}

export default function TermsPage() {
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

      <main className="max-w-2xl mx-auto px-5 py-12">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">الشروط والأحكام</h1>
        <p className="text-sm text-gray-400 mb-8">آخر تحديث: {new Date().getFullYear()}</p>

        <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="font-bold text-gray-900 mb-2">استخدام الخدمة</h2>
            <p>دكان أداة لإنشاء متجر على واتساب. أنت مسؤول عن صحة بيانات منتجاتك وأسعارك والتعامل مع عملائك وتنفيذ الطلبات والتوصيل والدفع. أنت مسؤول عن الحفاظ على بيانات دخول حسابك، ويمكنك التوقف عن استخدام الخدمة في أي وقت.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">الأسعار والاشتراك</h2>
            <p>تتوفّر خطة مجانية (حتى ٥ منتجات مع ظهور شعار «دكان»)، وخطة برو (١٩٩ جنيه شهريًا) بمنتجات بلا حدود ومميزات متقدمة. يتم تفعيل خطة برو يدويًا بعد الدفع، والاشتراك شهري بدون تجديد تلقائي — يمكنك إيقافه في أي وقت ويستمر حتى نهاية المدة المدفوعة. قد تتغيّر الأسعار مستقبلًا مع إشعار مسبق.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">بيانات عملائك</h2>
            <p>بيانات عملائك التي تصلك عبر الطلبات تخصّك وأنت المسؤول عن استخدامها بشكل قانوني ولغرض تنفيذ الطلب والتواصل مع العميل فقط. راجع <Link href="/privacy" className="text-green-700 font-semibold hover:underline">سياسة الخصوصية</Link>.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">المحتوى المسموح</h2>
            <p>يُمنع استخدام دكان لبيع منتجات غير قانونية أو مخالفة. نحتفظ بالحق في تعليق أو حذف أي متجر يخالف ذلك.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">الدفع والتوصيل</h2>
            <p>دكان لا يتدخل في الدفع أو التوصيل. كل المعاملات تتم مباشرة بينك وبين العميل، وأنت وحدك المسؤول عنها.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">المسؤولية</h2>
            <p>نقدّم الخدمة «كما هي». لا نتحمل مسؤولية أي خسائر ناتجة عن استخدام الخدمة أو تعاملاتك مع العملاء.</p>
          </section>
          <section>
            <h2 className="font-bold text-gray-900 mb-2">تعديل الشروط والتواصل</h2>
            <p>قد نحدّث هذه الشروط من وقت لآخر، واستمرارك في استخدام الخدمة يُعدّ موافقة عليها. لأي استفسار راسلنا على <a href={waLink} target="_blank" rel="noreferrer" className="text-green-700 font-semibold hover:underline">واتساب</a>.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
