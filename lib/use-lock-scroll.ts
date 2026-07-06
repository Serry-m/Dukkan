import { useEffect } from 'react'

// Lock background scroll while a drawer is open, WITHOUT killing the drawer's
// own inner scroll on iOS.
//
// - The document (body/window) is the scroller on mobile → lock it with
//   position:fixed (the body-scroll-lock technique). Unlike overflow:hidden on
//   <html>/<body> — which freezes ALL scrolling on iOS, including the drawer —
//   position:fixed leaves fixed overlays' inner scroll working.
// - <main> is the scroller on the desktop app-shell → freeze its overflow too
//   (a normal element, safe to overflow:hidden).
export function useLockScroll(active: boolean) {
  useEffect(() => {
    if (!active) return
    const body = document.body
    const main = document.querySelector('main') as HTMLElement | null
    const scrollY = window.scrollY

    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      mainOverflow: main?.style.overflow ?? '',
    }

    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    if (main) main.style.overflow = 'hidden'

    return () => {
      body.style.position = prev.position
      body.style.top = prev.top
      body.style.left = prev.left
      body.style.right = prev.right
      body.style.width = prev.width
      if (main) main.style.overflow = prev.mainOverflow
      window.scrollTo(0, scrollY)
    }
  }, [active])
}
