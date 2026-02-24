# SEO 外部設定ガイド

このドキュメントでは、コードの変更だけでは完結しない **外部サービス側の設定手順** をまとめています。
初心者でも順番に進められるよう、スクリーンショットの代わりに具体的な操作手順を記載しています。

---

## 目次

1. [OG 画像の作成](#1-og-画像の作成)
2. [Google Search Console の登録](#2-google-search-console-の登録)
3. [X（Twitter）Card の検証](#3-xtwitter-card-の検証)
4. [Facebook OGP デバッグ](#4-facebook-ogp-デバッグ)
5. [LINE / Slack / Discord での確認](#5-line--slack--discord-での確認)
6. [構造化データの検証](#6-構造化データの検証)
7. [Google Analytics（GA4）の設定（任意）](#7-google-analyticsga4-の設定任意)

---

## 1. OG 画像の作成

SNS でシェアされたときに表示される画像（OGP 画像）を作成して `static/` フォルダに配置します。

### 必要なファイル（4 枚）

| ファイル名 | 内容 | 言語 |
|---|---|---|
| `static/og-home-ja.png` | ホームページ用 | 日本語 |
| `static/og-home-en.png` | ホームページ用 | 英語 |
| `static/og-about-ja.png` | FFmpegとは？ページ用 | 日本語 |
| `static/og-about-en.png` | FFmpegとは？ページ用 | 英語 |

### デザイン仕様

- **サイズ**: 1200 x 630 px（必須。SNS が推奨するサイズ）
- **フォーマット**: PNG（JPEG でも可だがPNG推奨）
- **ファイルサイズ**: 1MB 以下を推奨
- **背景**: ブランドカラー（紫 / ラベンダー系）のグラデーション
- **テキスト**:
  - メインタイトル: 48〜64px の白色太字
  - サブタイトル: 24〜32px の白色（やや透明）
- **ロゴ**: favicon の "F" マークを大きく配置
- **注意**: 200 x 105px のサムネイルでも文字が読めるか確認する

### Canva で作成する手順（無料）

1. [Canva](https://www.canva.com/) にアクセスしてアカウント作成（無料プランでOK）
2. 「カスタムサイズ」で **1200 x 630 px** を指定
3. 背景にグラデーションを設定（紫系: `#7B5EA7` → `#A78BFA` など）
4. テキストを追加:
   - `og-home-ja.png` の場合:
     - メイン: 「FFmpegコマンドジェネレーター」
     - サブ: 「動画・音声・画像変換コマンドを簡単生成」
   - `og-home-en.png` の場合:
     - メイン: "FFmpeg Command Generator"
     - サブ: "Easily Generate Video, Audio & Image Commands"
   - `og-about-ja.png` の場合:
     - メイン: 「FFmpegとは？」
     - サブ: 「歴史・設計思想・使い方を徹底解説」
   - `og-about-en.png` の場合:
     - メイン: "What is FFmpeg?"
     - サブ: "History, Design Philosophy & Use Cases"
5. PNG でダウンロード
6. ダウンロードしたファイルをプロジェクトの `static/` フォルダに配置

### 確認ポイント

- [ ] 4 枚すべて 1200 x 630 px になっているか
- [ ] ファイル名が正確か（`og-home-ja.png` など）
- [ ] `static/` フォルダ直下に配置されているか
- [ ] ファイルサイズが 1MB 以下か

---

## 2. Google Search Console の登録

Google 検索にサイトを認識させ、検索パフォーマンスを監視するために必要です。

### 手順

#### 2-1. アカウント作成・プロパティ追加

1. [Google Search Console](https://search.google.com/search-console/) にアクセス
2. Google アカウントでログイン
3. 左上の「プロパティを追加」をクリック
4. **「URL プレフィックス」** を選択（「ドメイン」ではない方）
5. `https://www.cmd-gen.com` と入力して「続行」

#### 2-2. 所有権の確認（3 つの方法のいずれか）

**方法 A: HTML ファイルアップロード（推奨・最も簡単）**

1. Google が提示する HTML ファイル（例: `googleXXXXXXXXXXXX.html`）をダウンロード
2. ダウンロードしたファイルを `static/` フォルダに配置
3. `git add static/googleXXXXXXXXXXXX.html && git commit -m "Add Google Search Console verification" && git push origin main`
4. デプロイ完了を待つ
5. Search Console に戻って「確認」をクリック

**方法 B: HTML メタタグ**

1. Google が提示するメタタグ（例: `<meta name="google-site-verification" content="XXXXX" />`）をコピー
2. `src/app.html` の `<head>` 内（`%sveltekit.head%` の直前がおすすめ）に貼り付け
3. コミット → プッシュ → デプロイ
4. Search Console に戻って「確認」をクリック

**方法 C: DNS TXT レコード（ドメイン管理画面が必要）**

1. Google が提示する TXT レコードの値をコピー
2. ドメインの DNS 管理画面（お名前.com、Cloudflare、Vercel DNS など）を開く
3. TXT レコードを追加:
   - ホスト名: `@` または空欄
   - 値: Google が提示した文字列
4. DNS 反映を待つ（数分〜24 時間）
5. Search Console に戻って「確認」をクリック

#### 2-3. サイトマップの送信

1. Search Console の左メニューから「サイトマップ」を選択
2. 「新しいサイトマップの追加」に `https://www.cmd-gen.com/sitemap.xml` を入力
3. 「送信」をクリック
4. ステータスが「成功」になるのを確認（数分かかる場合あり）

#### 2-4. インデックス登録をリクエスト

1. Search Console の上部検索バーに `https://www.cmd-gen.com/` を入力して Enter
2. 「インデックス登録をリクエスト」をクリック
3. 同様に `https://www.cmd-gen.com/about-ffmpeg` もリクエスト
4. ※ 実際にインデックスされるまで数日〜数週間かかります

#### 2-5. 定期的にチェックすべき項目

| セクション | 確認内容 | 頻度 |
|---|---|---|
| 検索パフォーマンス | 検索クエリ・クリック数・表示回数 | 週1回 |
| カバレッジ / ページ | クロールエラーがないか | 月1回 |
| ページエクスペリエンス | Core Web Vitals の状態 | 月1回 |
| 拡張 | 構造化データのエラー | デプロイ後 |

---

## 3. X（Twitter）Card の検証

X（旧 Twitter）でリンクをシェアしたときに、大きな画像付きカードが表示されるようにします。

### 確認手順

1. ブラウザで X（Twitter）にログイン
2. 投稿作成画面を開く
3. `https://www.cmd-gen.com/` を貼り付けてプレビューを確認
4. 大きな画像（`og-home-ja.png`）とタイトル・説明文が表示されればOK

### トラブルシューティング

- **カードが表示されない場合**:
  - X はメタデータを強力にキャッシュします
  - URL の末尾に `?v=1` を付けると新しい URL として再取得されます
  - 24〜48 時間後に再度確認してください
- **画像が表示されない場合**:
  - OG 画像ファイルが `static/` に配置されているか確認
  - デプロイが完了しているか確認
  - `curl -I https://www.cmd-gen.com/og-home-ja.png` でファイルが取得できるか確認

### 補足: X 開発者ツール

以前は Card Validator（https://cards-dev.twitter.com/validator）が利用できましたが、
2023年以降はアクセスが制限される場合があります。上記の方法（実際に投稿画面で確認）が確実です。

---

## 4. Facebook OGP デバッグ

Facebook / Instagram でシェアしたときの表示を確認・修正します。

> **設定済み**: `fb:app_id` = `2306408559869119` が全ページに埋め込み済みです。

### 確認手順

1. [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) にアクセス
2. Facebook アカウントでログイン（必要な場合）
3. `https://www.cmd-gen.com/` を入力して「デバッグ」をクリック
4. 表示結果を確認:
   - **og:title**: 「FFmpegコマンドジェネレーター」が表示されるか
   - **og:description**: 説明文が表示されるか
   - **og:image**: OG 画像が表示されるか
5. 同様に `https://www.cmd-gen.com/about-ffmpeg` も確認

### キャッシュをクリアする方法

- Facebook は OGP 情報をキャッシュします
- デプロイ後に表示が更新されない場合は、Sharing Debugger で **「もう一度スクレイピング」** をクリック
- これで最新の情報に更新されます

### 確認ポイント

- [ ] og:title が正しく表示されるか
- [ ] og:description が正しく表示されるか
- [ ] og:image が表示されるか（画像のプレビューが見えるか）
- [ ] 警告（Warnings）が表示されていないか

---

## 5. LINE / Slack / Discord での確認

これらのサービスは OGP タグを自動で読み取るため、**特別な設定は不要** です。

### 確認方法

| サービス | 方法 |
|---|---|
| **LINE** | 自分宛てのトークに `https://www.cmd-gen.com/` を送信 → プレビューカードを確認 |
| **Slack** | 任意のチャンネルに URL を投稿 → 展開されるプレビューを確認 |
| **Discord** | 任意のチャンネルに URL を投稿 → 埋め込みプレビューを確認 |

### キャッシュについて

- **LINE**: キャッシュが強力で、更新に時間がかかる場合があります。URL の末尾に `?v=1` を付けると新しいキャッシュとして取得されます
- **Slack**: URL を再投稿すると自動的に再取得されます
- **Discord**: URL を貼り直すと再取得されます。古い投稿は編集しても更新されません

---

## 6. 構造化データの検証

JSON-LD 構造化データが正しく実装されているかを確認します。
Google が構造化データを認識すると、検索結果に リッチリザルト（星評価、FAQ展開など）が表示される可能性があります。

### 確認手順

#### 6-1. Google Rich Results Test

1. [Rich Results Test](https://search.google.com/test/rich-results) にアクセス
2. `https://www.cmd-gen.com/` を入力して「URL をテスト」
3. 結果を確認:
   - 「WebApplication」が検出されるか
   - 「WebSite」が検出されるか
   - エラーや警告がないか
4. 同様に `https://www.cmd-gen.com/about-ffmpeg` をテスト
   - 「Article」が検出されるか
   - 「HowTo」が検出されるか

#### 6-2. Schema.org Validator

1. [Schema.org Validator](https://validator.schema.org/) にアクセス
2. 「Fetch URL」タブで URL を入力
3. JSON-LD の文法エラーがないか確認

### よくある問題と対処法

| 問題 | 原因 | 対処法 |
|---|---|---|
| 構造化データが検出されない | SSR が無効 / プリレンダリングされていない | `+layout.ts` で `ssr = true` を確認 |
| `datePublished` の警告 | Article に日付がない | 将来的に追加予定（現時点では許容） |
| `image` の警告 | Article に画像がない | OG 画像を設定すれば解消 |

---

## 7. Google Analytics（GA4）の設定

サイトのアクセス数やユーザー行動を計測するために設定します。SEO の効果測定に役立ちます。

> **設定済み**: 測定 ID `G-TX9J3RENDP` が `src/app.html` に埋め込み済みです。

### 手順

#### 7-1. GA4 プロパティの作成

1. [Google Analytics](https://analytics.google.com/) にアクセス
2. 「管理」→「プロパティを作成」
3. プロパティ名: `FFmpeg Command Generator`
4. タイムゾーン: `日本`、通貨: `日本円`
5. 「次へ」→ ビジネスの説明を選択 → 「作成」

#### 7-2. データストリームの設定

1. 「ウェブ」を選択
2. URL: `https://www.cmd-gen.com`
3. ストリーム名: `cmd-gen.com`
4. 「ストリームを作成」

#### 7-3. 測定 ID の取得

1. データストリームの詳細画面で **測定 ID**（`G-XXXXXXXXXX` 形式）をコピー

#### 7-4. コードへの埋め込み（設定済み）

`src/app.html` に以下が埋め込み済みです:

```html
<!-- Google Analytics (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-TX9J3RENDP"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TX9J3RENDP');
</script>
```

#### 7-5. 確認

1. デプロイ後、Google Analytics の「リアルタイム」レポートにアクセス
2. 自分でサイトを開いて、アクセスが記録されるか確認

---

## チェックリスト（デプロイ後に実施）

デプロイ後、以下をすべて確認してください:

### OG 画像

- [ ] `https://www.cmd-gen.com/og-home-ja.png` がブラウザで表示される
- [ ] `https://www.cmd-gen.com/og-home-en.png` がブラウザで表示される
- [ ] `https://www.cmd-gen.com/og-about-ja.png` がブラウザで表示される
- [ ] `https://www.cmd-gen.com/og-about-en.png` がブラウザで表示される

### メタタグ（curl で確認）

```bash
# ホームページ
curl -s https://www.cmd-gen.com/ | grep '<title>'
curl -s https://www.cmd-gen.com/ | grep 'og:image'
curl -s https://www.cmd-gen.com/ | grep 'twitter:card'

# About ページ
curl -s https://www.cmd-gen.com/about-ffmpeg | grep '<title>'
curl -s https://www.cmd-gen.com/about-ffmpeg | grep 'og:image'
curl -s https://www.cmd-gen.com/about-ffmpeg | grep 'twitter:card'
```

### sitemap / robots

```bash
curl -s https://www.cmd-gen.com/sitemap.xml
curl -s https://www.cmd-gen.com/robots.txt
```

### SNS プレビュー

- [ ] X（Twitter）でカードプレビューが表示される
- [ ] Facebook Sharing Debugger で正しく表示される
- [ ] LINE でプレビューカードが表示される

### 構造化データ

- [ ] Rich Results Test で WebApplication が検出される
- [ ] Rich Results Test で Article / HowTo が検出される（about-ffmpeg）
- [ ] エラーが 0 件である

### Google Search Console

- [ ] プロパティが追加・確認済み
- [ ] サイトマップが送信済み
- [ ] インデックス登録をリクエスト済み
