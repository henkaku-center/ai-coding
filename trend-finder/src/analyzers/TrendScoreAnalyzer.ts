/**
 * TrendScoreAnalyzer
 * トレンドスコアを算出
 */

import { Trend } from '../models/Trend.js';
import { TrendHistory } from '../models/TrendHistory.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export class TrendScoreAnalyzer {
  private weights = config.analyzers.scoreWeights;

  /**
   * トレンドスコアを算出
   * @param trend - 対象トレンド
   * @param history - 過去データ（オプショナル）
   * @returns 0-100のスコア
   */
  calculateScore(trend: Trend, history?: TrendHistory): number {
    const mentionScore = this.calculateMentionScore(trend.mentionCount);
    const velocityScore = history
      ? this.calculateVelocityScore(trend, history)
      : 50; // 履歴がない場合は中央値
    const freshnessScore = this.calculateFreshnessScore(trend.timestamp);

    const totalScore =
      mentionScore * this.weights.mention +
      velocityScore * this.weights.velocity +
      freshnessScore * this.weights.freshness;

    const normalizedScore = Math.min(100, Math.max(0, totalScore));

    logger.debug(
      `Score calculation for "${trend.keyword}": mention=${mentionScore}, velocity=${velocityScore}, freshness=${freshnessScore}, total=${normalizedScore}`
    );

    return Math.round(normalizedScore);
  }

  /**
   * メンション数をスコア化（0-100）
   */
  private calculateMentionScore(mentionCount: number): number {
    // 10,000メンションを100点として正規化
    const maxMentions = 10000;
    const score = (mentionCount / maxMentions) * 100;
    return Math.min(100, score);
  }

  /**
   * 増加率をスコア化（0-100）
   */
  private calculateVelocityScore(trend: Trend, history: TrendHistory): number {
    if (history.dataPoints.length < 2) {
      return 50; // データが不足している場合は中央値
    }

    // 最新と1つ前のデータポイントを比較
    const latest = history.dataPoints[history.dataPoints.length - 1];
    const previous = history.dataPoints[history.dataPoints.length - 2];

    if (!latest || !previous || previous.mentionCount === 0) {
      return 50;
    }

    const growthRate =
      (latest.mentionCount - previous.mentionCount) / previous.mentionCount;

    // 成長率を0-100にマッピング
    // 100%成長 = 50点、200%成長 = 100点として計算
    const score = Math.min(100, (growthRate * 100) / 2 + 50);
    return Math.max(0, score);
  }

  /**
   * 時間的新鮮度をスコア化（0-100）
   */
  private calculateFreshnessScore(timestamp: Date): number {
    const now = new Date();
    const hoursSincePost = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

    // 24時間以内なら100点、それ以降は徐々に減少
    if (hoursSincePost < 0) {
      return 100; // 未来のタイムスタンプの場合
    }

    const score = Math.max(0, 100 - hoursSincePost * 4);
    return score;
  }

  /**
   * 複数のトレンドをスコア順にソート
   */
  sortByScore(trends: Trend[]): Trend[] {
    return [...trends].sort((a, b) => b.score - a.score);
  }

  /**
   * 最小スコア以上のトレンドのみをフィルタリング
   */
  filterByMinScore(trends: Trend[], minScore: number): Trend[] {
    return trends.filter((trend) => trend.score >= minScore);
  }
}
