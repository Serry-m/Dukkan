'use client'

import { useState, useEffect } from 'react'
import type { Store } from '@/types'
import { useCartStore } from '@/lib/cart-store'
import { buildWhatsAppOrderUrl, saveOrder, orderCode } from '@/lib/whatsapp'
import { currencyLabel } from '@/lib/currency'
import { readableText } from '@/lib/color'
import { effectivePrice } from '@/lib/price'
import { createClient } from '@/lib/supabase/client'
import { PaymentMethods } from './PaymentMethods'
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
  const setStore = useCartStore((s) => s.setStore)

  // Scope the cart to this store — clears any cart left over from another store.
  useEffect(() => {
    setStore(store.id)
  }, [store.id, setStore])

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('cart')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [ordering, setOrdering] = useState(false)
  const [orderUrl, setOrderUrl] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: 'percent' | 'fixed'; value: number } | null>(null)
  const [couponMsg, setCouponMsg] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const themeColor = store.theme_color ?? '#16a34a'
  const onTheme = readableText(themeColor)
  const curr = currencyLabel(store.currency)
  const deliveryFee = Number(store.delivery_fee || 0)
  const discount = Math.round(
    appliedCoupon
      ? appliedCoupon.type === 'percent'
        ? (totalPrice * appliedCoupon.value) / 100
        : Math.min(appliedCoupon.value, totalPrice)
      : 0
  )
  const grandTotal = Math.max(0, totalPrice - discount) + deliveryFee

  async function applyCoupon() {
    const code = couponInput.trim()
    if (!code) return
    setApplyingCoupon(true)
    setCouponMsg('')
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_coupon', { p_store_id: store.id, p_code: code })
    setApplyingCoupon(false)
    const row = Array.isArray(data) ? data[0] : data
    if (error || !row) {
      setAppliedCoupon(null)
      setCouponMsg('كود غير صالح')
      return
    }
    setAppliedCoupon({ code: code.toUpperCase(), type: row.type, value: Number(row.value) })
    setCouponMsg('تم تطبيق الخصم ✓')
  }

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
      discount: appliedCoupon && discount > 0 ? { code: appliedCoupon.code, amount: discount } : undefined,
    }
    // Generate the order id up front so the WhatsApp message can carry the matching
    // reference. A DB failure must NOT block the order — the WhatsApp message IS the order.
    const orderId = crypto.randomUUID()
    let orderRef: string | undefined
    try {
      await saveOrder(store, items, customer, orderId)
      orderRef = orderCode(orderId)
    } catch (err) {
      console.error('Failed to save order:', err)
    }

    const url = buildWhatsAppOrderUrl(store, items, customer, orderRef)
    setOrderUrl(url)

    clearCart()
    setStep('done')
    setOrdering(false)
    window.open(url, '_blank')
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2'

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {/* Floating cart bar — only when the cart actually has something in it. */}
      {totalItems > 0 && (
        <SheetTrigger
          className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-50 w-[calc(100%-2rem)] rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-xl active:scale-[0.98] transition-all"
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
      )}

      <SheetContent side="bottom" className="rounded-t-2xl max-h-[88vh] overflow-auto px-4 pb-8 max-w-lg mx-auto" dir="rtl">

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
                    <img src={product.image_url} alt={product.name} loading="lazy" decoding="async" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
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
                    <p className="text-xs text-gray-400">{quantity} × {effectivePrice(product).toLocaleString('ar-EG')} {curr}</p>
                  </div>
                  <p className="font-bold text-sm flex-shrink-0" style={{ color: themeColor }}>
                    {(effectivePrice(product) * quantity).toLocaleString('ar-EG')} {curr}
                  </p>
                  <button onClick={() => removeItem(lineId)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-1.5">
                {(deliveryFee > 0 || discount > 0) && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>المجموع الفرعي</span>
                    <span>{totalPrice.toLocaleString('ar-EG')} {curr}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>خصم ({appliedCoupon!.code})</span>
                    <span>−{discount.toLocaleString('ar-EG')} {curr}</span>
                  </div>
                )}
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>الشحن</span>
                    <span>{deliveryFee.toLocaleString('ar-EG')} {curr}</span>
                  </div>
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
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="محمد أحمد" maxLength={60} className={inputClass} />
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
                  maxLength={300}
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">ملاحظات (اختياري)</label>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي تفاصيل إضافية للطلب" maxLength={200} className={inputClass} />
              </div>

              {/* Coupon */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">كود الخصم (اختياري)</label>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="أدخل الكود"
                    dir="ltr"
                    maxLength={30}
                    disabled={!!appliedCoupon}
                    className={`${inputClass} flex-1 disabled:opacity-60`}
                  />
                  {appliedCoupon ? (
                    <button type="button" onClick={() => { setAppliedCoupon(null); setCouponInput(''); setCouponMsg('') }} className="px-4 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium">
                      إزالة
                    </button>
                  ) : (
                    <button type="button" onClick={applyCoupon} disabled={applyingCoupon} className="px-4 rounded-xl text-sm font-medium" style={{ backgroundColor: themeColor, color: onTheme }}>
                      {applyingCoupon ? '...' : 'تطبيق'}
                    </button>
                  )}
                </div>
                {couponMsg && <p className={`text-xs ${appliedCoupon ? 'text-green-600' : 'text-red-500'}`}>{couponMsg}</p>}
              </div>

              {/* How the customer can pay the merchant */}
              <PaymentMethods store={store} />

              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                {items.map(({ product, quantity, selectedOptions, lineId }) => (
                  <div key={lineId} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {quantity}× {product.name}
                      {optionsLabel(selectedOptions) && <span className="text-gray-400"> ({optionsLabel(selectedOptions)})</span>}
                    </span>
                    <span className="font-medium">{(effectivePrice(product) * quantity).toLocaleString('ar-EG')} {curr}</span>
                  </div>
                ))}
                {(discount > 0 || deliveryFee > 0) && <div className="border-t border-gray-200 mt-2 pt-2 space-y-1">
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>خصم ({appliedCoupon!.code})</span>
                      <span>−{discount.toLocaleString('ar-EG')} {curr}</span>
                    </div>
                  )}
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">الشحن</span>
                      <span className="font-medium">{deliveryFee.toLocaleString('ar-EG')} {curr}</span>
                    </div>
                  )}
                </div>}
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-gray-200 mt-2">
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
          <div className="py-8 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColor}15` }}>
              <CheckCircle size={36} style={{ color: themeColor }} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">طلبك جاهز — خطوة أخيرة</h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              افتح واتساب واضغط <span className="font-bold text-gray-700">إرسال</span> لإتمام طلبك مع البائع. لن يصل الطلب قبل الإرسال.
            </p>
            {orderUrl && (
              <a
                href={orderUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 flex items-center justify-center gap-2 w-full max-w-xs text-base font-bold px-6 py-3 rounded-xl transition-colors"
                style={{ backgroundColor: themeColor, color: onTheme }}
              >
                <MessageCircle size={18} /> افتح واتساب وأرسل الطلب
              </a>
            )}
            <button
              onClick={() => { setStep('cart'); setOpen(false); setCustomerName(''); setCustomerPhone(''); setCustomerAddress(''); setNotes(''); setAppliedCoupon(null); setCouponInput(''); setCouponMsg('') }}
              className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              العودة للمتجر
            </button>
          </div>
        )}

      </SheetContent>
    </Sheet>
  )
}
