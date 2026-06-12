'use client'

import { useState } from 'react'
import type { Store } from '@/types'
import { useCartStore } from '@/lib/cart-store'
import { buildWhatsAppOrderUrl, saveOrder } from '@/lib/whatsapp'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Trash2, MessageCircle, ArrowRight } from 'lucide-react'

// Two-step checkout: cart review → customer info → WhatsApp
type Step = 'cart' | 'info'

export default function CartBar({ store }: { store: Store }) {
  const items = useCartStore((s) => s.items)
  const totalItems = useCartStore((s) => s.totalItems())
  const totalPrice = useCartStore((s) => s.totalPrice())
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('cart')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [error, setError] = useState('')

  function handleOpenChange(val: boolean) {
    setOpen(val)
    if (!val) setStep('cart') // reset to cart view when closed
  }

  function handleProceed() {
    setError('')
    setStep('info')
  }

  function handleOrder() {
    if (!customerName.trim()) { setError('من فضلك أدخل اسمك'); return }
    if (!customerPhone.trim()) { setError('من فضلك أدخل رقم هاتفك'); return }

    const url = buildWhatsAppOrderUrl(store, items, customerName.trim(), customerPhone.trim())
    saveOrder(store, items, customerName.trim(), customerPhone.trim())
    clearCart()
    setOpen(false)
    setStep('cart')
    setCustomerName('')
    setCustomerPhone('')
    window.open(url, '_blank')
  }

  const themeColor = store.theme_color ?? '#16a34a'

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-50 w-[calc(100%-2rem)] text-white rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-xl active:scale-[0.98] transition-all"
        style={{ backgroundColor: themeColor }}
      >
        <div className="flex items-center gap-2">
          <div className="bg-white/20 rounded-lg px-2 py-0.5 text-sm font-bold">{totalItems}</div>
          <span className="text-sm font-medium">عرض السلة</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold">{totalPrice.toLocaleString('ar-EG')} جنيه</span>
          <ShoppingCart size={18} />
        </div>
      </SheetTrigger>

      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-auto px-4 pb-8" dir="rtl">

        {/* ── Step 1: Cart review ── */}
        {step === 'cart' && (
          <>
            <SheetHeader className="text-right pb-4 border-b">
              <SheetTitle>سلة التسوق</SheetTitle>
            </SheetHeader>

            <div className="py-4 space-y-3">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">📦</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">{quantity} × {product.price.toLocaleString('ar-EG')} جنيه</p>
                  </div>
                  <p className="font-bold text-sm flex-shrink-0" style={{ color: themeColor }}>
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
                <span style={{ color: themeColor }}>{totalPrice.toLocaleString('ar-EG')} جنيه</span>
              </div>
              <Button
                className="w-full h-12 text-base gap-2 text-white"
                style={{ backgroundColor: themeColor }}
                onClick={handleProceed}
              >
                متابعة الطلب
                <ArrowRight size={18} />
              </Button>
            </div>
          </>
        )}

        {/* ── Step 2: Customer info ── */}
        {step === 'info' && (
          <>
            <SheetHeader className="text-right pb-4 border-b">
              <SheetTitle>بيانات التواصل</SheetTitle>
            </SheetHeader>

            <div className="py-5 space-y-4">
              <p className="text-sm text-gray-500">
                حتى يتمكن البائع من التواصل معك لتأكيد الطلب
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">الاسم</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="محمد أحمد"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                  style={{ focusRingColor: themeColor } as React.CSSProperties}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">رقم الهاتف</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="01012345678"
                  dir="ltr"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
                />
              </div>

              {/* Order summary */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{quantity}× {product.name}</span>
                    <span className="font-medium">{(product.price * quantity).toLocaleString('ar-EG')} جنيه</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-gray-200 mt-2">
                  <span>الإجمالي</span>
                  <span style={{ color: themeColor }}>{totalPrice.toLocaleString('ar-EG')} جنيه</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full h-12 text-base gap-2 text-white"
                style={{ backgroundColor: themeColor }}
                onClick={handleOrder}
              >
                <MessageCircle size={20} />
                اطلب عبر واتساب
              </Button>
              <button
                onClick={() => setStep('cart')}
                className="w-full text-sm text-gray-400 hover:text-gray-600 py-2"
              >
                ← رجوع للسلة
              </button>
            </div>
          </>
        )}

      </SheetContent>
    </Sheet>
  )
}
