'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Store } from '@/types'
import { CURRENCIES } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Camera } from 'lucide-react'

type Props = {
  store: Store | null
  userId: string
}

export default function StoreSettingsForm({ store, userId }: Props) {
  const router = useRouter()
  const [name, setName] = useState(store?.name ?? '')
  const [slug, setSlug] = useState(store?.slug ?? '')
  const [whatsapp, setWhatsapp] = useState(store?.whatsapp_number ?? '')
  const [description, setDescription] = useState(store?.description ?? '')
  const [themeColor, setThemeColor] = useState(store?.theme_color ?? '#16a34a')
  const [currency, setCurrency] = useState(store?.currency ?? 'EGP')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(store?.logo_url ?? null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
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

  async function uploadLogo(file: File): Promise<string | null> {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `logos/${userId}/${Date.now()}.${ext}`
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
    setSuccess(false)
    setLoading(true)

    const supabase = createClient()
    let logoUrl = store?.logo_url ?? null

    if (logoFile) {
      logoUrl = await uploadLogo(logoFile)
      if (!logoUrl) {
        setError('فشل رفع الشعار — تأكد من إنشاء Storage bucket باسم store-assets')
        setLoading(false)
        return
      }
    }

    const payload = { name, slug, whatsapp_number: whatsapp, description, logo_url: logoUrl, theme_color: themeColor, currency }

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

    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md">تم الحفظ بنجاح ✓</div>}

          <div className="space-y-1">
            <Label htmlFor="name">اسم المتجر</Label>
            <Input id="name" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="مثال: متجر محمود للإكسسوارات" required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="whatsapp">رقم واتساب</Label>
            <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))} placeholder="01012345678" required dir="ltr" />
            <p className="text-xs text-gray-400">أدخل رقمك المصري — كود الدولة يُضاف تلقائياً</p>
          </div>

          {/* Logo upload */}
          <div className="space-y-2">
            <Label>شعار المتجر</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center flex-shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🛍️</span>
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
          </div>

          {/* Currency selector */}
          <div className="space-y-1">
            <Label htmlFor="currency">العملة</Label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full h-9 border border-input rounded-lg px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name} ({c.label})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">وصف المتجر (اختياري)</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="مثال: أفضل الإكسسوارات بأسعار منافسة" />
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? 'جاري الحفظ...' : store ? 'حفظ التغييرات' : 'إنشاء المتجر'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
