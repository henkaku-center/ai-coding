/**
 * Trend モデル
 */

import { z } from 'zod';
import { Category } from '../config/categories.js';

export interface Trend {
  id: string;
  keyword: string;
  source: 'twitter' | 'news' | 'calendar';
  category: Category;
  score: number;
  mentionCount: number;
  timestamp: Date;
  metadata: {
    hashtags?: string[];
    relatedKeywords?: string[];
    url?: string;
  };
}

export const TrendSchema = z.object({
  id: z.string().uuid(),
  keyword: z.string().min(1).max(100),
  source: z.enum(['twitter', 'news', 'calendar']),
  category: z.enum([
    'technology',
    'business',
    'entertainment',
    'lifestyle',
    'sports',
    'politics',
    'other',
  ]),
  score: z.number().min(0).max(100),
  mentionCount: z.number().int().nonnegative(),
  timestamp: z.date(),
  metadata: z.object({
    hashtags: z.array(z.string()).optional(),
    relatedKeywords: z.array(z.string()).optional(),
    url: z.string().url().optional(),
  }),
});

export function validateTrend(data: unknown): Trend {
  return TrendSchema.parse(data) as Trend;
}
