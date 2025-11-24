/**
 * MockTrendCollector (MVP 用)
 * 実際の API 連携は今後実装予定
 */

import { v4 as uuidv4 } from 'uuid';
import { BaseCollector } from './base/BaseCollector.js';
import { Trend } from '../models/Trend.js';

export class MockTrendCollector extends BaseCollector<Trend> {
  protected sourceName = 'Mock Trend Source';
  protected minInterval = 1000;

  async collect(): Promise<Trend[]> {
    this.log('Collecting mock trend data...');
    await this.delay();

    // MVP 用のモックデータ
    const mockTrends: Trend[] = [
      {
        id: uuidv4(),
        keyword: 'AI技術の進化',
        source: 'twitter',
        category: 'technology',
        score: 85,
        mentionCount: 15000,
        timestamp: new Date(),
        metadata: {
          hashtags: ['#AI', '#機械学習', '#ChatGPT'],
          relatedKeywords: ['人工知能', '生成AI', 'LLM'],
        },
      },
      {
        id: uuidv4(),
        keyword: '年末セール',
        source: 'news',
        category: 'business',
        score: 72,
        mentionCount: 8500,
        timestamp: new Date(),
        metadata: {
          hashtags: ['#セール', '#お買い得'],
          relatedKeywords: ['ブラックフライデー', 'サイバーマンデー'],
        },
      },
      {
        id: uuidv4(),
        keyword: '新作映画公開',
        source: 'news',
        category: 'entertainment',
        score: 68,
        mentionCount: 6200,
        timestamp: new Date(),
        metadata: {
          hashtags: ['#映画', '#新作'],
          relatedKeywords: ['劇場公開', '話題作'],
        },
      },
    ];

    this.log(`Collected ${mockTrends.length} mock trends`);
    return mockTrends;
  }
}
