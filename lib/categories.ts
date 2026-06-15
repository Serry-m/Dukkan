// Orders the distinct product categories by the owner's saved order,
// appending any categories that aren't in the saved order yet.
export function orderCategories(distinct: string[], savedOrder: string[]): string[] {
  const inOrder = savedOrder.filter((c) => distinct.includes(c))
  const rest = distinct.filter((c) => !savedOrder.includes(c))
  return [...inOrder, ...rest]
}
