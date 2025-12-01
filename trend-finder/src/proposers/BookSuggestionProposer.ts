/**
 * BookSuggestionProposer
 * トレンドキーワードに基づいて講談社の書籍候補を提案
 */

import { Trend } from '../models/Trend.js';
import { Book } from '../models/BookPromotion.js';
import { logger } from '../utils/logger.js';

export interface BookSuggestion {
  keyword: string;
  category: string;
  score: number;
  mentionCount: number;
  suggestedGenre: string;
  suggestedLabels: string[];
  reason: string;
  relatedTrends: string[];
}

export class BookSuggestionProposer {
  /**
   * トレンドを分析して書籍候補を提案
   */
  async propose(trends: Trend[], existingBooks: Book[]): Promise<BookSuggestion[]> {
    logger.info('Analyzing trends for book suggestions...');

    // 既存の書籍のキーワードを収集
    const existingKeywords = this.extractExistingKeywords(existingBooks);

    // トレンドをカテゴリ別・スコア順にグループ化
    const trendsByCategory = this.groupTrendsByCategory(trends);

    const suggestions: BookSuggestion[] = [];

    // 各カテゴリのトレンドを分析
    for (const [category, categoryTrends] of Object.entries(trendsByCategory)) {
      const categorySuggestions = this.analyzeCategoryTrends(
        category,
        categoryTrends,
        existingKeywords
      );
      suggestions.push(...categorySuggestions);
    }

    // スコア順にソートして上位を返す
    const sortedSuggestions = suggestions.sort((a, b) => b.score - a.score);

    logger.info(`Generated ${sortedSuggestions.length} book suggestions`);

    return sortedSuggestions;
  }

  /**
   * 既存書籍からキーワードを抽出
   */
  private extractExistingKeywords(books: Book[]): Set<string> {
    const keywords = new Set<string>();

    for (const book of books) {
      for (const keyword of book.keywords) {
        keywords.add(keyword.toLowerCase());
      }
    }

    return keywords;
  }

  /**
   * トレンドをカテゴリ別にグループ化
   */
  private groupTrendsByCategory(trends: Trend[]): Record<string, Trend[]> {
    const grouped: Record<string, Trend[]> = {};

    for (const trend of trends) {
      const category = trend.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(trend);
    }

    // 各カテゴリ内でスコア順にソート
    for (const category in grouped) {
      const categoryTrends = grouped[category];
      if (categoryTrends) {
        categoryTrends.sort((a, b) => b.mentionCount - a.mentionCount);
      }
    }

    return grouped;
  }

  /**
   * カテゴリ別のトレンドを分析
   */
  private analyzeCategoryTrends(
    category: string,
    trends: Trend[],
    existingKeywords: Set<string>
  ): BookSuggestion[] {
    const suggestions: BookSuggestion[] = [];

    // 上位10件のトレンドを分析（カテゴリによって調整）
    const topTrends = trends.slice(0, 10);

    for (const trend of topTrends) {
      // キーワードを抽出
      const keywords = this.extractKeywordsFromTrend(trend);

      // 新しいキーワード（既存書籍でカバーされていない）を探す
      const newKeywords = keywords.filter(
        (kw) => !existingKeywords.has(kw.toLowerCase())
      );

      if (newKeywords.length > 0) {
        // 書籍候補を提案
        const suggestion = this.createSuggestion(trend, newKeywords, category);
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
    }

    return suggestions;
  }

  /**
   * トレンドからキーワードを抽出
   */
  private extractKeywordsFromTrend(trend: Trend): string[] {
    const keywords: string[] = [];

    // トレンドのキーワードから主要な用語を抽出
    const mainKeywords = trend.keyword
      .split(/[、。！？\s]+/)
      .filter((word) => word.length > 1 && word.length < 20);

    keywords.push(...mainKeywords);

    // 関連キーワードも含める
    if (trend.metadata.relatedKeywords) {
      keywords.push(...trend.metadata.relatedKeywords);
    }

    // 重複を除去
    return Array.from(new Set(keywords));
  }

  /**
   * 書籍提案を作成
   */
  private createSuggestion(
    trend: Trend,
    keywords: string[],
    category: string
  ): BookSuggestion | null {
    // カテゴリとキーワードに基づいて推奨ジャンルとレーベルを決定
    const { genre, labels } = this.suggestGenreAndLabels(category, keywords, trend.keyword);

    if (!genre) {
      return null;
    }

    // 関連トレンドを抽出
    const relatedTrends = keywords.slice(0, 5);

    // 提案理由を生成
    const reason = this.generateReason(trend, keywords, genre, labels);

    return {
      keyword: trend.keyword,
      category: category,
      score: trend.score,
      mentionCount: trend.mentionCount,
      suggestedGenre: genre,
      suggestedLabels: labels,
      reason: reason,
      relatedTrends: relatedTrends,
    };
  }

  /**
   * カテゴリとキーワードに基づいてジャンルとレーベルを提案
   */
  private suggestGenreAndLabels(
    category: string,
    keywords: string[],
    trendKeyword: string
  ): { genre: string; labels: string[] } {
    const keywordStr = keywords.join(' ').toLowerCase() + ' ' + trendKeyword.toLowerCase();

    // テクノロジー関連
    if (
      category === 'technology' ||
      /AI|機械学習|ディープラーニング|プログラミング|データサイエンス|量子|ブロックチェーン|Web3|DX|Python/.test(
        keywordStr
      )
    ) {
      if (/入門|はじめて|わかる|基礎/.test(keywordStr)) {
        return { genre: '入門書', labels: ['ブルーバックス', '講談社現代新書'] };
      } else if (/実践|プログラミング|エンジニア/.test(keywordStr)) {
        return {
          genre: 'エンジニアリング',
          labels: ['機械学習プロフェッショナルシリーズ', 'ブルーバックス'],
        };
      } else {
        return { genre: '科学', labels: ['ブルーバックス', '講談社学術文庫'] };
      }
    }

    // ビジネス関連
    if (
      category === 'business' ||
      /ビジネス|経済|投資|キャリア|働き方|経営|マーケティング|DX|ChatGPT活用/.test(keywordStr)
    ) {
      return { genre: 'ビジネス', labels: ['講談社現代新書', '講談社+α新書'] };
    }

    // エンタメ関連
    if (
      category === 'entertainment' ||
      /映画|アニメ|ドラマ|エンタメ|ちいかわ|キャラクター/.test(keywordStr)
    ) {
      return { genre: 'エンタメ', labels: ['講談社'] };
    }

    // 政治・社会関連
    if (
      category === 'politics' ||
      /政治|外交|国際|社会問題|世代論/.test(keywordStr)
    ) {
      return { genre: '社会・政治', labels: ['講談社現代新書', '講談社学術文庫'] };
    }

    // ライフスタイル・教養
    if (
      category === 'lifestyle' ||
      /教養|哲学|思想|古典|論語|孫子|歴史/.test(keywordStr)
    ) {
      return { genre: '古典・教養', labels: ['講談社学術文庫', '講談社現代新書'] };
    }

    // その他の場合は null を返す
    return { genre: '', labels: [] };
  }

  /**
   * 提案理由を生成
   */
  private generateReason(
    trend: Trend,
    keywords: string[],
    genre: string,
    labels: string[]
  ): string {
    let reason = '';

    // トレンドの注目度を説明
    if (trend.mentionCount >= 3000) {
      reason += `「${trend.keyword}」は現在非常に高い注目を集めています（メンション: ${trend.mentionCount.toLocaleString()}件）。`;
    } else if (trend.mentionCount >= 1000) {
      reason += `「${trend.keyword}」が話題になっています（メンション: ${trend.mentionCount.toLocaleString()}件）。`;
    } else {
      reason += `「${trend.keyword}」に関心が高まっています。`;
    }

    // ジャンルとレーベルの提案
    reason += `${genre}として、${labels.join('または')}から関連書籍を出版することを推奨します。`;

    // キーワードに基づいた具体的な提案
    const mainKeywords = keywords.slice(0, 3);
    if (mainKeywords.length > 0) {
      reason += `特に「${mainKeywords.join('」「')}」などをテーマにした書籍が求められています。`;
    }

    return reason;
  }

  /**
   * 提案をテキスト形式で出力
   */
  formatSuggestions(suggestions: BookSuggestion[]): string {
    let output = '# 講談社書籍の推奨リスト\n\n';
    output += `生成日時: ${new Date().toLocaleString('ja-JP')}\n`;
    output += `提案件数: ${suggestions.length}件\n\n`;
    output += '---\n\n';

    for (let i = 0; i < suggestions.length; i++) {
      const suggestion = suggestions[i];
      if (!suggestion) continue;

      output += `## ${i + 1}. ${suggestion.keyword}\n\n`;
      output += `- **カテゴリ**: ${suggestion.category}\n`;
      output += `- **メンション数**: ${suggestion.mentionCount.toLocaleString()}件\n`;
      output += `- **推奨ジャンル**: ${suggestion.suggestedGenre}\n`;
      output += `- **推奨レーベル**: ${suggestion.suggestedLabels.join(', ')}\n`;
      output += `- **理由**: ${suggestion.reason}\n`;
      output += `- **関連キーワード**: ${suggestion.relatedTrends.join(', ')}\n`;
      output += '\n---\n\n';
    }

    return output;
  }
}
