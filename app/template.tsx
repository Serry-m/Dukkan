'use client'

import { motion } from 'motion/react'

// Gentle fade between route changes. Opacity-only (no transform) so it never
// breaks position:fixed / position:sticky elements (cart bar, mobile nav...).
export default function Template({ children }: { children: React.ReactNode }) {
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
