'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Product, ProductOption } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, X, ImagePlus } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  storeId: string
  product: Product | null
  categories?: string[]
}

// The editor keeps option values as a raw comma-separated string for easy
// typing; we split into an array only on save.
type DraftOption = { name: string; valuesRaw: string }

// A photo slot is either an already-saved url or a freshly picked file.
type ImageSlot = { url: string | null; file: File | null; preview: string }

export default function ProductForm({ storeId, product, categories = [] }: Props) {
  const router = useRouter()
  const [name, setName] = useState(product?.name ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [category, setCategory] = useState(product?.category ?? '')
  const [inStock, setInStock] = useState(product?.in_stock ?? true)
  // Up to 3 photo slots. Each is either an already-saved url or a new file.
  const initialImages = product?.images?.length
    ? product.images
    : product?.image_url
      ? [product.image_url]
      : []
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(
    initialImages.map((u) => ({ url: u, file: null, preview: u }))
  )
  const [options, setOptions] = useState<DraftOption[]>(
    (product?.options ?? []).map((o) => ({ name: o.name, valuesRaw: o.values.join('، ') }))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const MAX_IMAGES = 3

  function handleAddImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageSlots((prev) =>
      prev.length >= MAX_IMAGES ? prev : [...prev, { url: null, file, preview: URL.createObjectURL(file) }]
    )
    e.target.value = '' // allow re-selecting the same file
  }

  function removeImage(i: number) {
    setImageSlots((prev) => prev.filter((_, idx) => idx !== i))
  }

  function addOption() {
    setOptions((prev) => [...prev, { name: '', valuesRaw: '' }])
  }
  function updateOption(i: number, patch: Partial<DraftOption>) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o)))
  }
  function removeOption(i: number) {
    setOptions((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function uploadImage(file: File): Promise<string | null> {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `products/${storeId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('store_assets').upload(path, file, { upsert: true })
    if (error) {
      setError(`فشل رفع الصورة: ${error.message}`)
      return null
    }
    const { data } = supabase.storage.from('store_assets').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    // Upload any new photos; keep existing urls. Order is preserved.
    const images: string[] = []
    for (const slot of imageSlots) {
      if (slot.file) {
        const url = await uploadImage(slot.file)
        if (!url) { setLoading(false); return }
        images.push(url)
      } else if (slot.url) {
        images.push(slot.url)
      }
    }
    const imageUrl = images[0] ?? null

    // Clean the option groups: drop empty names / values.
    const cleanOptions: ProductOption[] = options
      .map((o) => ({
        name: o.name.trim(),
        values: o.valuesRaw
          .split(/[,،]/)
          .map((v) => v.trim())
          .filter(Boolean),
      }))
      .filter((o) => o.name && o.values.length > 0)

    const payload = {
      store_id: storeId,
      name,
      price: parseFloat(price),
      description: description || null,
      category: category.trim() || null,
      options: cleanOptions,
      in_stock: inStock,
      image_url: imageUrl,
      images,
    }

    if (product) {
      const { error } = await supabase.from('products').update(payload).eq('id', product.id)
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) { setError(error.message); setLoading(false); return }
    }

    toast.success(product ? 'تم حفظ المنتج' : 'تمت إضافة المنتج')
    router.push('/dashboard/products')
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>}

          <div className="space-y-1">
            <Label htmlFor="name">اسم المنتج</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: سماعة بلوتوث" required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="price">السعر</Label>
            <Input id="price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="150" required dir="ltr" />
          </div>

          {/* Category with datalist of existing categories */}
          <div className="space-y-1">
            <Label htmlFor="category">التصنيف (اختياري)</Label>
            <Input
              id="category"
              list="category-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="مثال: أقراط، سلاسل، خواتم"
            />
            <datalist id="category-list">
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
            <p className="text-xs text-gray-400">يساعد العملاء على تصفح متجرك حسب النوع</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">الوصف (اختياري)</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر للمنتج — اللون، المقاس، المواصفات..."
              rows={3}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>

          {/* Product photos — up to 3 */}
          <div className="space-y-2">
            <Label>صور المنتج <span className="text-gray-400 font-normal">(حتى ٣ صور)</span></Label>
            <div className="flex gap-2.5 flex-wrap">
              {imageSlots.map((slot, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                  <img src={slot.preview} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full">رئيسية</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              {imageSlots.length < MAX_IMAGES && (
                <label
                  htmlFor="image"
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-green-400 hover:bg-green-50/40 transition-colors text-gray-400"
                >
                  <ImagePlus size={20} />
                  <span className="text-[10px] font-medium">إضافة صورة</span>
                </label>
              )}
            </div>
            <input id="image" type="file" accept="image/*" className="hidden" onChange={handleAddImage} />
            <p className="text-xs text-gray-400">الصورة الأولى هي الرئيسية التي تظهر في قائمة المنتجات</p>
          </div>

          {/* Variant options editor */}
          <div className="space-y-2">
            <Label>الخيارات (اختياري)</Label>
            <p className="text-xs text-gray-400 -mt-1">
              أضف خياراً واحداً لكل نوع (مثل «المقاس») واكتب كل القيم بداخله مفصولة بفاصلة. لا تنشئ خياراً منفصلاً لكل قيمة.
            </p>
            <div className="space-y-3">
              {options.map((opt, i) => {
                const previewValues = opt.valuesRaw.split(/[,،]/).map((v) => v.trim()).filter(Boolean)
                return (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">الخيار {(i + 1).toLocaleString('ar-EG')}</span>
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <X size={15} />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">اسم الخيار</label>
                      <Input
                        value={opt.name}
                        onChange={(e) => updateOption(i, { name: e.target.value })}
                        placeholder="مثال: المقاس"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">القيم (افصل بينها بفاصلة)</label>
                      <Input
                        value={opt.valuesRaw}
                        onChange={(e) => updateOption(i, { valuesRaw: e.target.value })}
                        placeholder="S، M، L"
                        className="bg-white"
                      />
                      {previewValues.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {previewValues.map((v, vi) => (
                            <span key={vi} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{v}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-1.5 text-sm font-medium text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} /> إضافة خيار
            </button>
          </div>

          <div className="flex items-center gap-3">
            <input id="inStock" type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="w-4 h-4 accent-green-600" />
            <Label htmlFor="inStock" className="cursor-pointer">متاح في المخزن</Label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? 'جاري الحفظ...' : product ? 'حفظ التعديلات' : 'إضافة المنتج'}
            </Button>
            <button type="button" onClick={() => router.back()} className="flex-1 h-8 rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted transition-colors">
              إلغاء
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
