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
import { Lock, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, Store as StoreIcon } from 'lucide-react'

type Props = {
  store: Store | null
  userId: string
}

const STORE_TYPES = [
  { id: 'fashion', label: 'أزياء وإكسسوار' },
  { id: 'food', label: 'طعام' },
  { id: 'electronics', label: 'إلكترونيات' },
  { id: 'home', label: 'منزل' },
  { id: 'other', label: 'أخرى' },
]

export default function StoreSettingsForm({ store, userId }: Props) {
  const router = useRouter()
  const pro = isPro(store)
  const [name, setName] = useState(store?.name ?? '')
  const [slug, setSlug] = useState(store?.slug ?? '')
  const [whatsapp, setWhatsapp] = useState(store?.whatsapp_number ?? '')
  const [description, setDescription] = useState(store?.description ?? '')
  const [themeColor, setThemeColor] = useState(store?.theme_color ?? '#16a34a')
  // Currency is locked to EGP for now (matches the Egyptian phone validation).
  const currency = store?.currency ?? 'EGP'
  const [deliveryFee, setDeliveryFee] = useState(store?.delivery_fee?.toString() ?? '0')
  const [payInstapay, setPayInstapay] = useState(store?.payment_instapay ?? '')
  const [payVodafone, setPayVodafone] = useState(store?.payment_vodafone ?? '')
  const [payCod, setPayCod] = useState(store?.payment_cod ?? false)
  // Home sections (merchant-controlled storefront blocks)
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

  function handleNameChange(value: string) {
    setName(value)
    if (!store) {
      setSlug(
        value.toLowerCase().trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      )
    }
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setLogoCleared(false)
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
    setBannerCleared(false)
  }

  function clearLogo() {
    setLogoFile(null)
    setLogoPreview(null)
    setLogoCleared(true)
  }

  function clearBanner() {
    setBannerFile(null)
    setBannerPreview(null)
    setBannerCleared(true)
  }

  // Picking a store type pre-sets sensible section defaults (the merchant can override).
  function pickStoreType(id: string) {
    setStoreType(id)
    setShowTiles(id !== 'other')
  }

  async function uploadImage(file: File, folder: string): Promise<string | null> {
    const invalid = validateImageFile(file)
    if (invalid) {
      setError(invalid)
      return null
    }
    const supabase = createClient()
    const path = `${folder}/${userId}/${Date.now()}.${safeImageExt(file)}`
    const { error } = await supabase.storage
      .from('store_assets')
      .upload(path, file, { upsert: true })
    if (error) return null
    const { data } = supabase.storage.from('store_assets').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    let logoUrl = store?.logo_url ?? null
    let bannerUrl = store?.banner_url ?? null

    if (logoFile) {
      logoUrl = await uploadImage(logoFile, 'logos')
      if (!logoUrl) {
        setError('فشل رفع الشعار — تأكد من إنشاء Storage bucket باسم store_assets')
        setLoading(false)
        return
      }
    } else if (logoCleared) {
      logoUrl = null
    }

    if (bannerFile) {
      bannerUrl = await uploadImage(bannerFile, 'banners')
      if (!bannerUrl) {
        setError('فشل رفع صورة الغلاف')
        setLoading(false)
        return
      }
    } else if (bannerCleared) {
      bannerUrl = null
    }

    const payload = {
      name, slug, whatsapp_number: whatsapp, description, logo_url: logoUrl, banner_url: bannerUrl,
      theme_color: themeColor, currency, delivery_fee: parseFloat(deliveryFee) || 0, is_open: isOpen,
      payment_instapay: payInstapay.trim() || null,
      payment_vodafone: payVodafone.trim() || null,
      payment_cod: payCod,
      store_type: storeType || null,
      announcement_enabled: announceOn,
      announcement_text: announceText.trim() || null,
      show_collection_tiles: showTiles,
      promo_enabled: promoOn,
      promo_title: promoTitle.trim() || null,
      promo_subtitle: promoSubtitle.trim() || null,
      message_template: messageTemplate.trim() || null, layout, theme,
      font_override: fontOverride || null,
      card_style: cardStyle,
      about: about.trim() || null,
      location: location.trim() || null,
      working_hours: workingHours.trim() || null,
      instagram: instagram.trim() || null,
      facebook: facebook.trim() || null,
      tiktok: tiktok.trim() || null,
    }

    if (store) {
      const { error } = await supabase.from('stores').update(payload).eq('id', store.id)
      if (error) {
        setError(error.code === '23505' ? 'هذا الرابط مستخدم بالفعل، جرب رابطاً آخر' : error.message)
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.from('stores').insert({ owner_id: userId, ...payload })
      if (error) {
        setError(error.code === '23505' ? 'هذا الرابط مستخدم بالفعل، جرب رابطاً آخر' : error.message)
        setLoading(false)
        return
      }
    }

    toast.success(store ? 'تم حفظ التغييرات' : 'تم إنشاء المتجر')
    setLoading(false)
    router.refresh()
  }

  // Has the user changed anything since load? Drives the unsaved-changes hint.
  const dirty = !store || (
    name !== (store.name ?? '') ||
    slug !== (store.slug ?? '') ||
    whatsapp !== (store.whatsapp_number ?? '') ||
    description !== (store.description ?? '') ||
    themeColor !== (store.theme_color ?? '#16a34a') ||
    deliveryFee !== (store.delivery_fee?.toString() ?? '0') ||
    payInstapay !== (store.payment_instapay ?? '') ||
    payVodafone !== (store.payment_vodafone ?? '') ||
    payCod !== (store.payment_cod ?? false) ||
    storeType !== (store.store_type ?? '') ||
    announceOn !== (store.announcement_enabled ?? false) ||
    announceText !== (store.announcement_text ?? '') ||
    showTiles !== (store.show_collection_tiles ?? false) ||
    promoOn !== (store.promo_enabled ?? false) ||
    promoTitle !== (store.promo_title ?? '') ||
    promoSubtitle !== (store.promo_subtitle ?? '') ||
    isOpen !== (store.is_open ?? true) ||
    messageTemplate !== (store.message_template ?? '') ||
    layout !== (store.layout ?? 'grid') ||
    theme !== (store.theme ?? 'modern') ||
    fontOverride !== (store.font_override ?? '') ||
    cardStyle !== (store.card_style ?? 'rounded') ||
    about !== (store.about ?? '') ||
    location !== (store.location ?? '') ||
    workingHours !== (store.working_hours ?? '') ||
    instagram !== (store.instagram ?? '') ||
    facebook !== (store.facebook ?? '') ||
    tiktok !== (store.tiktok ?? '') ||
    logoFile !== null || bannerFile !== null || logoCleared || bannerCleared
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

      {/* ── Section 1: Basic info ── */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <h2 className="text-sm font-bold text-gray-900">المعلومات الأساسية</h2>

          <div className="space-y-1">
            <Label htmlFor="name">اسم المتجر</Label>
            <Input id="name" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="مثال: متجر محمود للإكسسوارات" required maxLength={60} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="whatsapp">رقم واتساب</Label>
            <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))} placeholder="01012345678" required dir="ltr" maxLength={15} />
            <p className="text-xs text-gray-400">الرقم الذي يستقبل طلبات عملائك على واتساب</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="slug">رابط المتجر</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">/store/</span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="mahmoud-shop"
                required
                dir="ltr"
                maxLength={40}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-400">أحرف إنجليزية وأرقام وشرطة فقط</p>
            {store && slug !== store.slug && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                ⚠️ تغيير الرابط سيُعطّل الروابط التي شاركتها سابقاً مع عملائك.
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">وصف المتجر (اختياري)</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="مثال: أفضل الإكسسوارات بأسعار منافسة" maxLength={200} />
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Appearance ── */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <h2 className="text-sm font-bold text-gray-900">مظهر المتجر</h2>

          {/* Theme picker */}
          <div className="space-y-2">
            <Label>قالب المتجر</Label>
            <div className="grid grid-cols-2 gap-2.5">
              {THEME_LIST.map((t) => {
                const locked = t.pro && !pro
                const selected = theme === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => !locked && setTheme(t.id)}
                    disabled={locked}
                    className={`relative text-right rounded-xl border-2 p-3 transition-all ${
                      selected ? 'border-green-500' : 'border-gray-200 hover:border-gray-300'
                    } ${locked ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {/* Mini preview: the theme's surface, corner radius and
                        button shape on its page background — so the templates
                        are visually distinguishable, not near-white squares. */}
                    <div
                      className="relative mb-2 h-16 rounded-lg overflow-hidden flex items-center justify-center"
                      style={{ backgroundColor: t.pageBg }}
                    >
                      <div className={`w-12 bg-white ${t.cardRadius} ${t.cardSurface} p-1.5 flex flex-col gap-1`}>
                        <div className="h-6 rounded bg-gray-100" />
                        <div className="h-1 w-7 rounded-full bg-gray-300" />
                        <div className={`h-2 ${t.innerRadius} border border-gray-300`} />
                      </div>
                      {selected && (
                        <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                          <Check size={13} className="text-white" />
                        </span>
                      )}
                      {locked && (
                        <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center">
                          <Lock size={11} className="text-gray-400" />
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      {t.name} {t.pro && <ProBadge />}
                    </p>
                    <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{t.desc}</p>
                  </button>
                )
              })}
            </div>
            {THEME_LIST.some((t) => t.pro) && !pro && (
              <ProUpsell feature="القوالب الإضافية (أنيق، جريء)" />
            )}
          </div>

          {/* Logo upload */}
          <div className="space-y-2">
            <Label>شعار المتجر</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center flex-shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  <StoreIcon size={26} className="text-gray-300" />
                )}
                <label
                  htmlFor="logo"
                  className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity rounded-full"
                >
                  <Camera size={20} className="text-white" />
                </label>
              </div>
              <div>
                <input id="logo" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                <div className="flex items-center gap-3">
                  <label htmlFor="logo" className="text-sm text-green-600 hover:underline cursor-pointer font-medium">
                    {logoPreview ? 'تغيير الصورة' : 'اختر صورة'}
                  </label>
                  {logoPreview && (
                    <button type="button" onClick={clearLogo} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
                      إزالة
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">PNG أو JPG — يُفضل مربع الشكل</p>
              </div>
            </div>
          </div>

          {/* Theme color picker */}
          <div className="space-y-2">
            <Label>لون المتجر</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
              <div className="flex gap-2">
                {['#16a34a','#2563eb','#7c3aed','#e11d48','#db2777','#a16207','#c2410c','#1f2937'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setThemeColor(color)}
                    className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ backgroundColor: color, borderColor: themeColor === color ? color : 'transparent' }}
                  />
                ))}
              </div>
            </div>
            {isLightColor(themeColor) && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                ⚠️ هذا اللون فاتح جداً — قد يصعب قراءة النص عليه. يُفضّل لون أغمق لأزرار المتجر.
              </p>
            )}
          </div>

          {/* Banner upload — Pro */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">صورة الغلاف (اختياري) {!pro && <ProBadge />}</Label>
            {pro ? (
              <>
                {bannerPreview && (
                  <div className="aspect-[3/1] w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                    <img src={bannerPreview} alt="banner" className="w-full h-full object-cover" />
                  </div>
                )}
                <input id="banner" type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
                <div className="flex items-center gap-3">
                  <label htmlFor="banner" className="inline-block text-sm text-green-600 hover:underline cursor-pointer font-medium">
                    {bannerPreview ? 'تغيير صورة الغلاف' : 'رفع صورة غلاف'}
                  </label>
                  {bannerPreview && (
                    <button type="button" onClick={clearBanner} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
                      إزالة
                    </button>
                  )}
                </div>
              </>
            ) : (
              <ProUpsell feature="صورة الغلاف" />
            )}
          </div>

          {/* Layout */}
          <div className="space-y-1.5">
            <Label>طريقة عرض المنتجات</Label>
            <div className="grid grid-cols-2 gap-2">
              {([['grid', 'شبكة (عمودين)'], ['list', 'قائمة (صف لكل منتج)']] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setLayout(val)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${layout === val ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Card shape */}
          <div className="space-y-1.5">
            <Label>شكل البطاقات</Label>
            <div className="grid grid-cols-2 gap-2">
              {([['rounded', 'دائري'], ['sharp', 'حاد']] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCardStyle(val)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${cardStyle === val ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Font */}
          <div className="space-y-1.5">
            <Label htmlFor="font">الخط</Label>
            <select
              id="font"
              value={fontOverride}
              onChange={(e) => setFontOverride(e.target.value)}
              className="w-full h-9 border border-input rounded-lg px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              <option value="">حسب القالب</option>
              <option value="cairo">القاهرة</option>
              <option value="tajawal">تجوال</option>
              <option value="almarai">المراعي</option>
              <option value="amiri">أميري (كلاسيكي)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* ── Home sections (merchant-controlled storefront blocks) ── */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-gray-900">أقسام الصفحة الرئيسية</h2>
            <p className="text-xs text-gray-400 mt-0.5">فعّل ما يناسب متجرك فقط — كل شيء اختياري.</p>
          </div>

          {/* Store type — sets sensible defaults */}
          <div className="space-y-2">
            <Label>نوع المتجر</Label>
            <div className="flex flex-wrap gap-2">
              {STORE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => pickStoreType(t.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    storeType === t.id ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400">نضبط لك الأقسام المقترحة — وتقدر تغيّرها بالأسفل.</p>
          </div>

          {/* Announcement bar — Pro */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">شريط الإعلان {!pro && <ProBadge />}</Label>
            {pro ? (
              <>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setAnnounceOn((v) => !v)}
                    aria-label="شريط الإعلان"
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${announceOn ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${announceOn ? 'right-1' : 'right-6'}`} />
                  </button>
                  <span className="text-sm text-gray-600">رسالة تظهر أعلى المتجر (شحن، عرض…)</span>
                </label>
                {announceOn && (
                  <Input value={announceText} onChange={(e) => setAnnounceText(e.target.value)} placeholder="شحن مجاني للطلبات فوق ٥٠٠ جنيه" maxLength={120} />
                )}
              </>
            ) : (
              <ProUpsell feature="شريط الإعلان" />
            )}
          </div>

          {/* Collection tiles — Pro */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">تصفّح حسب الفئة {!pro && <ProBadge />}</Label>
            {pro ? (
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setShowTiles((v) => !v)}
                  aria-label="تصفّح حسب الفئة"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${showTiles ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${showTiles ? 'right-1' : 'right-6'}`} />
                </button>
                <span className="text-sm text-gray-600">بطاقات بصور لكل فئة (تُؤخذ تلقائياً من صور المنتجات)</span>
              </label>
            ) : (
              <ProUpsell feature="تصفّح حسب الفئة" />
            )}
          </div>

          {/* Promo hero overlay — Pro */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">لافتة العروض على الغلاف {!pro && <ProBadge />}</Label>
            {pro ? (
              <>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setPromoOn((v) => !v)}
                    aria-label="لافتة العروض"
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${promoOn ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${promoOn ? 'right-1' : 'right-6'}`} />
                  </button>
                  <span className="text-sm text-gray-600">عنوان وزر على صورة الغلاف</span>
                </label>
                {promoOn && (
                  <div className="space-y-2">
                    <Input value={promoTitle} onChange={(e) => setPromoTitle(e.target.value)} placeholder="العنوان — مثال: تخفيضات الصيف ٢٥٪" maxLength={60} />
                    <Input value={promoSubtitle} onChange={(e) => setPromoSubtitle(e.target.value)} placeholder="سطر صغير (اختياري) — مثال: على كل القطع" maxLength={80} />
                  </div>
                )}
              </>
            ) : (
              <ProUpsell feature="لافتة العروض" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: Selling & delivery ── */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <h2 className="text-sm font-bold text-gray-900">البيع والتوصيل</h2>

          {/* Delivery fee — Pro */}
          <div className="space-y-1">
            <Label htmlFor="delivery" className="flex items-center gap-2">رسوم التوصيل {!pro && <ProBadge />}</Label>
            {pro ? (
              <>
                <Input
                  id="delivery"
                  type="number"
                  min="0"
                  step="0.01"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  placeholder="0"
                  dir="ltr"
                />
                <p className="text-xs text-gray-400">تُضاف تلقائياً لإجمالي الطلب. اتركها 0 إذا كان التوصيل مجانياً أو يُحسب لاحقاً.</p>
              </>
            ) : (
              <ProUpsell feature="رسوم التوصيل" />
            )}
          </div>

          {/* Payment methods — display only (Dukkan never processes money) */}
          <div className="space-y-2.5">
            <div>
              <Label>طرق الدفع المقبولة</Label>
              <p className="text-xs text-gray-400 mt-0.5">تظهر للعميل عند الطلب ليعرف كيف يدفع لك. دكان لا يتقاضى أي عمولة.</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">إنستاباي (رقم أو اسم مستخدم)</label>
              <Input value={payInstapay} onChange={(e) => setPayInstapay(e.target.value)} placeholder="01012345678 أو username@instapay" dir="ltr" maxLength={60} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">فودافون كاش (رقم)</label>
              <Input value={payVodafone} onChange={(e) => setPayVodafone(e.target.value.replace(/[^\d]/g, ''))} placeholder="01012345678" dir="ltr" maxLength={15} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer pt-1">
              <button
                type="button"
                onClick={() => setPayCod((v) => !v)}
                aria-label="الدفع عند الاستلام"
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${payCod ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${payCod ? 'right-1' : 'right-6'}`} />
              </button>
              <span className="text-sm text-gray-700">الدفع عند الاستلام (كاش)</span>
            </label>
          </div>

          {/* Store open/closed */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <Label className="cursor-pointer">المتجر مفتوح</Label>
              <p className="text-xs text-gray-400 mt-0.5">عند الإغلاق، يتصفح العملاء لكن لا يمكنهم إتمام الطلب</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen((v) => !v)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${isOpen ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${isOpen ? 'right-1' : 'right-6'}`} />
            </button>
          </div>

          {/* WhatsApp message template */}
          <div className="space-y-1">
            <Label htmlFor="template">رسالة الترحيب في الطلب (اختياري)</Label>
            <textarea
              id="template"
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              placeholder="مثال: أهلاً! حابب أطلب من متجرك 🛍️"
              rows={2}
              maxLength={300}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
            <p className="text-xs text-gray-400">أول سطر في رسالة الواتساب التي يرسلها العميل. اتركه فارغاً للرسالة الافتراضية.</p>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 4: Identity & contact ── */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <h2 className="text-sm font-bold text-gray-900">هوية المتجر والتواصل</h2>

          <div className="space-y-1">
            <Label htmlFor="about">عن المتجر (اختياري)</Label>
            <textarea
              id="about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="نبذة عن متجرك، قصتك، ما يميزك..."
              rows={3}
              maxLength={500}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="location">الموقع (اختياري)</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="القاهرة، مدينة نصر" maxLength={120} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="hours">مواعيد العمل (اختياري)</Label>
              <Input id="hours" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} placeholder="يومياً ١٠ص - ١٢م" maxLength={120} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">روابط التواصل (اختياري) {!pro && <ProBadge />}</Label>
            {pro ? (
              <>
                <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="إنستجرام — اسم المستخدم أو الرابط" dir="ltr" maxLength={150} />
                <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="فيسبوك — اسم المستخدم أو الرابط" dir="ltr" maxLength={150} />
                <Input value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="تيك توك — اسم المستخدم أو الرابط" dir="ltr" maxLength={150} />
              </>
            ) : (
              <ProUpsell feature="روابط التواصل الاجتماعي" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sticky save bar — stays reachable on every screen size so the user
          never has to scroll the long form to save. */}
      <div className="sticky bottom-0 -mx-4 px-4 lg:-mx-8 lg:px-8 py-3 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent">
        {store && dirty && (
          <p className="mb-2 text-center text-xs text-amber-600">● لديك تغييرات غير محفوظة</p>
        )}
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
          {loading ? 'جاري الحفظ...' : store ? 'حفظ التغييرات' : 'إنشاء المتجر'}
        </Button>
      </div>
    </form>
  )
}
