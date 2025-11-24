/**
 * BookPromotion モデル
 */

import { z } from 'zod';
import { Trend } from './Trend.js';

export interface Book {
  id: string;
  title: string;
  keywords: string[];
  genre: string;
  amazonUrl: string;
  registeredAt: Date;
}

export interface BookPromotion {
  id: string;
  book: Book;
  recommendationLevel: 'high' | 'medium' | 'low';
  relatedTrends: Trend[];
  reason: string;
  recommendedPeriod: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
}

export const BookSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  keywords: z.array(z.string()),
  genre: z.string(),
  amazonUrl: z.string().url(),
  registeredAt: z.date(),
});

export const BookPromotionSchema = z.object({
  id: z.string().uuid(),
  book: BookSchema,
  recommendationLevel: z.enum(['high', 'medium', 'low']),
  relatedTrends: z.array(z.any()), // Trend型の検証は別途行う
  reason: z.string(),
  recommendedPeriod: z.object({
    start: z.date(),
    end: z.date(),
  }),
  generatedAt: z.date(),
});

export function validateBook(data: unknown): Book {
  return BookSchema.parse(data) as Book;
}

export function validateBookPromotion(data: unknown): BookPromotion {
  return BookPromotionSchema.parse(data) as BookPromotion;
}
