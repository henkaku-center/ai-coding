# AI コーディング環境セットアップ

Apple Silicon Mac 専用の開発環境を一括セットアップするスクリプトです。
AI コーディングツール（Claude Code、Copilot、Cursor など）を使った開発に必要なツールを自動でインストールします。

## インストールされるツール

### CLI ツール
- **Xcode Command Line Tools** - Mac での開発に必須の基本ツール
- **Homebrew** - macOS 用パッケージマネージャー
- **Git** - バージョン管理システム
- **Node.js** - JavaScript ランタイム
- **Python** - プログラミング言語
- **gh** - GitHub CLI（コマンドラインから GitHub 操作）
- **jq** - JSON データを扱うコマンドラインツール
- **libpq (psql)** - PostgreSQL クライアント
- **uv** - Python の高速パッケージマネージャー

### GUI アプリケーション
- **Visual Studio Code** - コードエディター
- **Docker Desktop** - コンテナ実行環境
- **Claude Code** - Anthropic の AI コーディングツール（ネイティブアプリ + CLI）
- **Cursor** - AI 統合エディター（任意）
- **Codex CLI** - OpenAI のコマンドラインツール（任意）

### VS Code 拡張機能
- Claude Code 拡張
- GitHub Copilot（任意）
- GitHub Copilot Chat（任意）
- Dev Containers（リモートコンテナ開発用）

### その他の設定
- **global .gitignore** - `.env` や秘密情報の誤コミットを防止
- **~/workspaces** - AI 作業用の安全なディレクトリ
- **~/.claude/CLAUDE.md** - Claude Code の動作ルール（日本語対応、セキュリティ設定など）

## 使い方

### 1. スクリプトをダウンロード

```bash
# このリポジトリをクローンするか、setup.sh をダウンロード
git clone <このリポジトリのURL>
cd ai-coding
```

### 2. 実行権限を付与

```bash
chmod +x setup.sh
```

### 3. スクリプトを実行

```bash
./setup.sh
```

### 4. 画面の指示に従う

- Xcode Command Line Tools のインストールダイアログが表示されたら「インストール」をクリック
- Homebrew や各種ツールのインストールが自動で進みます
- 完了まで 10〜30 分程度かかります（インターネット速度に依存）

## セットアップ後の必須ステップ

セットアップが完了したら、以下の手順で AI コーディングを開始できます：

### 1. Claude CLI にログイン

```bash
claude login
```

ブラウザが開くので Anthropic アカウントでログインしてください。

### 2. Claude Code を起動

アプリケーションフォルダから Claude Code を起動し、Anthropic アカウントでログインします。

### 3. 作業場所を ~/workspaces に設定

AI にコードを書かせるときは必ず `~/workspaces` ディレクトリを使用してください：

```bash
cd ~/workspaces
# ここで AI にコードを書かせる
```

### 4. Claude のルールを確認（任意）

`~/.claude/CLAUDE.md` に Claude Code の動作ルールが記載されています。必要に応じて編集してください。

## 任意で使えるツール

セットアップには含まれていますが、必要に応じて使用してください：

- **GitHub Copilot** - VS Code で GitHub アカウントにログイン
- **Codex CLI** - ターミナルで `codex` コマンド
- **Cursor** - アプリを起動してログイン
- **PostgreSQL** - `psql "postgres://USER:PASSWORD@HOST:5432/dbname"` で接続

## 注意事項

- **Apple Silicon (M1/M2/M3) Mac 専用**です。Intel Mac では動作しません。
- すでにインストール済みのツールはスキップされます（再実行しても安全）。
- `~/.claude/CLAUDE.md` が既に存在する場合は上書きされません。
- Docker Desktop などの GUI アプリは初回起動時に追加の設定が必要な場合があります。

## トラブルシューティング

### Homebrew のパスが通らない

ターミナルを再起動するか、以下を実行してください：

```bash
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### VS Code 拡張がインストールされない

VS Code を一度起動してから、スクリプトを再実行してください。

### Docker が起動しない

Docker Desktop を手動で起動し、初回セットアップを完了させてください。

## ライセンス

このスクリプトは自由に使用・改変できます。

## 作者

非エンジニアでも AI コーディングを安全に始められるように設計されています。
