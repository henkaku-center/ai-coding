/**
 * Event モデル
 */

import { z } from 'zod';
import { Category } from '../config/categories.js';

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string; // YYYY-MM-DD形式
  category: Category;
  isRecurring: boolean;
}

export const EventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.enum([
    'technology',
    'business',
    'entertainment',
    'lifestyle',
    'sports',
    'politics',
    'other',
  ]),
  isRecurring: z.boolean(),
});

export function validateEvent(data: unknown): Event {
  return EventSchema.parse(data) as Event;
}
