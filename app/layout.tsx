import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'

// Cairo is the best Arabic Google Font — clean, modern, supports Arabic numerals
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
})

export const metadata: Metadata = {
  title: 'دكان',
  description: 'أنشئ متجرك على واتساب في دقائق',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" className={`${cairo.variable} h-full antialiased`}>
      <body className={`min-h-full flex flex-col font-[var(--font-cairo)]`}>
        {children}
      </body>
    </html>
  )
}
