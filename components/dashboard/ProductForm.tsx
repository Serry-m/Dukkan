'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Product, ProductOption } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, X } from 'lucide-react'

type Props = {
  storeId: string
  product: Product | null
  categories?: string[]
}

// The editor keeps option values as a raw comma-separated string for easy
// typing; we split into an array only on save.
type DraftOption = { name: string; valuesRaw: string }

export default function ProductForm({ storeId, product, categories = [] }: Props) {
  const router = useRouter()
  const [name, setName] = useState(product?.name ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [category, setCategory] = useState(product?.category ?? '')
  const [inStock, setInStock] = useState(product?.in_stock ?? true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url ?? null)
  const [options, setOptions] = useState<DraftOption[]>(
    (product?.options ?? []).map((o) => ({ name: o.name, valuesRaw: o.values.join('، ') }))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
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
    let imageUrl = product?.image_url ?? null

    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
      if (!imageUrl) {
        setLoading(false)
        return
      }
    }

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
    }

    if (product) {
      const { error } = await supabase.from('products').update(payload).eq('id', product.id)
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await supabase.from('products').insert(payload)
      if (error) { setError(error.message); setLoading(false); return }
    }

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

          <div className="space-y-1">
            <Label htmlFor="image">صورة المنتج</Label>
            {imagePreview && (
              <img src={imagePreview} alt="preview" className="w-24 h-24 rounded-lg object-cover mb-2" />
            )}
            <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          {/* Variant options editor */}
          <div className="space-y-2">
            <Label>الخيارات (اختياري)</Label>
            <p className="text-xs text-gray-400 -mt-1">مثل المقاس أو اللون — يختار العميل قيمة عند الطلب</p>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-start bg-gray-50 rounded-xl p-2.5">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={opt.name}
                      onChange={(e) => updateOption(i, { name: e.target.value })}
                      placeholder="اسم الخيار (مثال: المقاس)"
                      className="bg-white"
                    />
                    <Input
                      value={opt.valuesRaw}
                      onChange={(e) => updateOption(i, { valuesRaw: e.target.value })}
                      placeholder="القيم مفصولة بفاصلة (S، M، L)"
                      className="bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
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
