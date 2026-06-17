import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Reveal, SlideIn, Stagger, StaggerItem } from '@/components/landing/Motion'
import { OrderNotification, CategoryMarquee } from '@/components/landing/Effects'
import { LandingNav } from '@/components/landing/LandingNav'
import { ProductShowcase } from '@/components/landing/ProductShowcase'
import Faq from '@/components/landing/Faq'
import { BrandMark } from '@/components/BrandMark'
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
    <div className="min-h-screen bg-white overflow-x-hidden" dir="rtl">

      {/* Subtle film grain over the whole page */}
      <div className="grain-overlay fixed inset-0 z-[60] pointer-events-none opacity-[0.035]" aria-hidden="true" />

      {/* ── Nav ── */}
      <LandingNav />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white">
        {/* Soft animated background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/3 w-[520px] h-[520px] bg-green-100 rounded-full opacity-50 blur-3xl aurora-1" />
          <div className="absolute top-10 -right-20 w-[360px] h-[360px] bg-emerald-50 rounded-full opacity-60 blur-3xl aurora-2" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-teal-50 rounded-full opacity-50 blur-3xl aurora-1" />
        </div>

        <div className="relative max-w-5xl mx-auto px-5 pt-16 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div className="order-2 lg:order-1">
            <Stagger>
              <StaggerItem>
                <span className="inline-block text-xs font-bold text-green-700 bg-green-50 border border-green-100 px-3 py-1 rounded-full mb-5 tracking-wide">
                  مجاني بالكامل - لا رسوم ولا عمولات
                </span>
              </StaggerItem>
              <StaggerItem>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.15] tracking-tight mb-5">
                  متجرك على واتساب<br />
                  <span className="text-green-600">في دقيقتين</span>
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
                  شارك رابطاً واحداً مع عملائك وابدأ تستقبل الطلبات مباشرة على واتساب — بدون تطبيق ولا تعقيد.
                </p>
              </StaggerItem>
              <StaggerItem>
                <div className="flex items-center gap-3 flex-wrap">
                  <Link href="/signup" className={cn(buttonVariants(), 'btn-shimmer bg-green-600 hover:bg-green-700 text-white font-bold px-7 h-12 text-base gap-2 shadow-lg shadow-green-200')}>
                    أنشئ متجرك الآن
                    <ArrowLeft size={16} />
                  </Link>
                  <Link href="/login" className={cn(buttonVariants({ variant: 'outline' }), 'px-7 h-12 text-base font-medium border-gray-200 text-gray-600 hover:bg-gray-50')}>
                    تسجيل الدخول
                  </Link>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-3">
                  <CheckCircle size={13} className="text-green-500" />
                  مجاني تماماً · بدون بطاقة ائتمان
                </p>
              </StaggerItem>
            </Stagger>
          </div>

          {/* Phone mockup */}
          <SlideIn from="left" delay={0.15} className="order-1 lg:order-2 flex justify-center lg:justify-start">
            <div className="relative w-56 sm:w-64">
              <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl shadow-gray-300/60">
                <div className="bg-white rounded-[2rem] overflow-hidden">
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
                  <div className="bg-[#f7f8fa] p-2.5 space-y-2">
                    {[
                      { name: 'سماعة بلوتوث', price: '٢٥٠' },
                      { name: 'شاحن سريع', price: '١٢٠' },
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
                    <div className="bg-green-600 rounded-xl px-3 py-2.5 flex items-center justify-between mt-1">
                      <span className="text-white text-[10px] font-bold">عرض السلة</span>
                      <span className="text-white text-[10px] font-semibold">٣٧٠ جنيه</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Animated cycling "new order" notification */}
              <OrderNotification className="absolute -left-6 bottom-16" />
            </div>
          </SlideIn>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5 py-8">
          <Stagger className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: 'دقيقتان', label: 'وقت الإعداد' },
              { value: '٠٪', label: 'رسوم أو عمولات' },
              { value: 'واتساب', label: 'طلباتك مباشرة' },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Category marquee ── */}
      <section className="py-10 bg-white">
        <p className="text-center text-sm text-gray-400 mb-4">بيع أي شيء — مهما كان مجالك</p>
        <CategoryMarquee />
      </section>

      {/* ── Features bento ── */}
      <section className="max-w-5xl mx-auto px-5 py-16">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-10">
            كل ما تحتاجه في مكان واحد
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Reveal className="sm:row-span-2">
            <div className="bg-green-600 rounded-2xl p-7 flex flex-col justify-between h-full min-h-[220px]">
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
          </Reveal>

          <Reveal delay={0.1}>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:bg-white hover:shadow-[0_14px_30px_-12px_rgba(22,163,74,0.22)] flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Link2 size={18} className="text-green-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">رابط مخصص لمتجرك</h3>
                <p className="text-sm text-gray-500">رابط قصير يحمل اسم متجرك، سهل المشاركة على أي منصة.</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:bg-white hover:shadow-[0_14px_30px_-12px_rgba(22,163,74,0.22)] flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={18} className="text-green-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">الطلبات مباشرة على واتساب</h3>
                <p className="text-sm text-gray-500">رسالة منظمة بتفاصيل الطلب والعميل — بنقرة واحدة.</p>
              </div>
            </div>
          </Reveal>
        </div>

        <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {[
            { icon: BarChart2, title: 'تتبع طلباتك', desc: 'لوحة تحكم تعرض كل الطلبات والعملاء والإيرادات' },
            { icon: Store, title: 'تحكم كامل', desc: 'عدّل المنتجات والأسعار والمخزون في أي وقت' },
            { icon: CheckCircle, title: 'بدون رسوم', desc: 'لا عمولات ولا اشتراك شهري — مجاني تماماً' },
          ].map(({ icon: Icon, title, desc }) => (
            <StaggerItem key={title}>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:bg-white hover:shadow-[0_14px_30px_-12px_rgba(22,163,74,0.22)] h-full">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                  <Icon size={17} className="text-green-700" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ── Customer flow showcase (scroll-pinned) ── */}
      <section className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-3">
              كيف يطلب عميلك؟
            </h2>
            <p className="text-gray-500 text-center mb-12 max-w-md mx-auto">ثلاث خطوات بسيطة من التصفّح حتى وصول الطلب على واتساب</p>
          </Reveal>
          <ProductShowcase />
        </div>
      </section>

      {/* ── How it works (vertical timeline) ── */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-12">
              ابدأ في ٣ خطوات
            </h2>
          </Reveal>
          <Stagger className="max-w-xl mx-auto">
            {[
              { num: '١', title: 'سجّل حسابك', desc: 'أنشئ حساباً مجانياً بالبريد الإلكتروني في ثوانٍ، بدون بطاقة ائتمان.' },
              { num: '٢', title: 'أضف منتجاتك', desc: 'أضف الصور والأسعار والأوصاف والتصنيفات لمنتجاتك بسهولة.' },
              { num: '٣', title: 'شارك وابيع', desc: 'شارك رابط متجرك واستقبل الطلبات منظّمة مباشرة على واتساب.' },
            ].map((step, i, arr) => (
              <StaggerItem key={step.num}>
                <div className="flex gap-5 relative pb-10 last:pb-0">
                  {/* Connecting line */}
                  {i < arr.length - 1 && (
                    <div className="absolute right-[27px] top-14 bottom-0 w-px bg-green-200" />
                  )}
                  <div className="w-14 h-14 rounded-2xl bg-green-600 text-white text-2xl font-extrabold flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-200 relative z-10">
                    {step.num}
                  </div>
                  <div className="pt-2">
                    <h3 className="font-bold text-gray-900 text-lg">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mt-1">{step.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-10">الأسئلة الشائعة</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Faq />
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-green-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-10 w-72 h-72 bg-green-500 rounded-full opacity-40 blur-3xl" />
        </div>
        <Reveal className="relative max-w-5xl mx-auto px-5 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">جاهز تبدأ؟</h2>
          <p className="text-green-100 text-base mb-8 max-w-sm mx-auto">
            انضم للتجار اللي بيبيعوا عبر واتساب بشكل منظم واحترافي.
          </p>
          <Link
            href="/signup"
            className="btn-shimmer inline-flex items-center gap-2 bg-white text-green-700 font-bold px-8 py-3.5 rounded-xl hover:bg-green-50 transition-colors text-base shadow-lg shadow-green-800/20"
          >
            أنشئ متجرك مجاناً
            <ArrowLeft size={18} />
          </Link>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <BrandMark size={24} className="rounded-md" />
            <span className="text-gray-400 font-medium">دكان</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 transition-colors">الخصوصية</Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-300 transition-colors">الشروط</Link>
            <span className="text-gray-700 text-xs">جميع الحقوق محفوظة {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-500 hover:text-gray-300 transition-colors">تسجيل الدخول</Link>
            <Link href="/signup" className="text-green-500 hover:text-green-400 font-medium transition-colors">إنشاء حساب</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
