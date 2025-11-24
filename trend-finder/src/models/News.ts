/**
 * News モデル
 */

import { z } from 'zod';
import { Category } from '../config/categories.js';

export interface News {
  id: string;
  title: string;
  summary: string;
  category: Category;
  publishedAt: Date;
  sourceUrl: string;
  sourceName: string;
  keywords: string[];
  scrapedAt: Date;
}

export const NewsSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  summary: z.string(),
  category: z.enum([
    'technology',
    'business',
    'entertainment',
    'lifestyle',
    'sports',
    'politics',
    'other',
  ]),
  publishedAt: z.date(),
  sourceUrl: z.string().url(),
  sourceName: z.string(),
  keywords: z.array(z.string()),
  scrapedAt: z.date(),
});

export function validateNews(data: unknown): News {
  return NewsSchema.parse(data) as News;
}
