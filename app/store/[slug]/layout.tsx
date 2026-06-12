import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type Props = {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: store } = await supabase
    .from('stores')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!store) return { title: 'متجر غير موجود' }

  return {
    title: store.name,
    description: store.description ?? `تسوق من ${store.name} عبر واتساب`,
  }
}

export default async function StorefrontLayout({ children, params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!store) notFound()

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Store header — mobile-first, max readable width on desktop */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          {store.logo_url ? (
            <img
              src={store.logo_url}
              alt={store.name}
              className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-2 ring-green-100"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-xl flex-shrink-0">
              🛍️
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-bold text-gray-900 text-base truncate">{store.name}</h1>
            {store.description && (
              <p className="text-xs text-gray-400 truncate">{store.description}</p>
            )}
          </div>
        </div>
      </header>

      {children}
    </div>
  )
}
