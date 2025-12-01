/**
 * BookPromoProposer
 * 書籍プロモーション提案
 */

import { v4 as uuidv4 } from 'uuid';
import { Book, BookPromotion } from '../models/BookPromotion.js';
import { Trend } from '../models/Trend.js';
import { logger } from '../utils/logger.js';

export class BookPromoProposer {
  /**
   * 書籍プロモーションを提案
   * @param book - 対象書籍
   * @param trends - トレンドリスト
   * @returns プロモーション提案
   */
  async propose(book: Book, trends: Trend[]): Promise<BookPromotion | null> {
    logger.info(`Analyzing promotion opportunity for book: ${book.title}`);

    // 書籍のキーワードに関連するトレンドを検索
    const relatedTrends = this.findRelatedTrends(book, trends);

    if (relatedTrends.length === 0) {
      logger.info(`No related trends found for book: ${book.title}`);
      return null;
    }

    // 推奨度を判定
    const recommendationLevel = this.determineRecommendationLevel(relatedTrends);

    // プロモーション期間を算出
    const recommendedPeriod = this.calculatePromotionPeriod(relatedTrends);

    // 理由を生成
    const reason = this.generateReason(book, relatedTrends);

    const promotion: BookPromotion = {
      id: uuidv4(),
      book,
      recommendationLevel,
      relatedTrends,
      reason,
      recommendedPeriod,
      generatedAt: new Date(),
    };

    logger.info(
      `Generated promotion proposal for "${book.title}" with level: ${recommendationLevel}`
    );

    return promotion;
  }

  /**
   * 複数の書籍に対してプロモーション提案を生成
   */
  async proposeForBooks(books: Book[], trends: Trend[]): Promise<BookPromotion[]> {
    const promotions: BookPromotion[] = [];

    for (const book of books) {
      const promotion = await this.propose(book, trends);
      if (promotion) {
        promotions.push(promotion);
      }
    }

    // 推奨度順にソート
    return promotions.sort((a, b) => {
      const levelOrder = { high: 3, medium: 2, low: 1 };
      return levelOrder[b.recommendationLevel] - levelOrder[a.recommendationLevel];
    });
  }

  /**
   * 書籍に関連するトレンドを検索
   */
  private findRelatedTrends(book: Book, trends: Trend[]): Array<Trend & { relevanceScore: number }> {
    const relatedTrends: Array<Trend & { relevanceScore: number }> = [];

    for (const trend of trends) {
      const relevanceScore = this.calculateRelevance(book, trend);

      // 関連度が30以上のトレンドのみ採用（より厳格に）
      if (relevanceScore >= 30) {
        relatedTrends.push({ ...trend, relevanceScore });
      }
    }

    // 関連度スコア順にソートして上位5件を返す
    return relatedTrends.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 5);
  }

  /**
   * 書籍とトレンドの関連性を計算
   */
  private calculateRelevance(book: Book, trend: Trend): number {
    let score = 0;

    // 書籍のキーワードとトレンドキーワードの一致
    for (const keyword of book.keywords) {
      const keywordLower = keyword.toLowerCase();
      const trendKeywordLower = trend.keyword.toLowerCase();

      // 完全一致
      if (keywordLower === trendKeywordLower) {
        score += 50;
      }
      // 部分一致
      else if (
        trendKeywordLower.includes(keywordLower) ||
        keywordLower.includes(trendKeywordLower)
      ) {
        score += 30;
      }

      // ハッシュタグとの一致
      const hashtags = trend.metadata.hashtags || [];
      if (hashtags.some((tag) => tag.toLowerCase().includes(keywordLower))) {
        score += 20;
      }

      // 関連キーワードとの一致
      const relatedKeywords = trend.metadata.relatedKeywords || [];
      if (relatedKeywords.some((kw) => kw.toLowerCase().includes(keywordLower))) {
        score += 10;
      }
    }

    return score;
  }

  /**
   * 推奨度を判定
   */
  private determineRecommendationLevel(
    relatedTrends: Array<Trend & { relevanceScore: number }>
  ): 'high' | 'medium' | 'low' {
    if (relatedTrends.length === 0) {
      return 'low';
    }

    // トップトレンドの関連度とスコアを組み合わせて判定
    const topTrend = relatedTrends[0];
    if (!topTrend) {
      return 'low';
    }

    const maxRelevance = topTrend.relevanceScore;
    const maxTrendScore = Math.max(...relatedTrends.map((t) => t.score));

    // 関連度が高く（100以上）、かつトレンドスコアも高い（70以上）場合は高推奨
    if (maxRelevance >= 100 && maxTrendScore >= 70) {
      return 'high';
    }
    // 関連度が中程度（60以上）またはトレンドスコアが中程度（50以上）
    else if (maxRelevance >= 60 || (maxTrendScore >= 50 && maxRelevance >= 40)) {
      return 'medium';
    }
    // それ以外は低推奨
    else {
      return 'low';
    }
  }

  /**
   * プロモーション推奨期間を算出
   */
  private calculatePromotionPeriod(relatedTrends: Array<Trend & { relevanceScore: number }>): {
    start: Date;
    end: Date;
  } {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    if (relatedTrends.length === 0) {
      end.setDate(end.getDate() + 7); // デフォルト1週間
      return { start, end };
    }

    const maxScore = Math.max(...relatedTrends.map((t) => t.score));

    if (maxScore >= 80) {
      // 高スコア: 2週間
      end.setDate(end.getDate() + 14);
    } else if (maxScore >= 60) {
      // 中スコア: 1週間
      end.setDate(end.getDate() + 7);
    } else {
      // 低スコア: 3日間
      end.setDate(end.getDate() + 3);
    }

    return { start, end };
  }

  /**
   * 推奨理由を生成
   */
  private generateReason(book: Book, relatedTrends: Array<Trend & { relevanceScore: number }>): string {
    if (relatedTrends.length === 0) {
      return '現在、関連するトレンドが見つかりませんでした。';
    }

    const topTrend = relatedTrends[0];
    if (!topTrend) {
      return '関連トレンドの分析中です。';
    }

    // 書籍のキーワードとトレンドの関連性を分析
    const matchedKeywords = this.findMatchedKeywords(book, topTrend);

    let reason = '';

    // 書籍固有の特徴を前面に出す
    reason += this.generateBookSpecificIntro(book, matchedKeywords);

    // トレンドとの関連性を説明
    if (topTrend.score >= 80) {
      reason += `現在「${topTrend.keyword}」が非常に高い注目を集めており（スコア: ${topTrend.score}、メンション: ${topTrend.mentionCount.toLocaleString()}件）、`;
    } else if (topTrend.score >= 60) {
      reason += `「${topTrend.keyword}」が注目を集めている今（スコア: ${topTrend.score}、メンション: ${topTrend.mentionCount.toLocaleString()}件）、`;
    } else {
      reason += `「${topTrend.keyword}」に関する話題が増えている中、`;
    }

    // ジャンルとターゲット層に応じた推奨文
    reason += this.generateTargetAudienceMessage(book);

    // 複数の関連トレンドがある場合は補足
    if (relatedTrends.length > 1) {
      const otherTrends = relatedTrends.slice(1, 3).map((t) => t.keyword);
      if (otherTrends.length > 0) {
        reason += `さらに「${otherTrends.join('」「')}」など複数の関連トピックも盛り上がっており、相乗効果が期待できます。`;
      }
    }

    // 推奨アクションを追加
    if (topTrend.score >= 70) {
      reason += `今すぐプロモーションを強化すべきタイミングです。`;
    } else if (topTrend.score >= 50) {
      reason += `今週中のプロモーション展開を推奨します。`;
    } else {
      reason += `短期的なプロモーション施策をご検討ください。`;
    }

    return reason;
  }

  /**
   * 書籍固有の導入文を生成
   */
  private generateBookSpecificIntro(book: Book, matchedKeywords: string[]): string {
    const title = book.title;

    // タイトルから特徴的な要素を抽出
    if (title.includes('はじめて') || title.includes('入門')) {
      return `「${title}」は初学者向けの${book.genre}として、${matchedKeywords.length > 0 ? matchedKeywords.join('・') : '関連分野'}を基礎から学べる貴重な一冊です。`;
    } else if (title.includes('中学数学') || title.includes('高校数学')) {
      return `「${title}」は数学的な基礎から丁寧に解説する${book.genre}として、理論をしっかり理解したい読者に最適です。`;
    } else if (title.includes('実践') || title.includes('つくって') || title.includes('プログラミング')) {
      return `「${title}」は実装に重点を置いた${book.genre}として、手を動かして学びたいエンジニアに人気の書籍です。`;
    } else if (title.includes('改訂') || title.includes('第2版')) {
      return `「${title}」は最新の知見を反映した定番${book.genre}として、既存読者の買い替えと新規読者の両方を獲得できます。`;
    } else if (title.includes('ChatGPT') || title.includes('活用術')) {
      return `「${title}」はビジネス現場での具体的な活用法を紹介する実践的な${book.genre}として、即戦力を求める読者に支持されています。`;
    } else if (title.includes('世代') || title.includes('キャリア')) {
      return `「${title}」は現代の働き方や価値観を扱う${book.genre}として、キャリアに悩む読者層に響く内容です。`;
    } else if (title.includes('映画') || title.includes('ガイドブック')) {
      return `「${title}」は話題作の公式${book.genre}として、ファン層への訴求力が非常に高い商品です。`;
    } else if (title.includes('衝撃') || title.includes('世界はこう変わる')) {
      return `「${title}」は社会的インパクトを論じる${book.genre}として、経営層やビジネスリーダーの関心を集めています。`;
    } else if (title.includes('知能とは') || title.includes('量子コンピュータ')) {
      return `「${title}」は先端技術の本質に迫る${book.genre}として、知的好奇心の高い読者層を惹きつけます。`;
    } else if (title.includes('論語') || title.includes('孫子') || title.includes('老子') || title.includes('荘子') || title.includes('菜根譚')) {
      return `「${title}」は数千年にわたり読み継がれてきた東洋哲学の名著として、現代のビジネスや人生に活かせる普遍的な知恵が詰まった${book.genre}です。`;
    } else if (book.genre === '古典') {
      return `「${title}」は時代を超えて価値を持つ${book.genre}として、教養を深め人生を豊かにする洞察を提供します。`;
    } else {
      return `「${title}」は${matchedKeywords.length > 0 ? matchedKeywords.join('・') : '関連分野'}をカバーする${book.genre}として、幅広い読者層にアピールできます。`;
    }
  }

  /**
   * ターゲット層向けのメッセージを生成
   */
  private generateTargetAudienceMessage(book: Book): string {
    switch (book.genre) {
      case '入門書':
        return '初学者の需要が急増するこの機会を逃さず、プロモーションを強化することをお勧めします。';
      case 'エンジニアリング':
        return '技術者コミュニティでの口コミ効果も期待でき、技術書コーナーでの展開強化が効果的です。';
      case 'ビジネス':
        return 'ビジネス書読者の購買意欲が高まるタイミングであり、店頭での目立つ展開が重要です。';
      case '科学':
        return '教養層・学生層へのリーチが広がるチャンスであり、専門書コーナーでの露出強化をお勧めします。';
      case 'エンタメ':
        return 'SNSでの話題拡散と連動したプロモーションが非常に効果的なタイミングです。';
      case '古典':
        return '教養を深めたい読者層や、ビジネスパーソンの自己研鑽ニーズが高まるタイミングであり、人文・哲学コーナーでの展開強化が効果的です。';
      default:
        return '幅広い読者層へのアプローチが可能なタイミングです。';
    }
  }

  /**
   * 書籍のキーワードとトレンドでマッチしたキーワードを抽出
   */
  private findMatchedKeywords(book: Book, trend: Trend): string[] {
    const matched: string[] = [];
    const trendKeywordLower = trend.keyword.toLowerCase();

    for (const keyword of book.keywords) {
      const keywordLower = keyword.toLowerCase();

      // 完全一致または部分一致
      if (
        keywordLower === trendKeywordLower ||
        trendKeywordLower.includes(keywordLower) ||
        keywordLower.includes(trendKeywordLower)
      ) {
        matched.push(keyword);
      }

      // ハッシュタグとの一致
      const hashtags = trend.metadata.hashtags || [];
      if (hashtags.some((tag) => tag.toLowerCase().includes(keywordLower))) {
        if (!matched.includes(keyword)) {
          matched.push(keyword);
        }
      }
    }

    return matched.slice(0, 3); // 最大3つまで
  }
}
