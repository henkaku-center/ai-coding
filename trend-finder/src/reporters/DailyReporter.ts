/**
 * DailyReporter
 * 日次レポート生成
 */

import { format } from 'date-fns';
import { Trend } from '../models/Trend.js';
import { ArticleProposal } from '../models/ArticleProposal.js';
import { BookPromotion } from '../models/BookPromotion.js';
import { CATEGORY_LABELS } from '../config/categories.js';
import { logger } from '../utils/logger.js';

export interface DailyReportData {
  date: Date;
  topTrends: Trend[];
  risingTrends: Trend[];
  articleProposals: ArticleProposal[];
  bookPromotions: BookPromotion[];
}

export class DailyReporter {
  /**
   * 日次レポートを生成（Markdown形式）
   */
  generateMarkdown(data: DailyReportData): string {
    logger.info('Generating daily report in Markdown format');

    const dateStr = format(data.date, 'yyyy年MM月dd日');
    const lines: string[] = [];

    // ヘッダー
    lines.push(`# トレンドレポート - ${dateStr}`);
    lines.push('');

    // トップトレンド
    lines.push('## 🔥 トップトレンド');
    lines.push('');

    if (data.topTrends.length > 0) {
      data.topTrends.slice(0, 10).forEach((trend, index) => {
        lines.push(`### ${index + 1}. ${trend.keyword}`);
        lines.push(`- **スコア**: ${trend.score}/100`);
        lines.push(`- **カテゴリ**: ${CATEGORY_LABELS[trend.category]}`);
        lines.push(`- **メンション数**: ${trend.mentionCount.toLocaleString()}件`);
        lines.push(`- **ソース**: ${trend.source}`);

        if (trend.metadata.hashtags && trend.metadata.hashtags.length > 0) {
          lines.push(`- **関連ハッシュタグ**: ${trend.metadata.hashtags.join(', ')}`);
        }

        lines.push('');
      });
    } else {
      lines.push('トレンドデータがありません。');
      lines.push('');
    }

    // 急上昇ワード
    lines.push('## 📈 急上昇ワード');
    lines.push('');

    if (data.risingTrends.length > 0) {
      data.risingTrends.forEach((trend) => {
        lines.push(`- **${trend.keyword}** (スコア: ${trend.score})`);
      });
      lines.push('');
    } else {
      lines.push('急上昇中のトレンドはありません。');
      lines.push('');
    }

    // おすすめ記事テーマ
    lines.push('## ✍️ おすすめ記事テーマ');
    lines.push('');

    if (data.articleProposals.length > 0) {
      data.articleProposals.forEach((proposal, index) => {
        lines.push(`### ${index + 1}. ${proposal.title}`);
        lines.push(`- **切り口**: ${proposal.angle}`);
        lines.push(`- **想定読者**: ${proposal.targetAudience}`);
        lines.push(
          `- **推奨公開**: ${format(proposal.recommendedPublishTime, 'MM月dd日 HH:mm')}`
        );
        lines.push(`- **理由**: ${proposal.reason}`);
        lines.push('');
      });
    } else {
      lines.push('記事提案がありません。');
      lines.push('');
    }

    // 書籍プロモーション推奨
    lines.push('## 📚 書籍プロモーション推奨');
    lines.push('');

    if (data.bookPromotions.length > 0) {
      // 推奨度別に分類
      const high = data.bookPromotions.filter((p) => p.recommendationLevel === 'high');
      const medium = data.bookPromotions.filter((p) => p.recommendationLevel === 'medium');
      const low = data.bookPromotions.filter((p) => p.recommendationLevel === 'low');

      if (high.length > 0) {
        lines.push('### 🔴 高推奨');
        high.forEach((promo) => {
          lines.push(`#### ${promo.book.title}`);
          lines.push(`- **理由**: ${promo.reason}`);
          lines.push(
            `- **推奨期間**: ${format(promo.recommendedPeriod.start, 'MM/dd')} - ${format(promo.recommendedPeriod.end, 'MM/dd')}`
          );
          lines.push('');
        });
      }

      if (medium.length > 0) {
        lines.push('### 🟡 中推奨');
        medium.forEach((promo) => {
          lines.push(`#### ${promo.book.title}`);
          lines.push(`- **理由**: ${promo.reason}`);
          lines.push('');
        });
      }

      if (low.length > 0) {
        lines.push('### 🟢 低推奨');
        low.forEach((promo) => {
          lines.push(`- ${promo.book.title}`);
        });
        lines.push('');
      }
    } else {
      lines.push('書籍プロモーション推奨はありません。');
      lines.push('');
    }

    // フッター
    lines.push('---');
    lines.push(`レポート生成日時: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`);
    lines.push('');

    return lines.join('\n');
  }

  /**
   * 日次レポートを生成（JSON形式）
   */
  generateJSON(data: DailyReportData): string {
    logger.info('Generating daily report in JSON format');

    const report = {
      date: format(data.date, 'yyyy-MM-dd'),
      topTrends: data.topTrends.slice(0, 10).map((trend) => ({
        keyword: trend.keyword,
        score: trend.score,
        category: trend.category,
        mentionCount: trend.mentionCount,
        source: trend.source,
        hashtags: trend.metadata.hashtags,
      })),
      risingTrends: data.risingTrends.map((trend) => ({
        keyword: trend.keyword,
        score: trend.score,
      })),
      articleProposals: data.articleProposals.map((proposal) => ({
        title: proposal.title,
        angle: proposal.angle,
        targetAudience: proposal.targetAudience,
        recommendedPublishTime: proposal.recommendedPublishTime,
        score: proposal.score,
      })),
      bookPromotions: data.bookPromotions.map((promo) => ({
        bookTitle: promo.book.title,
        recommendationLevel: promo.recommendationLevel,
        reason: promo.reason,
        recommendedPeriod: promo.recommendedPeriod,
      })),
      generatedAt: new Date().toISOString(),
    };

    return JSON.stringify(report, null, 2);
  }
}
