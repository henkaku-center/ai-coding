# 02: GitHubに保存する（＝バックアップ＋履歴）

GitHub は「このフォルダをネットに保存して、いつでも戻せるようにする場所」です。
難しいことはしません。**“変更したらGitHubに保存する”** だけでOKです。

## まず覚える言葉（これだけ）

- リポジトリ（repository）: フォルダのこと
- コミット（commit）: セーブ（保存ポイントを作る）
- プッシュ（push）: GitHubにアップロード

## おすすめのやり方（VS CodeのUIだけ、ノーコマンド）

黒い画面は不要。VS Code の左側にある「ソース管理」ビューだけを使います。

### 方法A: VS Code でアップロードする

初回（公開先を作る）

1. VS Code を開き、右上の顔アイコン（Accounts）から GitHub にサインイン
2. `deshi` フォルダを VS Code で開く
3. 左の「ソース管理」アイコン（枝分かれマーク）を押す
4. `Publish to GitHub`（または `Publish Branch`）ボタンを押す
5. GitHub 上のリポジトリ名はそのままでOK、公開範囲は **Private** 推奨

変更したら毎回これだけ

1. 左の「ソース管理」を開くと変更ファイルが一覧に出る
2. まとめてステージする: `...` メニュー → `Stage All Changes`（または各ファイルの `+`）
3. メッセージを書く（例: `記事を1つ追加`）
4. 上のチェックマーク（Commit）を押す → 聞かれたら「Stage all」を選ぶ
5. `Sync Changes`（矢印の↕）か `Push` が出ていれば押す

これで「セーブしてGitHubにアップロード」完了です。

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
