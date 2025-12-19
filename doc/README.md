# ホームページを作って公開する（超やさしい手順）

この `doc/` は、「プログラミング未経験でも迷わない」ことを最優先にした手順書です。

やることは大きく4つだけです。

1. AIに文章や見た目の案を出してもらう（vibe-coding）
2. GitHub に保存する（= 変更履歴も残る）
3. Cloudflare に GitHub をつなぐ（自動で公開される）
4. 自分のドメイン（例: `example.com`）で公開する

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

## 目次（上から順にやればOK）

- `doc/01-vibe-coding-homepage.md`：まずは「中身を追加」して完成体を作る
- `doc/02-github-management.md`：GitHubに保存して、戻せる状態にする
- `doc/03-cloudflare-deploy.md`：Cloudflare管理画面で自動公開する
- `doc/04-custom-domain.md`：自分のドメインで公開する

## 最初に読む場所

`doc/01-vibe-coding-homepage.md` から始めてください。
