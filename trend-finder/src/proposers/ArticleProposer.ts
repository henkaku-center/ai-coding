/**
 * ArticleProposer
 * 記事テーマを提案
 */

import { v4 as uuidv4 } from 'uuid';
import { Trend } from '../models/Trend.js';
import { ArticleProposal } from '../models/ArticleProposal.js';
import { Category, CATEGORY_LABELS } from '../config/categories.js';
import { logger } from '../utils/logger.js';

export interface ProposeOptions {
  category?: Category;
  minScore?: number;
  limit?: number;
}

export class ArticleProposer {
  /**
   * 記事テーマを提案
   * @param trends - 分析済みトレンド
   * @param options - オプション
   * @returns 記事提案のリスト
   */
  async propose(trends: Trend[], options?: ProposeOptions): Promise<ArticleProposal[]> {
    logger.info('Starting article proposal generation...');

    // スコア順にソート
    const sortedTrends = this.sortByScore(trends);

    // フィルタリング
    const filtered = this.filterTrends(sortedTrends, options);

    // 提案生成
    const proposals = this.generateProposals(filtered, options?.limit ?? 5);

    logger.info(`Generated ${proposals.length} article proposals`);
    return proposals;
  }

  /**
   * トレンドをスコア順にソート
   */
  private sortByScore(trends: Trend[]): Trend[] {
    return [...trends].sort((a, b) => b.score - a.score);
  }

  /**
   * トレンドをフィルタリング
   */
  private filterTrends(trends: Trend[], options?: ProposeOptions): Trend[] {
    let filtered = trends;

    // カテゴリフィルタ
    if (options?.category) {
      filtered = filtered.filter((trend) => trend.category === options.category);
    }

    // 最小スコアフィルタ
    if (options?.minScore !== undefined) {
      filtered = filtered.filter((trend) => trend.score >= options.minScore);
    }

    return filtered;
  }

  /**
   * 提案を生成
   */
  private generateProposals(trends: Trend[], limit: number): ArticleProposal[] {
    const proposals: ArticleProposal[] = [];

    for (let i = 0; i < Math.min(trends.length, limit); i++) {
      const trend = trends[i];
      if (!trend) continue;

      const proposal: ArticleProposal = {
        id: uuidv4(),
        title: this.generateTitle(trend),
        angle: this.generateAngle(trend),
        targetAudience: this.determineTargetAudience(trend),
        basedOnTrend: trend,
        recommendedPublishTime: this.calculatePublishTime(trend),
        reason: this.generateReason(trend),
        relatedKeywords: this.extractRelatedKeywords(trend),
        score: trend.score,
        generatedAt: new Date(),
      };

      proposals.push(proposal);
    }

    return proposals;
  }

  /**
   * 記事タイトル案を生成
   */
  private generateTitle(trend: Trend): string {
    const templates = [
      `${trend.keyword}が話題！今知っておきたいポイント`,
      `注目の${trend.keyword}について徹底解説`,
      `【速報】${trend.keyword}の最新情報まとめ`,
      `いま話題の${trend.keyword}とは？わかりやすく解説`,
      `${trend.keyword}が急上昇中！その背景と影響を探る`,
    ];

    // カテゴリに応じたテンプレートを選択
    const categoryTemplates: Record<Category, string[]> = {
      technology: [
        `${trend.keyword}の技術トレンドを解説`,
        `エンジニアが注目する${trend.keyword}の今`,
      ],
      business: [
        `ビジネスパーソン必見！${trend.keyword}の最新動向`,
        `${trend.keyword}が業界に与える影響とは`,
      ],
      entertainment: [
        `話題沸騰！${trend.keyword}の魅力を徹底紹介`,
        `${trend.keyword}が人気の理由を分析`,
      ],
      lifestyle: [
        `今日から始める${trend.keyword}のススメ`,
        `${trend.keyword}で生活をもっと豊かに`,
      ],
      sports: [
        `${trend.keyword}の試合結果と注目ポイント`,
        `スポーツファン必見！${trend.keyword}の最新情報`,
      ],
      politics: [
        `${trend.keyword}の政治的背景を解説`,
        `今知っておくべき${trend.keyword}の動き`,
      ],
      other: templates,
    };

    const categorySpecific = categoryTemplates[trend.category] || templates;
    const randomIndex = Math.floor(Math.random() * categorySpecific.length);
    return categorySpecific[randomIndex] || templates[0] || '';
  }

  /**
   * 記事の切り口を生成
   */
  private generateAngle(trend: Trend): string {
    const angles = [
      '最新トレンドの背景と今後の展望',
      '初心者にもわかりやすい基礎知識',
      '専門家の視点から見た分析',
      '実践的な活用方法とヒント',
      '関連する話題との比較分析',
    ];

    const categoryAngles: Record<Category, string> = {
      technology: '技術的な詳細と実装例を交えた解説',
      business: 'ビジネスへの影響と活用事例の紹介',
      entertainment: 'エンタメ視点での魅力と見どころ',
      lifestyle: '日常生活への取り入れ方と実践例',
      sports: '試合の見どころと選手の活躍',
      politics: '政策の背景と社会への影響',
      other: angles[0] || '',
    };

    return categoryAngles[trend.category] || angles[0] || '';
  }

  /**
   * 想定読者を決定
   */
  private determineTargetAudience(trend: Trend): string {
    const audiences: Record<Category, string> = {
      technology: 'ITエンジニア、技術に関心のある一般ユーザー',
      business: 'ビジネスパーソン、経営者、マーケター',
      entertainment: 'エンタメファン、一般視聴者',
      lifestyle: '生活改善に関心のある一般ユーザー',
      sports: 'スポーツファン、アスリート',
      politics: '政治に関心のある一般市民',
      other: '幅広い一般読者',
    };

    return audiences[trend.category] || audiences.other;
  }

  /**
   * 推奨公開タイミングを計算
   */
  private calculatePublishTime(trend: Trend): Date {
    const now = new Date();

    // スコアが高い場合は即座に公開を推奨
    if (trend.score >= 80) {
      return now; // 今すぐ
    } else if (trend.score >= 60) {
      // 24時間以内
      const tomorrow = new Date(now);
      tomorrow.setHours(tomorrow.getHours() + 12);
      return tomorrow;
    } else {
      // 48時間以内
      const dayAfter = new Date(now);
      dayAfter.setDate(dayAfter.getDate() + 2);
      return dayAfter;
    }
  }

  /**
   * 提案理由を生成
   */
  private generateReason(trend: Trend): string {
    const scoreLevel = trend.score >= 80 ? '非常に高く' : trend.score >= 60 ? '高く' : '中程度に';
    const categoryLabel = CATEGORY_LABELS[trend.category];

    return `「${trend.keyword}」は${categoryLabel}カテゴリで${scoreLevel}注目されています（スコア: ${trend.score}）。現在${trend.mentionCount.toLocaleString()}件のメンションがあり、今後さらに話題になる可能性があります。`;
  }

  /**
   * 関連キーワードを抽出
   */
  private extractRelatedKeywords(trend: Trend): string[] {
    const keywords: string[] = [trend.keyword];

    if (trend.metadata.hashtags) {
      keywords.push(...trend.metadata.hashtags.slice(0, 3));
    }

    if (trend.metadata.relatedKeywords) {
      keywords.push(...trend.metadata.relatedKeywords.slice(0, 3));
    }

    return [...new Set(keywords)].slice(0, 5);
  }
}
