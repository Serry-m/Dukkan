'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  const [isOpen, setIsOpen] = useState(store?.is_open ?? true)
  const [messageTemplate, setMessageTemplate] = useState(store?.message_template ?? '')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(store?.logo_url ?? null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(store?.banner_url ?? null)
  const [layout, setLayout] = useState(store?.layout ?? 'grid')
  const [theme, setTheme] = useState(store?.theme ?? 'modern')
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
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  async function uploadImage(file: File, folder: string): Promise<string | null> {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${folder}/${userId}/${Date.now()}.${ext}`
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
    }

    if (bannerFile) {
      bannerUrl = await uploadImage(bannerFile, 'banners')
      if (!bannerUrl) {
        setError('فشل رفع صورة الغلاف')
        setLoading(false)
        return
      }
    }

    const payload = {
      name, slug, whatsapp_number: whatsapp, description, logo_url: logoUrl, banner_url: bannerUrl,
      theme_color: themeColor, currency, delivery_fee: parseFloat(deliveryFee) || 0, is_open: isOpen,
      message_template: messageTemplate.trim() || null, layout, theme,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

      {/* ── Section 1: Basic info ── */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <h2 className="text-sm font-bold text-gray-900">المعلومات الأساسية</h2>

          <div className="space-y-1">
            <Label htmlFor="name">اسم المتجر</Label>
            <Input id="name" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="مثال: متجر محمود للإكسسوارات" required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="whatsapp">رقم واتساب</Label>
            <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))} placeholder="01012345678" required dir="ltr" />
            <p className="text-xs text-gray-400">أدخل رقمك المصري — كود الدولة يُضاف تلقائياً</p>
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
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-400">أحرف إنجليزية وأرقام وشرطة فقط</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">وصف المتجر (اختياري)</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="مثال: أفضل الإكسسوارات بأسعار منافسة" />
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
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-8 h-8 rounded-lg border border-gray-200" style={{ backgroundColor: t.swatch }} />
                      {selected && <Check size={16} className="text-green-600" />}
                      {locked && <Lock size={13} className="text-gray-400" />}
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
                <label htmlFor="logo" className="text-sm text-green-600 hover:underline cursor-pointer font-medium">
                  اختر صورة
                </label>
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
                {['#16a34a','#2563eb','#9333ea','#dc2626','#ea580c','#0891b2'].map((color) => (
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
                <label htmlFor="banner" className="inline-block text-sm text-green-600 hover:underline cursor-pointer font-medium">
                  {bannerPreview ? 'تغيير صورة الغلاف' : 'رفع صورة غلاف'}
                </label>
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
              className="w-full border border-input rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="location">الموقع (اختياري)</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="القاهرة، مدينة نصر" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="hours">مواعيد العمل (اختياري)</Label>
              <Input id="hours" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} placeholder="يومياً ١٠ص - ١٢م" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>روابط التواصل (اختياري)</Label>
            <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="إنستجرام — اسم المستخدم أو الرابط" dir="ltr" />
            <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="فيسبوك — اسم المستخدم أو الرابط" dir="ltr" />
            <Input value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="تيك توك — اسم المستخدم أو الرابط" dir="ltr" />
          </div>
        </CardContent>
      </Card>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent lg:static lg:mx-0 lg:px-0 lg:bg-none lg:py-0">
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
          {loading ? 'جاري الحفظ...' : store ? 'حفظ التغييرات' : 'إنشاء المتجر'}
        </Button>
      </div>
    </form>
  )
}
