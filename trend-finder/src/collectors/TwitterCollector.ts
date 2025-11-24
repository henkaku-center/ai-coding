/**
 * TwitterCollector
 * Twitter/X のトレンドを収集
 *
 * Twitter API v2の Recent Search を使用してトレンドを収集
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { BaseCollector } from './base/BaseCollector.js';
import { Trend } from '../models/Trend.js';
import { config } from '../config/index.js';
import type { Category } from '../config/categories.js';

// Twitter API v2のエンドポイント
const TWITTER_API_BASE = 'https://api.twitter.com/2';

interface TwitterTweet {
  id: string;
  text: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
  entities?: {
    hashtags?: Array<{ tag: string }>;
    mentions?: Array<{ username: string }>;
  };
}

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
   * Recent Search APIを使用して日本語の人気ツイートを収集
   */
  private async collectFromTwitterAPI(): Promise<Trend[]> {
    this.log('Fetching trends from Twitter API v2...');

    try {
      // 日本語の人気ツイートを検索（レート制限対策: 1クエリのみ）
      const query = '#トレンド OR #話題 OR #ニュース OR #今日 -is:retweet lang:ja';

      const allTrends: Trend[] = [];
      const hashtagCount = new Map<string, number>();

      const response = await axios.get(`${TWITTER_API_BASE}/tweets/search/recent`, {
        headers: {
          Authorization: `Bearer ${this.bearerToken}`,
        },
        params: {
          query,
          max_results: 100, // 最大100件取得
          'tweet.fields': 'public_metrics,created_at,entities',
          'expansions': 'author_id',
        },
      });

      const tweets: TwitterTweet[] = response.data.data || [];

      // ハッシュタグの出現回数をカウント
      tweets.forEach((tweet) => {
        tweet.entities?.hashtags?.forEach((hashtag) => {
          const tag = hashtag.tag;
          hashtagCount.set(tag, (hashtagCount.get(tag) || 0) + 1);
        });
      });

      // ハッシュタグをトレンドに変換（出現回数上位10件）
      const topHashtags = Array.from(hashtagCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      for (const [hashtag, count] of topHashtags) {
        const trend: Trend = {
          id: uuidv4(),
          keyword: `#${hashtag}`,
          source: 'twitter',
          category: this.detectCategory(hashtag),
          score: 0, // スコアは後で計算
          mentionCount: count * 100, // 推定値（実際のツイート数 × 100）
          timestamp: new Date(),
          metadata: {
            hashtags: [`#${hashtag}`],
            relatedKeywords: [],
          },
        };
        allTrends.push(trend);
      }

      this.log(`Successfully collected ${allTrends.length} trends from Twitter API`);
      return allTrends;
    } catch (error: any) {
      if (error.response) {
        this.log(
          `Twitter API error: ${error.response.status} - ${error.response.data?.title || error.message}`,
          'error'
        );
      } else {
        this.log(`Twitter API request failed: ${error.message}`, 'error');
      }
      throw error;
    }
  }

  /**
   * ハッシュタグからカテゴリを推定
   */
  private detectCategory(hashtag: string): Category {
    const tag = hashtag.toLowerCase();

    // テクノロジー
    if (
      tag.includes('ai') ||
      tag.includes('技術') ||
      tag.includes('プログラミング') ||
      tag.includes('開発') ||
      tag.includes('it')
    ) {
      return 'technology';
    }

    // ビジネス
    if (
      tag.includes('ビジネス') ||
      tag.includes('経済') ||
      tag.includes('企業') ||
      tag.includes('株') ||
      tag.includes('セール')
    ) {
      return 'business';
    }

    // エンタメ
    if (
      tag.includes('映画') ||
      tag.includes('音楽') ||
      tag.includes('アニメ') ||
      tag.includes('芸能') ||
      tag.includes('ドラマ')
    ) {
      return 'entertainment';
    }

    // ライフスタイル
    if (
      tag.includes('料理') ||
      tag.includes('グルメ') ||
      tag.includes('旅行') ||
      tag.includes('ファッション') ||
      tag.includes('週末')
    ) {
      return 'lifestyle';
    }

    // スポーツ
    if (
      tag.includes('スポーツ') ||
      tag.includes('野球') ||
      tag.includes('サッカー') ||
      tag.includes('試合')
    ) {
      return 'sports';
    }

    // 政治
    if (tag.includes('政治') || tag.includes('選挙') || tag.includes('国会')) {
      return 'politics';
    }

    return 'other';
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
        score: 0, // スコアは後で計算
        mentionCount: 12000,
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
        score: 0,
        mentionCount: 8000,
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
        score: 0,
        mentionCount: 4500,
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
        score: 0,
        mentionCount: 6200,
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
        score: 0,
        mentionCount: 5800,
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
