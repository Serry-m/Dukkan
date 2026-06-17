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

  // Manual subscription: merchant contacts us on WhatsApp; we activate Pro.
  // Set NEXT_PUBLIC_SUPPORT_WHATSAPP to your support number (e.g. 201001234567).
  const support = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '201000000000'
  const waText = encodeURIComponent(
    pro
      ? `مرحباً، أريد تجديد اشتراك Pro لمتجري "${store?.name ?? ''}" على دكان.`
      : `مرحباً، أريد الاشتراك في خطة Pro (${PRO_PRICE_EGP} جنيه/شهر) لمتجري "${store?.name ?? ''}" على دكان.`
  )
  const waLink = `https://wa.me/${support}?text=${waText}`

  return (
    <div className="max-w-xl mx-auto">
      {status === 'success' && (
        <div className="mb-5 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          <CheckCircle2 size={16} /> تم الدفع بنجاح — تم تفعيل خطة Pro
        </div>
      )}
      {status === 'failed' && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          لم تتم عملية الدفع. يمكنك المحاولة مرة أخرى.
        </div>
      )}

      {/* Current plan */}
      {pro ? (
        <div className="rounded-2xl bg-gradient-to-br from-green-600 to-green-700 text-white p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={20} />
            <span className="font-bold text-lg">أنت مشترك في خطة Pro</span>
          </div>
          <p className="text-green-100 text-sm">
            {expires ? `الاشتراك ساري حتى ${expires}` : 'اشتراكك نشط'}
          </p>
        </div>
      ) : (
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-3">
            <Crown size={26} className="text-green-700" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">ترقية إلى دكان Pro</h1>
          <p className="text-gray-500 text-sm mt-1">أزل الحدود وافتح كل الميزات</p>
        </div>
      )}

      {/* Benefits */}
      <div className="bg-white rounded-2xl ring-1 ring-foreground/[0.07] shadow-[var(--shadow-soft)] p-6 mb-6">
        <div className="flex items-baseline gap-1 mb-5">
          <span className="text-3xl font-extrabold text-gray-900">{PRO_PRICE_EGP}</span>
          <span className="text-gray-400 text-sm">جنيه / شهرياً</span>
        </div>
        <ul className="space-y-3">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
              <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={13} className="text-green-700" />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-base flex items-center justify-center gap-2 transition-colors"
      >
        <MessageCircle size={18} />
        {pro ? 'تواصل معنا للتجديد' : 'تواصل معنا للاشتراك'}
      </a>

      <p className="text-center text-xs text-gray-400 mt-4">
        راسلنا على واتساب وسنفعّل خطة Pro لمتجرك خلال دقائق. الاشتراك شهري.
      </p>
    </div>
  )
}
