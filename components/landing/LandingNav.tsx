'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useScroll, useMotionValueEvent } from 'motion/react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { BrandMark } from '@/components/BrandMark'

// Sticky nav that shrinks + gains a frosted backdrop once you scroll past the hero.
export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 40))

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-gray-200/70 shadow-[0_4px_20px_-8px_rgba(16,24,40,0.12)]'
          : 'bg-white/40 backdrop-blur-sm border-b border-transparent'
      )}
    >
      <div
        className={cn(
          'max-w-5xl mx-auto px-5 flex items-center justify-between gap-4 transition-all duration-300',
          scrolled ? 'h-14' : 'h-16'
        )}
      >
        <div className="flex items-center gap-2">
          <BrandMark size={scrolled ? 28 : 32} className="transition-all duration-300" />
          <span className="font-bold text-gray-900 text-[15px]">دكان</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 transition-colors font-medium hidden sm:block">
            تسجيل الدخول
          </Link>
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: 'sm' }), 'bg-green-600 hover:bg-green-700 text-white font-semibold px-4 h-9 text-sm')}
          >
            ابدأ مجاناً
          </Link>
        </div>
      </div>
    </nav>
  )
}
