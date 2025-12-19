# 02: GitHubに保存する（＝バックアップ＋履歴）

GitHub は「このフォルダをネットに保存して、いつでも戻せるようにする場所」です。
難しいことはしません。**“変更したらGitHubに保存する”** だけでOKです。

## まず覚える言葉（これだけ）

- リポジトリ（repository）: フォルダのこと
- コミット（commit）: セーブ（保存ポイントを作る）
- プッシュ（push）: GitHubにアップロード

## おすすめのやり方（コマンド無し）

コマンド（黒い画面）が怖い人は、**GitHub Desktop** を使うのが一番楽です。

### 方法A: GitHub Desktopでアップロードする

1. GitHub にログイン（アカウントがなければ作る）
2. GitHub Desktop をインストールしてログインする
3. GitHub Desktop で「Add existing repository」を選ぶ
4. このプロジェクトのフォルダ（`deshi`）を選ぶ
5. 画面の「Publish repository」みたいなボタンを押して公開（PrivateでもOK）

変更したら:

1. GitHub Desktop を開く
2. 左側に「変更されたファイル」が出る
3. 下に短いメモを書く（例: `記事を1つ追加`）
4. 「Commit」→「Push」

これで「いつでも戻せる」状態になります。

### 方法B: ブラウザだけで編集する（超かんたん）

コードを触らず、記事だけ増やしたいならブラウザでもできます。

1. GitHubのリポジトリを開く
2. `content/`（トップ）または `posts/`（投稿）を開く
3. `Add file` → `Create new file`
4. `content/about.md` や `posts/my-first.md` のようにして本文を貼る
5. `Commit changes` を押す

この方法でも Cloudflare Pages は自動で更新できます（次章）。

## こわいときの保険（任意）

慣れてきたら「本番を壊さない」ために、作業用のブランチを作る方法があります。
ただし、最初は難しいので **飛ばしてOK** です。

```mermaid
flowchart LR
  A[main: 本番] --> B[作業用ブランチ]
  B --> C[確認できたら main に戻す]
```

## 次に進む

GitHubに保存できたら、次は Cloudflare の管理画面で「GitHubとつなげて公開」します。

- 次: `doc/03-cloudflare-deploy.md`
