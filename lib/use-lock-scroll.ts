import { useEffect } from 'react'

// While a full-height drawer/overlay is open, lock the page's scroll containers
// (the dashboard <main> that actually scrolls, plus <body>/<html>) so that
// touch-dragging on the drawer — including on its non-scrolling header/footer —
// can't chain into the page behind it on mobile. Restores exactly on close.
export function useLockScroll(active: boolean) {
  useEffect(() => {
    if (!active) return
    const main = document.querySelector('main')
    const html = document.documentElement
    const prevMain = main?.style.overflow ?? ''
    const prevBody = document.body.style.overflow
    const prevHtml = html.style.overflow
    if (main) main.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    html.style.overflow = 'hidden'
    return () => {
      if (main) main.style.overflow = prevMain
      document.body.style.overflow = prevBody
      html.style.overflow = prevHtml
    }
  }, [active])
}
