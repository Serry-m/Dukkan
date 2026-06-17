// Storefront themes — each is a cohesive bundle of design decisions
// (font, page surface, card treatment, typography) so a non-designer
// merchant gets a store that looks intentionally designed.

export type ThemeConfig = {
  id: string
  name: string            // Arabic display name
  desc: string
  pro: boolean
  font: 'cairo' | 'tajawal' | 'almarai' | 'amiri'
  pageBg: string          // base page background color
  cardRadius: string      // outer card corner
  innerRadius: string     // buttons / inner elements
  cardSurface: string     // ring + shadow treatment (the "feel")
  nameClass: string       // product-name typography
  swatch: string          // settings preview background
}

const EASE_LIFT = 'hover:-translate-y-0.5'

export const THEMES: Record<string, ThemeConfig> = {
  // Soft, floating, friendly — the default.
  modern: {
    id: 'modern',
    name: 'عصري',
    desc: 'بطاقات ناعمة وظلال خفيفة — مظهر حديث ومريح',
    pro: false,
    font: 'cairo',
    pageBg: '#f7f8fa',
    cardRadius: 'rounded-2xl',
    innerRadius: 'rounded-xl',
    cardSurface: `ring-1 ring-gray-900/[0.05] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] ${EASE_LIFT}`,
    nameClass: 'font-semibold text-sm text-gray-900',
    swatch: '#f7f8fa',
  },
  // Clean, airy, hairline borders, no shadows.
  minimal: {
    id: 'minimal',
    name: 'بسيط',
    desc: 'حدود رفيعة ومساحات بيضاء — مظهر نظيف وأنيق',
    pro: false,
    font: 'almarai',
    pageBg: '#ffffff',
    cardRadius: 'rounded-lg',
    innerRadius: 'rounded-md',
    cardSurface: 'ring-1 ring-gray-200 hover:ring-gray-300',
    nameClass: 'font-medium text-sm text-gray-900',
    swatch: '#ffffff',
  },
  // Warm, refined, boutique.
  elegant: {
    id: 'elegant',
    name: 'أنيق',
    desc: 'خط كلاسيكي وخلفية دافئة — مظهر بوتيك فاخر',
    pro: true,
    font: 'amiri',
    pageBg: '#faf7f2',
    cardRadius: 'rounded-2xl',
    innerRadius: 'rounded-full',
    cardSurface: `ring-1 ring-stone-300/60 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] ${EASE_LIFT}`,
    nameClass: 'font-bold text-[15px] text-stone-800',
    swatch: '#faf7f2',
  },
  // High-contrast, sharp, confident.
  bold: {
    id: 'bold',
    name: 'جريء',
    desc: 'حدود قوية وخط عريض — مظهر جريء وعصري',
    pro: true,
    font: 'cairo',
    pageBg: '#ffffff',
    cardRadius: 'rounded-xl',
    innerRadius: 'rounded-md',
    cardSurface: `ring-2 ring-gray-900 ${EASE_LIFT}`,
    nameClass: 'font-extrabold text-[15px] text-gray-900',
    swatch: '#ffffff',
  },
}

export function getTheme(id: string | null | undefined): ThemeConfig {
  return THEMES[id ?? 'modern'] ?? THEMES.modern
}

export const THEME_LIST = Object.values(THEMES)
