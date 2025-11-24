/**
 * TrendService
 * トレンド収集・分析・提案の統合サービス
 */

import { MockTrendCollector, TwitterCollector, NewsCollector, CalendarCollector } from '../collectors/index.js';
import { TrendScoreAnalyzer } from '../analyzers/index.js';
import { ArticleProposer } from '../proposers/index.js';
import { DailyReporter, DailyReportData } from '../reporters/index.js';
import { TrendRepository, BookRepository } from '../repositories/index.js';
import { Trend } from '../models/Trend.js';
import { News } from '../models/News.js';
import { Event } from '../models/Event.js';
import { BookPromoProposer } from '../proposers/BookPromoProposer.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export class TrendService {
  private mockCollector = new MockTrendCollector();
  private twitterCollector = new TwitterCollector();
  private newsCollector = new NewsCollector();
  private calendarCollector = new CalendarCollector();

  private scoreAnalyzer = new TrendScoreAnalyzer();
  // 将来の拡張用
  // private timeSeriesAnalyzer = new TimeSeriesAnalyzer();
  // private relationAnalyzer = new RelationAnalyzer();

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
      this.newsCollector.collectWithRetry(),
      this.calendarCollector.collectWithRetry(),
    ]);

    const allTrends: Trend[] = [];

    // モックコレクター（結果0）
    const mockResult = results[0];
    if (mockResult.status === 'fulfilled') {
      allTrends.push(...(mockResult.value as Trend[]));
      logger.info(`Mock collector succeeded: ${mockResult.value.length} trends`);
    } else {
      logger.error('Mock collector failed:', mockResult.reason);
    }

    // Twitterコレクター（結果1）
    const twitterResult = results[1];
    if (twitterResult.status === 'fulfilled') {
      allTrends.push(...(twitterResult.value as Trend[]));
      logger.info(`Twitter collector succeeded: ${twitterResult.value.length} trends`);
    } else {
      logger.error('Twitter collector failed:', twitterResult.reason);
    }

    // ニュースコレクター（結果2）
    const newsResult = results[2];
    if (newsResult.status === 'fulfilled') {
      const newsItems = newsResult.value as News[];
      const newsTrends = newsItems.map(news => this.convertNewsToTrend(news));
      allTrends.push(...newsTrends);
      logger.info(`News collector succeeded: ${newsTrends.length} trends`);
    } else {
      logger.error('News collector failed:', newsResult.reason);
    }

    // カレンダーコレクター（結果3）
    const calendarResult = results[3];
    if (calendarResult.status === 'fulfilled') {
      const events = calendarResult.value as Event[];
      // 今後7日以内のイベントのみをトレンドに変換
      const upcomingEvents = events.slice(0, 5);
      const eventTrends = upcomingEvents.map(event => this.convertEventToTrend(event));
      allTrends.push(...eventTrends);
      logger.info(`Calendar collector succeeded: ${eventTrends.length} trends`);
    } else {
      logger.error('Calendar collector failed:', calendarResult.reason);
    }

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
   * 日次レポートを生成（Markdown形式）
   */
  async generateDailyReport(date: Date = new Date()): Promise<string> {
    logger.info('Generating daily report...');
    const reportData = await this.generateReportData(date);
    return this.dailyReporter.generateMarkdown(reportData);
  }

  /**
   * 日次レポートを生成（HTML形式）
   */
  async generateDailyReportHTML(date: Date = new Date()): Promise<string> {
    logger.info('Generating daily report HTML...');
    const reportData = await this.generateReportData(date);
    return this.dailyReporter.generateHTML(reportData);
  }

  /**
   * レポートデータを生成（共通処理）
   */
  private async generateReportData(date: Date): Promise<DailyReportData> {
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
    return {
      date,
      topTrends: analyzedTrends.slice(0, 10),
      risingTrends,
      articleProposals,
      bookPromotions,
    };
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

  /**
   * NewsをTrendに変換
   */
  private convertNewsToTrend(news: News): Trend {
    return {
      id: uuidv4(),
      keyword: news.title,
      source: 'news',
      category: news.category,
      score: 0, // スコアは後で計算
      mentionCount: 100, // ニュース記事は最低100メンションとして扱う
      timestamp: news.publishedAt,
      metadata: {
        hashtags: [],
        relatedKeywords: news.keywords,
        url: news.sourceUrl,
      },
    };
  }

  /**
   * EventをTrendに変換
   */
  private convertEventToTrend(event: Event): Trend {
    return {
      id: uuidv4(),
      keyword: event.name,
      source: 'calendar',
      category: event.category,
      score: 0, // スコアは後で計算
      mentionCount: 500, // イベントは話題性が高いため500メンションとして扱う
      timestamp: new Date(event.date),
      metadata: {
        hashtags: [],
        relatedKeywords: [event.description, event.date],
      },
    };
  }
}
