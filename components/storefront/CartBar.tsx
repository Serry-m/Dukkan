'use client'

import { useState } from 'react'
import type { Store } from '@/types'
import { useCartStore } from '@/lib/cart-store'
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Trash2, MessageCircle } from 'lucide-react'

export default function CartBar({ store }: { store: Store }) {
  const items = useCartStore((s) => s.items)
  const totalItems = useCartStore((s) => s.totalItems())
  const totalPrice = useCartStore((s) => s.totalPrice())
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const [open, setOpen] = useState(false)

  function handleOrder() {
    const url = buildWhatsAppOrderUrl(store, items)
    clearCart()
    window.open(url, '_blank')
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* SheetTrigger renders as a button by default — we just style it */}
      <SheetTrigger
        className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-50 w-[calc(100%-2rem)] bg-green-600 text-white rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-xl hover:bg-green-700 active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-2">
          <div className="bg-white/20 rounded-lg px-2 py-0.5 text-sm font-bold">
            {totalItems}
          </div>
          <span className="text-sm font-medium">عرض السلة</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold">{totalPrice.toLocaleString('ar-EG')} جنيه</span>
          <ShoppingCart size={18} />
        </div>
      </SheetTrigger>

      <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-auto px-4 pb-6" dir="rtl">
        <SheetHeader className="text-right pb-4 border-b">
          <SheetTitle>سلة التسوق</SheetTitle>
        </SheetHeader>

        <div className="py-4 space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex items-center gap-3">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                  📦
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-xs text-gray-400">
                  {quantity} × {product.price.toLocaleString('ar-EG')} جنيه
                </p>
              </div>
              <p className="font-bold text-sm text-green-600 flex-shrink-0">
                {(product.price * quantity).toLocaleString('ar-EG')} جنيه
              </p>
              <button onClick={() => removeItem(product.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex justify-between font-bold text-lg">
            <span>الإجمالي</span>
            <span className="text-green-600">{totalPrice.toLocaleString('ar-EG')} جنيه</span>
          </div>

          <Button
            className="w-full bg-green-500 hover:bg-green-600 h-12 text-base gap-2"
            onClick={handleOrder}
          >
            <MessageCircle size={20} />
            اطلب عبر واتساب
          </Button>

          <p className="text-xs text-center text-gray-400">
            سيتم فتح واتساب مع تفاصيل طلبك تلقائياً
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
