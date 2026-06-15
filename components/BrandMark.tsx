import { cn } from '@/lib/utils'

// The single دكان brand mark — a "د" monogram on the brand green.
// Used everywhere an inline logo appears so the brand stays consistent.
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn('rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <span className="text-white font-bold leading-none" style={{ fontSize: Math.round(size * 0.52) }}>
        د
      </span>
    </div>
  )
}
