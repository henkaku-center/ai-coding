/**
 * 重複除去ユーティリティ
 */

export function removeDuplicates<T>(
  items: T[],
  keyExtractor: (item: T) => string | number
): T[] {
  const seen = new Set<string | number>();
  const result: T[] = [];

  for (const item of items) {
    const key = keyExtractor(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}
