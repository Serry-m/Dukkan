import { Skeleton } from '@/components/ui/skeleton'

export default function StorefrontLoading() {
  return (
    <main className="max-w-lg mx-auto px-3 py-4">
      <Skeleton className="h-10 w-full rounded-xl mb-3" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-9 w-full rounded-xl mt-1" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
