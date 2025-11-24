/**
 * RelationAnalyzer
 * 関連性分析
 */

import { Trend } from '../models/Trend.js';
import { logger } from '../utils/logger.js';

export interface RelatedTrend {
  trend: Trend;
  relevanceScore: number;
}

export class RelationAnalyzer {
  /**
   * 関連するトレンドを検索
   * @param targetTrend - 対象トレンド
   * @param allTrends - 全トレンドリスト
   * @param limit - 返す関連トレンドの最大数
   * @returns 関連度の高い順にソートされたトレンド
   */
  findRelations(targetTrend: Trend, allTrends: Trend[], limit: number = 5): RelatedTrend[] {
    const relatedTrends: RelatedTrend[] = [];

    for (const trend of allTrends) {
      // 自分自身は除外
      if (trend.id === targetTrend.id) {
        continue;
      }

      const relevanceScore = this.calculateRelevance(targetTrend, trend);

      if (relevanceScore > 0) {
        relatedTrends.push({
          trend,
          relevanceScore,
        });
      }
    }

    // 関連度順にソート
    relatedTrends.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return relatedTrends.slice(0, limit);
  }

  /**
   * 2つのトレンド間の関連性を計算
   * @returns 0-100の関連度スコア
   */
  private calculateRelevance(trend1: Trend, trend2: Trend): number {
    let score = 0;

    // カテゴリが同じ場合は基本スコア+30
    if (trend1.category === trend2.category) {
      score += 30;
    }

    // キーワードの共起をチェック
    const keyword1Lower = trend1.keyword.toLowerCase();
    const keyword2Lower = trend2.keyword.toLowerCase();

    // キーワードが部分一致する場合+40
    if (keyword1Lower.includes(keyword2Lower) || keyword2Lower.includes(keyword1Lower)) {
      score += 40;
    }

    // ハッシュタグの共通性をチェック
    const hashtags1 = trend1.metadata.hashtags || [];
    const hashtags2 = trend2.metadata.hashtags || [];
    const commonHashtags = this.findCommonElements(hashtags1, hashtags2);

    // 共通ハッシュタグ1つにつき+10（最大30）
    score += Math.min(30, commonHashtags.length * 10);

    // 関連キーワードの共通性をチェック
    const keywords1 = trend1.metadata.relatedKeywords || [];
    const keywords2 = trend2.metadata.relatedKeywords || [];
    const commonKeywords = this.findCommonElements(keywords1, keywords2);

    // 共通キーワード1つにつき+5（最大20）
    score += Math.min(20, commonKeywords.length * 5);

    // スコアを0-100に正規化
    return Math.min(100, score);
  }

  /**
   * 2つの配列の共通要素を見つける
   */
  private findCommonElements(arr1: string[], arr2: string[]): string[] {
    const set1 = new Set(arr1.map((s) => s.toLowerCase()));
    return arr2.filter((item) => set1.has(item.toLowerCase()));
  }

  /**
   * Jaccard係数を計算（将来の拡張用にコメントアウト）
   * @param set1 - セット1
   * @param set2 - セット2
   * @returns 0-1の類似度
   *
   * TODO: findRelationsメソッドで関連度スコアの計算に使用予定
   */
  // private calculateJaccardCoefficient(set1: Set<string>, set2: Set<string>): number {
  //   const intersection = new Set([...set1].filter((x) => set2.has(x)));
  //   const union = new Set([...set1, ...set2]);
  //
  //   if (union.size === 0) {
  //     return 0;
  //   }
  //
  //   return intersection.size / union.size;
  // }

  /**
   * 共起キーワードを抽出
   * @param trends - トレンドリスト
   * @param minOccurrence - 最小出現回数
   * @returns キーワードと出現回数のマップ
   */
  extractCoOccurringKeywords(
    trends: Trend[],
    minOccurrence: number = 2
  ): Map<string, number> {
    const keywordCounts = new Map<string, number>();

    for (const trend of trends) {
      const allKeywords = [
        trend.keyword,
        ...(trend.metadata.hashtags || []),
        ...(trend.metadata.relatedKeywords || []),
      ];

      for (const keyword of allKeywords) {
        const normalized = keyword.toLowerCase().trim();
        if (normalized.length > 1) {
          keywordCounts.set(normalized, (keywordCounts.get(normalized) || 0) + 1);
        }
      }
    }

    // 最小出現回数以上のものだけを残す
    const filtered = new Map<string, number>();
    for (const [keyword, count] of keywordCounts) {
      if (count >= minOccurrence) {
        filtered.set(keyword, count);
      }
    }

    logger.debug(`Extracted ${filtered.size} co-occurring keywords`);
    return filtered;
  }

  /**
   * トレンドのクラスタリング（簡易版）
   * カテゴリ別にグループ化
   */
  clusterByCategory(trends: Trend[]): Map<string, Trend[]> {
    const clusters = new Map<string, Trend[]>();

    for (const trend of trends) {
      const category = trend.category;
      if (!clusters.has(category)) {
        clusters.set(category, []);
      }
      clusters.get(category)!.push(trend);
    }

    return clusters;
  }
}
