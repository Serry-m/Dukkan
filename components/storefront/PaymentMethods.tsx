import type { Store } from '@/types'

// Shows how the customer can pay the merchant. Display-only — Dukkan never
// processes money — but answers the buyer's #1 question and builds trust.
export function PaymentMethods({ store, className = '' }: { store: Store; className?: string }) {
  const methods: { label: string; value?: string }[] = []
  if (store.payment_instapay) methods.push({ label: 'إنستاباي', value: store.payment_instapay })
  if (store.payment_vodafone) methods.push({ label: 'فودافون كاش', value: store.payment_vodafone })
  if (store.payment_cod) methods.push({ label: 'الدفع عند الاستلام' })
  if (!methods.length) return null

  return (
    <div className={className}>
      <p className="text-xs font-medium text-gray-500 mb-2">طرق الدفع المتاحة</p>
      <div className="space-y-1.5">
        {methods.map((m) => (
          <div key={m.label} className="flex items-center justify-between gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
            <span className="font-medium text-gray-700">{m.label}</span>
            {m.value && <span className="text-gray-500 tabular-nums truncate" dir="ltr">{m.value}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
