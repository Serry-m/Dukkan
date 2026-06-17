'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Store, MessageCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { title: 'تصفّح المنتجات', desc: 'العميل يفتح رابط متجرك ويتصفح منتجاتك بالصور والأسعار — بدون تطبيق.' },
  { title: 'أضف إلى السلة', desc: 'يختار ما يريد ويضيفه إلى السلة بضغطة واحدة، ويحدد الكمية.' },
  { title: 'اطلب عبر واتساب', desc: 'تُجهَّز رسالة منظّمة بكل تفاصيل الطلب وبيانات العميل وتصلك على واتساب مباشرة.' },
]

export function ProductShowcase() {
  const [active, setActive] = useState(0)

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-start">
      {/* Sticky phone */}
      <div className="hidden lg:flex lg:sticky lg:top-28 justify-center order-1">
        <PhoneFrame>
          <PhoneScreen step={active} />
        </PhoneFrame>
      </div>

      {/* Scrolling steps */}
      <div className="order-2">
        {/* Mobile phone (non-sticky, shown once at top) */}
        <div className="lg:hidden flex justify-center mb-8">
          <PhoneFrame>
            <PhoneScreen step={active} />
          </PhoneFrame>
        </div>

        {STEPS.map((s, i) => (
          <motion.div
            key={i}
            onViewportEnter={() => setActive(i)}
            viewport={{ amount: 0.6 }}
            className="lg:min-h-[56vh] flex flex-col justify-center py-6 lg:py-0"
          >
            <div className={cn('transition-opacity duration-500', active === i ? 'opacity-100' : 'lg:opacity-35')}>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold transition-colors',
                    active === i ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'
                  )}
                >
                  {(i + 1).toLocaleString('ar-EG')}
                </span>
                <h3 className="text-xl font-bold text-gray-900">{s.title}</h3>
              </div>
              <p className="text-gray-500 leading-relaxed max-w-md pr-12">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-60 bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl shadow-gray-300/60">
      <div className="bg-white rounded-[2rem] overflow-hidden h-[440px] relative">{children}</div>
    </div>
  )
}

function PhoneScreen({ step }: { step: number }) {
  const reduce = useReducedMotion()
  return (
    <>
      {/* Header */}
      <div className="bg-green-600 px-4 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Store size={14} className="text-white" />
          </div>
          <div>
            <p className="text-white text-xs font-bold leading-none">متجر محمود</p>
            <p className="text-green-200 text-[10px] mt-0.5">4 منتجات</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="p-2.5"
        >
          {step === 0 && <BrowseScreen />}
          {step === 1 && <CartScreen />}
          {step === 2 && <OrderScreen />}
        </motion.div>
      </AnimatePresence>
    </>
  )
}

function BrowseScreen() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {['سماعة بلوتوث', 'شاحن سريع', 'حافظة هاتف', 'كابل USB'].map((n, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="aspect-square bg-green-50 flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-green-200" />
          </div>
          <div className="p-1.5">
            <p className="text-[9px] font-semibold text-gray-800 truncate">{n}</p>
            <p className="text-[9px] text-green-600 font-bold">{(120 + i * 60).toLocaleString('ar-EG')} ج</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function CartScreen() {
  return (
    <div className="space-y-2">
      {[{ n: 'سماعة بلوتوث', q: '١', p: '٢٥٠' }, { n: 'شاحن سريع', q: '٢', p: '٢٤٠' }].map((it, i) => (
        <div key={i} className="bg-white rounded-xl flex items-center gap-2 p-2 border border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-gray-800 truncate">{it.n}</p>
            <p className="text-[9px] text-gray-400">الكمية: {it.q}</p>
          </div>
          <p className="text-[10px] font-bold text-green-600">{it.p} ج</p>
        </div>
      ))}
      <div className="bg-green-600 rounded-xl px-3 py-2.5 flex items-center justify-between mt-2">
        <span className="text-white text-[10px] font-bold">الإجمالي</span>
        <span className="text-white text-[11px] font-extrabold">٤٩٠ جنيه</span>
      </div>
    </div>
  )
}

function OrderScreen() {
  return (
    <div className="rounded-xl p-2.5" style={{ backgroundColor: '#ECE5DD' }}>
      <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none p-2.5 text-[9px] leading-relaxed text-gray-700 shadow-sm">
        <p className="font-bold mb-1">طلب جديد من متجر محمود 🛒</p>
        <p>• ١× سماعة بلوتوث — ٢٥٠ ج</p>
        <p>• ٢× شاحن سريع — ٢٤٠ ج</p>
        <p className="font-bold mt-1">الإجمالي: ٤٩٠ جنيه</p>
        <div className="border-t border-black/10 my-1.5" />
        <p>👤 محمد أحمد</p>
        <p>📞 ٠١٠١٢٣٤٥٦٧٨</p>
        <p>📍 القاهرة، مدينة نصر</p>
        <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-gray-400">
          ١٢:٤٥ <Check size={9} className="text-blue-500" />
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2 justify-center text-[9px] text-gray-500">
        <MessageCircle size={11} className="text-[#25D366]" /> وصل الطلب على واتساب
      </div>
    </div>
  )
}
