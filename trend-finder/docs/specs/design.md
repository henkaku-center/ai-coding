# 設計書：トレンド分析・コンテンツ提案システム

## 1. システムアーキテクチャ

### 1.1 全体構成

```
┌─────────────────────────────────────────────────────────────┐
│                     CLI / Scheduler                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Collector  │→ │   Analyzer   │→ │   Proposer   │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                              ↓               │
│                                      ┌──────────────┐       │
│                                      │   Reporter   │       │
│                                      │   Service    │       │
│                                      └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Repository  │  │    Cache     │  │   Storage    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    External Sources                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Twitter/X   │  │  News Sites  │  │  Calendar    │      │
│  │     API      │  │   Scraper    │  │     API      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 レイヤー責務

| レイヤー | 責務 |
|---------|------|
| **CLI/Scheduler** | コマンド実行、定期実行制御 |
| **Application Layer** | ビジネスロジック、データ処理フロー |
| **Data Access Layer** | データ永続化、キャッシング |
| **External Sources** | 外部データソースとの通信 |

---

## 2. 技術スタック

### 2.1 言語・ランタイム
- **言語**: TypeScript 5.x
- **ランタイム**: Node.js 20.x (LTS)
- **パッケージマネージャー**: npm または pnpm

### 2.2 主要ライブラリ

| カテゴリ | ライブラリ | 用途 |
|---------|-----------|------|
| **HTTP Client** | axios | API通信 |
| **スクレイピング** | cheerio | HTML解析 |
| **日時処理** | date-fns | 日付計算・フォーマット |
| **データ検証** | zod | 型安全なバリデーション |
| **CLI** | commander | CLIインターフェース |
| **スケジューラー** | node-cron | 定期実行 |
| **ログ** | winston | ログ記録 |
| **テスト** | vitest | ユニットテスト |
| **静的解析** | eslint, prettier | コード品質維持 |

### 2.3 データストレージ
- **MVP**: JSON ファイル（`data/` ディレクトリ配下）
- **将来検討**: SQLite または PostgreSQL

---

## 3. ディレクトリ構造

```
trend-finder/
├── src/
│   ├── index.ts                     # エントリーポイント
│   ├── cli.ts                       # CLI定義
│   ├── config/
│   │   ├── index.ts                 # 設定統合
│   │   ├── sources.ts               # データソース設定
│   │   └── categories.ts            # カテゴリ定義
│   ├── collectors/                  # データ収集層
│   │   ├── base/
│   │   │   └── BaseCollector.ts     # 抽象基底クラス
│   │   ├── TwitterCollector.ts      # Twitter/Xトレンド収集
│   │   ├── NewsCollector.ts         # ニュース収集
│   │   ├── CalendarCollector.ts     # 記念日収集
│   │   └── index.ts
│   ├── analyzers/                   # データ分析層
│   │   ├── TrendScoreAnalyzer.ts    # トレンドスコア算出
│   │   ├── TimeSeriesAnalyzer.ts    # 時系列分析
│   │   ├── RelationAnalyzer.ts      # 関連性分析
│   │   └── index.ts
│   ├── proposers/                   # 提案生成層
│   │   ├── ArticleProposer.ts       # 記事テーマ提案
│   │   ├── BookPromoProposer.ts     # 書籍プロモ提案
│   │   └── index.ts
│   ├── reporters/                   # レポート生成層
│   │   ├── DailyReporter.ts         # 日次レポート
│   │   ├── WeeklyReporter.ts        # 週次レポート
│   │   └── index.ts
│   ├── services/                    # サービス層
│   │   ├── CollectorService.ts      # 収集オーケストレーション
│   │   ├── AnalyzerService.ts       # 分析オーケストレーション
│   │   ├── ProposerService.ts       # 提案オーケストレーション
│   │   └── ReporterService.ts       # レポート生成
│   ├── repositories/                # データアクセス層
│   │   ├── TrendRepository.ts       # トレンドデータ保存
│   │   ├── NewsRepository.ts        # ニュースデータ保存
│   │   ├── EventRepository.ts       # イベントデータ保存
│   │   ├── BookRepository.ts        # 登録書籍データ保存
│   │   └── index.ts
│   ├── models/                      # データモデル
│   │   ├── Trend.ts                 # トレンドモデル
│   │   ├── News.ts                  # ニュースモデル
│   │   ├── Event.ts                 # イベントモデル
│   │   ├── ArticleProposal.ts       # 記事提案モデル
│   │   ├── BookPromotion.ts         # 書籍プロモモデル
│   │   └── index.ts
│   ├── utils/                       # ユーティリティ
│   │   ├── logger.ts                # ロガー
│   │   ├── retry.ts                 # リトライ処理
│   │   ├── delay.ts                 # 遅延処理
│   │   ├── deduplicator.ts          # 重複除去
│   │   └── index.ts
│   └── types/                       # 型定義
│       ├── config.ts
│       ├── collector.ts
│       └── index.ts
├── data/                            # データ保存ディレクトリ
│   ├── trends/                      # トレンドデータ
│   │   └── YYYY-MM-DD.json
│   ├── news/                        # ニュースデータ
│   │   └── YYYY-MM-DD.json
│   ├── events/                      # イベントデータ
│   │   └── calendar.json
│   ├── books/                       # 登録書籍データ
│   │   └── books.json
│   └── reports/                     # レポート
│       ├── daily/
│       │   └── YYYY-MM-DD.md
│       └── weekly/
│           └── YYYY-Www.md
├── logs/                            # ログファイル
│   └── app.log
├── tests/                           # テストコード
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docs/                            # ドキュメント
│   └── specs/
│       ├── requirements.md
│       └── design.md
├── .env.example                     # 環境変数サンプル
├── .env                             # 環境変数（git管理外）
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 4. データモデル

### 4.1 Trend（トレンドモデル）

```typescript
interface Trend {
  id: string;                      // UUID
  keyword: string;                 // トレンドキーワード
  source: 'twitter' | 'news' | 'calendar';
  category: Category;              // カテゴリ
  score: number;                   // トレンドスコア (0-100)
  mentionCount: number;            // メンション数
  timestamp: Date;                 // 取得日時
  metadata: {
    hashtags?: string[];           // 関連ハッシュタグ
    relatedKeywords?: string[];    // 関連キーワード
    url?: string;                  // ソースURL
  };
}

type Category =
  | 'technology'
  | 'business'
  | 'entertainment'
  | 'lifestyle'
  | 'sports'
  | 'politics'
  | 'other';
```

### 4.2 News（ニュースモデル）

```typescript
interface News {
  id: string;
  title: string;
  summary: string;
  category: Category;
  publishedAt: Date;
  sourceUrl: string;
  sourceName: string;
  keywords: string[];
  scrapedAt: Date;
}
```

### 4.3 Event（イベント/記念日モデル）

```typescript
interface Event {
  id: string;
  name: string;
  description: string;
  date: string;                    // YYYY-MM-DD形式
  category: Category;
  isRecurring: boolean;            // 毎年繰り返しか
}
```

### 4.4 ArticleProposal（記事提案モデル）

```typescript
interface ArticleProposal {
  id: string;
  title: string;                   // 提案記事タイトル
  angle: string;                   // 切り口
  targetAudience: string;          // 想定読者
  basedOnTrend: Trend;             // 基となるトレンド
  recommendedPublishTime: Date;    // 推奨公開日時
  reason: string;                  // 提案理由
  relatedKeywords: string[];       // 関連キーワード
  score: number;                   // 提案スコア (0-100)
  generatedAt: Date;
}
```

### 4.5 BookPromotion（書籍プロモモデル）

```typescript
interface Book {
  id: string;
  title: string;
  keywords: string[];              // 登録キーワード
  genre: string;
  registeredAt: Date;
}

interface BookPromotion {
  id: string;
  book: Book;
  recommendationLevel: 'high' | 'medium' | 'low';
  relatedTrends: Trend[];          // 関連トレンド
  reason: string;                  // 推奨理由
  recommendedPeriod: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
}
```

### 4.6 TrendHistory（トレンド履歴モデル）

```typescript
interface TrendHistory {
  keyword: string;
  dataPoints: {
    timestamp: Date;
    score: number;
    mentionCount: number;
  }[];
  peakTime?: Date;
  startTime?: Date;
  status: 'rising' | 'peak' | 'declining' | 'stable';
}
```

---

## 5. モジュール設計

### 5.1 BaseCollector（抽象基底クラス）

```typescript
abstract class BaseCollector<T> {
  protected abstract sourceName: string;
  protected abstract minInterval: number;  // ms

  abstract collect(): Promise<T[]>;

  // 共通機能
  async collectWithRetry(maxRetries: number = 3): Promise<T[]> {
    // リトライロジック
  }

  protected async delay(ms: number): Promise<void> {
    // レート制限対策
  }

  protected log(message: string): void {
    // ログ出力
  }
}
```

### 5.2 TwitterCollector

```typescript
class TwitterCollector extends BaseCollector<Trend> {
  protected sourceName = 'Twitter/X';
  protected minInterval = 1000;

  async collect(): Promise<Trend[]> {
    // Twitter APIまたはスクレイピングでトレンド取得
    // トレンドデータを Trend モデルに変換して返す
  }
}
```

### 5.3 TrendScoreAnalyzer

```typescript
class TrendScoreAnalyzer {
  /**
   * トレンドスコアを算出
   * @param trend - 対象トレンド
   * @param history - 過去データ
   * @returns 0-100のスコア
   */
  calculateScore(trend: Trend, history: TrendHistory[]): number {
    const mentionScore = this.calculateMentionScore(trend.mentionCount);
    const velocityScore = this.calculateVelocityScore(trend, history);
    const freshnessScore = this.calculateFreshnessScore(trend.timestamp);

    // 重み付け平均
    return (
      mentionScore * 0.4 +
      velocityScore * 0.4 +
      freshnessScore * 0.2
    );
  }

  private calculateMentionScore(count: number): number {
    // メンション数を正規化 (0-100)
  }

  private calculateVelocityScore(
    trend: Trend,
    history: TrendHistory[]
  ): number {
    // 増加率を計算
  }

  private calculateFreshnessScore(timestamp: Date): number {
    // 時間的新鮮度を計算
  }
}
```

### 5.4 ArticleProposer

```typescript
class ArticleProposer {
  /**
   * 記事テーマを提案
   * @param trends - 分析済みトレンド
   * @param options - オプション（カテゴリフィルタなど）
   * @returns 記事提案のリスト
   */
  async propose(
    trends: Trend[],
    options?: {
      category?: Category;
      minScore?: number;
      limit?: number;
    }
  ): Promise<ArticleProposal[]> {
    // スコア順にソート
    const sortedTrends = this.sortByScore(trends);

    // フィルタリング
    const filtered = this.filterTrends(sortedTrends, options);

    // 提案生成
    return this.generateProposals(filtered, options?.limit ?? 5);
  }

  private generateProposals(
    trends: Trend[],
    limit: number
  ): ArticleProposal[] {
    // トレンドから記事タイトル案を生成
  }
}
```

---

## 6. データフロー

### 6.1 収集→分析→提案フロー

```
1. データ収集フェーズ
   CollectorService
     ├─ TwitterCollector.collect()
     ├─ NewsCollector.collect()
     └─ CalendarCollector.collect()
          ↓
   TrendRepository.save()

2. 分析フェーズ
   AnalyzerService
     ├─ TrendRepository.load()
     ├─ TrendScoreAnalyzer.calculateScore()
     ├─ TimeSeriesAnalyzer.analyze()
     └─ RelationAnalyzer.findRelations()
          ↓
   TrendRepository.update()

3. 提案生成フェーズ
   ProposerService
     ├─ ArticleProposer.propose()
     └─ BookPromoProposer.propose()
          ↓
   ReporterService
     ├─ DailyReporter.generate()
     └─ 出力: data/reports/daily/YYYY-MM-DD.md
```

### 6.2 シーケンス図（日次実行）

```
CLI/Scheduler          CollectorService    AnalyzerService    ProposerService    ReporterService
     │                        │                   │                  │                  │
     │─collect()──────────────>│                   │                  │                  │
     │                        │─collect()          │                  │                  │
     │                        │  (各Collector)     │                  │                  │
     │                        │<─返却(Trend[])     │                  │                  │
     │                        │─save()             │                  │                  │
     │                        │  (Repository)      │                  │                  │
     │<───完了────────────────│                   │                  │                  │
     │                        │                   │                  │                  │
     │─analyze()──────────────────────────────────>│                  │                  │
     │                        │                   │─load()           │                  │
     │                        │                   │─calculateScore() │                  │
     │                        │                   │─analyze()        │                  │
     │                        │                   │─update()         │                  │
     │<───完了────────────────────────────────────│                  │                  │
     │                        │                   │                  │                  │
     │─propose()──────────────────────────────────────────────────────>│                  │
     │                        │                   │                  │─propose()        │
     │<───完了────────────────────────────────────────────────────────│                  │
     │                        │                   │                  │                  │
     │─report()───────────────────────────────────────────────────────────────────────────>│
     │                        │                   │                  │                  │─generate()
     │<───完了────────────────────────────────────────────────────────────────────────────│
```

---

## 7. スクレイピング設計

### 7.1 基本方針

- **robots.txt 遵守**: スクレイピング前に確認
- **User-Agent 設定**: 識別可能な User-Agent を使用
- **レート制限**: 1秒以上の間隔を空ける
- **リトライ戦略**: 3回まで、指数バックオフ
- **タイムアウト**: 10秒

### 7.2 Twitter/X トレンド収集

**方法1**: Twitter API v2（要認証）
```typescript
// API使用時
const endpoint = 'https://api.twitter.com/2/trends/available';
```

**方法2**: スクレイピング（APIが使えない場合）
```typescript
// 代替サービスを利用（例: getdaytrends.com など）
// ※利用規約を必ず確認
```

### 7.3 ニュースサイト収集

**対象候補**:
- Yahoo!ニュース トピックス
- はてなブックマーク ホットエントリ
- Google News RSS

**実装例**:
```typescript
class NewsCollector extends BaseCollector<News> {
  private sources = [
    {
      name: 'Yahoo News',
      url: 'https://news.yahoo.co.jp/',
      selector: '.newsFeed_item',
    },
    // 他のソース
  ];

  async collect(): Promise<News[]> {
    const results: News[] = [];

    for (const source of this.sources) {
      await this.delay(this.minInterval);
      const html = await axios.get(source.url);
      const $ = cheerio.load(html.data);

      // セレクタで記事抽出
      $(source.selector).each((i, elem) => {
        // News モデルに変換
      });
    }

    return results;
  }
}
```

### 7.4 記念日・イベント収集

**対象候補**:
- Wikipedia「○月○日」ページ
- 記念日協会サイト
- Google Calendar API

---

## 8. 分析アルゴリズム設計

### 8.1 トレンドスコア算出アルゴリズム

```typescript
score = (
  mentionScore * 0.4 +
  velocityScore * 0.4 +
  freshnessScore * 0.2
)

// mentionScore: メンション数の正規化 (0-100)
mentionScore = min(100, (mentionCount / 10000) * 100)

// velocityScore: 増加率スコア (0-100)
growthRate = (currentCount - previousCount) / previousCount
velocityScore = min(100, growthRate * 100)

// freshnessScore: 新鮮度スコア (0-100)
hoursSincePost = (now - timestamp) / 3600000
freshnessScore = max(0, 100 - (hoursSincePost * 5))
```

### 8.2 急上昇トレンド判定

```typescript
function isRising(trend: Trend, history: TrendHistory): boolean {
  const currentScore = trend.score;
  const previousScore = history.dataPoints[history.dataPoints.length - 1]?.score ?? 0;

  // 前日比200%以上
  return (currentScore / previousScore) >= 2.0;
}
```

### 8.3 関連性分析

```typescript
function calculateRelevance(keyword1: string, keyword2: string): number {
  // 共起頻度ベースの関連性スコア
  const coOccurrence = countCoOccurrence(keyword1, keyword2);
  const keyword1Count = countOccurrence(keyword1);
  const keyword2Count = countOccurrence(keyword2);

  // Jaccard係数
  return coOccurrence / (keyword1Count + keyword2Count - coOccurrence);
}
```

---

## 9. レポート生成設計

### 9.1 日次レポートフォーマット

```markdown
# トレンドレポート - YYYY年MM月DD日

## 🔥 トップトレンド

1. **[キーワード]** (スコア: 95)
   - カテゴリ: テクノロジー
   - メンション数: 15,000
   - 前日比: +250%
   - 関連: #hashtag1, #hashtag2

...

## 📈 急上昇ワード

- **[キーワード]** (前日比 +300%)
- ...

## ✍️ おすすめ記事テーマ

### 1. [記事タイトル案]
- **切り口**: ...
- **想定読者**: ...
- **推奨公開**: 今日中
- **理由**: [トレンド]が急上昇中

...

## 📚 書籍プロモーション推奨

### 高: [書籍タイトル]
- **関連トレンド**: ...
- **推奨期間**: 今週中
- **理由**: ...

...
```

### 9.2 JSON出力フォーマット

```json
{
  "date": "2025-11-24",
  "topTrends": [
    {
      "keyword": "...",
      "score": 95,
      "category": "technology",
      "mentionCount": 15000,
      "changeRate": 2.5
    }
  ],
  "risingTrends": [...],
  "articleProposals": [...],
  "bookPromotions": [...]
}
```

---

## 10. エラーハンドリング戦略

### 10.1 リトライ戦略

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = baseDelay * Math.pow(2, i);
      logger.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await sleep(delay);
    }
  }

  throw new Error('Max retries exceeded');
}
```

### 10.2 部分的失敗の処理

```typescript
class CollectorService {
  async collectAll(): Promise<{
    success: Trend[];
    failed: { collector: string; error: Error }[];
  }> {
    const collectors = [
      new TwitterCollector(),
      new NewsCollector(),
      new CalendarCollector(),
    ];

    const results = await Promise.allSettled(
      collectors.map(c => c.collectWithRetry())
    );

    const success: Trend[] = [];
    const failed: { collector: string; error: Error }[] = [];

    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        success.push(...result.value);
      } else {
        failed.push({
          collector: collectors[i].sourceName,
          error: result.reason,
        });
        logger.error(`Failed to collect from ${collectors[i].sourceName}`, result.reason);
      }
    });

    return { success, failed };
  }
}
```

---

## 11. スケジューリング設計

### 11.1 定期実行設定

```typescript
import cron from 'node-cron';

// 1時間ごと: トレンド収集
cron.schedule('0 * * * *', async () => {
  logger.info('Starting hourly trend collection');
  await collectorService.collectAll();
});

// 6時間ごと: ニュース収集
cron.schedule('0 */6 * * *', async () => {
  logger.info('Starting news collection');
  await newsCollector.collect();
});

// 毎日9時: 日次レポート生成
cron.schedule('0 9 * * *', async () => {
  logger.info('Generating daily report');
  await reporterService.generateDaily();
});

// 毎週月曜9時: 週次レポート生成
cron.schedule('0 9 * * 1', async () => {
  logger.info('Generating weekly report');
  await reporterService.generateWeekly();
});
```

---

## 12. CLI設計

### 12.1 コマンド一覧

```bash
# データ収集
trend-finder collect [options]
  --source <twitter|news|calendar|all>  # ソース指定
  --save                                # 結果を保存

# 分析実行
trend-finder analyze [options]
  --date <YYYY-MM-DD>                   # 対象日付
  --output <json|markdown>              # 出力形式

# 記事提案
trend-finder propose articles [options]
  --category <category>                 # カテゴリ指定
  --limit <number>                      # 件数

# 書籍プロモ提案
trend-finder propose books [options]
  --book-id <id>                        # 書籍ID指定

# レポート生成
trend-finder report daily [date]
trend-finder report weekly [week]

# 定期実行開始
trend-finder start

# 書籍登録
trend-finder book add --title <title> --keywords <k1,k2,k3>
```

### 12.2 設定ファイル

```typescript
// config/default.ts
export const config = {
  collectors: {
    twitter: {
      enabled: true,
      interval: 3600000, // 1時間
      apiKey: process.env.TWITTER_API_KEY,
    },
    news: {
      enabled: true,
      interval: 21600000, // 6時間
      sources: ['yahoo', 'hatena'],
    },
    calendar: {
      enabled: true,
      interval: 604800000, // 1週間
    },
  },
  analyzers: {
    scoreWeights: {
      mention: 0.4,
      velocity: 0.4,
      freshness: 0.2,
    },
    risingThreshold: 2.0, // 前日比200%
  },
  storage: {
    type: 'json', // 'json' | 'sqlite'
    path: './data',
  },
  logging: {
    level: 'info',
    file: './logs/app.log',
  },
};
```

---

## 13. セキュリティ設計

### 13.1 環境変数管理

```bash
# .env.example
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here

# プロキシ設定（必要に応じて）
HTTP_PROXY=
HTTPS_PROXY=

# ログレベル
LOG_LEVEL=info
```

### 13.2 入力検証

```typescript
import { z } from 'zod';

const TrendSchema = z.object({
  keyword: z.string().min(1).max(100),
  score: z.number().min(0).max(100),
  category: z.enum(['technology', 'business', 'entertainment', 'lifestyle', 'sports', 'politics', 'other']),
  timestamp: z.date(),
});

// 使用例
function validateTrend(data: unknown): Trend {
  return TrendSchema.parse(data);
}
```

---

## 14. テスト戦略

### 14.1 テスト種別

| 種別 | 対象 | ツール |
|------|------|--------|
| **ユニットテスト** | 各クラス・関数の単体テスト | vitest |
| **統合テスト** | モジュール間連携テスト | vitest |
| **E2Eテスト** | CLI実行テスト | vitest + 実データ |

### 14.2 モック戦略

```typescript
// tests/mocks/mockCollector.ts
class MockTwitterCollector extends TwitterCollector {
  async collect(): Promise<Trend[]> {
    // テストデータを返す
    return [
      {
        id: 'test-1',
        keyword: 'テストトレンド',
        score: 85,
        // ...
      },
    ];
  }
}
```

---

## 15. パフォーマンス最適化

### 15.1 キャッシング戦略

```typescript
class CacheService {
  private cache = new Map<string, { data: any; expiry: Date }>();

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item || item.expiry < new Date()) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiry: new Date(Date.now() + ttlMs),
    });
  }
}
```

### 15.2 並列処理

```typescript
// 複数ソースから並列収集
const results = await Promise.all([
  twitterCollector.collect(),
  newsCollector.collect(),
  calendarCollector.collect(),
]);
```

---

## 16. 拡張性への配慮

### 16.1 プラグインアーキテクチャ

```typescript
// 新しいCollectorを追加しやすい設計
interface CollectorPlugin {
  name: string;
  collect(): Promise<Trend[]>;
}

class CollectorRegistry {
  private collectors: CollectorPlugin[] = [];

  register(collector: CollectorPlugin): void {
    this.collectors.push(collector);
  }

  async collectAll(): Promise<Trend[]> {
    const results = await Promise.all(
      this.collectors.map(c => c.collect())
    );
    return results.flat();
  }
}
```

### 16.2 通知システムの拡張

```typescript
// 将来的に Email, Slack などを追加可能
interface NotificationChannel {
  send(message: string): Promise<void>;
}

class ConsoleNotifier implements NotificationChannel {
  async send(message: string): Promise<void> {
    console.log(message);
  }
}

// 将来追加
class SlackNotifier implements NotificationChannel {
  async send(message: string): Promise<void> {
    // Slack API呼び出し
  }
}
```

---

## 17. 変更履歴

| 日付 | バージョン | 変更内容 | 作成者 |
|------|------------|----------|--------|
| 2025-11-24 | 1.0 | 初版作成 | - |
