/**
 * Whether any of the item's values contain the search text (case-insensitive).
 * Only values are searched, so "name" doesn't match every row through a field name.
 */
export function matchesSearch(item: object, text: string): boolean {
  const query = text.trim().toLowerCase();
  if (!query) {
    return true;
  }
  return Object.values(item).some((value) => value !== null && value !== undefined && String(value).toLowerCase().includes(query));
}
