'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Plus } from 'lucide-react'

const FAQS = [
  {
    q: 'هل دكان مجاني فعلاً؟',
    a: 'نعم، مجاني بالكامل. لا رسوم اشتراك شهري ولا عمولة على الطلبات.',
  },
  {
    q: 'هل أحتاج بطاقة ائتمان للتسجيل؟',
    a: 'لا. تحتاج فقط بريداً إلكترونياً ورقم واتساب، وتبدأ خلال دقيقتين.',
  },
  {
    q: 'كيف أستلم أموال الطلبات؟',
    a: 'الطلب يصلك على واتساب وتتفق مع العميل مباشرة على طريقة الدفع والتوصيل (الدفع عند الاستلام أو أي طريقة تناسبك). دكان لا يتدخل في الدفع.',
  },
  {
    q: 'هل أحتاج موقعاً أو تطبيقاً؟',
    a: 'لا. تحصل على رابط جاهز لمتجرك تشاركه مع عملائك على أي منصة.',
  },
  {
    q: 'هل يصلح لأي نوع من المنتجات؟',
    a: 'نعم — إكسسوارات، ملابس، أكل، إلكترونيات، هدايا، أي شيء تبيعه.',
  },
]

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  const reduce = useReducedMotion()

  return (
    <div className="max-w-2xl mx-auto divide-y divide-gray-100 border border-gray-100 rounded-2xl bg-white overflow-hidden">
      {FAQS.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-right hover:bg-gray-50/60 transition-colors"
            >
              <span className="font-semibold text-gray-900 text-sm">{item.q}</span>
              <Plus
                size={18}
                className="text-green-600 flex-shrink-0 transition-transform duration-300"
                style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
