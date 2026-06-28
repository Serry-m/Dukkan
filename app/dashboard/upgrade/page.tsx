import { createClient } from '@/lib/supabase/server'
import { isPro, PRO_PRICE_EGP, PRO_FEATURES, FREE_PRODUCT_LIMIT } from '@/lib/plan'
import { Check, Crown, CheckCircle2, MessageCircle } from 'lucide-react'

export default async function UpgradePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: store } = await supabase
    .from('stores')
    .select('plan, plan_expires_at, name, slug')
    .eq('owner_id', user!.id)
    .single()

  const pro = isPro(store)
  const expires = store?.plan_expires_at
    ? new Date(store.plan_expires_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const support = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '201000000000'
  const waText = encodeURIComponent(
    pro
      ? `مرحباً، أريد تجديد اشتراك Pro لمتجري "${store?.name ?? ''}" على دكان.`
      : `مرحباً، أريد الاشتراك في خطة Pro (${PRO_PRICE_EGP} جنيه/شهر) لمتجري "${store?.name ?? ''}" على دكان.`
  )
  const waLink = `https://wa.me/${support}?text=${waText}`

  return (
    <div className="max-w-md mx-auto">
      {status === 'success' && (
        <div className="mb-5 flex items-center gap-2 bg-[#D8F0DE] border border-[#bfe3c8] text-[#15803d] rounded-xl px-4 py-3 text-sm font-semibold">
          <CheckCircle2 size={16} /> تم تفعيل خطة برو
        </div>
      )}
      {status === 'failed' && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          لم تتم العملية. يمكنك المحاولة مرة أخرى.
        </div>
      )}

      {pro && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#15803d] text-white px-4 py-3.5 shadow-[0_8px_22px_rgba(22,163,74,0.25)]">
          <Crown size={18} />
          <span className="text-sm font-extrabold">خطة برو نشطة</span>
          {expires && <span className="text-xs text-green-100 mr-auto">حتى {expires}</span>}
        </div>
      )}

      {/* Value hook + current-plan contrast — only for free users (prospects).
          Pro users land here to renew and already have the banner above. */}
      {!pro && (
        <>
          <div className="mb-5 text-center">
            <h1 className="text-2xl font-extrabold text-[#1d1b16]">طوّر متجرك إلى الاحتراف</h1>
            <p className="mt-1.5 text-sm text-[#74716a]">كل أدوات البيع المتقدمة لمتجرك في خطة واحدة.</p>
          </div>

          <div className="mb-4 rounded-2xl border border-[#ECE7DC] bg-[#F4F0E8] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#5f5c54]">خطتك الحالية: المجانية</span>
              <span className="text-xs text-[#9a9488]">مجاناً</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#9a9488]">
              حتى {FREE_PRODUCT_LIMIT.toLocaleString('ar-EG')} منتجات · شعار «صُنع بواسطة دكان» ظاهر · مميزات أساسية فقط
            </p>
          </div>
        </>
      )}

      {/* Premium pricing card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#ECE7DC] bg-white p-8 shadow-[var(--shadow-lift)]">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-[#16a34a]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[#16a34a]/10 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D8F0DE]">
            <Crown size={30} className="text-[#15803d]" />
          </div>

          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold tracking-tight text-[#1d1b16] tabular-nums">{PRO_PRICE_EGP}</span>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-base font-semibold text-[#74716a]">جنيه</span>
              <span className="text-xs text-[#9a9488]">/ شهرياً</span>
            </div>
          </div>

          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#D8F0DE] px-3 py-1 text-xs font-bold text-[#15803d]">
            <Crown size={12} /> دكان برو
          </span>
        </div>

        <div className="relative my-7 space-y-3.5">
          {PRO_FEATURES.map((f) => (
            <div key={f} className="flex items-start gap-3 text-right">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#D8F0DE]">
                <Check size={13} strokeWidth={3} className="text-[#15803d]" />
              </span>
              <span className="text-sm leading-relaxed text-[#4a4843]">{f}</span>
            </div>
          ))}
        </div>

        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#16a34a] text-base font-bold text-white shadow-[0_10px_24px_-8px_rgba(22,163,74,0.5)] transition-all hover:bg-[#15803d] active:scale-[0.98]"
        >
          <MessageCircle size={18} />
          {pro ? 'تواصل معنا للتجديد' : 'تواصل معنا للاشتراك'}
        </a>

        <p className="relative mt-4 text-center text-xs text-[#9a9488]">
          راسلنا على واتساب وسنفعّل خطة برو لمتجرك خلال دقائق. الاشتراك شهري.
        </p>
      </div>
    </div>
  )
}
