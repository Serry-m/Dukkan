import { ImageOff } from 'lucide-react'

// Elegant empty-image state — a soft gradient + a light icon instead of a
// lone box. Optional "بدون صورة" label for larger contexts.
export function ImagePlaceholder({ size = 26, label = false }: { size?: number; label?: boolean }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <ImageOff size={size} strokeWidth={1.25} className="text-gray-300" />
      {label && <span className="text-[11px] text-gray-300 font-medium">بدون صورة</span>}
    </div>
  )
}
