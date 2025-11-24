/**
 * TrendHistory モデル
 */

import { z } from 'zod';

export interface TrendHistory {
  keyword: string;
  dataPoints: {
    timestamp: Date;
    score: number;
    mentionCount: number;
  }[];
  peakTime?: Date;
  startTime?: Date;
  status: 'rising' | 'peak' | 'declining' | 'stable';
}

export const TrendHistorySchema = z.object({
  keyword: z.string(),
  dataPoints: z.array(
    z.object({
      timestamp: z.date(),
      score: z.number().min(0).max(100),
      mentionCount: z.number().int().nonnegative(),
    })
  ),
  peakTime: z.date().optional(),
  startTime: z.date().optional(),
  status: z.enum(['rising', 'peak', 'declining', 'stable']),
});

export function validateTrendHistory(data: unknown): TrendHistory {
  return TrendHistorySchema.parse(data) as TrendHistory;
}
