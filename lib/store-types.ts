// Store categories — the id is stored in the DB; the label is shown in Arabic UI.
// Single source so the top bar and the settings chips never drift apart.
export const STORE_TYPES = [
  { id: 'fashion', label: 'أزياء وإكسسوار' },
  { id: 'food', label: 'طعام' },
  { id: 'electronics', label: 'إلكترونيات' },
  { id: 'home', label: 'منزل' },
  { id: 'other', label: 'أخرى' },
] as const

export function storeTypeLabel(id: string | null | undefined): string | null {
  if (!id) return null
  return STORE_TYPES.find((t) => t.id === id)?.label ?? id
}
