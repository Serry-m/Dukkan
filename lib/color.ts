// Utilities for keeping the owner-chosen theme color readable.
// A merchant can pick any color; buttons that put text on that color must
// stay legible, so we compute the right text color from luminance.

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace('#', '').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

// Relative luminance (WCAG) in 0..1.
function luminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const toLin = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLin(rgb.r) + 0.7152 * toLin(rgb.g) + 0.0722 * toLin(rgb.b)
}

// Returns readable text color (dark or white) to sit on top of `bg`.
export function readableText(bg: string): string {
  // Threshold ~0.45 keeps white legible on most brand colors while flipping
  // to dark text on pale backgrounds (yellow, beige, light pink...).
  return luminance(bg) > 0.45 ? '#1f2937' : '#ffffff'
}

// True when the color is too light to carry white text comfortably.
export function isLightColor(bg: string): boolean {
  return luminance(bg) > 0.6
}
