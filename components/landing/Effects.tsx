'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { MessageCircle } from 'lucide-react'

// ── Cycling "new order" notification for the hero phone mockup ──
const ORDERS = [
  { name: 'محمد أحمد', detail: 'سماعة بلوتوث ×١' },
  { name: 'سارة علي', detail: 'الإجمالي · ٣٧٠ جنيه' },
  { name: 'كريم حسن', detail: 'شاحن سريع ×٢' },
  { name: 'منة الله', detail: 'طلب جديد · ٤٩٠ جنيه' },
]

export function OrderNotification({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)

  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setI((v) => (v + 1) % ORDERS.length), 2600)
    return () => clearInterval(t)
  }, [reduce])

  const o = ORDERS[i]
  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={reduce ? false : { opacity: 0, y: 14, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, y: -14, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 px-3 py-2.5 flex items-center gap-2 w-max"
        >
          <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
            <MessageCircle size={13} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-800 leading-none">طلب جديد!</p>
            <p className="text-[9px] text-gray-400 mt-0.5">من: {o.name} · {o.detail}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── Number that counts up from 0 when scrolled into view ──
export function CountUp({
  to,
  duration = 1.2,
  className,
}: {
  to: number
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const reduce = useReducedMotion()
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (reduce || !inView) {
      setVal(to)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(to * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration, reduce])

  return <span ref={ref} className={className}>{val.toLocaleString('ar-EG')}</span>
}

// ── Seamless category marquee strip ──
const CATEGORIES = ['إكسسوارات', 'ملابس', 'أكل بيتي', 'إلكترونيات', 'هدايا', 'مستحضرات تجميل', 'أحذية', 'ألعاب أطفال', 'عطور', 'منتجات يدوية']
// Each animated half = the list twice, so even on very wide / zoomed-out screens one half
// exceeds the viewport and the -50% loop never reveals empty space behind the track.
const HALF = [...CATEGORIES, ...CATEGORIES]

export function CategoryMarquee() {
  return (
    <div className="relative overflow-hidden py-3" dir="ltr">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10" />
      {/* Per-pill right margin (not flex gap) so spacing across the loop seam matches the internal spacing. */}
      <div className="flex w-max animate-marquee">
        {[...HALF, ...HALF].map((c, i) => (
          <span
            key={i}
            className="flex-shrink-0 mr-3 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 shadow-[var(--shadow-soft)]"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  )
}
