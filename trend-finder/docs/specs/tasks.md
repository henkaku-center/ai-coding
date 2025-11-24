# 実装タスク一覧

## 概要

このドキュメントは、トレンドファインダーシステムの実装タスクを管理します。
各タスクをチェックボックス形式で記載し、完了したらチェックを入れてください。

**最終更新日**: 2025-11-24

---

## Phase 1: プロジェクトセットアップ

### 1.1 環境構築
- [x] Node.js 20.x のインストール確認
- [x] プロジェクト初期化（`npm init` または `pnpm init`）
- [x] TypeScript のセットアップ
  - [x] `typescript` インストール
  - [x] `tsconfig.json` 作成
  - [x] `@types/node` インストール
- [x] ESLint + Prettier のセットアップ
  - [x] `eslint` インストール
  - [x] `.eslintrc.json` 作成
  - [x] `prettier` インストール
  - [x] `.prettierrc` 作成

### 1.2 ディレクトリ構造作成
- [x] `src/` ディレクトリ作成
- [x] `src/config/` ディレクトリ作成
- [x] `src/collectors/` ディレクトリ作成
- [x] `src/analyzers/` ディレクトリ作成
- [x] `src/proposers/` ディレクトリ作成
- [x] `src/reporters/` ディレクトリ作成
- [x] `src/services/` ディレクトリ作成
- [x] `src/repositories/` ディレクトリ作成
- [x] `src/models/` ディレクトリ作成
- [x] `src/utils/` ディレクトリ作成
- [x] `src/types/` ディレクトリ作成
- [x] `data/` ディレクトリ作成
- [x] `logs/` ディレクトリ作成
- [x] `tests/` ディレクトリ作成

### 1.3 Git セットアップ
- [x] Git リポジトリ初期化（`git init`）
- [x] `.gitignore` 作成
  - [x] `node_modules/` を追加
  - [x] `.env` を追加
  - [x] `data/` を追加
  - [x] `logs/` を追加
- [x] `.env.example` 作成

### 1.4 依存関係インストール
- [x] `axios` インストール
- [x] `cheerio` インストール
- [x] `date-fns` インストール
- [x] `zod` インストール
- [x] `commander` インストール
- [x] `node-cron` インストール
- [x] `@types/node-cron` インストール
- [x] `winston` インストール
- [x] `uuid` インストール
- [x] `@types/uuid` インストール

---

## Phase 2: 基盤実装

### 2.1 型定義
- [x] `src/types/config.ts` 作成
  - [x] `Config` インターフェース定義
  - [x] `CollectorConfig` インターフェース定義
  - [x] `AnalyzerConfig` インターフェース定義
- [x] `src/types/collector.ts` 作成
  - [x] `CollectorResult` 型定義
  - [x] `CollectorPlugin` インターフェース定義
- [x] `src/types/index.ts` 作成（型の再エクスポート）

### 2.2 設定ファイル
- [x] `src/config/index.ts` 作成
  - [x] デフォルト設定定義
  - [x] 環境変数読み込み
  - [x] 設定のエクスポート
- [x] `src/config/sources.ts` 作成
  - [x] データソース設定定義
- [x] `src/config/categories.ts` 作成
  - [x] カテゴリ定義
  - [x] カテゴリ型のエクスポート

### 2.3 ユーティリティ実装
- [x] `src/utils/logger.ts` 作成
  - [x] Winston ロガーの初期化
  - [x] ログレベル設定
  - [x] ファイル出力設定
- [x] `src/utils/retry.ts` 作成
  - [x] `retryWithBackoff` 関数実装
  - [x] 指数バックオフロジック
- [x] `src/utils/delay.ts` 作成
  - [x] `sleep` 関数実装
- [x] `src/utils/deduplicator.ts` 作成
  - [x] `removeDuplicates` 関数実装
  - [x] キーベースの重複除去
- [x] `src/utils/index.ts` 作成（ユーティリティの再エクスポート）

---

## Phase 3: データモデル実装

### 3.1 基本モデル
- [x] `src/models/Trend.ts` 作成
  - [x] `Trend` インターフェース定義
  - [x] Zod スキーマ定義
  - [x] バリデーション関数
- [x] `src/models/News.ts` 作成
  - [x] `News` インターフェース定義
  - [x] Zod スキーマ定義
- [x] `src/models/Event.ts` 作成
  - [x] `Event` インターフェース定義
  - [x] Zod スキーマ定義
- [x] `src/models/TrendHistory.ts` 作成
  - [x] `TrendHistory` インターフェース定義
  - [x] Zod スキーマ定義

### 3.2 提案モデル
- [x] `src/models/ArticleProposal.ts` 作成
  - [x] `ArticleProposal` インターフェース定義
  - [x] Zod スキーマ定義
- [x] `src/models/BookPromotion.ts` 作成
  - [x] `Book` インターフェース定義
  - [x] `BookPromotion` インターフェース定義
  - [x] Zod スキーマ定義
- [x] `src/models/index.ts` 作成（モデルの再エクスポート）

---

## Phase 4: リポジトリ層実装

### 4.1 基本リポジトリ
- [x] `src/repositories/base/BaseRepository.ts` 作成
  - [x] 抽象基底クラス定義
  - [x] `save` メソッド
  - [x] `load` メソッド
  - [x] `delete` メソッド
  - [x] JSON ファイル操作

### 4.2 各種リポジトリ
- [x] `src/repositories/TrendRepository.ts` 作成
  - [x] `BaseRepository` を継承
  - [x] `saveByDate` メソッド
  - [x] `loadByDate` メソッド
  - [x] `loadLatest` メソッド
- [x] `src/repositories/NewsRepository.ts` 作成
  - [x] `BaseRepository` を継承
  - [x] ニュースデータの保存・読み込み
- [x] `src/repositories/EventRepository.ts` 作成
  - [x] `BaseRepository` を継承
  - [x] イベントデータの保存・読み込み
  - [x] `findByDate` メソッド
- [x] `src/repositories/BookRepository.ts` 作成
  - [x] `BaseRepository` を継承
  - [x] 書籍登録・取得・削除
  - [x] `findByKeyword` メソッド
- [x] `src/repositories/index.ts` 作成（リポジトリの再エクスポート）

---

## Phase 5: コレクター実装

### 5.1 基底クラス
- [x] `src/collectors/base/BaseCollector.ts` 作成
  - [x] 抽象基底クラス定義
  - [x] `collect` 抽象メソッド
  - [x] `collectWithRetry` メソッド
  - [x] `delay` メソッド
  - [x] ログ出力

### 5.2 Twitter/X コレクター
- [x] `src/collectors/TwitterCollector.ts` 作成
  - [x] `BaseCollector` を継承
  - [x] Twitter API 連携またはスクレイピング（モックデータ実装）
  - [x] トレンドハッシュタグ取得
  - [x] `Trend` モデルへの変換
  - [x] エラーハンドリング

### 5.3 ニュースコレクター
- [x] `src/collectors/NewsCollector.ts` 作成
  - [x] `BaseCollector` を継承
  - [x] 複数ニュースソース対応
  - [x] Cheerio を使った HTML 解析
  - [x] `News` モデルへの変換
  - [x] 重複除去
  - [x] エラーハンドリング

### 5.4 カレンダーコレクター
- [x] `src/collectors/CalendarCollector.ts` 作成
  - [x] `BaseCollector` を継承
  - [x] 記念日データ取得
  - [x] `Event` モデルへの変換
  - [x] エラーハンドリング

- [x] `src/collectors/index.ts` 作成（コレクターの再エクスポート）

---

## Phase 6: アナライザー実装

### 6.1 トレンドスコアアナライザー
- [x] `src/analyzers/TrendScoreAnalyzer.ts` 作成
  - [x] `calculateScore` メソッド実装
  - [x] `calculateMentionScore` メソッド
  - [x] `calculateVelocityScore` メソッド
  - [x] `calculateFreshnessScore` メソッド
  - [x] スコア算出式の実装
  - [x] スコアの正規化

### 6.2 時系列アナライザー
- [x] `src/analyzers/TimeSeriesAnalyzer.ts` 作成
  - [x] `analyze` メソッド実装
  - [x] トレンド開始時刻の検出
  - [x] ピーク時刻の検出
  - [x] 継続時間の計算
  - [x] 衰退速度の計算
  - [x] 急上昇判定（`isRising` メソッド）

### 6.3 関連性アナライザー
- [x] `src/analyzers/RelationAnalyzer.ts` 作成
  - [x] `findRelations` メソッド実装
  - [x] 共起キーワード抽出
  - [x] Jaccard 係数計算
  - [x] 関連スコア算出
  - [x] 関連ハッシュタグ抽出

- [x] `src/analyzers/index.ts` 作成（アナライザーの再エクスポート）

---

## Phase 7: プロポーザー実装

### 7.1 記事提案プロポーザー
- [x] `src/proposers/ArticleProposer.ts` 作成
  - [x] `propose` メソッド実装
  - [x] トレンドのフィルタリング
  - [x] カテゴリ別フィルタリング
  - [x] 記事タイトル案生成
  - [x] 切り口生成
  - [x] 想定読者設定
  - [x] 推奨公開タイミング算出
  - [x] 提案理由生成

### 7.2 書籍プロモプロポーザー
- [x] `src/proposers/BookPromoProposer.ts` 作成
  - [x] `propose` メソッド実装
  - [x] 書籍キーワードとトレンドのマッチング
  - [x] プロモーション推奨度判定（高/中/低）
  - [x] 推奨期間算出
  - [x] 推奨理由生成
  - [x] アラート生成機能

- [x] `src/proposers/index.ts` 作成（プロポーザーの再エクスポート）

---

## Phase 8: レポーター実装

### 8.1 日次レポーター
- [x] `src/reporters/DailyReporter.ts` 作成
  - [x] `generate` メソッド実装
  - [x] トップトレンドセクション生成
  - [x] 急上昇ワードセクション生成
  - [x] 記事提案セクション生成
  - [x] 書籍プロモセクション生成
  - [x] Markdown フォーマット出力
  - [x] JSON フォーマット出力
  - [x] ファイル保存

### 8.2 週次レポーター
- [ ] `src/reporters/WeeklyReporter.ts` 作成
  - [ ] `generate` メソッド実装
  - [ ] 週間トップトレンド集計
  - [ ] 継続トレンド検出
  - [ ] 新規トレンド検出
  - [ ] Markdown フォーマット出力
  - [ ] ファイル保存

- [x] `src/reporters/index.ts` 作成（レポーターの再エクスポート）

---

## Phase 9: サービス層実装

### 9.1 統合サービス（TrendService）
- [x] `src/services/TrendService.ts` 作成
  - [x] `collectAllTrends` メソッド実装（複数コレクターの並列実行）
  - [x] `analyzeTrends` メソッド実装
  - [x] `detectRisingTrends` メソッド実装
  - [x] `generateDailyReport` メソッド実装
  - [x] `saveTrends` / `loadTrends` メソッド実装
  - [x] 部分的失敗のハンドリング（Promise.allSettled使用）
  - [x] リポジトリへの保存

- [x] `src/services/index.ts` 作成（サービスの再エクスポート）

**注**: 設計書では複数のサービスクラスに分割する予定でしたが、MVP実装では統合サービス（TrendService）として実装しました。

---

## Phase 10: CLI 実装

### 10.1 CLI フレームワーク
- [x] `src/cli.ts` 作成
  - [x] Commander.js のセットアップ
  - [x] プログラム情報設定（名前、バージョン、説明）

### 10.2 各コマンド実装（MVP版）
- [x] `collect` コマンド実装
  - [x] `--save` オプション
  - [x] TrendService 呼び出し
  - [x] 結果表示（上位5件）
- [x] `analyze` コマンド実装
  - [x] `--date` オプション
  - [x] TrendService 呼び出し
  - [x] 急上昇トレンド検出
  - [x] 結果表示
- [x] `report` コマンド実装
  - [x] `--output` オプション
  - [x] TrendService 呼び出し
  - [x] Markdown レポート生成
  - [x] ファイル保存
- [x] `info` コマンド実装
  - [x] システム情報表示
  - [x] 設定値の表示

### 10.3 エントリーポイント
- [x] `src/index.ts` 作成
  - [x] CLI のインポート
  - [x] Shebang 設定
  - [x] プロセス起動
- [x] `package.json` に bin フィールド追加

**注**: 設計書ではより詳細なコマンド構成（propose articles, propose books, book add など）を予定していましたが、MVP実装ではシンプルな4コマンド（collect, analyze, report, info）として実装しました。

---

## Phase 11: スケジューラー実装

### 11.1 スケジューラー本体
- [ ] `src/scheduler.ts` 作成
  - [ ] node-cron のセットアップ
  - [ ] 1時間ごとのトレンド収集ジョブ
  - [ ] 6時間ごとのニュース収集ジョブ
  - [ ] 毎日9時の日次レポート生成ジョブ
  - [ ] 毎週月曜9時の週次レポート生成ジョブ
  - [ ] エラーハンドリング
  - [ ] ログ出力

### 11.2 start コマンド
- [ ] `src/cli.ts` に `start` コマンド追加
  - [ ] スケジューラー起動
  - [ ] 停止シグナルのハンドリング（SIGINT, SIGTERM）
  - [ ] グレースフルシャットダウン

---

## Phase 12: テスト実装

### 12.1 テスト環境セットアップ
- [ ] `vitest` インストール
- [ ] `vitest.config.ts` 作成
- [ ] `tests/unit/` ディレクトリ作成
- [ ] `tests/integration/` ディレクトリ作成
- [ ] `tests/fixtures/` ディレクトリ作成

### 12.2 ユニットテスト
- [ ] `tests/unit/utils/` テスト作成
  - [ ] `retry.test.ts`
  - [ ] `deduplicator.test.ts`
- [ ] `tests/unit/analyzers/` テスト作成
  - [ ] `TrendScoreAnalyzer.test.ts`
  - [ ] `TimeSeriesAnalyzer.test.ts`
- [ ] `tests/unit/proposers/` テスト作成
  - [ ] `ArticleProposer.test.ts`
- [ ] `tests/unit/repositories/` テスト作成
  - [ ] `TrendRepository.test.ts`

### 12.3 統合テスト
- [ ] `tests/integration/collector.test.ts` 作成
  - [ ] モックデータを使ったコレクター統合テスト
- [ ] `tests/integration/analyzer.test.ts` 作成
  - [ ] 分析フロー統合テスト
- [ ] `tests/integration/reporter.test.ts` 作成
  - [ ] レポート生成統合テスト

### 12.4 テストフィクスチャ
- [ ] `tests/fixtures/trends.json` 作成
- [ ] `tests/fixtures/news.json` 作成
- [ ] `tests/fixtures/events.json` 作成

---

## Phase 13: ドキュメント整備

### 13.1 README
- [ ] `README.md` 作成
  - [ ] プロジェクト概要
  - [ ] 機能一覧
  - [ ] セットアップ手順
  - [ ] 使い方（コマンド例）
  - [ ] 設定ファイルの説明
  - [ ] トラブルシューティング
  - [ ] ライセンス

### 13.2 その他ドキュメント
- [ ] `docs/API.md` 作成（主要クラス・メソッドの説明）
- [ ] `docs/CONTRIBUTING.md` 作成（コントリビューションガイド）
- [ ] `CHANGELOG.md` 作成（変更履歴）

---

## Phase 14: 最終調整・リリース準備

### 14.1 コード品質チェック
- [ ] ESLint でコード静的解析
- [ ] Prettier でコードフォーマット
- [ ] 未使用のインポート削除
- [ ] コメント追加・修正

### 14.2 パフォーマンステスト
- [ ] 収集処理の実行時間測定
- [ ] 分析処理の実行時間測定
- [ ] メモリ使用量チェック
- [ ] ボトルネックの特定と改善

### 14.3 セキュリティチェック
- [ ] 依存パッケージの脆弱性スキャン（`npm audit`）
- [ ] `.env` がGit管理外であることを確認
- [ ] ハードコードされた認証情報がないか確認

### 14.4 リリース
- [ ] バージョン番号設定（`package.json`）
- [ ] Git タグ作成
- [ ] GitHub リポジトリへプッシュ
- [ ] リリースノート作成

---

## MVP（最小機能セット）チェックリスト

以下が完了すれば MVP として動作可能：

- [x] 少なくとも1つのコレクター（Twitter または News）が動作する
  - ✅ MockTrendCollector と TwitterCollector（モックデータ）が実装済み
- [x] トレンドスコア算出が動作する
  - ✅ TrendScoreAnalyzer による重み付けスコア計算が実装済み
- [x] 記事提案が3件以上生成できる
  - ✅ ArticleProposer により5件の提案が生成可能
- [x] 日次レポートを Markdown 形式で出力できる
  - ✅ DailyReporter による Markdown/JSON レポート生成が実装済み
- [x] CLI で `collect`, `analyze`, `report` コマンドが動作する
  - ✅ 4つのコマンド（collect, analyze, report, info）が動作確認済み

**MVP完成日**: 2025-11-24

---

## 優先度別タスク

### 🔴 高優先度（MVP に必須）
- Phase 1: プロジェクトセットアップ
- Phase 2: 基盤実装
- Phase 3: データモデル実装
- Phase 4: リポジトリ層実装
- Phase 5.1, 5.2: コレクター基底クラス + Twitter コレクター
- Phase 6.1: トレンドスコアアナライザー
- Phase 7.1: 記事提案プロポーザー
- Phase 8.1: 日次レポーター
- Phase 9: サービス層実装
- Phase 10: CLI 実装

### 🟡 中優先度（完全版に必要）
- Phase 5.3, 5.4: ニュース・カレンダーコレクター
- Phase 6.2, 6.3: 時系列・関連性アナライザー
- Phase 7.2: 書籍プロモプロポーザー
- Phase 8.2: 週次レポーター
- Phase 11: スケジューラー実装

### 🟢 低優先度（拡張・改善）
- Phase 12: テスト実装
- Phase 13: ドキュメント整備
- Phase 14: 最終調整

---

## 進捗状況

**全体進捗**: MVP完成（Phase 1-10 完了）

**Phase 別進捗**:
- Phase 1: ✅ 完了 (19 / 19)
- Phase 2: ✅ 完了 (11 / 11)
- Phase 3: ✅ 完了 (8 / 8)
- Phase 4: ✅ 完了 (11 / 11)
- Phase 5: ✅ 完了 (10 / 10)
- Phase 6: ✅ 完了 (14 / 14)
- Phase 7: ✅ 完了 (9 / 9)
- Phase 8: ⚠️ 部分完了 (8 / 10) - 週次レポーターは未実装
- Phase 9: ✅ 完了 (統合サービスとして実装)
- Phase 10: ✅ 完了 (MVP版4コマンド実装)
- Phase 11: 未着手 (0 / 3)
- Phase 12: 未着手 (0 / 13)
- Phase 13: 未着手 (0 / 4)
- Phase 14: 未着手 (0 / 7)

**MVP 進捗**: ✅ 完了 (5 / 5)

---

## メモ・注意事項

### 実装時の注意点
- スクレイピング対象サイトの利用規約を必ず確認する
- robots.txt を遵守する
- レート制限を守る（最低1秒間隔）
- API キーは環境変数で管理する
- エラーログを必ず記録する

### 変更が必要になる可能性がある箇所
- Twitter API の仕様変更対応
- ニュースサイトの HTML 構造変更対応
- スコア算出アルゴリズムの調整

### 今後の拡張案
- データベース対応（SQLite, PostgreSQL）
- Web UI 実装
- Slack/Discord 通知機能
- AI（LLM）を使った記事タイトル生成
- 画像解析によるトレンド検出
