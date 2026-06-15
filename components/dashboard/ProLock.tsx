import Link from 'next/link'
import { Crown } from 'lucide-react'

// Small "Pro" badge to mark a gated label.
export function ProBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
      <Crown size={9} /> Pro
    </span>
  )
}

// Replaces a gated control on the free plan with an upgrade prompt.
export function ProUpsell({ feature }: { feature: string }) {
  return (
    <Link
      href="/dashboard/upgrade"
      className="flex items-center gap-2 rounded-xl border border-dashed border-green-200 bg-green-50/60 px-3 py-2.5 text-sm hover:bg-green-50 transition-colors"
    >
      <Crown size={15} className="text-green-700 flex-shrink-0" />
      <span className="text-green-800">{feature} متاحة في خطة Pro</span>
      <span className="mr-auto text-xs font-bold text-green-700 flex-shrink-0">ترقية ←</span>
    </Link>
  )
}
