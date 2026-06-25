'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useScroll, useMotionValueEvent } from 'motion/react'
import { cn } from '@/lib/utils'
import { BrandMark } from '@/components/BrandMark'

const LINKS = [
  { href: '#how', label: 'إزاي بتشتغل' },
  { href: '#features', label: 'المميزات' },
  { href: '#pricing', label: 'الأسعار' },
]

// Sticky, warm frosted nav. Gains a touch more presence once you scroll past the hero.
export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 40))

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300 backdrop-blur-md',
        scrolled
          ? 'bg-[#FBFAF7]/85 border-b border-[#ECE7DC] shadow-[0_4px_20px_-12px_rgba(29,27,22,0.18)]'
          : 'bg-[#FBFAF7]/70 border-b border-transparent'
      )}
    >
      <div className="max-w-[1140px] mx-auto px-[clamp(18px,5vw,40px)] h-16 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2.5 text-[#1d1b16]">
          <BrandMark size={38} className="rounded-xl" />
          <span className="font-extrabold text-[22px] tracking-tight">دكان</span>
        </a>

        <nav className="hidden md:flex items-center gap-8 font-semibold text-[15px]">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-[#74716a] hover:text-[#1d1b16] transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:block text-[15px] font-semibold text-[#74716a] hover:text-[#1d1b16] px-3 py-1.5 transition-colors">
            دخول
          </Link>
          <Link
            href="/signup"
            className="bg-[#16a34a] hover:bg-[#15803d] hover:-translate-y-0.5 text-white font-bold text-[15px] px-5 py-2.5 rounded-xl shadow-[0_5px_15px_rgba(21,128,61,0.26)] transition-all"
          >
            ابدأ مجاناً
          </Link>
        </div>
      </div>
    </header>
  )
}
