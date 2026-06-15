import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  CheckCircle,
  Zap,
  Link2,
  MessageCircle,
  BarChart2,
  ArrowLeft,
  Store,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
              <Store size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-[15px]">واتساب ستور</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 transition-colors font-medium hidden sm:block"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: 'sm' }),
                'bg-green-600 hover:bg-green-700 text-white font-semibold px-4 h-9 text-sm'
              )}
            >
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-green-50 rounded-full opacity-40 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-5 pt-16 pb-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div className="order-2 lg:order-1 text-right lg:text-right">
            <span className="inline-block text-xs font-bold text-green-700 bg-green-50 border border-green-100 px-3 py-1 rounded-full mb-5 tracking-wide">
              مجاني بالكامل - لا رسوم ولا عمولات
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.15] tracking-tight mb-5">
              متجرك على واتساب<br />
              <span className="text-green-600">في دقيقتين</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
              شارك رابطاً واحداً مع عملائك وابدأ تستقبل الطلبات مباشرة على واتساب — بدون تطبيق ولا تعقيد.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants(),
                  'bg-green-600 hover:bg-green-700 text-white font-bold px-7 h-12 text-base gap-2'
                )}
              >
                أنشئ متجرك الآن
                <ArrowLeft size={16} />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'px-7 h-12 text-base font-medium border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>

          {/* Visual: phone mockup */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-start">
            <div className="relative w-56 sm:w-64">
              {/* Phone frame */}
              <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl shadow-gray-300/60">
                <div className="bg-white rounded-[2rem] overflow-hidden">
                  {/* Phone top bar */}
                  <div className="bg-green-600 px-4 pt-5 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <Store size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-bold leading-none">متجر محمود</p>
                        <p className="text-green-200 text-[10px] mt-0.5">4 منتجات</p>
                      </div>
                    </div>
                  </div>

                  {/* Mock product cards */}
                  <div className="bg-[#f7f8fa] p-2.5 space-y-2">
                    {[
                      { name: 'سماعة بلوتوث', price: '٢٥٠', img: 'headphones' },
                      { name: 'شاحن سريع', price: '١٢٠', img: 'charger' },
                    ].map((item) => (
                      <div key={item.name} className="bg-white rounded-xl flex items-center gap-2.5 p-2 shadow-sm border border-gray-100">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex-shrink-0 flex items-center justify-center">
                          <div className="w-5 h-5 rounded bg-green-200" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                          <p className="text-[10px] text-green-600 font-bold mt-0.5">{item.price} جنيه</p>
                        </div>
                        <div className="w-6 h-6 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[10px] font-bold">+</span>
                        </div>
                      </div>
                    ))}

                    {/* Cart bar */}
                    <div className="bg-green-600 rounded-xl px-3 py-2.5 flex items-center justify-between mt-1">
                      <span className="text-white text-[10px] font-bold">عرض السلة</span>
                      <span className="text-white text-[10px] font-semibold">٣٧٠ جنيه</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating WhatsApp badge */}
              <div className="absolute -left-6 bottom-16 bg-white rounded-2xl shadow-xl border border-gray-100 px-3 py-2.5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={13} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-800 leading-none">طلب جديد!</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">من: محمد أحمد</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5 py-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: '+٥٠٠', label: 'تاجر نشط' },
              { value: 'دقيقتان', label: 'وقت الإعداد' },
              { value: '٠٪', label: 'رسوم أو عمولات' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features bento ── */}
      <section className="max-w-5xl mx-auto px-5 py-16">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-10">
          كل ما تحتاجه في مكان واحد
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Large feature */}
          <div className="sm:row-span-2 bg-green-600 rounded-2xl p-7 flex flex-col justify-between min-h-[220px]">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">متجر جاهز في دقيقتين</h3>
              <p className="text-green-100 text-sm leading-relaxed">
                اكتب اسم متجرك، أضف منتجاتك، وشارك الرابط. بدون خطوات معقدة.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <Link2 size={18} className="text-green-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">رابط مخصص لمتجرك</h3>
              <p className="text-sm text-gray-500">رابط قصير يحمل اسم متجرك، سهل المشاركة على أي منصة.</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <MessageCircle size={18} className="text-green-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">الطلبات مباشرة على واتساب</h3>
              <p className="text-sm text-gray-500">رسالة منظمة بتفاصيل الطلب والعميل — بنقرة واحدة.</p>
            </div>
          </div>
        </div>

        {/* Additional features row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {[
            { icon: BarChart2, title: 'تتبع طلباتك', desc: 'لوحة تحكم تعرض كل الطلبات والعملاء' },
            { icon: Store, title: 'تحكم كامل', desc: 'عدّل المنتجات والأسعار والمخزون في أي وقت' },
            { icon: CheckCircle, title: 'بدون رسوم', desc: 'لا عمولات ولا اشتراك شهري — مجاني تماماً' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                <Icon size={17} className="text-green-700" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-12">
            ابدأ في ٣ خطوات
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {[
              { num: '١', title: 'سجّل حسابك', desc: 'أنشئ حساباً مجانياً بالبريد الإلكتروني في ثوانٍ.' },
              { num: '٢', title: 'أضف منتجاتك', desc: 'أضف صور الأسعار والأوصاف لمنتجاتك بسهولة.' },
              { num: '٣', title: 'شارك وابيع', desc: 'شارك رابطك واستقبل الطلبات مباشرة على واتساب.' },
            ].map((step, i) => (
              <div key={step.num} className="flex flex-col items-center text-center sm:items-center relative">
                <div className="w-14 h-14 rounded-2xl bg-green-600 text-white text-2xl font-extrabold flex items-center justify-center mb-4 shadow-lg shadow-green-200">
                  {step.num}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[180px]">{step.desc}</p>

                {/* Connector line (desktop only) */}
                {i < 2 && (
                  <div className="hidden sm:block absolute left-0 top-7 w-full border-t-2 border-dashed border-green-200 -z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-5xl mx-auto px-5 py-16">
        <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-10">
          تجار يثقون فيه
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              quote: 'قبل ما أعرف أنا كنت بعت بالكلام. دلوقتي الطلب بييجيلي منظم على الواتساب.',
              name: 'أحمد سامي',
              role: 'صاحب متجر إكسسوارات',
            },
            {
              quote: 'الرابط بشاركه في الجروبات وبيجيلي طلبات من غير ما أكون متواجد.',
              name: 'منى خالد',
              role: 'تاجرة ملابس أطفال',
            },
            {
              quote: 'أسهل حاجة عملتها في حياتي. المتجر خلّص في ١٠ دقايق.',
              name: 'كريم وليد',
              role: 'صاحب متجر إلكترونيات',
            },
          ].map((t) => (
            <div key={t.name} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-green-500 text-sm">&#9733;</span>
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed flex-1">{t.quote}</p>
              <div>
                <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-green-600">
        <div className="max-w-5xl mx-auto px-5 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            جاهز تبدأ؟
          </h2>
          <p className="text-green-100 text-base mb-8 max-w-sm mx-auto">
            انضم للتجار اللي بيبيعوا عبر واتساب بشكل منظم واحترافي.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-8 py-3.5 rounded-xl hover:bg-green-50 transition-colors text-base shadow-lg shadow-green-800/20"
          >
            أنشئ متجرك مجاناً
            <ArrowLeft size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-green-600 flex items-center justify-center">
              <Store size={12} className="text-white" />
            </div>
            <span className="text-gray-400 font-medium">واتساب ستور</span>
          </div>
          <p className="text-gray-600 text-xs text-center">
            جميع الحقوق محفوظة {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-500 hover:text-gray-300 transition-colors">
              تسجيل الدخول
            </Link>
            <Link
              href="/signup"
              className="text-green-500 hover:text-green-400 font-medium transition-colors"
            >
              إنشاء حساب
            </Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
