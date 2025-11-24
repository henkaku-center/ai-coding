/**
 * TwitterCollector
 * Twitter/X のトレンドを収集
 *
 * 注意: Twitter API v2 の認証が必要です
 * 現在はモックデータを返す実装になっています
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { BaseCollector } from './base/BaseCollector.js';
import { Trend } from '../models/Trend.js';
import { config } from '../config/index.js';
import { TWITTER_API_ENDPOINT } from '../config/sources.js';

export class TwitterCollector extends BaseCollector<Trend> {
  protected sourceName = 'Twitter/X';
  protected minInterval = 5000; // 5秒（APIレート制限対策）

  private apiKey: string | undefined;
  private bearerToken: string | undefined;

  constructor() {
    super();
    this.apiKey = config.collectors.twitter.apiKey;
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN;
  }

  async collect(): Promise<Trend[]> {
    this.log('Starting Twitter trend collection...');

    // API キーがない場合はモックデータを返す
    if (!this.bearerToken || !this.apiKey) {
      this.log('Twitter API credentials not found. Returning mock data.', 'warn');
      return this.collectMockData();
    }

    try {
      await this.delay();
      return await this.collectFromTwitterAPI();
    } catch (error) {
      this.log(`Failed to collect from Twitter API: ${error}`, 'error');
      this.log('Falling back to mock data', 'warn');
      return this.collectMockData();
    }
  }

  /**
   * Twitter API v2 からトレンドを取得
   * 実装予定: 実際のAPI連携
   */
  private async collectFromTwitterAPI(): Promise<Trend[]> {
    // TODO: 実際のTwitter API v2 実装
    // 参考: https://developer.twitter.com/en/docs/twitter-api/trends/api-reference

    this.log('Twitter API integration is not yet implemented', 'warn');

    // 実装例（参考）:
    // const response = await axios.get(`${TWITTER_API_ENDPOINT}/trends/place`, {
    //   headers: {
    //     Authorization: `Bearer ${this.bearerToken}`,
    //   },
    //   params: {
    //     id: 23424856, // 日本のWOEID
    //   },
    // });

    return this.collectMockData();
  }

  /**
   * モックデータを返す（開発・テスト用）
   */
  private collectMockData(): Trend[] {
    this.log('Using mock Twitter data');

    const mockTrends: Trend[] = [
      {
        id: uuidv4(),
        keyword: '#技術トレンド',
        source: 'twitter',
        category: 'technology',
        score: 92,
        mentionCount: 45000,
        timestamp: new Date(),
        metadata: {
          hashtags: ['#技術トレンド', '#プログラミング', '#AI'],
          relatedKeywords: ['開発', 'エンジニア', '最新技術'],
        },
      },
      {
        id: uuidv4(),
        keyword: '#今日のニュース',
        source: 'twitter',
        category: 'other',
        score: 78,
        mentionCount: 28000,
        timestamp: new Date(),
        metadata: {
          hashtags: ['#今日のニュース', '#速報'],
          relatedKeywords: ['最新', 'ニュース', '話題'],
        },
      },
      {
        id: uuidv4(),
        keyword: '#週末の過ごし方',
        source: 'twitter',
        category: 'lifestyle',
        score: 65,
        mentionCount: 18500,
        timestamp: new Date(),
        metadata: {
          hashtags: ['#週末の過ごし方', '#休日', '#おでかけ'],
          relatedKeywords: ['レジャー', '旅行', 'グルメ'],
        },
      },
      {
        id: uuidv4(),
        keyword: '#スポーツニュース',
        source: 'twitter',
        category: 'sports',
        score: 71,
        mentionCount: 22000,
        timestamp: new Date(),
        metadata: {
          hashtags: ['#スポーツニュース', '#野球', '#サッカー'],
          relatedKeywords: ['試合結果', '選手', '優勝'],
        },
      },
      {
        id: uuidv4(),
        keyword: '#新商品発表',
        source: 'twitter',
        category: 'business',
        score: 69,
        mentionCount: 19500,
        timestamp: new Date(),
        metadata: {
          hashtags: ['#新商品発表', '#新製品', '#発売'],
          relatedKeywords: ['企業', 'リリース', 'イノベーション'],
        },
      },
    ];

    return mockTrends;
  }

  /**
   * Twitter API が利用可能かチェック
   */
  isAPIAvailable(): boolean {
    return !!(this.bearerToken && this.apiKey);
  }
}
