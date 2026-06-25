import Link from 'next/link'
import { Reveal, SlideIn, Stagger, StaggerItem } from '@/components/landing/Motion'
import { LandingNav } from '@/components/landing/LandingNav'
import Faq from '@/components/landing/Faq'
import { BrandMark } from '@/components/BrandMark'
import { PRO_PRICE_EGP, FREE_PRODUCT_LIMIT } from '@/lib/plan'

// Warm, RTL Egyptian-Arabic landing — leads with WhatsApp simplicity and 2-minute speed.
const PALETTE = {
  '--green': '#16a34a',
  '--green-d': '#15803d',
  '--tint': '#E9F7EE',
  '--tint2': '#F1FBF4',
  '--ink': '#1d1b16',
  '--muted': '#74716a',
  '--paper': '#FBFAF7',
  '--warm': '#F4F0E8',
  '--border': '#ECE7DC',
} as React.CSSProperties

const FREE = FREE_PRODUCT_LIMIT.toLocaleString('ar-EG')
const PRO = PRO_PRICE_EGP.toLocaleString('ar-EG')

const FREE_FEATURES = [
  `لحد ${FREE} منتجات`,
  'طلبات واتساب مباشرة',
  'لينك مخصص + صفحة متجر',
  'اعرض طرق الدفع (إنستاباي / فودافون / استلام)',
]

const PRO_FEATURES = [
  { t: 'كل مميزات المجاني، زائد:', bold: true },
  { t: 'منتجات بلا حدود' },
  { t: 'ثيمات وألوان وخطوط للمتجر' },
  { t: 'أقسام للصفحة الرئيسية' },
  { t: 'كوبونات خصم + رسوم توصيل' },
  { t: 'تحليلات + قائمة عملائك' },
  { t: 'شيل شعار دكان من متجرك' },
]

const HOW_STEPS = [
  { num: '٠١', title: 'اعمل متجرك', desc: 'سجّل باسمك ورقم واتساب، واختار اسم المتجر. دقيقة وانت خلّصت.' },
  { num: '٠٢', title: 'ضيف منتجاتك', desc: 'صورة، اسم، وسعر. زي ما بتنزّل صورة منتج على إنستجرام بالظبط.' },
  { num: '٠٣', title: 'اشارك اللينك', desc: 'لينك واحد تحطّه في البايو وتبعته لعملائك. خلاص — متجرك شغّال.' },
]

const PROOF_POINTS = [
  'الطلب بيتسجّل على محادثة واتساب اللي انت عارفها',
  'تتفق على التوصيل والدفع مباشرة مع عميلك',
  'علاقة شخصية مع كل عميل — مش مجرد طلب في نظام',
]

const PRODUCTS = [
  { n: 'كنافة بالمانجو', p: '٦٠', bg: 'repeating-linear-gradient(135deg,#FBE9C7,#FBE9C7 6px,#F7E0B2 6px,#F7E0B2 12px)', c: '#b58a3a' },
  { n: 'بسبوسة سادة', p: '٤٠', bg: 'repeating-linear-gradient(135deg,#F3E3D2,#F3E3D2 6px,#EBD7C0 6px,#EBD7C0 12px)', c: '#a9855c' },
  { n: 'أرز باللبن', p: '٢٥', bg: 'repeating-linear-gradient(135deg,#EDE7DE,#EDE7DE 6px,#E2DACE 6px,#E2DACE 12px)', c: '#9b9385' },
]

// ── small inline glyphs (kept faithful to the design) ──
function Tick({ size = 20, solid = false }: { size?: number; solid?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx="12" cy="12" r={solid ? 10 : 11} fill={solid ? '#16a34a' : 'var(--tint)'} />
      <path d="M7.5 12.3l3 3 6-6.5" stroke={solid ? '#fff' : '#16a34a'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function Chevron({ color = '#fff', size = 19 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M15 6l-6 6 6 6" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function WhatsApp({ size = 22, fill = '#fff' }: { size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.3 14c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.7 1.8c.1.2.1.4 0 .5l-.4.5c-.1.2-.3.3-.1.6.1.3.6 1 1.3 1.6.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.6-.1l1.7.8c.2.1.4.2.4.3.1.1.1.5-.1 1z" />
    </svg>
  )
}

const SECTION = 'clamp(58px,9vw,110px) clamp(18px,5vw,40px)'
const WRAP = { maxWidth: 1140, margin: '0 auto' }

export default function HomePage() {
  const support = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP
  const supportHref = support ? `https://wa.me/${support.replace(/[^0-9]/g, '')}` : '#top'

  return (
    <div
      dir="rtl"
      style={{
        ...PALETTE,
        fontFamily: 'var(--font-cairo), system-ui, sans-serif',
        background: 'var(--paper)',
        color: 'var(--ink)',
        overflowX: 'hidden',
        lineHeight: 1.85,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <LandingNav />

      {/* ============ HERO ============ */}
      <section id="top" style={{ position: 'relative', ...WRAP, padding: 'clamp(40px,7vw,90px) clamp(18px,5vw,40px) clamp(30px,6vw,70px)', scrollMarginTop: 80 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(30px,5vw,60px)', alignItems: 'center' }}>
          {/* copy */}
          <div style={{ flex: '1 1 360px', minWidth: 300 }}>
            <Stagger>
              <StaggerItem>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'var(--tint)', color: 'var(--green-d)', padding: '7px 15px', borderRadius: 999, fontWeight: 700, fontSize: 14.5 }}>
                  <span className="animate-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
                  مجاني · بدون عمولة · على واتساب
                </div>
              </StaggerItem>
              <StaggerItem>
                <h1 style={{ fontSize: 'clamp(36px,8vw,62px)', lineHeight: 1.18, fontWeight: 900, letterSpacing: '-1px', margin: '18px 0 0' }}>
                  متجرك على واتساب<br />
                  <span style={{ color: 'var(--green)' }}>في دقيقتين</span>.
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p style={{ fontSize: 'clamp(17px,2.4vw,20px)', color: 'var(--muted)', margin: '22px 0 0', maxWidth: 520 }}>
                  اعمل متجرك، ضيف منتجاتك، واشارك لينك واحد. عميلك يطلب منك على واتساب على طول — وانت تستلم فلوسك زي ما انت متعوّد.{' '}
                  <strong style={{ color: 'var(--ink)', fontWeight: 700 }}>من غير عمولة، ومن غير وجع دماغ.</strong>
                </p>
              </StaggerItem>
              <StaggerItem>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 13, marginTop: 30 }}>
                  <Link href="/signup" className="btn-shimmer" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9, background: 'var(--green)', color: '#fff', padding: '15px 28px', borderRadius: 14, fontWeight: 800, fontSize: 17.5, boxShadow: '0 8px 22px rgba(21,128,61,.3)' }}>
                    افتح دكانك مجاناً
                    <Chevron />
                  </Link>
                  <a href="#proof" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9, background: '#fff', color: 'var(--ink)', padding: '15px 26px', borderRadius: 14, fontWeight: 700, fontSize: 17.5, border: '1.5px solid var(--border)' }}>
                    شوف مثال حي
                  </a>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 24, color: 'var(--muted)', fontSize: 14.5, fontWeight: 600, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Tick size={17} /> {FREE} منتجات مجاناً للأبد</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Tick size={17} /> من غير بطاقة ائتمان</span>
                </div>
              </StaggerItem>
            </Stagger>
          </div>

          {/* phone */}
          <div style={{ flex: '1 1 300px', minWidth: 288, display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', width: 330, height: 330, borderRadius: '50%', background: 'radial-gradient(circle,rgba(22,163,74,.16),transparent 68%)', top: '6%', zIndex: 0 }} />
            <SlideIn from="left" delay={0.15}>
              <div style={{ position: 'relative', zIndex: 1, width: 290 }}>
                <div style={{ background: '#1d1b16', borderRadius: 42, padding: 11, boxShadow: '0 30px 60px -20px rgba(29,27,22,.45),0 12px 24px -12px rgba(29,27,22,.3)' }}>
                  <div style={{ background: '#fff', borderRadius: 32, overflow: 'hidden' }}>
                    {/* cover */}
                    <div style={{ height: 78, background: 'linear-gradient(135deg,#1ba951,#15803d)', position: 'relative' }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 30%,rgba(255,255,255,.18),transparent 55%)' }} />
                    </div>
                    <div style={{ padding: '0 16px 16px', marginTop: -30, position: 'relative' }}>
                      <div style={{ width: 58, height: 58, borderRadius: 17, background: '#fff', padding: 3, boxShadow: '0 6px 14px rgba(0,0,0,.12)' }}>
                        <BrandMark size={52} className="rounded-[14px]" />
                      </div>
                      <div style={{ marginTop: 11, display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontWeight: 800, fontSize: 18 }}>مطبخ تيتة</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#16a34a" /><path d="M7.5 12.3l3 3 6-6.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 1 }}>أكل بيتي طازة · التجمع الخامس</div>
                      <div style={{ marginTop: 7, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--tint)', color: 'var(--green-d)', fontSize: 11.5, fontWeight: 700, padding: '4px 9px', borderRadius: 8 }}>
                        الدفع: إنستاباي · فودافون كاش · عند الاستلام
                      </div>
                    </div>
                    {/* products */}
                    <div style={{ padding: '2px 14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {PRODUCTS.map((it) => (
                        <div key={it.n} style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', border: '1px solid var(--border)', borderRadius: 15, padding: 9 }}>
                          <div style={{ width: 54, height: 54, borderRadius: 11, flexShrink: 0, background: it.bg, display: 'grid', placeItems: 'center' }}>
                            <span style={{ font: '600 8px monospace', color: it.c }}>صورة</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14.5 }}>{it.n}</div>
                            <div style={{ color: 'var(--green-d)', fontWeight: 800, fontSize: 13.5 }}>{it.p} جنيه</div>
                          </div>
                          <span style={{ background: 'var(--green)', color: '#fff', fontWeight: 800, fontSize: 13.5, padding: '8px 15px', borderRadius: 10 }}>اطلب</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* floating notification */}
                <div style={{ position: 'absolute', bottom: -26, left: '50%', transform: 'translateX(-50%)', width: 268 }}>
                  <div className="dk-float" style={{ background: '#fff', borderRadius: 16, padding: '12px 13px', boxShadow: '0 18px 38px -10px rgba(29,27,22,.32)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: '#25D366', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <WhatsApp />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6 }}>طلب جديد على واتساب <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }} /></div>
                      <div style={{ color: 'var(--muted)', fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>كنافة بالمانجو ×٢ — ١٢٠ جنيه</div>
                    </div>
                  </div>
                </div>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how" style={{ background: 'var(--warm)', borderBlock: '1px solid var(--border)', scrollMarginTop: 64 }}>
        <div style={{ ...WRAP, padding: 'clamp(56px,9vw,108px) clamp(18px,5vw,40px)' }}>
          <Reveal>
            <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto' }}>
              <div style={{ color: 'var(--green-d)', fontWeight: 800, fontSize: 15 }}>٣ خطوات بس</div>
              <h2 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, letterSpacing: '-.8px', margin: '8px 0 0' }}>من الموبايل، ومن غير أي خبرة تقنية</h2>
              <p style={{ color: 'var(--muted)', fontSize: 'clamp(16px,2.2vw,19px)', margin: '14px 0 0' }}>لو بتعرف تنزّل بوست على إنستجرام، يبقى تعرف تفتح دكان.</p>
            </div>
          </Reveal>
          <Stagger style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(248px,1fr))', gap: 20, marginTop: 'clamp(38px,5vw,58px)' }}>
            {HOW_STEPS.map((s) => (
              <StaggerItem key={s.num}>
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 22, padding: '28px 24px', height: '100%' }}>
                  <div style={{ fontWeight: 900, fontSize: 38, color: 'var(--tint)', WebkitTextStroke: '1.5px var(--green)', lineHeight: 1 }}>{s.num}</div>
                  <h3 style={{ fontSize: 21, fontWeight: 800, margin: '14px 0 0' }}>{s.title}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: 16, margin: '9px 0 0' }}>{s.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ============ WHATSAPP ORDER PROOF ============ */}
      <section id="proof" style={{ ...WRAP, padding: SECTION, scrollMarginTop: 64 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(34px,5vw,64px)', alignItems: 'center' }}>
          <Reveal style={{ flex: '1 1 340px', minWidth: 300 }}>
            <div style={{ color: 'var(--green-d)', fontWeight: 800, fontSize: 15 }}>القلب بتاع دكان</div>
            <h2 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, letterSpacing: '-.8px', margin: '8px 0 0', lineHeight: 1.2 }}>العميل بيدوس «اطلب»، والرسالة بتوصلك جاهزة</h2>
            <p style={{ color: 'var(--muted)', fontSize: 'clamp(16px,2.2vw,19px)', margin: '16px 0 0', maxWidth: 480 }}>أول ما العميل يدوس على المنتج، بيتفتح واتساب برسالة منظّمة فيها المنتجات والكمية والإجمالي — توصلك انت على طول. مفيش لخبطة، ولا «بكام ده؟» عشر مرات.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {PROOF_POINTS.map((p) => (
                <li key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, fontSize: 16.5, fontWeight: 600 }}><Tick size={22} /> {p}</li>
              ))}
            </ul>
          </Reveal>

          {/* whatsapp chat mock */}
          <Reveal delay={0.12} style={{ flex: '1 1 300px', minWidth: 290, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 300, borderRadius: 26, overflow: 'hidden', boxShadow: '0 26px 54px -22px rgba(29,27,22,.4)', border: '1px solid var(--border)' }}>
              <div style={{ background: '#0c6b5b', padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 11 }}>
                <Chevron color="#fff" size={20} />
                <BrandMark size={38} className="rounded-full" />
                <div style={{ flex: 1, color: '#fff' }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>مطبخ تيتة</div>
                  <div style={{ fontSize: 11.5, opacity: 0.8 }}>متصل دلوقتي</div>
                </div>
              </div>
              <div style={{ background: '#ECE5DD', padding: '18px 14px 16px', minHeight: 248, backgroundImage: 'radial-gradient(rgba(0,0,0,.025) 1px,transparent 1px)', backgroundSize: '18px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ maxWidth: '88%', background: '#fff', borderRadius: 14, borderTopRightRadius: 4, padding: '11px 13px', boxShadow: '0 1px 1px rgba(0,0,0,.07)' }}>
                    <div style={{ fontWeight: 800, color: 'var(--green-d)', fontSize: 13.5, marginBottom: 6 }}>طلب جديد — مطبخ تيتة</div>
                    <div style={{ fontSize: 13, lineHeight: 1.9, color: '#222', whiteSpace: 'pre-line', borderTop: '1px dashed #e0dccf', borderBottom: '1px dashed #e0dccf', padding: '7px 0', marginBottom: 7 }}>{'• كنافة بالمانجو   ×٢    ١٢٠ ج\n• أرز باللبن        ×١     ٢٥ ج'}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#222' }}>الإجمالي: ١٤٥ جنيه</div>
                    <div style={{ fontSize: 12.5, color: '#555', marginTop: 6, lineHeight: 1.9 }}>الدفع: إنستاباي / عند الاستلام<br />الاسم: ______<br />العنوان: ______</div>
                    <div style={{ textAlign: 'left', fontSize: 10.5, color: '#8a9b8f', marginTop: 5 }}>٨:٤٢ م ✓✓</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                  <div style={{ background: '#D9FDD3', borderRadius: 14, borderTopLeftRadius: 4, padding: '9px 13px', fontSize: 13.5, color: '#222', boxShadow: '0 1px 1px rgba(0,0,0,.07)' }}>تمام يا فندم 🌿 هيوصلك خلال ساعة. <span style={{ fontSize: 10.5, color: '#6b9b73' }}>٨:٤٣ م</span></div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ FEATURES / WHY US ============ */}
      <section id="features" style={{ background: 'var(--warm)', borderBlock: '1px solid var(--border)', scrollMarginTop: 64 }}>
        <div style={{ ...WRAP, padding: SECTION }}>
          <Reveal>
            <div style={{ maxWidth: 640 }}>
              <div style={{ color: 'var(--green-d)', fontWeight: 800, fontSize: 15 }}>ليه دكان بالذات</div>
              <h2 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, letterSpacing: '-.8px', margin: '8px 0 0', lineHeight: 1.2 }}>معمول مخصوص للبيزنس الصغير اللي شغّال من البيت</h2>
              <p style={{ color: 'var(--muted)', fontSize: 'clamp(16px,2.2vw,19px)', margin: '14px 0 0' }}>مش محتاج منصة ضخمة ولا بوابة دفع ولا فريق تقني. دكان بيعمل حاجة واحدة بس — وبيعملها صح.</p>
            </div>
          </Reveal>
          <Stagger style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(238px,1fr))', gap: 18, marginTop: 'clamp(34px,5vw,52px)' }}>
            {[
              { icon: <span style={{ fontWeight: 900, fontSize: 19, color: 'var(--green-d)' }}>٪٠</span>, title: 'بدون عمولة، خالص', desc: 'صفر عمولة على أي طلب وأي مبلغ. اللي بتكسبه يفضل كله معاك انت.' },
              { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="3" stroke="#15803d" strokeWidth="2" /><path d="M3 10h18" stroke="#15803d" strokeWidth="2" /><circle cx="17" cy="14.5" r="1.4" fill="#15803d" /></svg>, title: 'فلوسك تيجيلك انت', desc: 'اعرض إنستاباي، فودافون كاش، أو الدفع عند الاستلام. العميل يدفعلك مباشرة.' },
              { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M9 15l6-6" stroke="#15803d" strokeWidth="2" strokeLinecap="round" /><path d="M11 7l1.5-1.5a3.5 3.5 0 015 5L17 12" stroke="#15803d" strokeWidth="2" strokeLinecap="round" /><path d="M13 17l-1.5 1.5a3.5 3.5 0 01-5-5L7 12" stroke="#15803d" strokeWidth="2" strokeLinecap="round" /></svg>, title: 'لينك واحد لكل حاجة', desc: 'متجرك كله في لينك واحد تحطّه في بايو إنستجرام وتيك توك وفيسبوك.' },
              { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M13 2L4 13h6l-1 9 9-11h-6l1-9z" stroke="#15803d" strokeWidth="2" strokeLinejoin="round" /></svg>, title: 'بسيط لأقصى درجة', desc: 'من غير إعدادات معقّدة ولا شروحات. تفتح وتبيع في نفس الدقيقة.' },
            ].map((c) => (
              <StaggerItem key={c.title}>
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 20, padding: '26px 22px', height: '100%' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: 'var(--tint)', display: 'grid', placeItems: 'center' }}>{c.icon}</div>
                  <h3 style={{ fontSize: 19, fontWeight: 800, margin: '16px 0 0' }}>{c.title}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: 15.5, margin: '7px 0 0' }}>{c.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" style={{ ...WRAP, padding: SECTION, scrollMarginTop: 64 }}>
        <Reveal>
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
            <div style={{ color: 'var(--green-d)', fontWeight: 800, fontSize: 15 }}>أسعار واضحة</div>
            <h2 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, letterSpacing: '-.8px', margin: '8px 0 0' }}>ابدأ مجاناً، وكبّر وقت ما تكبر</h2>
            <p style={{ color: 'var(--muted)', fontSize: 'clamp(16px,2.2vw,19px)', margin: '14px 0 0' }}>من غير رسوم خفية ولا عمولة على الطلبات. ادفع شهرياً وانت مرتاح.</p>
          </div>
        </Reveal>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22, justifyContent: 'center', marginTop: 'clamp(34px,5vw,52px)', alignItems: 'stretch' }}>
          {/* FREE */}
          <Reveal style={{ flex: '1 1 320px', maxWidth: 400, display: 'flex' }}>
            <div style={{ flex: 1, background: '#fff', border: '1px solid var(--border)', borderRadius: 24, padding: '32px 28px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 800, fontSize: 22 }}>مجاني</div>
              <div style={{ color: 'var(--muted)', fontSize: 15, marginTop: 2 }}>للاستخدام الشخصي</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, margin: '18px 0 4px' }}><span style={{ fontSize: 46, fontWeight: 900, lineHeight: 1 }}>٠</span><span style={{ color: 'var(--muted)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>جنيه / للأبد</span></div>
              <Link href="/signup" style={{ textDecoration: 'none', textAlign: 'center', marginTop: 18, background: '#fff', color: 'var(--ink)', border: '1.5px solid var(--border)', padding: 13, borderRadius: 13, fontWeight: 800, fontSize: 16.5 }}>ابدأ مجاناً</Link>
              <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0 0', display: 'flex', flexDirection: 'column', gap: 13, fontSize: 15.5 }}>
                {FREE_FEATURES.map((f) => (
                  <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}><Tick /> {f}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          {/* PRO */}
          <Reveal delay={0.1} style={{ flex: '1 1 320px', maxWidth: 400, display: 'flex' }}>
            <div style={{ flex: 1, position: 'relative', background: 'linear-gradient(180deg,#fff,#F4FBF6)', border: '2px solid var(--green)', borderRadius: 24, padding: '32px 28px', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 50px -26px rgba(21,128,61,.4)' }}>
              <div style={{ position: 'absolute', top: -14, right: 28, background: 'var(--green)', color: '#fff', fontWeight: 800, fontSize: 13, padding: '6px 14px', borderRadius: 999, boxShadow: '0 6px 14px rgba(21,128,61,.3)' }}>الأكثر اختياراً</div>
              <div style={{ fontWeight: 800, fontSize: 22 }}>برو</div>
              <div style={{ color: 'var(--muted)', fontSize: 15, marginTop: 2 }}>للي عايز يكبّر بيزنسه</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, margin: '18px 0 4px' }}><span style={{ fontSize: 46, fontWeight: 900, lineHeight: 1, color: 'var(--green-d)' }}>{PRO}</span><span style={{ color: 'var(--muted)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>جنيه / شهرياً</span></div>
              <Link href="/signup" style={{ textDecoration: 'none', textAlign: 'center', marginTop: 18, background: 'var(--green)', color: '#fff', padding: 13, borderRadius: 13, fontWeight: 800, fontSize: 16.5, boxShadow: '0 8px 20px rgba(21,128,61,.3)' }}>جرّب برو</Link>
              <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0 0', display: 'flex', flexDirection: 'column', gap: 13, fontSize: 15.5 }}>
                {PRO_FEATURES.map((f) => (
                  <li key={f.t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontWeight: f.bold ? 700 : 400 }}><Tick solid /> {f.t}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" style={{ background: 'var(--warm)', borderBlock: '1px solid var(--border)', scrollMarginTop: 64 }}>
        <div style={{ ...WRAP, padding: SECTION }}>
          <Reveal>
            <h2 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, letterSpacing: '-.8px', textAlign: 'center', margin: '0 0 clamp(28px,4vw,44px)' }}>أسئلة بتتسأل كتير</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Faq />
          </Reveal>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section style={{ ...WRAP, padding: '0 clamp(18px,5vw,40px) clamp(58px,9vw,100px)', marginTop: 'clamp(58px,9vw,100px)' }}>
        <Reveal>
          <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg,#1ba951,#15803d)', borderRadius: 30, padding: 'clamp(40px,7vw,72px) clamp(26px,5vw,60px)', textAlign: 'center' }}>
            <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,.08)', top: -90, left: -60 }} />
            <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,.07)', bottom: -90, right: -40 }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ color: '#fff', fontSize: 'clamp(28px,5.5vw,46px)', fontWeight: 900, letterSpacing: '-.8px', margin: 0 }}>جاهز تفتح دكانك؟</h2>
              <p style={{ color: 'rgba(255,255,255,.9)', fontSize: 'clamp(16px,2.4vw,20px)', margin: '14px auto 0', maxWidth: 480 }}>في دقيقتين يبقى عندك متجر شغّال على واتساب. مجاناً، ومن غير عمولة.</p>
              <Link href="/signup" className="btn-shimmer" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9, marginTop: 30, background: '#fff', color: 'var(--green-d)', padding: '16px 34px', borderRadius: 15, fontWeight: 900, fontSize: 18, boxShadow: '0 14px 30px -10px rgba(0,0,0,.3)' }}>
                افتح دكانك دلوقتي
                <Chevron color="#15803d" size={20} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ FOOTER ============ */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--warm)' }}>
        <div style={{ ...WRAP, padding: 'clamp(36px,5vw,56px) clamp(18px,5vw,40px)', display: 'flex', flexWrap: 'wrap', gap: 30, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BrandMark size={36} className="rounded-[11px]" />
              <span style={{ fontWeight: 900, fontSize: 22 }}>دكان</span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 15, margin: '12px 0 0' }}>متجرك على واتساب في دقيقتين. مصمّم للبيزنس الصغير اللي شغّال من البيت.</p>
          </div>
          <div style={{ display: 'flex', gap: 'clamp(34px,6vw,72px)', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>المنتج</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 14.5, color: 'var(--muted)' }}>
                <a href="#how" style={{ textDecoration: 'none', color: 'inherit' }}>إزاي بيشتغل</a>
                <a href="#features" style={{ textDecoration: 'none', color: 'inherit' }}>المميزات</a>
                <a href="#pricing" style={{ textDecoration: 'none', color: 'inherit' }}>الأسعار</a>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>تواصل ومساعدة</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 14.5, color: 'var(--muted)' }}>
                <a href={supportHref} style={{ textDecoration: 'none', color: 'inherit' }}>الدعم على واتساب</a>
                <a href="#faq" style={{ textDecoration: 'none', color: 'inherit' }}>أسئلة شائعة</a>
                <Link href="/login" style={{ textDecoration: 'none', color: 'inherit' }}>تسجيل الدخول</Link>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div style={{ ...WRAP, padding: '18px clamp(18px,5vw,40px)', display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center', color: 'var(--muted)', fontSize: 13.5 }}>
            <span>© {new Date().getFullYear().toLocaleString('ar-EG', { useGrouping: false })} دكان. كل الحقوق محفوظة.</span>
            <div style={{ display: 'flex', gap: 18 }}>
              <Link href="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>الخصوصية</Link>
              <Link href="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>الشروط</Link>
              <span>صُنع بحب في مصر 🇪🇬</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
