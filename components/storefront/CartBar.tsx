'use client'

import { useState } from 'react'
import type { Store } from '@/types'
import { useCartStore } from '@/lib/cart-store'
import { buildWhatsAppOrderUrl, saveOrder } from '@/lib/whatsapp'
import { currencyLabel } from '@/lib/currency'
import { readableText } from '@/lib/color'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Trash2, MessageCircle, ArrowRight, CheckCircle, Package } from 'lucide-react'

type Step = 'cart' | 'info' | 'done'

function optionsLabel(opts?: Record<string, string>): string {
  if (!opts || !Object.keys(opts).length) return ''
  return Object.entries(opts).map(([k, v]) => `${k}: ${v}`).join('، ')
}

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
  const [customerAddress, setCustomerAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [ordering, setOrdering] = useState(false)

  function handleOpenChange(val: boolean) {
    setOpen(val)
    if (!val && step !== 'done') setStep('cart')
  }

  function handleProceed() {
    setError('')
    setStep('info')
  }

  async function handleOrder() {
    if (!store.is_open) { setError('المتجر مغلق مؤقتاً — لا يمكن إتمام الطلب الآن'); return }
    if (!customerName.trim()) { setError('من فضلك أدخل اسمك'); return }
    const phoneDigits = customerPhone.replace(/\D/g, '')
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setError('رقم الهاتف غير صحيح — أدخل 11 رقم مثل 01012345678')
      return
    }
    if (!customerAddress.trim()) { setError('من فضلك أدخل عنوان التوصيل'); return }
    if (!store.whatsapp_number?.trim()) {
      setError('هذا المتجر لم يضبط رقم واتساب بعد — تواصل مع صاحب المتجر')
      return
    }

    setOrdering(true)
    setError('')
    const customer = {
      name: customerName.trim(),
      phone: phoneDigits,
      address: customerAddress.trim(),
      notes: notes.trim(),
    }
    const url = buildWhatsAppOrderUrl(store, items, customer)

    try {
      await saveOrder(store, items, customer)
    } catch (err) {
      console.error('Failed to save order:', err)
    }

    clearCart()
    setStep('done')
    setOrdering(false)
    window.open(url, '_blank')
  }

  const themeColor = store.theme_color ?? '#16a34a'
  const onTheme = readableText(themeColor)
  const curr = currencyLabel(store.currency)
  const deliveryFee = Number(store.delivery_fee || 0)
  const grandTotal = totalPrice + deliveryFee

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2'

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-50 w-[calc(100%-2rem)] rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-xl active:scale-[0.98] transition-all"
        style={{ backgroundColor: themeColor, color: onTheme }}
      >
        <div className="flex items-center gap-2">
          <div className="bg-white/20 rounded-lg px-2 py-0.5 text-sm font-bold">{totalItems}</div>
          <span className="text-sm font-medium">عرض السلة</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold">{totalPrice.toLocaleString('ar-EG')} {curr}</span>
          <ShoppingCart size={18} />
        </div>
      </SheetTrigger>

      <SheetContent side="bottom" className="rounded-t-2xl max-h-[88vh] overflow-auto px-4 pb-8" dir="rtl">

        {/* ── Step 1: Cart ── */}
        {step === 'cart' && (
          <>
            <SheetHeader className="text-right pb-4 border-b">
              <SheetTitle>سلة التسوق</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-3">
              {items.map(({ product, quantity, selectedOptions, lineId }) => (
                <div key={lineId} className="flex items-center gap-3">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package size={18} className="text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    {optionsLabel(selectedOptions) && (
                      <p className="text-[11px] text-gray-400 truncate">{optionsLabel(selectedOptions)}</p>
                    )}
                    <p className="text-xs text-gray-400">{quantity} × {product.price.toLocaleString('ar-EG')} {curr}</p>
                  </div>
                  <p className="font-bold text-sm flex-shrink-0" style={{ color: themeColor }}>
                    {(product.price * quantity).toLocaleString('ar-EG')} {curr}
                  </p>
                  <button onClick={() => removeItem(lineId)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-1.5">
                {deliveryFee > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>المجموع الفرعي</span>
                      <span>{totalPrice.toLocaleString('ar-EG')} {curr}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>الشحن</span>
                      <span>{deliveryFee.toLocaleString('ar-EG')} {curr}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>الإجمالي</span>
                  <span style={{ color: themeColor }}>{grandTotal.toLocaleString('ar-EG')} {curr}</span>
                </div>
              </div>
              <Button className="w-full h-12 text-base gap-2" style={{ backgroundColor: themeColor, color: onTheme }} onClick={handleProceed}>
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
              <SheetTitle>بيانات الطلب</SheetTitle>
            </SheetHeader>
            <div className="py-5 space-y-4">
              <p className="text-sm text-gray-500">حتى يتمكن البائع من التواصل معك وتوصيل طلبك</p>
              {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">الاسم</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="محمد أحمد" className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">رقم الهاتف</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="01012345678"
                  dir="ltr"
                  maxLength={11}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">عنوان التوصيل</label>
                <textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="المدينة، الحي، الشارع، رقم المبنى/الشقة"
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">ملاحظات (اختياري)</label>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي تفاصيل إضافية للطلب" className={inputClass} />
              </div>

              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                {items.map(({ product, quantity, selectedOptions, lineId }) => (
                  <div key={lineId} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {quantity}× {product.name}
                      {optionsLabel(selectedOptions) && <span className="text-gray-400"> ({optionsLabel(selectedOptions)})</span>}
                    </span>
                    <span className="font-medium">{(product.price * quantity).toLocaleString('ar-EG')} {curr}</span>
                  </div>
                ))}
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200 mt-2">
                    <span className="text-gray-500">الشحن</span>
                    <span className="font-medium">{deliveryFee.toLocaleString('ar-EG')} {curr}</span>
                  </div>
                )}
                <div className={`flex justify-between font-bold text-sm ${deliveryFee > 0 ? 'pt-1' : 'pt-2 border-t border-gray-200 mt-2'}`}>
                  <span>الإجمالي</span>
                  <span style={{ color: themeColor }}>{grandTotal.toLocaleString('ar-EG')} {curr}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Button
                className="w-full h-12 text-base gap-2 text-white"
                style={{ backgroundColor: themeColor }}
                onClick={handleOrder}
                disabled={ordering}
              >
                <MessageCircle size={20} />
                {ordering ? 'جاري الإرسال...' : 'اطلب عبر واتساب'}
              </Button>
              <button onClick={() => setStep('cart')} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">
                ← رجوع للسلة
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Order placed ── */}
        {step === 'done' && (
          <div className="py-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColor}15` }}>
              <CheckCircle size={36} style={{ color: themeColor }} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">تم إرسال طلبك!</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              تم فتح واتساب مع تفاصيل طلبك. انتظر تأكيد البائع على الرقم المسجل.
            </p>
            <button
              onClick={() => { setStep('cart'); setOpen(false); setCustomerName(''); setCustomerPhone(''); setCustomerAddress(''); setNotes('') }}
              className="mt-2 text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
              style={{ backgroundColor: themeColor, color: onTheme }}
            >
              العودة للمتجر
            </button>
          </div>
        )}

      </SheetContent>
    </Sheet>
  )
}
