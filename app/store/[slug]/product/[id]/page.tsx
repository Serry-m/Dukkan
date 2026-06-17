import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Product } from '@/types'
import ProductDetailView from '@/components/storefront/ProductDetailView'

type Props = { params: Promise<{ slug: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url, price')
    .eq('id', id)
    .single()

  if (!product) return { title: 'منتج غير موجود' }

  const images = product.image_url ? [{ url: product.image_url }] : undefined
  return {
    title: product.name,
    description: product.description ?? `${product.name} — اطلب الآن عبر واتساب`,
    openGraph: {
      title: product.name,
      description: product.description ?? `اطلب ${product.name} الآن`,
      images,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: product.name, images: product.image_url ? [product.image_url] : undefined },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug, id } = await params
  const supabase = await createClient()

  const { data: store } = await supabase.from('stores').select('id, slug, theme_color, currency').eq('slug', slug).single()
  if (!store) notFound()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('store_id', store.id)
    .single()
  if (!product) notFound()

  // Related: other products from the store, same category first.
  const { data: others } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .neq('id', id)
    .order('in_stock', { ascending: false })
    .order('sort_order', { ascending: true })
    .limit(20)

  const all = (others ?? []) as Product[]
  const sameCat = product.category ? all.filter((p) => p.category === product.category) : []
  const related = [...sameCat, ...all.filter((p) => !sameCat.includes(p))].slice(0, 8)

  return (
    <ProductDetailView
      product={product}
      slug={store.slug}
      themeColor={store.theme_color ?? '#16a34a'}
      currency={store.currency}
      related={related}
    />
  )
}
