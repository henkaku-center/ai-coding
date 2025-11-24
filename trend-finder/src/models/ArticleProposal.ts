/**
 * ArticleProposal モデル
 */

import { z } from 'zod';
import { Trend } from './Trend.js';

export interface ArticleProposal {
  id: string;
  title: string;
  angle: string;
  targetAudience: string;
  basedOnTrend: Trend;
  recommendedPublishTime: Date;
  reason: string;
  relatedKeywords: string[];
  score: number;
  generatedAt: Date;
}

export const ArticleProposalSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  angle: z.string(),
  targetAudience: z.string(),
  basedOnTrend: z.any(), // Trend型の検証は別途行う
  recommendedPublishTime: z.date(),
  reason: z.string(),
  relatedKeywords: z.array(z.string()),
  score: z.number().min(0).max(100),
  generatedAt: z.date(),
});

export function validateArticleProposal(data: unknown): ArticleProposal {
  return ArticleProposalSchema.parse(data) as ArticleProposal;
}
