# Trend Finder

トレンド分析・コンテンツ提案システム

Twitter/X、ニュース、カレンダーイベントなどから最新のトレンドを収集・分析し、記事提案や書籍プロモーションの推奨を自動生成するシステムです。

## 特徴

- 🔥 **トレンド収集**: Twitter API v2、ニュースサイトからリアルタイムにトレンドを収集
- 📊 **スコア分析**: メンション数・速度・鮮度を考慮した独自のスコアリングアルゴリズム
- 📈 **急上昇検出**: 急激に人気が高まっているトレンドを自動検出
- ✍️ **記事提案**: トレンドに基づいた記事テーマを自動生成
- 📚 **書籍プロモ推奨**: トレンドとマッチする書籍のプロモーションを提案
- 🌐 **HTMLダッシュボード**: Chart.jsを使った美しい可視化ダッシュボード
- 📄 **レポート出力**: Markdown + HTML形式での日次レポート生成

## デモ

### HTMLダッシュボード

<img width="1200" alt="HTMLダッシュボード" src="https://via.placeholder.com/1200x800/667eea/ffffff?text=Trend+Dashboard">

- トレンドスコアの棒グラフ
- カテゴリ別分布のドーナツチャート
- トップトレンド一覧テーブル
- 急上昇ワード・記事提案・書籍プロモーション推奨

## 必要要件

- Node.js 20.x 以上
- npm または pnpm
- Twitter API Bearer Token（オプション）

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd trend-finder
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env`ファイルを作成して、Twitter APIの認証情報を設定します：

```bash
cp .env.example .env
```

`.env`を編集：

```env
# Twitter/X API（オプション: なければモックデータを使用）
TWITTER_API_KEY="your-api-key"
TWITTER_API_SECRET="your-api-secret"
TWITTER_BEARER_TOKEN="your-bearer-token"

# ログレベル
LOG_LEVEL=info

# データ保存パス
DATA_PATH=./data
```

> **注**: Twitter APIキーがない場合は、モックデータで動作します。

### 4. ビルド

```bash
npm run build
```

## 使い方

### 書籍データのセットアップ（オプション）

書籍プロモーション機能を使用するには、書籍データをセットアップします：

```bash
# サンプルデータ（講談社のAI系書籍10冊）をコピー
mkdir -p data/books
cp seeds/books.json data/books/books.json
```

これにより、トレンドに基づいた書籍プロモーション推奨が自動で生成されます。

### トレンド収集

```bash
# トレンドを収集して表示
npm start collect

# トレンドを収集して保存
npm start collect --save
```

**出力例:**
```
✅ 8件のトレンドを収集しました

📊 トップトレンド（上位5件）:
  1. AI技術の進化 (スコア: 85)
  2. 年末セール (スコア: 72)
  3. 新作映画公開 (スコア: 68)
  4. #技術トレンド (スコア: 92)
  5. #今日のニュース (スコア: 78)
```

### トレンド分析

```bash
# トレンドを分析して保存
npm start analyze

# 特定日付のトレンドを分析
npm start analyze --date 2025-11-24
```

### レポート生成

```bash
# 日次レポートを生成（Markdown + HTML）
npm start report

# カスタム出力先
npm start report --output ./reports
```

生成されるファイル:
- `data/reports/daily/2025-11-24.md` - Markdown形式
- `data/reports/daily/2025-11-24.html` - HTMLダッシュボード

HTMLダッシュボードを開く:

```bash
open data/reports/daily/2025-11-24.html
```

### システム情報

```bash
# システム情報を表示
npm start info
```

## プロジェクト構造

```
trend-finder/
├── src/
│   ├── analyzers/          # トレンド分析ロジック
│   │   ├── TrendScoreAnalyzer.ts
│   │   ├── TimeSeriesAnalyzer.ts
│   │   └── RelationAnalyzer.ts
│   ├── collectors/         # データ収集
│   │   ├── TwitterCollector.ts
│   │   ├── NewsCollector.ts
│   │   ├── CalendarCollector.ts
│   │   └── MockTrendCollector.ts
│   ├── proposers/          # 提案生成
│   │   ├── ArticleProposer.ts
│   │   └── BookPromoProposer.ts
│   ├── reporters/          # レポート生成
│   │   └── DailyReporter.ts
│   ├── repositories/       # データ永続化
│   │   ├── TrendRepository.ts
│   │   ├── NewsRepository.ts
│   │   ├── EventRepository.ts
│   │   └── BookRepository.ts
│   ├── services/           # ビジネスロジック統合
│   │   └── TrendService.ts
│   ├── models/             # データモデル
│   ├── config/             # 設定
│   ├── utils/              # ユーティリティ
│   ├── cli.ts              # CLIコマンド定義
│   └── index.ts            # エントリーポイント
├── data/                   # データ保存ディレクトリ
│   ├── trends/
│   ├── news/
│   ├── events/
│   └── reports/
│       └── daily/
├── logs/                   # ログファイル
├── docs/                   # ドキュメント
└── tests/                  # テスト
```

## CLIコマンド一覧

| コマンド | 説明 | オプション |
|---------|------|-----------|
| `collect` | トレンドデータを収集 | `--save` データを保存 |
| `analyze` | トレンドを分析 | `--date <date>` 対象日付 |
| `report` | 日次レポートを生成 | `--output <dir>` 出力先 |
| `info` | システム情報を表示 | - |

## 機能詳細

### トレンドスコア計算

トレンドスコアは以下の要素を重み付けして計算されます：

```
スコア = (メンション数 × 0.4) + (増加速度 × 0.4) + (鮮度 × 0.2)
```

- **メンション数**: ツイート・記事での言及回数
- **増加速度**: 前回との比較での伸び率
- **鮮度**: 最新の情報ほど高スコア

### 急上昇トレンド検出

スコアが**70以上**のトレンドを「急上昇」と判定します。

### 記事提案

トレンドに基づいて以下を自動生成：
- 記事タイトル案
- 切り口（angle）
- 想定読者
- 推奨公開タイミング
- 提案理由

### 書籍プロモーション推奨

トレンドとキーワードマッチする書籍を検出し、推奨度（高/中/低）と推奨期間を算出します。

## データソース

### Twitter/X (実装済み)
- Twitter API v2 Recent Search
- 日本語ハッシュタグの収集
- レート制限対応（15分あたり25リクエスト）

### ニュース（実装済み）
- Yahoo!ニュース
- はてなブックマーク

### カレンダー（実装済み）
- 年間イベント・記念日データ

### モックデータ（開発・テスト用）
- Twitter APIがない場合の代替データ

## 開発

### テストの実行

```bash
npm test
```

### リント

```bash
npm run lint
```

### フォーマット

```bash
npm run format
```

## トラブルシューティング

### Twitter API レート制限エラー

```
Twitter API error: 429 - Too Many Requests
```

**解決策**: 15分待ってから再実行してください。システムは自動的にモックデータにフォールバックします。

### 環境変数が読み込まれない

- `.env`ファイルがプロジェクトルートに存在するか確認
- ファイル名が`.env`（`.env.example`ではない）か確認
- ビルド後に再実行

### ログが出力されない

- `LOG_LEVEL`環境変数を確認
- `logs/`ディレクトリの権限を確認

## ロードマップ

- [ ] 週次レポート生成
- [ ] スケジューラー機能（cron）
- [ ] データベース対応（SQLite, PostgreSQL）
- [ ] Web UI実装
- [ ] Slack/Discord通知機能
- [ ] AI（LLM）を使った記事タイトル生成
- [ ] リアルタイムダッシュボード

## 技術スタック

- **言語**: TypeScript 5.x
- **ランタイム**: Node.js 20.x
- **CLI**: Commander.js
- **HTTP**: axios
- **スクレイピング**: Cheerio
- **バリデーション**: Zod
- **ロギング**: Winston
- **日付操作**: date-fns
- **グラフ**: Chart.js
- **テスト**: Vitest

## ライセンス

ISC

## 貢献

プルリクエストを歓迎します！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 作者

Generated with [Claude Code](https://claude.com/claude-code)

## 謝辞

- [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api)
- [Chart.js](https://www.chartjs.org/)
- [Commander.js](https://github.com/tj/commander.js)
