/**
 * NewsCollector
 * ニュースサイトからトレンドを収集
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import { BaseCollector } from './base/BaseCollector.js';
import { News } from '../models/News.js';
import { NEWS_SOURCES } from '../config/sources.js';
import { removeDuplicates } from '../utils/deduplicator.js';

export class NewsCollector extends BaseCollector<News> {
  protected sourceName = 'News Sites';
  protected minInterval = 2000; // 2秒

  async collect(): Promise<News[]> {
    this.log('Starting news collection...');
    const allNews: News[] = [];

    for (const source of NEWS_SOURCES) {
      if (!source.enabled) {
        continue;
      }

      try {
        await this.delay();
        this.log(`Fetching from ${source.name}...`);

        const newsItems = await this.collectFromSource(source);
        allNews.push(...newsItems);

        this.log(`Collected ${newsItems.length} items from ${source.name}`);
      } catch (error) {
        this.log(`Failed to collect from ${source.name}: ${error}`, 'error');
      }
    }

    // 重複除去
    const uniqueNews = removeDuplicates(allNews, (news) => news.title);
    this.log(`Total unique news items: ${uniqueNews.length}`);

    return uniqueNews;
  }

  private async collectFromSource(source: { name: string; url: string; selector: string }): Promise<News[]> {
    try {
      const response = await axios.get(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const newsItems: News[] = [];

      // 簡易的な実装：各ニュースサイトの構造に応じて調整が必要
      $(source.selector).each((_, element) => {
        const title = $(element).find('a').first().text().trim();
        const url = $(element).find('a').first().attr('href') || '';

        if (title && title.length > 0) {
          newsItems.push({
            id: uuidv4(),
            title,
            summary: '', // 詳細なスクレイピングは今後実装
            category: this.categorizeNews(title),
            publishedAt: new Date(),
            sourceUrl: url.startsWith('http') ? url : source.url + url,
            sourceName: source.name,
            keywords: this.extractKeywords(title),
            scrapedAt: new Date(),
          });
        }
      });

      return newsItems;
    } catch (error) {
      this.log(`Error fetching from ${source.name}: ${error}`, 'error');
      return [];
    }
  }

  private categorizeNews(title: string): 'technology' | 'business' | 'entertainment' | 'lifestyle' | 'sports' | 'politics' | 'other' {
    const techKeywords = ['AI', '技術', 'IT', 'アプリ', 'スマホ', 'PC', 'ソフトウェア'];
    const businessKeywords = ['経済', '企業', 'ビジネス', '株', '市場', '投資'];
    const entertainmentKeywords = ['映画', 'アニメ', '芸能', '音楽', 'ドラマ'];
    const sportsKeywords = ['野球', 'サッカー', 'スポーツ', '試合', '優勝'];
    const politicsKeywords = ['政治', '選挙', '政府', '国会', '首相'];

    const lowerTitle = title.toLowerCase();

    if (techKeywords.some(keyword => lowerTitle.includes(keyword.toLowerCase()))) {
      return 'technology';
    }
    if (businessKeywords.some(keyword => lowerTitle.includes(keyword.toLowerCase()))) {
      return 'business';
    }
    if (entertainmentKeywords.some(keyword => lowerTitle.includes(keyword.toLowerCase()))) {
      return 'entertainment';
    }
    if (sportsKeywords.some(keyword => lowerTitle.includes(keyword.toLowerCase()))) {
      return 'sports';
    }
    if (politicsKeywords.some(keyword => lowerTitle.includes(keyword.toLowerCase()))) {
      return 'politics';
    }

    return 'other';
  }

  private extractKeywords(title: string): string[] {
    // 簡易的なキーワード抽出（スペース区切り）
    return title
      .split(/[\s、。！？]+/)
      .filter(word => word.length > 1)
      .slice(0, 5);
  }
}
