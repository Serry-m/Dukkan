import type { Product, Store } from '@/types'
import { effectivePrice } from './price'

function socialUrl(platform: 'instagram' | 'facebook' | 'tiktok', value: string): string {
  const v = value.trim()
  if (v.startsWith('http')) return v
  const handle = v.replace(/^@/, '')
  if (platform === 'instagram') return `https://instagram.com/${handle}`
  if (platform === 'facebook') return `https://facebook.com/${handle}`
  return `https://tiktok.com/@${handle}`
}

// Build absolute social profile URLs for a store (for JSON-LD sameAs).
export function storeSocialLinks(store: Pick<Store, 'instagram' | 'facebook' | 'tiktok'>): string[] {
  const out: string[] = []
  if (store.instagram) out.push(socialUrl('instagram', store.instagram))
  if (store.facebook) out.push(socialUrl('facebook', store.facebook))
  if (store.tiktok) out.push(socialUrl('tiktok', store.tiktok))
  return out
}

// Store/Organization JSON-LD for the storefront home — richer Google presence.
export function storeJsonLd({
  store,
  url,
  sameAs,
}: {
  store: Pick<Store, 'name' | 'description' | 'logo_url'>
  url?: string
  sameAs?: string[]
}) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.name,
    ...(store.description ? { description: store.description } : {}),
    ...(store.logo_url ? { logo: store.logo_url, image: [store.logo_url] } : {}),
    ...(url ? { url } : {}),
    ...(sameAs && sameAs.length ? { sameAs } : {}),
  }
  return data
}

// Product JSON-LD (schema.org) so storefront product pages are eligible for
// Google rich results — price, availability and image shown right in search.
// Helps stores get *found*, not just shared.
export function productJsonLd({
  product,
  storeName,
  currency,
  url,
}: {
  product: Product
  storeName: string
  currency: string
  url?: string
}) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    ...(product.image_url ? { image: [product.image_url] } : {}),
    ...(product.category ? { category: product.category } : {}),
    brand: { '@type': 'Brand', name: storeName },
    offers: {
      '@type': 'Offer',
      price: effectivePrice(product),
      priceCurrency: currency || 'EGP',
      availability: product.in_stock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: storeName },
      ...(url ? { url } : {}),
    },
  }
  return data
}
