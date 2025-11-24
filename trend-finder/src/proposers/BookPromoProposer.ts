/**
 * BookPromoProposer
 * 書籍プロモーション提案
 */

import { v4 as uuidv4 } from 'uuid';
import { Book, BookPromotion } from '../models/BookPromotion.js';
import { Trend } from '../models/Trend.js';
import { logger } from '../utils/logger.js';

export class BookPromoProposer {
  /**
   * 書籍プロモーションを提案
   * @param book - 対象書籍
   * @param trends - トレンドリスト
   * @returns プロモーション提案
   */
  async propose(book: Book, trends: Trend[]): Promise<BookPromotion | null> {
    logger.info(`Analyzing promotion opportunity for book: ${book.title}`);

    // 書籍のキーワードに関連するトレンドを検索
    const relatedTrends = this.findRelatedTrends(book, trends);

    if (relatedTrends.length === 0) {
      logger.info(`No related trends found for book: ${book.title}`);
      return null;
    }

    // 推奨度を判定
    const recommendationLevel = this.determineRecommendationLevel(relatedTrends);

    // プロモーション期間を算出
    const recommendedPeriod = this.calculatePromotionPeriod(relatedTrends);

    // 理由を生成
    const reason = this.generateReason(book, relatedTrends);

    const promotion: BookPromotion = {
      id: uuidv4(),
      book,
      recommendationLevel,
      relatedTrends,
      reason,
      recommendedPeriod,
      generatedAt: new Date(),
    };

    logger.info(
      `Generated promotion proposal for "${book.title}" with level: ${recommendationLevel}`
    );

    return promotion;
  }

  /**
   * 複数の書籍に対してプロモーション提案を生成
   */
  async proposeForBooks(books: Book[], trends: Trend[]): Promise<BookPromotion[]> {
    const promotions: BookPromotion[] = [];

    for (const book of books) {
      const promotion = await this.propose(book, trends);
      if (promotion) {
        promotions.push(promotion);
      }
    }

    // 推奨度順にソート
    return promotions.sort((a, b) => {
      const levelOrder = { high: 3, medium: 2, low: 1 };
      return levelOrder[b.recommendationLevel] - levelOrder[a.recommendationLevel];
    });
  }

  /**
   * 書籍に関連するトレンドを検索
   */
  private findRelatedTrends(book: Book, trends: Trend[]): Trend[] {
    const relatedTrends: Trend[] = [];

    for (const trend of trends) {
      const relevanceScore = this.calculateRelevance(book, trend);

      if (relevanceScore > 0) {
        relatedTrends.push(trend);
      }
    }

    // スコア順にソートして上位5件を返す
    return relatedTrends.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  /**
   * 書籍とトレンドの関連性を計算
   */
  private calculateRelevance(book: Book, trend: Trend): number {
    let score = 0;

    // 書籍のキーワードとトレンドキーワードの一致
    for (const keyword of book.keywords) {
      const keywordLower = keyword.toLowerCase();
      const trendKeywordLower = trend.keyword.toLowerCase();

      // 完全一致
      if (keywordLower === trendKeywordLower) {
        score += 50;
      }
      // 部分一致
      else if (
        trendKeywordLower.includes(keywordLower) ||
        keywordLower.includes(trendKeywordLower)
      ) {
        score += 30;
      }

      // ハッシュタグとの一致
      const hashtags = trend.metadata.hashtags || [];
      if (hashtags.some((tag) => tag.toLowerCase().includes(keywordLower))) {
        score += 20;
      }

      // 関連キーワードとの一致
      const relatedKeywords = trend.metadata.relatedKeywords || [];
      if (relatedKeywords.some((kw) => kw.toLowerCase().includes(keywordLower))) {
        score += 10;
      }
    }

    return score;
  }

  /**
   * 推奨度を判定
   */
  private determineRecommendationLevel(
    relatedTrends: Trend[]
  ): 'high' | 'medium' | 'low' {
    if (relatedTrends.length === 0) {
      return 'low';
    }

    // 最高スコアのトレンドを基準に判定
    const maxScore = Math.max(...relatedTrends.map((t) => t.score));

    if (maxScore >= 80) {
      return 'high';
    } else if (maxScore >= 60) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * プロモーション推奨期間を算出
   */
  private calculatePromotionPeriod(relatedTrends: Trend[]): {
    start: Date;
    end: Date;
  } {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    if (relatedTrends.length === 0) {
      end.setDate(end.getDate() + 7); // デフォルト1週間
      return { start, end };
    }

    const maxScore = Math.max(...relatedTrends.map((t) => t.score));

    if (maxScore >= 80) {
      // 高スコア: 2週間
      end.setDate(end.getDate() + 14);
    } else if (maxScore >= 60) {
      // 中スコア: 1週間
      end.setDate(end.getDate() + 7);
    } else {
      // 低スコア: 3日間
      end.setDate(end.getDate() + 3);
    }

    return { start, end };
  }

  /**
   * 推奨理由を生成
   */
  private generateReason(book: Book, relatedTrends: Trend[]): string {
    if (relatedTrends.length === 0) {
      return '現在、関連するトレンドが見つかりませんでした。';
    }

    const topTrend = relatedTrends[0];
    if (!topTrend) {
      return '関連トレンドの分析中です。';
    }

    const trendKeywords = relatedTrends.map((t) => t.keyword).join('、');

    let reason = `「${trendKeywords}」などのトレンドが注目されています。`;

    if (topTrend.score >= 80) {
      reason += `特に「${topTrend.keyword}」は非常に高いスコア（${topTrend.score}）を記録しており、`;
      reason += `${topTrend.mentionCount.toLocaleString()}件のメンションがあります。`;
      reason += `この機会に「${book.title}」のプロモーションを強化することをお勧めします。`;
    } else if (topTrend.score >= 60) {
      reason += `「${topTrend.keyword}」は中程度の注目を集めています（スコア: ${topTrend.score}）。`;
      reason += `今週中のプロモーションが効果的です。`;
    } else {
      reason += `関連する話題がいくつか見られます。`;
      reason += `短期的なプロモーション活動を検討してください。`;
    }

    return reason;
  }
}
