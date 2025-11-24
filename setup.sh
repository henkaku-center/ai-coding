#!/bin/bash
set -e

###############################################################
# Apple Silicon 専用 Mac 開発環境セットアップ
# - Xcode Command Line Tools
# - Homebrew（/opt/homebrew）
# - Git / Node.js / Python / gh / jq / libpq（psql）
# - uv（将来 Amplifier を使いたくなった場合に備える）
# - Codex CLI（任意利用）
# - Docker Desktop
# - Visual Studio Code（Dev Containers 拡張入り）
# - Claude Code（Native + CLI）
# - Cursor（任意）
# - VS Code 拡張（Copilot系は任意）
# - global .gitignore（.env事故防止）
# - ~/workspaces （AI作業用ディレクトリ）
# - ~/.claude/CLAUDE.md（Claude Code ユーザーメモリ）
###############################################################

log() {
  echo ""
  echo "----------------------------------------"
  echo "$1"
  echo "----------------------------------------"
  echo ""
}

###############################################
# Xcode Command Line Tools
###############################################
install_xcode_cli() {
  if ! xcode-select -p &>/dev/null; then
    log "Xcode Command Line Tools をインストールします。"

    echo "ダイアログが出たら「インストール」をクリックしてください。"
    xcode-select --install || true

    echo "インストールが終わるまで待ちます..."
    until xcode-select -p &>/dev/null; do
      sleep 5
    done

    log "Xcode Command Line Tools のインストール完了。"
  else
    log "Xcode Command Line Tools はすでにインストール済みです。"
  fi
}

###############################################
# Homebrew
###############################################
install_homebrew() {
  if ! command -v brew &>/dev/null; then
    log "Homebrew をインストールします（Apple Silicon 用）。"

    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    eval "$(/opt/homebrew/bin/brew shellenv)"

    if [[ ! -f "${HOME}/.zprofile" ]]; then
      touch "${HOME}/.zprofile"
    fi

    if ! grep -q 'eval "$(/opt/homebrew/bin/brew shellenv)"' "${HOME}/.zprofile"; then
      echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> "${HOME}/.zprofile"
    fi

    log "Homebrew のインストール完了。"
  else
    eval "$(/opt/homebrew/bin/brew shellenv)"
    log "Homebrew はすでにインストール済みです。"
  fi
}

###############################################
# brew install wrapper
###############################################
brew_install() {
  local pkg="$1"
  if brew list "$pkg" &>/dev/null; then
    echo "✅ $pkg はインストール済み"
  else
    echo "👉 $pkg をインストールします..."
    brew install "$pkg"
  fi
}

brew_install_cask() {
  local pkg="$1"
  if brew list --cask "$pkg" &>/dev/null; then
    echo "✅ (アプリ) $pkg はインストール済み"
  else
    echo "👉 (アプリ) $pkg をインストールします..."
    brew install --cask "$pkg"
  fi
}

###############################################
# 開発ツール：CLI & GUI
###############################################
install_dev_tools() {
  log "開発ツールをインストールします。"

  brew update

  # CLI
  brew_install git
  brew_install node
  brew_install python
  brew_install gh
  brew_install jq
  brew_install uv

  # PostgreSQL Client (psql)
  brew_install libpq
  brew link --force libpq || true

  # Codex CLI（任意利用）
  brew_install_cask codex

  # GUI apps
  brew_install_cask visual-studio-code
  brew_install_cask docker
  brew_install_cask claude-code
  brew_install_cask cursor

  log "開発ツールのインストール完了。"
}

###############################################
# global gitignore（非エンジニア保護）
###############################################
setup_global_gitignore() {
  log "Git global .gitignore を設定します（非エンジニア保護版）。"

  GLOBAL_IGNORE_FILE="${HOME}/.gitignore_global"

  cat <<EOF > "$GLOBAL_IGNORE_FILE"
# --- Environment files ---
.env
.env.*
*.env
*.env.*
.envrc

# --- Secrets ---
*.pem
*.key
*.crt
*.p12
*.secret
*.token
*.credentials

# --- Logs ---
*.log

# --- Node build output ---
node_modules/
.next/
.out/
dist/
build/
.turbo/

# --- Python ---
__pycache__/
*.pyc
*.pyo
*.pyd
*.egg-info/
.venv/
venv/

# --- OS junk ---
.DS_Store
Thumbs.db

# --- Docker ---
docker-compose.override.yml

# --- Editor ---
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
!.vscode/launch.json

# --- Misc ---
*.tmp
*.swp
*.swo
EOF

  git config --global core.excludesfile "$GLOBAL_IGNORE_FILE"

  log "global gitignore を設定しました。"
}

###############################################
# Workspaces ディレクトリ
###############################################
setup_workspaces() {
  log "~/workspaces を作成します（AI 用の安全な作業エリア）。"
  mkdir -p "${HOME}/workspaces"
}

###############################################
# Claude ユーザーメモリ
###############################################
setup_claude_user_memory() {
  log "Claude Code のユーザーメモリ (~/.claude/CLAUDE.md) を設定します。"

  CLAUDE_DIR="${HOME}/.claude"
  CLAUDE_FILE="${CLAUDE_DIR}/CLAUDE.md"

  mkdir -p "$CLAUDE_DIR"

  if [[ -f "$CLAUDE_FILE" ]]; then
    echo "✅ ~/.claude/CLAUDE.md は既に存在しているためスキップします。"
    return
  fi

  cat <<EOF > "$CLAUDE_FILE"
# ユーザーメモリ（~/.claude/CLAUDE.md）

## 基本方針
- 日本語で回答してください。
- まず概要 → そのあと具体的な手順・コードを提示してください。
- 推測は推測と明記してください。

## コーディングスタイル
- 読みやすい変数名・関数名を優先してください。
- 型安全な実装（TypeScript など）を推奨します。

## セキュリティ
- APIキーや秘密情報を絶対に生成しないでください。
- .env の中身を要求しないでください。

## Git
- 危険なコマンド（git reset --hard、git push -f など）は提案しないでください。

## 非エンジニア配慮
- 専門用語を使うときは一言で意味を添えてください。

## 禁止操作
- rm -rf / など危険な操作は提案しないでください。
- /usr, /etc, /System などシステム領域は触れないでください。

## 作業範囲（Workspaces）
- **~/workspaces** の中だけでファイル作成・編集を行ってください。
- それ以外のディレクトリで操作しないでください。
EOF

  log "~/.claude/CLAUDE.md を作成しました。"
}

###############################################
# VS Code Extensions
###############################################
install_vscode_extensions() {
  log "VS Code 拡張をインストールします。"

  VSCODE_BIN="/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"

  if [[ ! -x "$VSCODE_BIN" ]]; then
    echo "⚠ VS Code CLI (code) が見つかりません。VS Code を一度起動してください。"
    return
  fi

  "$VSCODE_BIN" --install-extension anthropic.claude-code || true
  "$VSCODE_BIN" --install-extension GitHub.copilot || true
  "$VSCODE_BIN" --install-extension GitHub.copilot-chat || true
  "$VSCODE_BIN" --install-extension ms-vscode-remote.remote-containers || true

  log "VS Code 拡張のインストール完了。"
}

###############################################
# 完了メッセージ
###############################################
finish_message() {
  log "セットアップ完了！ 🎉"

  cat <<EOF
必要な開発ツールがすべて揃いました：

- Node.js / Python / jq
- PostgreSQL Client (psql)
- Git / GitHub CLI（任意）
- Docker Desktop
- Claude Code（Native / CLI）
- Visual Studio Code（Claude拡張入り）
- Cursor（任意）
- Codex CLI（任意）
- uv（Amplifier や Python の高速 CLI のための土台）
- ~/workspaces（AI作業エリア）
- ~/.claude/CLAUDE.md（Claude 用の行動ルール）
- global .gitignore（非エンジニアの事故防止）

━━━━━━━━━━━━━━━━━━━━━━━━━
【必須ステップ（これだけで AI コーディング開始）】
━━━━━━━━━━━━━━━━━━━━━━━━━

1. Claude CLI にログイン  
     claude login

2. Claude Code を起動  
   → Anthropic アカウントでログインしてください。

3. 作業場所は ~/workspaces  
   → AI にコードを書かせるときは必ずここを使ってください。

4. ルールを確認  
   → ~/.claude/CLAUDE.md に Claude のふるまい方が書いてあります。

━━━━━━━━━━━━━━━━━━━━━━━━━
【任意で使えるツール】
━━━━━━━━━━━━━━━━━━━━━━━━━

- GitHub Copilot（VS Code で GitHub ログイン）
- Codex CLI（ターミナルで \`codex\`）
- Cursor（必要なら起動してログイン）
- pg 接続（psql）  
  例）psql "postgres://USER:PASSWORD@HOST:5432/dbname"

━━━━━━━━━━━━━━━━━━━━━━━━━

セットアップは以上です！  
~/workspaces を中心に Claude にどんどん手を動かしてもらってください。
EOF
}

###############################################
# 実行フロー
###############################################
log "Apple Silicon 専用 Mac 開発環境セットアップを開始します。"

install_xcode_cli
install_homebrew
install_dev_tools
setup_global_gitignore
setup_workspaces
setup_claude_user_memory
install_vscode_extensions
finish_message