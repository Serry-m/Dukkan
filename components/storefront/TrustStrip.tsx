import { MessageCircle, ShieldCheck, Zap } from 'lucide-react'

// A quiet reassurance strip near the top of the catalog. Trust placement is
// one of the highest-impact conversion levers on mobile shops — and every
// claim here is true for the WhatsApp-order model (no fake "free shipping").
const ITEMS = [
  { icon: MessageCircle, label: 'الطلب عبر واتساب' },
  { icon: ShieldCheck, label: 'تعامل مباشر وآمن' },
  { icon: Zap, label: 'رد سريع على استفساراتك' },
]

export function TrustStrip() {
  return (
    <div className="mb-5 grid grid-cols-3 divide-x divide-x-reverse divide-gray-100 rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm">
      {ITEMS.map(({ icon: Icon, label }) => (
        <div key={label} className="flex flex-col items-center justify-center gap-1.5 px-2 py-3 text-center">
          <Icon size={18} strokeWidth={1.75} className="text-gray-400" />
          <span className="text-[11px] sm:text-xs font-medium text-gray-500 leading-tight">{label}</span>
        </div>
      ))}
    </div>
  )
}
