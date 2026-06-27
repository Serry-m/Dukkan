import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import type { Product } from '@/types'
import ProductDetailView from '@/components/storefront/ProductDetailView'
import { productJsonLd } from '@/lib/structured-data'
import { isPro } from '@/lib/plan'
import { limitProducts } from '@/lib/storefront'

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

  const { data: store } = await supabase.from('stores').select('id, slug, name, theme_color, currency, plan, plan_expires_at').eq('slug', slug).single()
  if (!store) notFound()
  const pro = isPro(store)

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('store_id', store.id)
    .single()
  if (!product || product.hidden) notFound()

  // Related: other products from the store, same category first.
  const { data: others } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .neq('id', id)
    .order('in_stock', { ascending: false })
    .order('sort_order', { ascending: true })
    .limit(20)

  const all = ((others ?? []) as Product[]).filter((p) => !p.hidden)
  const sameCat = product.category ? all.filter((p) => p.category === product.category) : []
  const relatedRaw = [...sameCat, ...all.filter((p) => !sameCat.includes(p))].slice(0, 8)

  // Free/lapsed stores: strip Pro-only presentation (featured, category, extra photos).
  const viewProduct: Product = pro
    ? product
    : { ...product, featured: false, category: null, images: product.image_url ? [product.image_url] : [] }
  const related = pro ? relatedRaw : limitProducts(relatedRaw, store)

  // Absolute URL for this product page (rich-result canonical).
  const h = await headers()
  const host = h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  const url = host ? `${proto}://${host}/store/${store.slug}/product/${product.id}` : undefined

  const jsonLd = productJsonLd({ product, storeName: store.name, currency: store.currency, url })
  // Escape `<` so merchant-controlled fields (e.g. a product name containing
  // "</script>") can't break out of the JSON-LD script tag (stored XSS guard).
  const jsonLdHtml = JSON.stringify(jsonLd).replace(/</g, '\\u003c')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml }}
      />
      <ProductDetailView
        product={viewProduct}
        slug={store.slug}
        themeColor={store.theme_color ?? '#16a34a'}
        currency={store.currency}
        related={related}
      />
    </>
  )
}
