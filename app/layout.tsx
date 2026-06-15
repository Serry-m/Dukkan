import type { Metadata } from 'next'
import { Cairo, Tajawal, Almarai } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

// Three Arabic fonts the owner can choose from for their storefront.
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
})
const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-tajawal',
})
const almarai = Almarai({
  subsets: ['arabic'],
  weight: ['400', '700', '800'],
  variable: '--font-almarai',
})

export const metadata: Metadata = {
  title: 'دكان — متجرك على واتساب',
  description: 'أنشئ متجرك على واتساب في دقيقتين — شارك رابطاً واحداً واستقبل الطلبات مباشرة. مجاني بدون رسوم.',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'دكان — متجرك على واتساب',
    description: 'أنشئ متجرك على واتساب في دقيقتين. مجاني بدون رسوم ولا عمولات.',
    type: 'website',
    locale: 'ar_EG',
  },
}

export const viewport = {
  themeColor: '#16a34a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" className={`${cairo.variable} ${tajawal.variable} ${almarai.variable} h-full antialiased`}>
      <body className={`min-h-full flex flex-col font-[var(--font-cairo)]`}>
        {children}
        <Toaster position="top-center" dir="rtl" />
      </body>
    </html>
  )
}
