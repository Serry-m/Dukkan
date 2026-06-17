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
  plan: 'free' | 'pro'
  plan_expires_at: string | null
  category_order: string[]
  layout: 'grid' | 'list'
  font: 'cairo' | 'tajawal' | 'almarai'
  banner_url: string | null
  card_style: 'rounded' | 'sharp'
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
  items: OrderItem[]
  total: number
  customer_name: string | null
  customer_phone: string | null
  customer_address: string | null
  notes: string | null
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
  sort_order: number
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
