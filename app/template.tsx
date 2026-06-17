'use client'

import { motion } from 'motion/react'
import { usePathname } from 'next/navigation'

// Gentle fade between route changes — but ONLY on marketing/auth/legal pages.
// App surfaces (dashboard, admin, storefront) skip it so navigation stays
// instant for owners and shoppers working fast. Opacity-only, so it never
// affects position:fixed / sticky elements.
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAppSurface =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/store')

  if (isAppSurface) return <>{children}</>

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
