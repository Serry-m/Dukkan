import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Reveal, SlideIn, Stagger, StaggerItem } from '@/components/landing/Motion'
import { OrderNotification, CategoryMarquee } from '@/components/landing/Effects'
import { LandingNav } from '@/components/landing/LandingNav'
import Faq from '@/components/landing/Faq'
import { BrandMark } from '@/components/BrandMark'
import { PRO_PRICE_EGP, FREE_PRODUCT_LIMIT } from '@/lib/plan'
import {
  CheckCircle,
  Zap,
  Link2,
  MessageCircle,
  ArrowLeft,
  Store,
  Check,
  Wallet,
  LayoutGrid,
} from 'lucide-react'

const FREE_FEATURES = [
  `حتى ${FREE_PRODUCT_LIMIT.toLocaleString('ar-EG')} منتجات`,
  'طلبات مباشرة على واتساب',
  'رابط مخصص وصفحة متجر',
  'طرق الدفع (إنستاباي · فودافون كاش · عند الاستلام)',
]

const PRO_FEATURES_LIST = [
  'منتجات بلا حدود',
  'قوالب وألوان وخطوط للمتجر',
  'أقسام الصفحة الرئيسية (لافتة · فئات · عروض)',
  'كوبونات الخصم ورسوم التوصيل',
  'لوحة التحليلات والعملاء',
  'إزالة شعار «صُنع بواسطة دكان»',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden" dir="rtl">

      <div className="grain-overlay fixed inset-0 z-[60] pointer-events-none opacity-[0.035]" aria-hidden="true" />

      <LandingNav />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 left-1/3 w-[520px] h-[520px] bg-green-100 rounded-full opacity-50 blur-3xl aurora-1" />
          <div className="absolute top-10 -right-24 w-[360px] h-[360px] bg-emerald-50 rounded-full opacity-60 blur-3xl aurora-2" />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div className="order-2 lg:order-1 text-center lg:text-right">
            <Stagger>
              <StaggerItem>
                <span className="inline-block text-xs font-bold text-green-700 bg-green-50 border border-green-100 px-3.5 py-1.5 rounded-full mb-6 tracking-wide">
                  ٠٪ عمولة على أي طلب — أرباحك كاملة لك
                </span>
              </StaggerItem>
              <StaggerItem>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.12] tracking-tight mb-5">
                  متجرك على واتساب<br />
                  <span className="text-green-600">في دقيقتين</span>
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                  انشر منتجاتك، شارك رابطاً واحداً، واستقبل الطلبات مباشرة على واتساب. بدون موقع ولا تعقيد.
                </p>
              </StaggerItem>
              <StaggerItem>
                <div className="flex items-center gap-3 flex-wrap justify-center lg:justify-start">
                  <Link href="/signup" className={cn(buttonVariants(), 'btn-shimmer bg-green-600 hover:bg-green-700 text-white font-bold px-7 h-12 text-base gap-2 shadow-lg shadow-green-200')}>
                    أنشئ متجرك الآن
                    <ArrowLeft size={16} />
                  </Link>
                  <Link href="/login" className={cn(buttonVariants({ variant: 'outline' }), 'px-7 h-12 text-base font-medium border-gray-200 text-gray-600 hover:bg-gray-50')}>
                    تسجيل الدخول
                  </Link>
                </div>
              </StaggerItem>
            </Stagger>
          </div>

          {/* Storefront preview */}
          <SlideIn from="left" delay={0.15} className="order-1 lg:order-2 flex justify-center lg:justify-start">
            <div className="relative w-60 sm:w-72">
              <div className="bg-gray-900 rounded-[2.6rem] p-2 shadow-2xl shadow-gray-300/60 transition-transform duration-500 hover:-translate-y-1">
                <div className="bg-[#faf7f2] rounded-[2.1rem] overflow-hidden">
                  {/* Cover + logo */}
                  <div className="relative h-20 bg-gradient-to-bl from-green-500 to-emerald-600" />
                  <div className="flex flex-col items-center -mt-7 pb-3">
                    <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-md ring-1 ring-gray-900/5">
                      <div className="w-full h-full rounded-xl bg-green-50 flex items-center justify-center">
                        <Store size={20} className="text-green-700" />
                      </div>
                    </div>
                    <p className="text-sm font-extrabold text-gray-900 mt-1.5">متجر نور</p>
                    <span className="text-[9px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full mt-1">● مفتوح</span>
                  </div>
                  {/* Products */}
                  <div className="grid grid-cols-2 gap-2 px-2.5 pb-2.5">
                    {[
                      { n: 'سلسلة ذهبية', p: '٥٠٠' },
                      { n: 'حلق أنيق', p: '٣٠٠' },
                    ].map((it) => (
                      <div key={it.n} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="aspect-[4/5] bg-gradient-to-br from-gray-50 to-gray-100 relative">
                          <span className="absolute bottom-1.5 left-1.5 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center text-green-600 text-sm font-bold">+</span>
                        </div>
                        <div className="p-1.5">
                          <p className="text-[10px] font-semibold text-gray-800 truncate">{it.n}</p>
                          <p className="text-[10px] font-bold text-gray-900">{it.p} جنيه</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Cart bar */}
                  <div className="mx-2.5 mb-3 bg-green-600 rounded-xl px-3 py-2 flex items-center justify-between">
                    <span className="text-white text-[10px] font-bold">عرض السلة</span>
                    <span className="text-white text-[10px] font-semibold">٨٠٠ جنيه</span>
                  </div>
                </div>
              </div>
              <OrderNotification className="absolute -left-6 bottom-20" />
            </div>
          </SlideIn>
        </div>
      </section>

      {/* ── Stats strip ── */}
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
          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-6">
            <CheckCircle size={13} className="text-green-500" />
            مجاني تماماً للبدء · بدون بطاقة ائتمان
          </p>
        </div>
      </section>

      {/* ── Category marquee ── */}
      <section className="py-12 bg-white">
        <p className="text-center text-sm text-gray-400 mb-5">بيع أي شيء — مهما كان مجالك</p>
        <CategoryMarquee />
      </section>

      {/* ── Why Dukkan (differentiators) ── */}
      <section className="max-w-5xl mx-auto px-5 py-16 sm:py-20">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-3">ليه دكان؟</h2>
          <p className="text-gray-500 text-center mb-12 max-w-md mx-auto">أبسط طريقة لتحوّل متابعينك إلى طلبات — دون أن تبني موقعاً.</p>
        </Reveal>
        <Stagger className="max-w-2xl mx-auto space-y-4">
          {[
            { icon: Zap, title: 'أبسط طريقة للبيع', desc: 'بدون موقع، بدون إعداد دفع، بدون تعقيد. اكتب اسم متجرك، أضف منتجاتك، وشارك الرابط.' },
            { icon: MessageCircle, title: 'الطلب يوصلك على واتساب', desc: 'رسالة منظمة بكل تفاصيل الطلب والعميل — في المكان الذي تعمل منه أصلاً.' },
            { icon: Wallet, title: '٠٪ عمولة أبداً', desc: 'نحن لا نلمس أموالك — العميل يدفع لك مباشرة، وكل جنيه يصلك كاملاً.' },
          ].map(({ icon: Icon, title, desc }) => (
            <StaggerItem key={title}>
              <div className="flex items-start gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-5 transition-all duration-300 hover:border-green-200 hover:bg-white hover:shadow-[0_14px_30px_-12px_rgba(22,163,74,0.20)]">
                <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-green-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ── Features bento ── */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5 py-16 sm:py-20">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-10">كل ما تحتاجه في مكان واحد</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Reveal className="sm:row-span-2">
              <div className="bg-green-600 rounded-2xl p-7 flex flex-col justify-between h-full min-h-[240px]">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                  <Zap size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">متجر جاهز في دقيقتين</h3>
                  <p className="text-green-100 text-sm leading-relaxed">اكتب اسم متجرك، أضف منتجاتك، وشارك الرابط. واجهة عربية أنيقة تعمل على كل الهواتف.</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-[0_14px_30px_-12px_rgba(22,163,74,0.20)] flex items-start gap-4 h-full">
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
              <div className="bg-white border border-gray-100 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-[0_14px_30px_-12px_rgba(22,163,74,0.20)] flex items-start gap-4 h-full">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <LayoutGrid size={18} className="text-green-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">لوحة تحكم كاملة</h3>
                  <p className="text-sm text-gray-500">طلباتك وعملاؤك وإيراداتك ومنتجاتك — كلها في لوحة واحدة بسيطة.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-5 py-16 sm:py-20">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-12">ابدأ في ٣ خطوات</h2>
          </Reveal>
          <Stagger className="max-w-xl mx-auto">
            {[
              { num: '١', title: 'سجّل حسابك', desc: 'أنشئ حساباً مجانياً بالبريد الإلكتروني في ثوانٍ، بدون بطاقة ائتمان.' },
              { num: '٢', title: 'أضف منتجاتك', desc: 'أضف الصور والأسعار والأوصاف والتصنيفات لمنتجاتك بسهولة.' },
              { num: '٣', title: 'شارك وابيع', desc: 'شارك رابط متجرك واستقبل الطلبات منظّمة مباشرة على واتساب.' },
            ].map((step, i, arr) => (
              <StaggerItem key={step.num}>
                <div className="flex gap-5 relative pb-10 last:pb-0">
                  {i < arr.length - 1 && <div className="absolute right-[27px] top-14 bottom-0 w-px bg-green-200" />}
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

      {/* ── Pricing ── */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-5 py-16 sm:py-20">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-3">أسعار واضحة، بلا مفاجآت</h2>
            <p className="text-gray-500 text-center mb-12 max-w-md mx-auto">ابدأ مجاناً، ورقِّ إلى الاحترافي وقتما يكبر متجرك. بدون عمولة في الحالتين.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {/* Free */}
            <Reveal>
              <div className="bg-white border border-gray-200 rounded-3xl p-7 h-full flex flex-col">
                <p className="font-bold text-gray-900">مجاني</p>
                <p className="text-sm text-gray-400 mb-4">للبداية والتجربة</p>
                <p className="text-4xl font-extrabold text-gray-900 mb-5">٠ <span className="text-base font-medium text-gray-400">جنيه</span></p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={cn(buttonVariants({ variant: 'outline' }), 'w-full border-gray-200 text-gray-700 hover:bg-gray-50 font-medium')}>
                  ابدأ مجاناً
                </Link>
              </div>
            </Reveal>
            {/* Pro */}
            <Reveal delay={0.1}>
              <div className="relative bg-white border-2 border-green-500 rounded-3xl p-7 h-full flex flex-col shadow-[0_20px_50px_-20px_rgba(22,163,74,0.35)]">
                <span className="absolute -top-3 right-7 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">الأكثر اختياراً</span>
                <p className="font-bold text-gray-900">احترافي</p>
                <p className="text-sm text-gray-400 mb-4">لمتجر متكامل وعلامة تجارية</p>
                <p className="text-4xl font-extrabold text-gray-900 mb-5">{PRO_PRICE_EGP.toLocaleString('ar-EG')} <span className="text-base font-medium text-gray-400">جنيه / شهر</span></p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {PRO_FEATURES_LIST.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={cn(buttonVariants(), 'w-full bg-green-600 hover:bg-green-700 text-white font-bold')}>
                  ابدأ بالاحترافي
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-5 py-16 sm:py-20">
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
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-16 -right-10 w-72 h-72 bg-green-500 rounded-full opacity-40 blur-3xl" />
        </div>
        <Reveal className="relative max-w-5xl mx-auto px-5 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">جاهز تبدأ؟</h2>
          <p className="text-green-100 text-base mb-8 max-w-sm mx-auto">متجرك الأول مجاناً — بدون بطاقة ائتمان وبدون أي عمولة.</p>
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
