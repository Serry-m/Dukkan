'use client'

import { useState, useEffect } from 'react'
import type { Store } from '@/types'
import { useCartStore } from '@/lib/cart-store'
import { buildWhatsAppOrderUrl, saveOrder } from '@/lib/whatsapp'
import { currencyLabel } from '@/lib/currency'
import { readableText } from '@/lib/color'
import { effectivePrice } from '@/lib/price'
import { createClient } from '@/lib/supabase/client'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Trash2, MessageCircle, CheckCircle, Package, Plus, Minus } from 'lucide-react'

// One sheet, two states: fill everything in `checkout`, then a `done` receipt
// that reassures the shopper the order isn't sent until they press WhatsApp.
type Step = 'checkout' | 'done'

function optionsLabel(opts?: Record<string, string>): string {
  if (!opts || !Object.keys(opts).length) return ''
  return Object.entries(opts).map(([k, v]) => `${k}: ${v}`).join('، ')
}

export default function CartBar({ store }: { store: Store }) {
  const items = useCartStore((s) => s.items)
  const totalItems = useCartStore((s) => s.totalItems())
  const totalPrice = useCartStore((s) => s.totalPrice())
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)
  const setStore = useCartStore((s) => s.setStore)

  // Scope the cart to this store — clears any cart left over from another store.
  useEffect(() => {
    setStore(store.id)
  }, [store.id, setStore])

  // Which payment methods the merchant accepts — shown as a single choice the
  // customer picks (only the ones they enabled). Empty = no payment section.
  const payOptions: { key: string; number?: string }[] = []
  if (store.payment_instapay) payOptions.push({ key: 'إنستاباي', number: store.payment_instapay })
  if (store.payment_vodafone) payOptions.push({ key: 'فودافون كاش', number: store.payment_vodafone })
  if (store.payment_cod) payOptions.push({ key: 'عند الاستلام' })

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('checkout')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [payment, setPayment] = useState(payOptions[0]?.key ?? '')
  const [error, setError] = useState('')
  const [ordering, setOrdering] = useState(false)
  const [orderUrl, setOrderUrl] = useState('')
  const [placed, setPlaced] = useState<{ count: number; total: number; payment?: string } | null>(null)
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
    if (!val && step !== 'done') setStep('checkout')
  }

  function resetAll() {
    setStep('checkout'); setOpen(false)
    setCustomerName(''); setCustomerPhone(''); setCustomerAddress(''); setNotes('')
    setAppliedCoupon(null); setCouponInput(''); setCouponMsg('')
    setPlaced(null); setOrderUrl('')
  }

  async function handleSubmit() {
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
      payment: payOptions.length ? payment : undefined,
      discount: appliedCoupon && discount > 0 ? { code: appliedCoupon.code, amount: discount } : undefined,
    }
    // Save the order to get its sequential number for the WhatsApp message.
    // A DB failure must NOT block the order — the WhatsApp message IS the order.
    let orderRef: string | undefined
    try {
      const num = await saveOrder(store, items, customer)
      if (num != null) orderRef = `#${num}`
    } catch (err) {
      console.error('Failed to save order:', err)
    }

    const url = buildWhatsAppOrderUrl(store, items, customer, orderRef)
    setOrderUrl(url)
    // Capture a snapshot for the receipt screen BEFORE the cart is cleared.
    setPlaced({ count: totalItems, total: grandTotal, payment: customer.payment })

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
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 rounded-lg px-2 py-0.5 text-sm font-bold">{totalItems}</div>
            <span className="text-sm font-semibold">عرض السلة</span>
            <span className="text-[13px] opacity-80 font-medium">· {totalItems.toLocaleString('ar-EG')} منتجات</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold">{totalPrice.toLocaleString('ar-EG')} {curr}</span>
            <ShoppingCart size={18} />
          </div>
        </SheetTrigger>
      )}

      <SheetContent side="bottom" className="rounded-t-2xl max-h-[92vh] overflow-auto px-4 pb-8 max-w-lg mx-auto" dir="rtl">

        {/* ── Checkout: cart + details + payment, all in one ── */}
        {step === 'checkout' && (
          <>
            <SheetHeader className="text-right pb-4 border-b">
              <SheetTitle>سلة المشتريات</SheetTitle>
            </SheetHeader>

            {/* Items with quantity steppers */}
            <div className="py-3 divide-y divide-gray-100">
              {items.map(({ product, quantity, selectedOptions, lineId }) => (
                <div key={lineId} className="flex items-center gap-3 py-3">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} loading="lazy" decoding="async" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package size={20} className="text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{product.name}</p>
                    {optionsLabel(selectedOptions) && (
                      <p className="text-[11px] text-gray-400 truncate">{optionsLabel(selectedOptions)}</p>
                    )}
                    <p className="text-[13px] font-bold text-gray-700 mt-0.5">
                      {(effectivePrice(product) * quantity).toLocaleString('ar-EG')} {curr}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(lineId, quantity - 1)} aria-label="إنقاص" className="w-8 h-8 flex items-center justify-center text-gray-600 active:bg-gray-100">
                        <Minus size={15} />
                      </button>
                      <span className="min-w-[22px] text-center text-sm font-bold text-gray-900">{quantity.toLocaleString('ar-EG')}</span>
                      <button onClick={() => updateQuantity(lineId, quantity + 1)} aria-label="زيادة" className="w-8 h-8 flex items-center justify-center active:bg-gray-100" style={{ color: themeColor }}>
                        <Plus size={15} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(lineId)} aria-label="حذف" className="text-gray-300 hover:text-red-400 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex gap-2 pt-3">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="كود الخصم"
                dir="ltr"
                maxLength={30}
                disabled={!!appliedCoupon}
                className={`${inputClass} flex-1 text-right disabled:opacity-60`}
              />
              {appliedCoupon ? (
                <button type="button" onClick={() => { setAppliedCoupon(null); setCouponInput(''); setCouponMsg('') }} className="px-5 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold flex-shrink-0">
                  إزالة
                </button>
              ) : (
                <button type="button" onClick={applyCoupon} disabled={applyingCoupon} className="px-5 rounded-xl text-sm font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 flex-shrink-0">
                  {applyingCoupon ? '...' : 'تطبيق'}
                </button>
              )}
            </div>
            {couponMsg && <p className={`text-xs font-medium mt-1.5 ${appliedCoupon ? 'text-green-600' : 'text-red-500'}`}>{couponMsg}</p>}

            {/* Totals */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mt-4 space-y-2.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>المجموع</span>
                <span className="text-gray-900 font-semibold">{totalPrice.toLocaleString('ar-EG')} {curr}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>خصم ({appliedCoupon!.code})</span>
                  <span className="font-semibold">−{discount.toLocaleString('ar-EG')} {curr}</span>
                </div>
              )}
              {deliveryFee > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>التوصيل</span>
                  <span className="text-gray-900 font-semibold">{deliveryFee.toLocaleString('ar-EG')} {curr}</span>
                </div>
              )}
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-gray-900">الإجمالي</span>
                <span className="text-lg font-bold" style={{ color: themeColor }}>{grandTotal.toLocaleString('ar-EG')} {curr}</span>
              </div>
            </div>

            {/* Customer details */}
            <div className="space-y-3 mt-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">الاسم</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="اسمك بالكامل" maxLength={60} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">رقم الموبايل</label>
                <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))} placeholder="01012345678" dir="ltr" maxLength={11} className={`${inputClass} text-right`} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">العنوان</label>
                <textarea value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="المنطقة، الشارع، رقم المبنى" rows={2} maxLength={300} className={`${inputClass} resize-none`} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">ملاحظات (اختياري)</label>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي تفاصيل إضافية للطلب" maxLength={200} className={inputClass} />
              </div>
            </div>

            {/* Payment method — only the methods the merchant enabled */}
            {payOptions.length > 0 && (
              <div className="mt-5">
                <div className="text-xs font-semibold text-gray-600 mb-2">طريقة الدفع</div>
                <div className="flex flex-wrap gap-2">
                  {payOptions.map((m) => {
                    const active = payment === m.key
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setPayment(m.key)}
                        className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold border transition-colors"
                        style={active
                          ? { backgroundColor: `${themeColor}14`, borderColor: themeColor, color: themeColor }
                          : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#57534e' }}
                      >
                        <span className="w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center" style={{ borderColor: active ? themeColor : '#d1d5db' }}>
                          {active && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />}
                        </span>
                        {m.key}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[11px] text-gray-400 mt-2">هتتفق على تفاصيل الدفع مع المتجر على واتساب بعد تأكيد الطلب.</p>
              </div>
            )}

            {error && <div className="bg-red-50 text-red-600 text-sm font-medium p-3 rounded-xl mt-4 text-center">{error}</div>}

            <Button
              className="w-full h-13 text-base gap-2 mt-5 text-white"
              style={{ backgroundColor: themeColor, height: 54 }}
              onClick={handleSubmit}
              disabled={ordering}
            >
              <MessageCircle size={20} />
              {ordering ? 'جاري الإرسال...' : 'أرسل الطلب على واتساب'}
            </Button>
          </>
        )}

        {/* ── Done: receipt / send reassurance ── */}
        {step === 'done' && (
          <div className="py-8 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColor}15` }}>
              <CheckCircle size={36} style={{ color: themeColor }} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">طلبك جاهز — اضغط إرسال</h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              هيفتح واتساب برسالة الطلب جاهزة. ابعتها للمتجر وهيتواصل معاك لتأكيد التوصيل والدفع. لن يصل الطلب قبل الإرسال.
            </p>

            {placed && (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 w-full max-w-xs text-right space-y-2 mt-1">
                <div className="flex justify-between text-sm"><span className="text-gray-500">المنتجات</span><span className="font-semibold text-gray-900">{placed.count.toLocaleString('ar-EG')} منتجات</span></div>
                {placed.payment && <div className="flex justify-between text-sm"><span className="text-gray-500">طريقة الدفع</span><span className="font-semibold text-gray-900">{placed.payment}</span></div>}
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between items-baseline"><span className="font-bold text-gray-900">الإجمالي</span><span className="text-lg font-bold text-gray-900">{placed.total.toLocaleString('ar-EG')} {curr}</span></div>
              </div>
            )}

            {orderUrl && (
              <a
                href={orderUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 flex items-center justify-center gap-2 w-full max-w-xs text-base font-bold px-6 py-3.5 rounded-xl transition-colors"
                style={{ backgroundColor: themeColor, color: onTheme }}
              >
                <MessageCircle size={18} /> إرسال على واتساب
              </a>
            )}
            <button onClick={resetAll} className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
              العودة للمتجر
            </button>
          </div>
        )}

      </SheetContent>
    </Sheet>
  )
}
