// The core data shapes used everywhere in the app.
// Keeping types in one file makes it easy to stay consistent
// between the dashboard (owner) and the storefront (customer).

export type Store = {
  id: string
  owner_id: string
  slug: string
  name: string
  description: string | null
  logo_url: string | null
  whatsapp_number: string
  currency: string
  theme_color: string     // hex color e.g. "#16a34a"
  is_open: boolean
  message_template: string | null
  view_count: number
  delivery_fee: number
  theme: string
  about: string | null
  location: string | null
  working_hours: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  plan: 'free' | 'pro'
  plan_expires_at: string | null
  category_order: string[]
  layout: 'grid' | 'list'
  font: 'cairo' | 'tajawal' | 'almarai'
  font_override: string | null
  banner_url: string | null
  card_style: 'rounded' | 'sharp'
  // Payment methods the merchant accepts (display-only — Dukkan never processes money).
  payment_instapay: string | null
  payment_vodafone: string | null
  payment_cod: boolean
  // Home sections (merchant-controlled storefront blocks).
  store_type: string | null
  announcement_enabled: boolean
  announcement_text: string | null
  show_collection_tiles: boolean
  promo_enabled: boolean
  promo_title: string | null
  promo_subtitle: string | null
  created_at: string
}

export type Coupon = {
  id: string
  store_id: string
  code: string
  type: 'percent' | 'fixed'
  value: number
  active: boolean
  expires_at: string | null   // optional expiry date; null = never expires
  usage_limit: number | null  // optional max redemptions; null = unlimited
  created_at: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'delivered'

export type OrderItem = {
  name: string
  quantity: number
  price: number
  options?: Record<string, string> | null  // selected variant options, e.g. { "المقاس": "M" }
}

export type Order = {
  id: string
  store_id: string
  order_number: number | null  // sequential per-store number (#1001…); null for pre-v23 orders
  items: OrderItem[]
  total: number
  customer_name: string | null
  customer_phone: string | null
  customer_address: string | null
  notes: string | null
  coupon_code: string | null
  status: OrderStatus
  created_at: string
}

// A variant option group, e.g. { name: "المقاس", values: ["S","M","L"] }
export type ProductOption = {
  name: string
  values: string[]
}

export type Product = {
  id: string
  store_id: string
  name: string
  description: string | null
  price: number
  sale_price: number | null  // optional discounted price (applies when 0 < sale_price < price)
  image_url: string | null   // primary image (= images[0]); used for cards/thumbnails
  images: string[]           // up to 3 photos shown in the detail carousel
  in_stock: boolean
  stock_quantity: number | null  // optional inventory count; null = use in_stock toggle only
  hidden: boolean                // hidden from the public storefront (still in the dashboard)
  sort_order: number
  featured: boolean
  category: string | null
  options: ProductOption[]
  created_at: string
}

// CartItem is client-only — never stored in the DB.
// It combines product data with the quantity the customer chose.
// `selectedOptions` holds the variant choices (e.g. { "المقاس": "M" }).
// `lineId` uniquely identifies a cart line: same product with different
// options becomes a separate line.
export type CartItem = {
  product: Product
  quantity: number
  selectedOptions?: Record<string, string>
  lineId: string
}
