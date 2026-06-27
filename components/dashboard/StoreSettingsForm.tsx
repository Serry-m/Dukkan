'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateImageFile, safeImageExt } from '@/lib/upload'
import type { Store } from '@/types'
import { isLightColor } from '@/lib/color'
import { isPro } from '@/lib/plan'
import { THEME_LIST } from '@/lib/themes'
import { ProUpsell, ProBadge } from '@/components/dashboard/ProLock'
import { Lock, Check, Camera, Store as StoreIcon, CreditCard, Truck, Palette, MessageCircle, LayoutGrid, Info, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

type Props = { store: Store | null; userId: string }
type Section = 'identity' | 'payment' | 'delivery' | 'appearance' | 'whatsapp' | 'home'

const SECTIONS: { id: Section; label: string; icon: typeof StoreIcon }[] = [
  { id: 'identity', label: 'هوية المتجر', icon: StoreIcon },
  { id: 'payment', label: 'الدفع', icon: CreditCard },
  { id: 'delivery', label: 'التوصيل', icon: Truck },
  { id: 'appearance', label: 'المظهر', icon: Palette },
  { id: 'whatsapp', label: 'واتساب', icon: MessageCircle },
  { id: 'home', label: 'الصفحة الرئيسية', icon: LayoutGrid },
]

const STORE_TYPES = [
  { id: 'fashion', label: 'أزياء وإكسسوار' },
  { id: 'food', label: 'طعام' },
  { id: 'electronics', label: 'إلكترونيات' },
  { id: 'home', label: 'منزل' },
  { id: 'other', label: 'أخرى' },
]

// Small reusable switch (matches the rest of the dashboard).
function Switch({ on, onToggle, ariaLabel }: { on: boolean; onToggle: () => void; ariaLabel: string }) {
  return (
    <button type="button" onClick={onToggle} aria-label={ariaLabel} className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${on ? 'bg-green-600' : 'bg-gray-300'}`}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${on ? 'right-1' : 'right-6'}`} />
    </button>
  )
}

export default function StoreSettingsForm({ store, userId }: Props) {
  const router = useRouter()
  const pro = isPro(store)
  const [name, setName] = useState(store?.name ?? '')
  const [slug, setSlug] = useState(store?.slug ?? '')
  const [whatsapp, setWhatsapp] = useState(store?.whatsapp_number ?? '')
  const [description, setDescription] = useState(store?.description ?? '')
  const [themeColor, setThemeColor] = useState(store?.theme_color ?? '#16a34a')
  const currency = store?.currency ?? 'EGP'
  const [deliveryFee, setDeliveryFee] = useState(store?.delivery_fee?.toString() ?? '0')
  const [payInstapay, setPayInstapay] = useState(store?.payment_instapay ?? '')
  const [payVodafone, setPayVodafone] = useState(store?.payment_vodafone ?? '')
  const [payCod, setPayCod] = useState(store?.payment_cod ?? false)
  const [instaOn, setInstaOn] = useState(!!store?.payment_instapay)
  const [vodaOn, setVodaOn] = useState(!!store?.payment_vodafone)
  const [storeType, setStoreType] = useState(store?.store_type ?? '')
  const [announceOn, setAnnounceOn] = useState(store?.announcement_enabled ?? false)
  const [announceText, setAnnounceText] = useState(store?.announcement_text ?? '')
  const [showTiles, setShowTiles] = useState(store?.show_collection_tiles ?? false)
  const [promoOn, setPromoOn] = useState(store?.promo_enabled ?? false)
  const [promoTitle, setPromoTitle] = useState(store?.promo_title ?? '')
  const [promoSubtitle, setPromoSubtitle] = useState(store?.promo_subtitle ?? '')
  const [isOpen, setIsOpen] = useState(store?.is_open ?? true)
  const [messageTemplate, setMessageTemplate] = useState(store?.message_template ?? '')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(store?.logo_url ?? null)
  const [logoCleared, setLogoCleared] = useState(false)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(store?.banner_url ?? null)
  const [bannerCleared, setBannerCleared] = useState(false)
  const [layout, setLayout] = useState(store?.layout ?? 'grid')
  const [theme, setTheme] = useState(store?.theme ?? 'modern')
  const [fontOverride, setFontOverride] = useState(store?.font_override ?? '')
  const [cardStyle, setCardStyle] = useState(store?.card_style ?? 'rounded')
  const [about, setAbout] = useState(store?.about ?? '')
  const [location, setLocation] = useState(store?.location ?? '')
  const [workingHours, setWorkingHours] = useState(store?.working_hours ?? '')
  const [instagram, setInstagram] = useState(store?.instagram ?? '')
  const [facebook, setFacebook] = useState(store?.facebook ?? '')
  const [tiktok, setTiktok] = useState(store?.tiktok ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [section, setSection] = useState<Section>('identity')

  function handleNameChange(value: string) {
    setName(value)
    if (!store) setSlug(value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }
  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); setLogoCleared(false)
  }
  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setBannerFile(file); setBannerPreview(URL.createObjectURL(file)); setBannerCleared(false)
  }
  function clearLogo() { setLogoFile(null); setLogoPreview(null); setLogoCleared(true) }
  function clearBanner() { setBannerFile(null); setBannerPreview(null); setBannerCleared(true) }
  function pickStoreType(id: string) { setStoreType(id); setShowTiles(id !== 'other') }
  function copySlug() {
    if (typeof window !== 'undefined') { navigator.clipboard?.writeText(`${window.location.origin}/store/${slug}`); toast.success('تم نسخ الرابط') }
  }

  async function uploadImage(file: File, folder: string): Promise<string | null> {
    const invalid = validateImageFile(file)
    if (invalid) { setError(invalid); return null }
    const supabase = createClient()
    const path = `${folder}/${userId}/${Date.now()}.${safeImageExt(file)}`
    const { error } = await supabase.storage.from('store_assets').upload(path, file, { upsert: true })
    if (error) return null
    const { data } = supabase.storage.from('store_assets').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !slug.trim()) { setError('أكمل اسم المتجر والرابط'); setSection('identity'); return }
    if (!whatsapp.trim()) { setError('أضف رقم واتساب لاستقبال الطلبات'); setSection('whatsapp'); return }
    setLoading(true)

    const supabase = createClient()
    let logoUrl = store?.logo_url ?? null
    let bannerUrl = store?.banner_url ?? null

    if (logoFile) {
      logoUrl = await uploadImage(logoFile, 'logos')
      if (!logoUrl) { setError('فشل رفع الشعار — تأكد من إنشاء Storage bucket باسم store_assets'); setLoading(false); return }
    } else if (logoCleared) logoUrl = null

    if (bannerFile) {
      bannerUrl = await uploadImage(bannerFile, 'banners')
      if (!bannerUrl) { setError('فشل رفع صورة الغلاف'); setLoading(false); return }
    } else if (bannerCleared) bannerUrl = null

    const payload = {
      name, slug, whatsapp_number: whatsapp, description, logo_url: logoUrl, banner_url: bannerUrl,
      theme_color: themeColor, currency, delivery_fee: parseFloat(deliveryFee) || 0, is_open: isOpen,
      payment_instapay: instaOn ? (payInstapay.trim() || null) : null,
      payment_vodafone: vodaOn ? (payVodafone.trim() || null) : null,
      payment_cod: payCod,
      store_type: storeType || null,
      announcement_enabled: announceOn, announcement_text: announceText.trim() || null,
      show_collection_tiles: showTiles,
      promo_enabled: promoOn, promo_title: promoTitle.trim() || null, promo_subtitle: promoSubtitle.trim() || null,
      message_template: messageTemplate.trim() || null, layout, theme,
      font_override: fontOverride || null, card_style: cardStyle,
      about: about.trim() || null, location: location.trim() || null, working_hours: workingHours.trim() || null,
      instagram: instagram.trim() || null, facebook: facebook.trim() || null, tiktok: tiktok.trim() || null,
    }

    const res = store
      ? await supabase.from('stores').update(payload).eq('id', store.id)
      : await supabase.from('stores').insert({ owner_id: userId, ...payload })
    if (res.error) {
      setError(res.error.code === '23505' ? 'هذا الرابط مستخدم بالفعل، جرب رابطاً آخر' : res.error.message)
      setLoading(false); return
    }
    toast.success(store ? 'تم حفظ التغييرات' : 'تم إنشاء المتجر')
    setLoading(false)
    router.refresh()
  }

  const dirty = !store || (
    name !== (store.name ?? '') || slug !== (store.slug ?? '') || whatsapp !== (store.whatsapp_number ?? '') ||
    description !== (store.description ?? '') || themeColor !== (store.theme_color ?? '#16a34a') ||
    deliveryFee !== (store.delivery_fee?.toString() ?? '0') ||
    payInstapay !== (store.payment_instapay ?? '') || payVodafone !== (store.payment_vodafone ?? '') || payCod !== (store.payment_cod ?? false) ||
    instaOn !== !!store.payment_instapay || vodaOn !== !!store.payment_vodafone ||
    storeType !== (store.store_type ?? '') || announceOn !== (store.announcement_enabled ?? false) || announceText !== (store.announcement_text ?? '') ||
    showTiles !== (store.show_collection_tiles ?? false) || promoOn !== (store.promo_enabled ?? false) ||
    promoTitle !== (store.promo_title ?? '') || promoSubtitle !== (store.promo_subtitle ?? '') ||
    isOpen !== (store.is_open ?? true) || messageTemplate !== (store.message_template ?? '') ||
    layout !== (store.layout ?? 'grid') || theme !== (store.theme ?? 'modern') || fontOverride !== (store.font_override ?? '') || cardStyle !== (store.card_style ?? 'rounded') ||
    about !== (store.about ?? '') || location !== (store.location ?? '') || workingHours !== (store.working_hours ?? '') ||
    instagram !== (store.instagram ?? '') || facebook !== (store.facebook ?? '') || tiktok !== (store.tiktok ?? '') ||
    logoFile !== null || bannerFile !== null || logoCleared || bannerCleared
  )

  const payCard = (on: boolean) => `bg-white rounded-2xl border ${on ? 'border-[#cfe8d5]' : 'border-[#ECE7DC]'} p-4 transition-colors`

  return (
    <form onSubmit={handleSubmit} className="pb-24">
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      {/* Section chips */}
      <div className="flex gap-2 flex-wrap mb-5">
        {SECTIONS.map((s) => {
          const active = section === s.id
          const Icon = s.icon
          return (
            <button key={s.id} type="button" onClick={() => setSection(s.id)} className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-[13.5px] border transition-colors ${active ? 'bg-[#16a34a] border-[#16a34a] text-white shadow-[0_5px_14px_rgba(22,163,74,0.2)]' : 'bg-white border-[#ECE7DC] text-[#74716a] hover:bg-[#F4F0E8] hover:text-[#1d1b16]'}`}>
              <Icon size={16} /> {s.label}
            </button>
          )
        })}
      </div>

      {/* ===== IDENTITY ===== */}
      {section === 'identity' && (
        <div className="space-y-4">
          {/* cover + logo */}
          <Card>
            <CardContent className="p-0 overflow-hidden">
              <div className="relative h-28 bg-gradient-to-l from-green-700 to-green-500">
                {bannerPreview && <img src={bannerPreview} alt="cover" className="w-full h-full object-cover" />}
                {pro ? (
                  <>
                    <input id="banner" type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
                    <label htmlFor="banner" className="absolute top-3 right-3 inline-flex items-center gap-1.5 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 text-[12.5px] font-bold text-gray-900 cursor-pointer hover:bg-white">
                      <Camera size={14} /> {bannerPreview ? 'تغيير الغلاف' : 'إضافة غلاف'}
                    </label>
                    {bannerPreview && <button type="button" onClick={clearBanner} className="absolute top-3 left-3 bg-white/90 rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-red-600">إزالة</button>}
                  </>
                ) : (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/90 rounded-lg px-2.5 py-1 text-[11px] font-bold text-gray-600"><Lock size={11} /> الغلاف Pro</span>
                )}
              </div>
              <div className="flex items-end gap-4 px-5 pb-4 -mt-9 flex-wrap">
                <div className="relative flex-shrink-0">
                  <div className="w-[84px] h-[84px] rounded-[22px] bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                    {logoPreview ? <img src={logoPreview} alt="logo" className="w-full h-full object-cover" /> : <StoreIcon size={30} className="text-gray-300" />}
                  </div>
                  <input id="logo" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  <label htmlFor="logo" className="absolute -bottom-1 -left-1 w-[30px] h-[30px] rounded-full bg-white border border-gray-200 shadow flex items-center justify-center cursor-pointer hover:bg-gray-50"><Camera size={15} className="text-gray-600" /></label>
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <div className="font-extrabold text-[17px]">{name || 'متجرك'}</div>
                  <div className="text-[13px] text-gray-400 font-semibold flex items-center gap-3">
                    شعار مربّع يظهر في متجرك وفي واتساب.
                    {logoPreview && <button type="button" onClick={clearLogo} className="text-red-500 hover:underline">إزالة الشعار</button>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* name / category / slug / description */}
          <Card><CardContent className="pt-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name">اسم المتجر</Label>
                <Input id="name" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="مثال: متجر نور" required maxLength={60} />
              </div>
              <div className="space-y-1">
                <Label>التصنيف</Label>
                <div className="flex flex-wrap gap-2">
                  {STORE_TYPES.map((t) => (
                    <button key={t.id} type="button" onClick={() => pickStoreType(t.id)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${storeType === t.id ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{t.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="slug">رابط المتجر</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">/store/</span>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="nour-shop" required dir="ltr" maxLength={40} className="flex-1" />
                <button type="button" onClick={copySlug} className="inline-flex items-center gap-1 text-[12.5px] font-bold text-green-700 hover:bg-green-50 rounded-lg px-2.5 py-2 transition-colors flex-shrink-0"><Copy size={14} /> نسخ</button>
              </div>
              <p className="text-xs text-gray-400">أحرف إنجليزية وأرقام وشرطة فقط — ده الرابط اللي تشاركه مع عملائك.</p>
              {store && slug !== store.slug && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">⚠️ تغيير الرابط سيُعطّل الروابط التي شاركتها سابقاً.</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">نبذة قصيرة (اختياري)</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="مثال: إكسسوارات مختارة بعناية" maxLength={200} />
              <p className="text-xs text-gray-400">تظهر أعلى صفحة متجرك تحت الاسم.</p>
            </div>
          </CardContent></Card>

          {/* about / location / hours / socials / open */}
          <Card><CardContent className="pt-6 space-y-5">
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div><Label className="cursor-pointer">المتجر مفتوح</Label><p className="text-xs text-gray-400 mt-0.5">عند الإغلاق، يتصفح العملاء لكن لا يمكنهم إتمام الطلب</p></div>
              <Switch on={isOpen} onToggle={() => setIsOpen((v) => !v)} ariaLabel="المتجر مفتوح" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="about">عن المتجر (اختياري)</Label>
              <textarea id="about" value={about} onChange={(e) => setAbout(e.target.value)} placeholder="نبذة عن متجرك، قصتك، ما يميزك..." rows={3} maxLength={500} className="w-full border border-input rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1"><Label htmlFor="location">الموقع (اختياري)</Label><Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="القاهرة، مدينة نصر" maxLength={120} /></div>
              <div className="space-y-1"><Label htmlFor="hours">مواعيد العمل (اختياري)</Label><Input id="hours" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} placeholder="يومياً ١٠ص - ١٢م" maxLength={120} /></div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">روابط التواصل (اختياري) {!pro && <ProBadge />}</Label>
              {pro ? (
                <>
                  <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="إنستجرام — اسم المستخدم أو الرابط" dir="ltr" maxLength={150} />
                  <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="فيسبوك — اسم المستخدم أو الرابط" dir="ltr" maxLength={150} />
                  <Input value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="تيك توك — اسم المستخدم أو الرابط" dir="ltr" maxLength={150} />
                </>
              ) : <ProUpsell feature="روابط التواصل الاجتماعي" />}
            </div>
          </CardContent></Card>
        </div>
      )}

      {/* ===== PAYMENT ===== */}
      {section === 'payment' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-[#EAF1F9] border border-[#cfe0f0] rounded-2xl px-4 py-3.5">
            <Info size={19} className="text-[#2C6FD6] flex-shrink-0" />
            <span className="text-[13px] text-[#2c4a7a] font-semibold leading-relaxed">دكان لا يستلم أي أموال. العميل يدفع لك مباشرة بالطرق التي تفعّلها هنا، وتظهر له عند تأكيد الطلب.</span>
          </div>

          <div className={payCard(instaOn)}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#EAF6EC] flex items-center justify-center flex-shrink-0"><CreditCard size={20} className="text-[#15803d]" /></div>
              <div className="flex-1 min-w-0"><div className="font-extrabold text-[14.5px]">إنستاباي</div><div className="text-[12.5px] text-gray-400 font-semibold">تحويل فوري على رقم أو عنوان إنستاباي.</div></div>
              <Switch on={instaOn} onToggle={() => setInstaOn((v) => !v)} ariaLabel="إنستاباي" />
            </div>
            {instaOn && <div className="mt-3.5 pt-3.5 border-t border-gray-100"><Label className="text-[12.5px]">عنوان إنستاباي</Label><Input value={payInstapay} onChange={(e) => setPayInstapay(e.target.value)} placeholder="01012345678 أو username@instapay" dir="ltr" maxLength={60} className="mt-1.5" /></div>}
          </div>

          <div className={payCard(vodaOn)}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#FBE9E6] flex items-center justify-center flex-shrink-0"><CreditCard size={20} className="text-[#D6453A]" /></div>
              <div className="flex-1 min-w-0"><div className="font-extrabold text-[14.5px]">فودافون كاش</div><div className="text-[12.5px] text-gray-400 font-semibold">محفظة موبايل — تحويل على رقمك.</div></div>
              <Switch on={vodaOn} onToggle={() => setVodaOn((v) => !v)} ariaLabel="فودافون كاش" />
            </div>
            {vodaOn && <div className="mt-3.5 pt-3.5 border-t border-gray-100"><Label className="text-[12.5px]">رقم المحفظة</Label><Input value={payVodafone} onChange={(e) => setPayVodafone(e.target.value.replace(/[^\d]/g, ''))} placeholder="01012345678" dir="ltr" maxLength={15} className="mt-1.5" /></div>}
          </div>

          <div className={payCard(payCod)}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"><Truck size={20} className="text-gray-500" /></div>
              <div className="flex-1 min-w-0"><div className="font-extrabold text-[14.5px]">الدفع عند الاستلام</div><div className="text-[12.5px] text-gray-400 font-semibold">العميل يدفع كاش وقت استلام الطلب.</div></div>
              <Switch on={payCod} onToggle={() => setPayCod((v) => !v)} ariaLabel="الدفع عند الاستلام" />
            </div>
          </div>
        </div>
      )}

      {/* ===== DELIVERY ===== */}
      {section === 'delivery' && (
        <Card><CardContent className="pt-6 space-y-5">
          <h2 className="text-sm font-bold text-gray-900">التوصيل</h2>
          <div className="space-y-1">
            <Label htmlFor="delivery" className="flex items-center gap-2">رسوم التوصيل {!pro && <ProBadge />}</Label>
            {pro ? (
              <>
                <Input id="delivery" type="number" min="0" step="0.01" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} placeholder="0" dir="ltr" />
                <p className="text-xs text-gray-400">تُضاف تلقائياً لإجمالي الطلب. اتركها 0 إذا كان التوصيل مجانياً أو يُحسب لاحقاً.</p>
              </>
            ) : <ProUpsell feature="رسوم التوصيل" />}
          </div>
          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2.5">رسوم مختلفة لكل محافظة (مناطق التوصيل) قريباً.</p>
        </CardContent></Card>
      )}

      {/* ===== APPEARANCE ===== */}
      {section === 'appearance' && (
        <div className="space-y-4">
          <Card><CardContent className="pt-6 space-y-5">
            <h2 className="text-sm font-bold text-gray-900">مظهر المتجر</h2>
            {/* Theme picker */}
            <div className="space-y-2">
              <Label>قالب المتجر</Label>
              <div className="grid grid-cols-2 gap-2.5">
                {THEME_LIST.map((t) => {
                  const locked = t.pro && !pro
                  const selected = theme === t.id
                  return (
                    <button key={t.id} type="button" onClick={() => !locked && setTheme(t.id)} disabled={locked} className={`relative text-right rounded-xl border-2 p-3 transition-all ${selected ? 'border-green-500' : 'border-gray-200 hover:border-gray-300'} ${locked ? 'opacity-60 cursor-not-allowed' : ''}`}>
                      <div className="relative mb-2 h-16 rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: t.pageBg }}>
                        <div className={`w-12 bg-white ${t.cardRadius} ${t.cardSurface} p-1.5 flex flex-col gap-1`}>
                          <div className="h-6 rounded bg-gray-100" /><div className="h-1 w-7 rounded-full bg-gray-300" /><div className={`h-2 ${t.innerRadius} border border-gray-300`} />
                        </div>
                        {selected && <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center"><Check size={13} className="text-white" /></span>}
                        {locked && <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center"><Lock size={11} className="text-gray-400" /></span>}
                      </div>
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">{t.name} {t.pro && <ProBadge />}</p>
                      <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{t.desc}</p>
                    </button>
                  )
                })}
              </div>
              {THEME_LIST.some((t) => t.pro) && !pro && <ProUpsell feature="القوالب الإضافية (أنيق، جريء)" />}
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>لون المتجر</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                <div className="flex gap-2 flex-wrap">
                  {['#16a34a', '#2563eb', '#7c3aed', '#e11d48', '#db2777', '#a16207', '#c2410c', '#1f2937'].map((color) => (
                    <button key={color} type="button" onClick={() => setThemeColor(color)} className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110" style={{ backgroundColor: color, borderColor: themeColor === color ? color : 'transparent' }} />
                  ))}
                </div>
              </div>
              {isLightColor(themeColor) && <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">⚠️ هذا اللون فاتح جداً — قد يصعب قراءة النص عليه.</p>}
            </div>

            {/* Layout / card / font */}
            <div className="space-y-1.5">
              <Label>طريقة عرض المنتجات</Label>
              <div className="grid grid-cols-2 gap-2">
                {([['grid', 'شبكة (عمودين)'], ['list', 'قائمة']] as const).map(([val, label]) => (
                  <button key={val} type="button" onClick={() => setLayout(val)} className={`px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${layout === val ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>{label}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>شكل البطاقات</Label>
              <div className="grid grid-cols-2 gap-2">
                {([['rounded', 'دائري'], ['sharp', 'حاد']] as const).map(([val, label]) => (
                  <button key={val} type="button" onClick={() => setCardStyle(val)} className={`px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${cardStyle === val ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>{label}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="font">الخط</Label>
              <select id="font" value={fontOverride} onChange={(e) => setFontOverride(e.target.value)} className="w-full h-9 border border-input rounded-lg px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50">
                <option value="">حسب القالب</option><option value="cairo">القاهرة</option><option value="tajawal">تجوال</option><option value="almarai">المراعي</option><option value="amiri">أميري (كلاسيكي)</option>
              </select>
            </div>
          </CardContent></Card>

          {/* Live preview */}
          <Card><CardContent className="pt-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4">معاينة صفحة المتجر</h2>
            <div className="border border-gray-200 rounded-2xl overflow-hidden max-w-[340px]">
              <div className="h-16" style={{ background: themeColor }}>{bannerPreview && <img src={bannerPreview} alt="" className="w-full h-full object-cover" />}</div>
              <div className="px-4 pb-4 -mt-6">
                <div className="w-[52px] h-[52px] rounded-[15px] bg-white border-[3px] border-white shadow flex items-center justify-center overflow-hidden">
                  {logoPreview ? <img src={logoPreview} alt="" className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center text-white font-black text-xl" style={{ background: themeColor }}>{(name || 'م').charAt(0)}</span>}
                </div>
                <div className="font-extrabold text-[15px] mt-2">{name || 'متجرك'}</div>
                <div className="text-xs text-gray-400 font-semibold mb-3">{description || 'وصف قصير لمتجرك'}</div>
                <div className="flex items-center justify-between p-2.5 border border-gray-100 rounded-xl">
                  <div><div className="font-bold text-[13px]">منتج</div><div className="text-xs text-gray-400 font-semibold">٤٥٠ ج</div></div>
                  <span className="text-white text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: themeColor }}>أضف للسلة</span>
                </div>
              </div>
            </div>
          </CardContent></Card>
        </div>
      )}

      {/* ===== WHATSAPP ===== */}
      {section === 'whatsapp' && (
        <Card><CardContent className="pt-6 space-y-5">
          <div className="space-y-1">
            <Label htmlFor="whatsapp">رقم واتساب لاستقبال الطلبات</Label>
            <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))} placeholder="01012345678" required dir="ltr" maxLength={15} />
            <p className="text-xs text-gray-400">كل الطلبات هتوصلك كرسالة واتساب على الرقم ده.</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="template">رسالة الترحيب في الطلب (اختياري)</Label>
            <textarea id="template" value={messageTemplate} onChange={(e) => setMessageTemplate(e.target.value)} placeholder="مثال: أهلاً! حابب أطلب من متجرك 🛍️" rows={3} maxLength={300} className="w-full border border-input rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50" />
            <p className="text-xs text-gray-400">أول سطر في رسالة الواتساب التي يرسلها العميل. اتركه فارغاً للرسالة الافتراضية.</p>
          </div>
        </CardContent></Card>
      )}

      {/* ===== HOME SECTIONS ===== */}
      {section === 'home' && (
        <Card><CardContent className="pt-6 space-y-5">
          <div><h2 className="text-sm font-bold text-gray-900">أقسام الصفحة الرئيسية</h2><p className="text-xs text-gray-400 mt-0.5">فعّل ما يناسب متجرك فقط — كل شيء اختياري.</p></div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">شريط الإعلان {!pro && <ProBadge />}</Label>
            {pro ? (
              <>
                <label className="flex items-center gap-3 cursor-pointer"><Switch on={announceOn} onToggle={() => setAnnounceOn((v) => !v)} ariaLabel="شريط الإعلان" /><span className="text-sm text-gray-600">رسالة تظهر أعلى المتجر (شحن، عرض…)</span></label>
                {announceOn && <Input value={announceText} onChange={(e) => setAnnounceText(e.target.value)} placeholder="شحن مجاني للطلبات فوق ٥٠٠ جنيه" maxLength={120} />}
              </>
            ) : <ProUpsell feature="شريط الإعلان" />}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">تصفّح حسب الفئة {!pro && <ProBadge />}</Label>
            {pro ? (
              <label className="flex items-center gap-3 cursor-pointer"><Switch on={showTiles} onToggle={() => setShowTiles((v) => !v)} ariaLabel="تصفّح حسب الفئة" /><span className="text-sm text-gray-600">بطاقات بصور لكل فئة (تُؤخذ تلقائياً من صور المنتجات)</span></label>
            ) : <ProUpsell feature="تصفّح حسب الفئة" />}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">لافتة العروض على الغلاف {!pro && <ProBadge />}</Label>
            {pro ? (
              <>
                <label className="flex items-center gap-3 cursor-pointer"><Switch on={promoOn} onToggle={() => setPromoOn((v) => !v)} ariaLabel="لافتة العروض" /><span className="text-sm text-gray-600">عنوان وزر على صورة الغلاف</span></label>
                {promoOn && (
                  <div className="space-y-2">
                    <Input value={promoTitle} onChange={(e) => setPromoTitle(e.target.value)} placeholder="العنوان — مثال: تخفيضات الصيف ٢٥٪" maxLength={60} />
                    <Input value={promoSubtitle} onChange={(e) => setPromoSubtitle(e.target.value)} placeholder="سطر صغير (اختياري) — مثال: على كل القطع" maxLength={80} />
                  </div>
                )}
              </>
            ) : <ProUpsell feature="لافتة العروض" />}
          </div>
        </CardContent></Card>
      )}

      {/* Sticky save bar */}
      <div className="sticky bottom-0 left-0 right-0 -mx-4 px-4 lg:-mx-8 lg:px-8 mt-5 py-3.5 bg-[#FBFAF7]/92 backdrop-blur-md border-t border-[#ECE7DC] flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-gray-500">{store && dirty ? '● لديك تغييرات غير محفوظة' : 'كل التغييرات محفوظة'}</span>
        <Button type="submit" className="bg-green-600 hover:bg-green-700 px-7" disabled={loading}>
          {loading ? 'جاري الحفظ...' : store ? 'حفظ التغييرات' : 'إنشاء المتجر'}
        </Button>
      </div>
    </form>
  )
}
