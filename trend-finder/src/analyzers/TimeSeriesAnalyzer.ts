/**
 * TimeSeriesAnalyzer
 * 時系列分析
 */

import { TrendHistory } from '../models/TrendHistory.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export class TimeSeriesAnalyzer {
  /**
   * トレンド履歴を分析
   */
  analyze(history: TrendHistory): TrendHistory {
    if (history.dataPoints.length === 0) {
      logger.warn(`No data points for keyword: ${history.keyword}`);
      return history;
    }

    // ピーク時刻の検出
    const peakTime = this.detectPeakTime(history);

    // 開始時刻の検出（最初のデータポイント）
    const startTime = history.dataPoints[0]?.timestamp;

    // ステータスの判定
    const status = this.determineStatus(history);

    return {
      ...history,
      peakTime,
      startTime,
      status,
    };
  }

  /**
   * ピーク時刻を検出
   */
  private detectPeakTime(history: TrendHistory): Date | undefined {
    if (history.dataPoints.length === 0) {
      return undefined;
    }

    const peakPoint = history.dataPoints.reduce((max, point) => {
      return point.score > max.score ? point : max;
    });

    return peakPoint?.timestamp;
  }

  /**
   * トレンドのステータスを判定
   */
  private determineStatus(
    history: TrendHistory
  ): 'rising' | 'peak' | 'declining' | 'stable' {
    if (history.dataPoints.length < 2) {
      return 'stable';
    }

    const recent = history.dataPoints.slice(-3); // 最新3件を見る

    if (recent.length < 2) {
      return 'stable';
    }

    // 前回比の増加率を計算
    const latestGrowth =
      recent.length >= 2
        ? (recent[recent.length - 1]!.score - recent[recent.length - 2]!.score) /
          recent[recent.length - 2]!.score
        : 0;

    const risingThreshold = config.analyzers.risingThreshold;

    if (latestGrowth > risingThreshold) {
      return 'rising';
    } else if (latestGrowth < -0.3) {
      return 'declining';
    } else if (Math.abs(latestGrowth) < 0.1) {
      return 'stable';
    } else {
      // ピーク判定: 最新が最大値に近い場合
      const maxScore = Math.max(...recent.map((p) => p.score));
      const latestScore = recent[recent.length - 1]!.score;

      if (latestScore >= maxScore * 0.95) {
        return 'peak';
      }
    }

    return 'stable';
  }

  /**
   * 急上昇トレンドかどうか判定
   */
  isRising(history: TrendHistory): boolean {
    if (history.dataPoints.length < 2) {
      return false;
    }

    const latest = history.dataPoints[history.dataPoints.length - 1];
    const previous = history.dataPoints[history.dataPoints.length - 2];

    if (!latest || !previous || previous.score === 0) {
      return false;
    }

    const growthRate = latest.score / previous.score;
    return growthRate >= config.analyzers.risingThreshold;
  }

  /**
   * トレンドの継続時間を計算（時間単位）
   */
  calculateDuration(history: TrendHistory): number {
    if (history.dataPoints.length < 2) {
      return 0;
    }

    const start = history.dataPoints[0]!.timestamp;
    const end = history.dataPoints[history.dataPoints.length - 1]!.timestamp;

    const durationMs = end.getTime() - start.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    return Math.round(durationHours * 10) / 10; // 小数点1桁まで
  }

  /**
   * 平均スコアを計算
   */
  calculateAverageScore(history: TrendHistory): number {
    if (history.dataPoints.length === 0) {
      return 0;
    }

    const sum = history.dataPoints.reduce((acc, point) => acc + point.score, 0);
    return Math.round((sum / history.dataPoints.length) * 10) / 10;
  }
}
