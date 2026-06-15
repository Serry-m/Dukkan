'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

type Props = {
  storeId: string
  product: Product | null
}

export default function ProductForm({ storeId, product }: Props) {
  const router = useRouter()
  const [name, setName] = useState(product?.name ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [inStock, setInStock] = useState(product?.in_stock ?? true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function uploadImage(file: File): Promise<string | null> {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `products/${storeId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('store-assets').upload(path, file, { upsert: true })
    if (error) {
      setError(`فشل رفع الصورة: ${error.message}`)
      return null
    }
    const { data } = supabase.storage.from('store-assets').getPublicUrl(path)
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

    const payload = {
      store_id: storeId,
      name,
      price: parseFloat(price),
      description: description || null,
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
            <Label htmlFor="price">السعر (جنيه)</Label>
            <Input id="price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="150" required dir="ltr" />
          </div>

          {/* Textarea for description so long text isn't cut off */}
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
