/**
 * カテゴリ定義
 */

export type Category =
  | 'technology'
  | 'business'
  | 'entertainment'
  | 'lifestyle'
  | 'sports'
  | 'politics'
  | 'other';

export const CATEGORIES: Category[] = [
  'technology',
  'business',
  'entertainment',
  'lifestyle',
  'sports',
  'politics',
  'other',
];

export const CATEGORY_LABELS: Record<Category, string> = {
  technology: 'テクノロジー',
  business: 'ビジネス',
  entertainment: 'エンタメ',
  lifestyle: 'ライフスタイル',
  sports: 'スポーツ',
  politics: '政治',
  other: 'その他',
};
