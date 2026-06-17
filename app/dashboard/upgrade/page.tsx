import { createClient } from '@/lib/supabase/server'
import { isPro, PRO_PRICE_EGP, PRO_FEATURES } from '@/lib/plan'
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
        <div className="mb-5 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          <CheckCircle2 size={16} /> تم تفعيل خطة Pro
        </div>
      )}
      {status === 'failed' && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          لم تتم العملية. يمكنك المحاولة مرة أخرى.
        </div>
      )}

      {pro && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white px-4 py-3">
          <Crown size={18} />
          <span className="text-sm font-bold">خطة Pro نشطة</span>
          {expires && <span className="text-xs text-green-100 mr-auto">حتى {expires}</span>}
        </div>
      )}

      {/* Premium pricing card */}
      <div className="relative overflow-hidden rounded-3xl border border-green-200 bg-white p-8 shadow-[var(--shadow-lift)]">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-green-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-green-500/10 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
            <Crown size={30} className="text-green-700" />
          </div>

          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold tracking-tight text-gray-900 tabular-nums">{PRO_PRICE_EGP}</span>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-base font-semibold text-gray-500">جنيه</span>
              <span className="text-xs text-gray-400">/ شهرياً</span>
            </div>
          </div>

          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
            <Crown size={12} /> دكان Pro
          </span>
        </div>

        <div className="relative my-7 space-y-3.5">
          {PRO_FEATURES.map((f) => (
            <div key={f} className="flex items-start gap-3 text-right">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <Check size={13} strokeWidth={3} className="text-green-700" />
              </span>
              <span className="text-sm leading-relaxed text-gray-700">{f}</span>
            </div>
          ))}
        </div>

        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 text-base font-bold text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700 hover:shadow-xl hover:shadow-green-600/25 active:scale-[0.98]"
        >
          <MessageCircle size={18} />
          {pro ? 'تواصل معنا للتجديد' : 'تواصل معنا للاشتراك'}
        </a>

        <p className="relative mt-4 text-center text-xs text-gray-400">
          راسلنا على واتساب وسنفعّل خطة Pro لمتجرك خلال دقائق. الاشتراك شهري.
        </p>
      </div>
    </div>
  )
}
