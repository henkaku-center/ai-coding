# ホームページを作って公開する（超やさしい手順）

この `doc/` は、「プログラミング未経験でも迷わない」ことを最優先にした手順書です。やることは4つだけ。

1. AIに文章や見た目の案を出してもらう（vibe-coding）
2. GitHub に保存する（= 変更履歴も残る）
3. Cloudflare に GitHub をつなぐ（自動で公開される）
4. 自分のドメイン（例: `example.com`）で公開する

## まず全体像（順番にやればOK）

- `doc/01-vibe-coding-homepage.md`  
  - コピペ用の依頼文で AI に作業をお願いする  
  - 文章は `content/about.md` と `posts/*.md` に置き、Next.js のソースは `web/` に配置するよう指示  
  - AIが出す経歴などは必ず自分の目で確認（根拠URL付き・丸写しを避ける）
- `doc/02-github-management.md`  
  - GitHub は「保存＆巻き戻し」の場所。意味は3つだけ：リポジトリ=フォルダ、コミット=セーブ、プッシュ=アップロード  
  - おすすめは GitHub Desktop（Add existing repo → `deshi` → Publish → Commit → Push）。ブラウザで記事を増やすだけでもOK
- `doc/03-cloudflare-deploy.md`  
  - Cloudflare Pages の管理画面から GitHub を接続するだけで自動公開  
  - 設定は Root=`web` / Build=`npm run build` / Output=`out` を必ず入力  
  - 投稿フォルダが空だと失敗するので `posts/welcome.md` は残す
- `doc/04-custom-domain.md`  
  - 取得したドメインを Cloudflare に追加し、DNS を Cloudflare 管理にする  
  - Pages の Custom domains で `example.com`（必要なら `www.example.com` も）を追加してDNS案内に従う

## このリポジトリの「超ざっくり」

- `content/about.md`：トップページ（About / プロフィール）の文章
- `posts/`：投稿（記事）の文章
- `web/`：サイト本体（見た目＋公開用の設定）
- 公開は Cloudflare Pages（管理画面で GitHub と連携）を使う

最初に作るページ:

- `content/about.md`（URLは `/`）
- `posts/welcome.md`（URLは `/posts/welcome`。投稿が空だとビルドできないので、まずはこれを編集するのがおすすめ）

## 最終的にこうなる（完成形の構成）

```text
<プロジェクト>/
  content/
    about.md            # トップ（About）
  posts/
    welcome.md          # 最初の投稿（サンプル）
    my-first.md         # 2つめ以降の投稿（任意）
  web/
    src/app/
      page.tsx          # / (about)
      posts/page.tsx    # /posts (一覧)
      posts/[slug]/...  # /posts/<slug> (詳細)
```

## 最初に読む場所

迷ったら `doc/01-vibe-coding-homepage.md` から始めてください。
