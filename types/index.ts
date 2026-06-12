// The core data shapes used everywhere in the app.
// Keeping types in one file makes it easy to stay consistent
// between the dashboard (owner) and the storefront (customer).

export type Store = {
  id: string
  owner_id: string        // links to Supabase auth user
  slug: string            // unique URL handle e.g. "mahmoud-gadgets"
  name: string
  description: string | null
  logo_url: string | null
  whatsapp_number: string // e.g. "201012345678" (international, no +)
  currency: string        // default "EGP"
  created_at: string
}

export type Product = {
  id: string
  store_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  in_stock: boolean
  sort_order: number
  created_at: string
}

// CartItem is client-only — never stored in the DB.
// It combines product data with the quantity the customer chose.
export type CartItem = {
  product: Product
  quantity: number
}
