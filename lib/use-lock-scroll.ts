import { useEffect } from 'react'

// While a full-height drawer is open, freeze ONLY the dashboard's scroll
// container (the <main> that scrolls) so touch-dragging on the drawer can't
// chain into the page behind it. We deliberately do NOT touch <body>/<html>:
// on iOS, overflow:hidden on the document freezes scrolling everywhere —
// including the drawer's own inner scroll. <main> is a normal overflow-auto
// element, so hiding its overflow stops it cleanly and leaves inner scroll alone.
export function useLockScroll(active: boolean) {
  useEffect(() => {
    if (!active) return
    const main = document.querySelector('main') as HTMLElement | null
    if (!main) return
    const prev = main.style.overflow
    main.style.overflow = 'hidden'
    return () => { main.style.overflow = prev }
  }, [active])
}
