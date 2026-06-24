import { cn } from '@/lib/utils'

// The دكان brand mark — a little storefront (scalloped awning + arched doorway)
// knocked out in white on the brand green. One asset used everywhere an inline
// logo appears so the brand stays consistent. Pairs with the "دكان" wordmark.
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="دكان"
      className={cn('flex-shrink-0', className)}
    >
      <rect x="0" y="0" width="48" height="48" rx="11" fill="#16a34a" />
      <rect x="14" y="19" width="20" height="21" rx="2" fill="#ffffff" />
      <path d="M20.5 40 V28 a3.5 3.5 0 0 1 7 0 V40 Z" fill="#16a34a" />
      <path
        d="M13 17 V14 a2 2 0 0 1 2 -2 H33 a2 2 0 0 1 2 2 V17 q-2.75 3 -5.5 0 q-2.75 3 -5.5 0 q-2.75 3 -5.5 0 q-2.75 3 -5.5 0 Z"
        fill="#ffffff"
      />
    </svg>
  )
}
