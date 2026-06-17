import type { Product } from '@/types'
import { effectivePrice } from './price'

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
