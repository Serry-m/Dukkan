'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateImageFile, safeImageExt } from '@/lib/upload'
import type { Product, ProductOption } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, X, ImagePlus, Star } from 'lucide-react'
import { toast } from 'sonner'
import { ProUpsell, ProBadge } from '@/components/dashboard/ProLock'

type Props = { storeId: string; product: Product | null; categories?: string[]; isPro?: boolean }
type DraftOption = { name: string; valuesRaw: string }
type ImageSlot = { url: string | null; file: File | null; preview: string }

export default function ProductForm({ storeId, product, categories = [], isPro = false }: Props) {
  const router = useRouter()
  const [name, setName] = useState(product?.name ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [salePrice, setSalePrice] = useState(product?.sale_price?.toString() ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [category, setCategory] = useState(product?.category ?? '')
  const [inStock, setInStock] = useState(product?.in_stock ?? true)
  const [stockQty, setStockQty] = useState(product?.stock_quantity != null ? String(product.stock_quantity) : '')
  const [featured, setFeatured] = useState(product?.featured ?? false)
  const trackingQty = stockQty.trim() !== ''
  const initialImages = product?.images?.length ? product.images : product?.image_url ? [product.image_url] : []
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(initialImages.map((u) => ({ url: u, file: null, preview: u })))
  const [options, setOptions] = useState<DraftOption[]>((product?.options ?? []).map((o) => ({ name: o.name, valuesRaw: o.values.join('، ') })))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const MAX_IMAGES = isPro ? 3 : 1
  const saleInvalid = salePrice.trim() !== '' && price.trim() !== '' && parseFloat(salePrice) >= parseFloat(price)

  function handleAddImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setImageSlots((prev) => (prev.length >= MAX_IMAGES ? prev : [...prev, { url: null, file, preview: URL.createObjectURL(file) }]))
    e.target.value = ''
  }
  function removeImage(i: number) { setImageSlots((prev) => prev.filter((_, idx) => idx !== i)) }
  function makeMain(i: number) {
    setImageSlots((prev) => { if (i <= 0 || i >= prev.length) return prev; const next = [...prev]; const [p] = next.splice(i, 1); next.unshift(p); return next })
  }
  function addOption() { setOptions((prev) => [...prev, { name: '', valuesRaw: '' }]) }
  function updateOption(i: number, patch: Partial<DraftOption>) { setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o))) }
  function removeOption(i: number) { setOptions((prev) => prev.filter((_, idx) => idx !== i)) }

  async function uploadImage(file: File): Promise<string | null> {
    const invalid = validateImageFile(file)
    if (invalid) { setError(invalid); return null }
    const supabase = createClient()
    const path = `products/${storeId}/${Date.now()}.${safeImageExt(file)}`
    const { error } = await supabase.storage.from('store_assets').upload(path, file, { upsert: true })
    if (error) { setError(`فشل رفع الصورة: ${error.message}`); return null }
    const { data } = supabase.storage.from('store_assets').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (saleInvalid) { setError('سعر التخفيض يجب أن يكون أقل من السعر الأصلي.'); return }
    setLoading(true)
    const supabase = createClient()

    const images: string[] = []
    for (const slot of imageSlots) {
      if (slot.file) { const url = await uploadImage(slot.file); if (!url) { setLoading(false); return } images.push(url) }
      else if (slot.url) images.push(slot.url)
    }
    const imageUrl = images[0] ?? null

    const cleanOptions: ProductOption[] = options
      .map((o) => ({ name: o.name.trim(), values: o.valuesRaw.split(/[,،]/).map((v) => v.trim()).filter(Boolean) }))
      .filter((o) => o.name && o.values.length > 0)

    const qty = trackingQty ? Math.max(0, parseInt(stockQty, 10) || 0) : null
    const inStockFinal = qty != null ? qty > 0 : inStock

    const payload = {
      store_id: storeId, name, price: parseFloat(price),
      sale_price: salePrice.trim() ? parseFloat(salePrice) : null,
      description: description || null, category: category.trim() || null,
      options: cleanOptions, in_stock: inStockFinal, stock_quantity: qty,
      featured: isPro ? featured : (product?.featured ?? false),
      image_url: imageUrl, images,
    }

    const res = product
      ? await supabase.from('products').update(payload).eq('id', product.id)
      : await supabase.from('products').insert(payload)
    if (res.error) { setError(res.error.message); setLoading(false); return }

    toast.success(product ? 'تم حفظ المنتج' : 'تمت إضافة المنتج')
    router.push('/dashboard/products')
    router.refresh()
  }

  const sectionTitle = 'text-[15px] font-extrabold text-[#1d1b16] mb-4'

  return (
    <form onSubmit={handleSubmit} className="pb-24">
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-start">
        {/* ── Main column ── */}
        <div className="space-y-5 min-w-0">
          <Card><CardContent className="pt-6">
            <h2 className={sectionTitle}>تفاصيل المنتج</h2>
            <div className="space-y-5">
              <div className="space-y-1">
                <Label htmlFor="name">اسم المنتج</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: سماعة بلوتوث" required maxLength={80} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="price">السعر</Label>
                  <Input id="price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="150" required dir="ltr" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="salePrice">سعر التخفيض (اختياري)</Label>
                  <Input id="salePrice" type="number" min="0" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="—" dir="ltr" />
                </div>
              </div>
              {saleInvalid && <p className="text-xs text-amber-600 -mt-3">سعر التخفيض يجب أن يكون أقل من السعر الأصلي ليظهر كخصم.</p>}

              <div className="space-y-1">
                <Label htmlFor="category" className="flex items-center gap-2">التصنيف (اختياري) {!isPro && <ProBadge />}</Label>
                {isPro ? (
                  <>
                    <Input id="category" list="category-list" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="مثال: أقراط، سلاسل، خواتم" maxLength={40} />
                    <datalist id="category-list">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                    <p className="text-xs text-gray-400">يساعد العملاء على تصفح متجرك حسب النوع</p>
                  </>
                ) : <ProUpsell feature="التصنيفات" />}
              </div>

              <div className="space-y-1">
                <Label htmlFor="description">الوصف (اختياري)</Label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف مختصر للمنتج — اللون، المقاس، المواصفات..." rows={4} maxLength={500} className="w-full border border-input rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50" />
              </div>
            </div>
          </CardContent></Card>

          {/* Variants */}
          <Card><CardContent className="pt-6">
            <h2 className={sectionTitle}>الخيارات والمتغيرات {!isPro && <span className="align-middle"><ProBadge /></span>}</h2>
            {!isPro ? <ProUpsell feature="خيارات المنتج (مقاسات وألوان)" /> : (
              <>
                <p className="text-xs text-gray-400 mb-3">أضف خياراً واحداً لكل نوع (مثل «المقاس») واكتب كل القيم بداخله مفصولة بفاصلة. لا تنشئ خياراً منفصلاً لكل قيمة.</p>
                <div className="space-y-3">
                  {options.map((opt, i) => {
                    const previewValues = opt.valuesRaw.split(/[,،]/).map((v) => v.trim()).filter(Boolean)
                    return (
                      <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-500">الخيار {(i + 1).toLocaleString('ar-EG')}</span>
                          <button type="button" onClick={() => removeOption(i)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><X size={15} /></button>
                        </div>
                        <div className="space-y-1"><label className="text-xs font-medium text-gray-600">اسم الخيار</label><Input value={opt.name} onChange={(e) => updateOption(i, { name: e.target.value })} placeholder="مثال: المقاس" className="bg-white" /></div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-600">القيم (افصل بينها بفاصلة)</label>
                          <Input value={opt.valuesRaw} onChange={(e) => updateOption(i, { valuesRaw: e.target.value })} placeholder="S، M، L" className="bg-white" />
                          {previewValues.length > 0 && <div className="flex flex-wrap gap-1.5 pt-1">{previewValues.map((v, vi) => <span key={vi} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{v}</span>)}</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <button type="button" onClick={addOption} className="mt-3 flex items-center gap-1.5 text-sm font-bold text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors"><Plus size={15} /> إضافة خيار</button>
              </>
            )}
          </CardContent></Card>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5 lg:sticky lg:top-[76px]">
          {/* Images */}
          <Card><CardContent className="pt-6">
            <h2 className={sectionTitle}>صور المنتج <span className="text-gray-400 font-normal text-xs">{isPro ? '(حتى ٣)' : '(صورة واحدة)'}</span></h2>
            <div className="grid grid-cols-3 gap-2.5">
              {imageSlots.map((slot, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                  <img src={slot.preview} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 ? (
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full">رئيسية</span>
                  ) : (
                    <button type="button" onClick={() => makeMain(i)} className="absolute bottom-1 right-1 left-1 bg-black/55 text-white text-[9px] py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-600">رئيسية</button>
                  )}
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition-colors"><X size={13} /></button>
                </div>
              ))}
              {imageSlots.length < MAX_IMAGES && (
                <label htmlFor="image" className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-green-400 hover:bg-green-50/40 transition-colors text-gray-400">
                  <ImagePlus size={20} /><span className="text-[10px] font-medium">إضافة</span>
                </label>
              )}
            </div>
            <input id="image" type="file" accept="image/*" className="hidden" onChange={handleAddImage} />
            {imageSlots.length === 0
              ? <p className="text-xs text-amber-600 mt-2">📷 أضف صورة واضحة — المنتجات بصور تحصل على طلبات أكثر بكثير.</p>
              : <p className="text-xs text-gray-400 mt-2">الصورة الأولى هي الرئيسية في القائمة.</p>}
            {!isPro && <div className="mt-3"><ProUpsell feature="إضافة حتى ٣ صور للمنتج" /></div>}
          </CardContent></Card>

          {/* Availability + featured */}
          <Card><CardContent className="pt-6 space-y-4">
            <h2 className={sectionTitle}>التوفّر</h2>
            <div className={`flex items-center gap-3 ${trackingQty ? 'opacity-50' : ''}`}>
              <button type="button" onClick={() => !trackingQty && setInStock((v) => !v)} disabled={trackingQty} aria-label="متاح في المخزن" className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${inStock ? 'bg-green-600' : 'bg-gray-300'} ${trackingQty ? 'cursor-not-allowed' : ''}`}>
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${inStock ? 'right-1' : 'right-6'}`} />
              </button>
              <span className="text-sm font-medium text-gray-700">{inStock ? 'متاح في المخزن' : 'غير متاح حالياً'}</span>
            </div>
            <div className="space-y-1">
              <Label htmlFor="stockQty">الكمية المتاحة (اختياري)</Label>
              <Input id="stockQty" type="number" min="0" step="1" value={stockQty} onChange={(e) => setStockQty(e.target.value.replace(/[^\d]/g, ''))} placeholder="مثال: 5" dir="ltr" className="max-w-[160px]" />
              <p className="text-xs text-gray-400">{trackingQty ? 'يُضبط التوفّر تلقائياً من الكمية، ويظهر «متبقّي ٣» للعميل عند قرب النفاد.' : 'اتركها فارغة لاستخدام مفتاح التوفّر فقط.'}</p>
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-1">
              <Label className="flex items-center gap-2">منتج مميز {!isPro && <ProBadge />}</Label>
              {isPro ? (
                <>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 accent-green-600" />
                    <span className="text-sm text-gray-600 inline-flex items-center gap-1">يظهر أولاً مع شارة <Star size={12} className="fill-amber-400 text-amber-400" /> مميز</span>
                  </label>
                  <p className="text-[11px] text-gray-400">ميّز أفضل منتجاتك فقط.</p>
                </>
              ) : <ProUpsell feature="تمييز المنتجات" />}
            </div>
          </CardContent></Card>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 left-0 right-0 -mx-4 px-4 lg:-mx-8 lg:px-8 mt-5 py-3.5 bg-[#FBFAF7]/92 backdrop-blur-md border-t border-[#ECE7DC] flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>إلغاء</Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700 px-7" disabled={loading || saleInvalid}>
          {loading ? 'جاري الحفظ...' : product ? 'حفظ التعديلات' : 'إضافة المنتج'}
        </Button>
      </div>
    </form>
  )
}
