// Single source of truth for currency display across the whole app.
// The DB stores a currency CODE (e.g. "EGP"); customers see the Arabic LABEL
// (e.g. "جنيه"). Keeping this in one place stops the storefront, the WhatsApp
// message, and the orders page from drifting apart.

export const CURRENCIES: { code: string; label: string; name: string }[] = [
  { code: 'EGP', label: 'جنيه', name: 'جنيه مصري' },
  { code: 'SAR', label: 'ريال', name: 'ريال سعودي' },
  { code: 'AED', label: 'درهم', name: 'درهم إماراتي' },
  { code: 'KWD', label: 'دينار', name: 'دينار كويتي' },
  { code: 'QAR', label: 'ريال', name: 'ريال قطري' },
  { code: 'USD', label: 'دولار', name: 'دولار أمريكي' },
]

// Returns the short Arabic label for a stored currency code.
// Falls back to the code itself for anything unrecognised.
export function currencyLabel(currency: string | null | undefined): string {
  if (!currency) return 'جنيه'
  const match = CURRENCIES.find((c) => c.code === currency)
  return match?.label ?? currency
}

// Formats an amount with Arabic digits + the currency label, e.g. "٢٥٠ جنيه".
export function formatPrice(amount: number, currency: string | null | undefined): string {
  return `${amount.toLocaleString('ar-EG')} ${currencyLabel(currency)}`
}
