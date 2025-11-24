/**
 * TrendService
 * トレンド収集・分析・提案の統合サービス
 */

import { MockTrendCollector, TwitterCollector, NewsCollector, CalendarCollector } from '../collectors/index.js';
import { TrendScoreAnalyzer, TimeSeriesAnalyzer, RelationAnalyzer } from '../analyzers/index.js';
import { ArticleProposer } from '../proposers/index.js';
import { DailyReporter, DailyReportData } from '../reporters/index.js';
import { TrendRepository, BookRepository } from '../repositories/index.js';
import { Trend } from '../models/Trend.js';
import { Book, BookPromotion } from '../models/BookPromotion.js';
import { BookPromoProposer } from '../proposers/BookPromoProposer.js';
import { logger } from '../utils/logger.js';

export class TrendService {
  private mockCollector = new MockTrendCollector();
  private twitterCollector = new TwitterCollector();
  private newsCollector = new NewsCollector();
  private calendarCollector = new CalendarCollector();

  private scoreAnalyzer = new TrendScoreAnalyzer();
  private timeSeriesAnalyzer = new TimeSeriesAnalyzer();
  private relationAnalyzer = new RelationAnalyzer();

  private articleProposer = new ArticleProposer();
  private bookPromoProposer = new BookPromoProposer();

  private dailyReporter = new DailyReporter();

  private trendRepository = new TrendRepository();
  private bookRepository = new BookRepository();

  /**
   * 全トレンドを収集
   */
  async collectAllTrends(): Promise<Trend[]> {
    logger.info('Starting trend collection from all sources...');

    const results = await Promise.allSettled([
      this.mockCollector.collectWithRetry(),
      this.twitterCollector.collectWithRetry(),
    ]);

    const allTrends: Trend[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allTrends.push(...result.value);
        logger.info(`Collector ${index} succeeded: ${result.value.length} trends`);
      } else {
        logger.error(`Collector ${index} failed:`, result.reason);
      }
    });

    logger.info(`Total trends collected: ${allTrends.length}`);
    return allTrends;
  }

  /**
   * トレンドを分析（スコア計算など）
   */
  async analyzeTrends(trends: Trend[]): Promise<Trend[]> {
    logger.info('Analyzing trends...');

    const analyzedTrends = trends.map((trend) => ({
      ...trend,
      score: this.scoreAnalyzer.calculateScore(trend),
    }));

    return this.scoreAnalyzer.sortByScore(analyzedTrends);
  }

  /**
   * 急上昇トレンドを検出
   */
  detectRisingTrends(trends: Trend[]): Trend[] {
    return trends.filter((trend) => trend.score >= 70);
  }

  /**
   * 日次レポートを生成
   */
  async generateDailyReport(date: Date = new Date()): Promise<string> {
    logger.info('Generating daily report...');

    // トレンド収集
    const trends = await this.collectAllTrends();

    // トレンド分析
    const analyzedTrends = await this.analyzeTrends(trends);

    // 急上昇トレンド検出
    const risingTrends = this.detectRisingTrends(analyzedTrends);

    // 記事提案生成
    const articleProposals = await this.articleProposer.propose(analyzedTrends, {
      minScore: 50,
      limit: 5,
    });

    // 書籍プロモーション提案
    const books = (await this.bookRepository.loadAll()) || [];
    const bookPromotions = await this.bookPromoProposer.proposeForBooks(books, analyzedTrends);

    // レポートデータ作成
    const reportData: DailyReportData = {
      date,
      topTrends: analyzedTrends.slice(0, 10),
      risingTrends,
      articleProposals,
      bookPromotions,
    };

    // Markdownレポート生成
    return this.dailyReporter.generateMarkdown(reportData);
  }

  /**
   * トレンドを保存
   */
  async saveTrends(trends: Trend[], date: Date = new Date()): Promise<void> {
    await this.trendRepository.saveByDate(date, trends);
    logger.info(`Saved ${trends.length} trends for ${date.toISOString()}`);
  }

  /**
   * トレンドを読み込み
   */
  async loadTrends(date: Date = new Date()): Promise<Trend[]> {
    const trends = await this.trendRepository.loadByDate(date);
    return trends || [];
  }
}
