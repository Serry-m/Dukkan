import type { MetadataRoute } from 'next'

// PWA manifest — lets customers "add to home screen" and run the storefront
// like a native app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'دكان',
    short_name: 'دكان',
    description: 'متجرك على واتساب — تصفح واطلب مباشرة',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#16a34a',
    dir: 'rtl',
    lang: 'ar',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  }
}
