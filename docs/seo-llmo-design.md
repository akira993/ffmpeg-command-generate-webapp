# SEO / LLMO 対策 詳細設計書

> **対象サイト**: https://www.cmd-gen.com
> **作成日**: 2025-02-20
> **ステータス**: 設計書（未実装）

---

## 目次

1. [現状分析](#1-現状分析)
2. [Phase 1: 技術 SEO 基盤（即時対応）](#2-phase-1-技術-seo-基盤即時対応)
3. [Phase 2: LLMO 最適化（1-2 週間）](#3-phase-2-llmo-最適化12-週間)
4. [Phase 3: コンテンツ戦略（1-3 ヶ月）](#4-phase-3-コンテンツ戦略13-ヶ月)
5. [キーワード戦略](#5-キーワード戦略)
6. [成果測定（KPI）](#6-成果測定kpi)
7. [検証方法](#7-検証方法)

---

## 1. 現状分析

### 1.1 サイト構成

| ページ | URL | 説明 |
|--------|-----|------|
| ホームページ | `/` | FFmpeg コマンドジェネレーター本体（8 プリセット） |
| FFmpeg 解説記事 | `/about-ffmpeg` | FFmpeg の歴史・設計・ユースケース・ベンチマーク（8000 文字以上） |

### 1.2 技術スタック

- SvelteKit 2 + Svelte 5 (Runes) + TypeScript + Tailwind CSS v4
- `@sveltejs/adapter-vercel`（Node.js 20.x）
- sveltekit-i18n（日本語デフォルト + 英語）
- 言語切替: `localStorage` ベース（URL パスは共通）

### 1.3 SEO 要素の現状

| 要素 | ホームページ (`/`) | `/about-ffmpeg` |
|------|-------------------|-----------------|
| `<title>` | **欠落** | あり（JA/EN） |
| `<meta description>` | **欠落** | あり（JA/EN） |
| `og:title` | **欠落** | あり |
| `og:description` | **欠落** | あり |
| `og:image` | **欠落** | **欠落** |
| `og:url` | **欠落** | **欠落** |
| `og:site_name` | **欠落** | **欠落** |
| Twitter Cards | **欠落** | **欠落** |
| `canonical` | **欠落** | **欠落** |
| `hreflang` | **欠落** | **欠落** |
| 構造化データ (JSON-LD) | **欠落** | **欠落** |
| `sitemap.xml` | **存在しない** | — |
| `robots.txt` | Sitemap 未記載 | — |
| SSR | **無効** (`ssr = false`) | 同上 |

### 1.4 致命的な問題: SSR 無効

**現在の設定** (`src/routes/+layout.ts`):

```typescript
export const ssr = false;
```

**影響**:
- クローラーが受け取る HTML は空の `<div style="display: contents"></div>` のみ
- `<title>`, `<meta>`, JSON-LD がサーバー側レスポンスに含まれない
- `/about-ffmpeg` の 8000 文字以上のコンテンツがインデックスされない可能性が高い
- OGP プレビュー（Slack, X, Discord 等）が空になる

---

## 2. Phase 1: 技術 SEO 基盤（即時対応）

### 2.1 SSR / プリレンダリング有効化

**対象ファイル**: `src/routes/+layout.ts`

**変更前**:
```typescript
export const ssr = false;
```

**変更後**:
```typescript
export const ssr = true;
export const prerender = true;
```

**i18n 初期化の SSR 対応方針**:

現在の `+layout.ts` で `browser` ガードが既に存在する:

```typescript
if (browser) {
  const saved = localStorage.getItem('locale');
  // ...
}
```

SSR 時は `defaultLocale`（`'ja'`）で翻訳がロードされ、クライアントハイドレーション後に `localStorage` / `navigator.language` で上書きされる。既存ロジックの変更は最小限で済む。

**検証**:
```bash
npm run build
# 生成 HTML を確認
cat .vercel/output/static/index.html | grep '<title>'
cat .vercel/output/static/about-ffmpeg/index.html | grep '<title>'
```

### 2.2 メタタグ設計

#### 2.2.1 ホームページ (`src/routes/+page.svelte`)

**`<svelte:head>` に追加するメタタグ（日本語）**:

```html
<title>FFmpeg コマンドジェネレーター | 動画・音声・画像変換コマンドを簡単生成</title>
<meta name="description" content="FFmpegコマンドをGUIで簡単生成。AV1動画圧縮、AVIF/WebP画像変換、音声抽出、GIF生成など8種のプリセット搭載。ドラッグ＆ドロップでバッチ処理スクリプトも自動生成。" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.cmd-gen.com/" />
<meta property="og:title" content="FFmpeg コマンドジェネレーター" />
<meta property="og:description" content="GUIで簡単にFFmpegコマンドを生成。AV1/AVIF対応、バッチ処理対応。" />
<meta property="og:image" content="https://www.cmd-gen.com/og-home-ja.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="FFmpeg コマンドジェネレーター" />
<meta property="og:locale" content="ja_JP" />
<meta property="og:locale:alternate" content="en_US" />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="FFmpeg コマンドジェネレーター" />
<meta name="twitter:description" content="GUIで簡単にFFmpegコマンドを生成。AV1/AVIF対応。" />
<meta name="twitter:image" content="https://www.cmd-gen.com/og-home-ja.png" />

<!-- Canonical & hreflang -->
<link rel="canonical" href="https://www.cmd-gen.com/" />
<link rel="alternate" hreflang="ja" href="https://www.cmd-gen.com/" />
<link rel="alternate" hreflang="en" href="https://www.cmd-gen.com/" />
<link rel="alternate" hreflang="x-default" href="https://www.cmd-gen.com/" />
```

**英語版**:

```html
<title>FFmpeg Command Generator | Easily Generate Video, Audio & Image Commands</title>
<meta name="description" content="Generate FFmpeg commands with an intuitive GUI. 8 presets: AV1 video compression, AVIF/WebP image conversion, audio extraction, GIF generation. Drag & drop batch processing supported." />

<meta property="og:title" content="FFmpeg Command Generator" />
<meta property="og:description" content="Easily generate FFmpeg commands with GUI. AV1/AVIF support, batch processing." />
<meta property="og:image" content="https://www.cmd-gen.com/og-home-en.png" />
<meta property="og:locale" content="en_US" />
<meta property="og:locale:alternate" content="ja_JP" />

<meta name="twitter:title" content="FFmpeg Command Generator" />
<meta name="twitter:description" content="Easily generate FFmpeg commands with GUI." />
<meta name="twitter:image" content="https://www.cmd-gen.com/og-home-en.png" />
```

**実装パターン**: 既存の `/about-ffmpeg` と同じく `{#if $locale === 'ja'}...{:else}...{/if}` で分岐。

#### 2.2.2 `/about-ffmpeg` の強化

**既存に追加するメタタグ（JA）**:

```html
<!-- 追加: og:image, og:url, og:site_name, og:locale -->
<meta property="og:image" content="https://www.cmd-gen.com/og-about-ja.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://www.cmd-gen.com/about-ffmpeg" />
<meta property="og:site_name" content="FFmpeg コマンドジェネレーター" />
<meta property="og:locale" content="ja_JP" />
<meta property="og:locale:alternate" content="en_US" />

<!-- 追加: Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="FFmpegとは？ — 歴史・設計思想・使い方を徹底解説" />
<meta name="twitter:description" content="25年以上の歴史を持つオープンソース動画・音声処理ツールFFmpegの完全ガイド" />
<meta name="twitter:image" content="https://www.cmd-gen.com/og-about-ja.png" />

<!-- 追加: Canonical & hreflang -->
<link rel="canonical" href="https://www.cmd-gen.com/about-ffmpeg" />
<link rel="alternate" hreflang="ja" href="https://www.cmd-gen.com/about-ffmpeg" />
<link rel="alternate" hreflang="en" href="https://www.cmd-gen.com/about-ffmpeg" />
<link rel="alternate" hreflang="x-default" href="https://www.cmd-gen.com/about-ffmpeg" />
```

#### 2.2.3 `src/app.html` への共通メタタグ

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <!-- 追加 -->
  <meta name="theme-color" content="#7c3aed" />
  <meta name="author" content="cmd-gen.com" />
  <!-- /追加 -->
  ...
</head>
```

### 2.3 構造化データ（JSON-LD）

#### 2.3.1 ホームページ: WebApplication

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "FFmpeg Command Generator",
  "alternateName": "FFmpeg コマンドジェネレーター",
  "url": "https://www.cmd-gen.com/",
  "description": "Generate FFmpeg commands with an intuitive GUI. 8 presets for video compression, image conversion, audio extraction, and more.",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Any (Web-based)",
  "browserRequirements": "Requires JavaScript",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "AV1 video compression with SVT-AV1 (~60% smaller than H.264)",
    "AVIF image compression (~85% smaller than JPEG)",
    "WebP image compression",
    "Video format conversion (MP4, WebM, MOV, AVI)",
    "Audio extraction from video (MP3, AAC, WAV, FLAC, Opus)",
    "Audio format conversion",
    "Video trimming with start/end timestamps",
    "2-pass GIF generation with palette optimization",
    "Batch processing script generation (Bash, PowerShell, CMD)",
    "Drag & drop file/folder support"
  ],
  "inLanguage": ["ja", "en"],
  "creator": {
    "@type": "Organization",
    "name": "cmd-gen.com",
    "url": "https://www.cmd-gen.com"
  }
}
```

#### 2.3.2 ホームページ: WebSite

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "FFmpeg Command Generator",
  "alternateName": "FFmpeg コマンドジェネレーター",
  "url": "https://www.cmd-gen.com/"
}
```

#### 2.3.3 `/about-ffmpeg`: Article

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "FFmpegとは？ — 歴史・設計思想・使い方を徹底解説",
  "description": "25年以上の歴史を持つオープンソース動画・音声処理ツールFFmpegの設計思想、主な機能、コマンド例、JPEG→AVIF/H.264→AV1の圧縮比較データを詳しく解説します。",
  "url": "https://www.cmd-gen.com/about-ffmpeg",
  "datePublished": "2025-02-14",
  "dateModified": "2025-02-20",
  "author": {
    "@type": "Organization",
    "name": "cmd-gen.com",
    "url": "https://www.cmd-gen.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "cmd-gen.com",
    "url": "https://www.cmd-gen.com"
  },
  "inLanguage": "ja",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.cmd-gen.com/about-ffmpeg"
  },
  "keywords": ["FFmpeg", "動画圧縮", "AV1", "AVIF", "SVT-AV1", "動画変換", "音声抽出", "GIF生成"]
}
```

#### 2.3.4 `/about-ffmpeg`: HowTo

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "FFmpegでAV1動画圧縮する方法",
  "description": "SVT-AV1エンコーダーを使ってFFmpegで動画を高効率圧縮する手順。H.264比で約60%のファイルサイズ削減が可能。",
  "totalTime": "PT5M",
  "tool": {
    "@type": "HowToTool",
    "name": "FFmpeg"
  },
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "FFmpegをインストール",
      "text": "macOS: brew install ffmpeg / Windows: winget install ffmpeg / Linux: sudo apt install ffmpeg"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "入力ファイルを準備",
      "text": "変換したい動画ファイルを作業ディレクトリに配置します。"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "コマンドを実行",
      "text": "ffmpeg -i input.mp4 -c:v libsvtav1 -crf 30 -preset 6 -c:a libopus output.mp4"
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "結果を確認",
      "text": "出力ファイルのサイズが元の約40%になっていることを確認します。"
    }
  ]
}
```

### 2.4 sitemap.xml

**新規作成**: `static/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <url>
    <loc>https://www.cmd-gen.com/</loc>
    <lastmod>2025-02-20</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ja" href="https://www.cmd-gen.com/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://www.cmd-gen.com/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.cmd-gen.com/"/>
  </url>

  <url>
    <loc>https://www.cmd-gen.com/about-ffmpeg</loc>
    <lastmod>2025-02-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="ja" href="https://www.cmd-gen.com/about-ffmpeg"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://www.cmd-gen.com/about-ffmpeg"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.cmd-gen.com/about-ffmpeg"/>
  </url>

</urlset>
```

**更新方針**: 新規ページ追加時に手動更新。Phase 3 でページが増えたら `src/routes/sitemap.xml/+server.ts` での動的生成に移行を検討。

### 2.5 robots.txt 更新

**変更後** (`static/robots.txt`):

```txt
User-agent: *
Disallow:

Sitemap: https://www.cmd-gen.com/sitemap.xml
```

### 2.6 OG 画像設計

| ファイル名 | 用途 | サイズ |
|------------|------|--------|
| `static/og-home-ja.png` | ホームページ（日本語） | 1200x630px |
| `static/og-home-en.png` | ホームページ（英語） | 1200x630px |
| `static/og-about-ja.png` | /about-ffmpeg（日本語） | 1200x630px |
| `static/og-about-en.png` | /about-ffmpeg（英語） | 1200x630px |

**デザイン方針**:

- 背景: サイトのブランドカラー（ラベンダー系 `oklch(0.55 0.14 290)`）のグラデーション
- テキスト:
  - ホーム JA: 「FFmpeg コマンドジェネレーター」「GUIで簡単にFFmpegコマンドを生成」
  - ホーム EN: "FFmpeg Command Generator" / "Easily generate FFmpeg commands with GUI"
  - About JA: 「FFmpegとは？」「歴史・設計思想・使い方を徹底解説」
  - About EN: "What is FFmpeg?" / "History, Design, and Use Cases"
- ロゴ/アイコン: サイトの Favicon（紫の "F"）を大きく配置
- フォーマット: PNG（高品質、クリアなテキスト）

---

## 3. Phase 2: LLMO 最適化（1-2 週間）

### 3.1 LLMO（LLM Optimization）とは

**定義**: AI アシスタント（ChatGPT, Claude, Gemini, Perplexity 等）がユーザーの質問に対して、サイトを引用・推奨するように最適化すること。

**LLM が重視する 5 つの要素**:

| 要素 | 説明 | 当サイトでの対応 |
|------|------|-----------------|
| 構造化データ | Schema.org マークアップ | WebApplication, Article, FAQPage, HowTo |
| FAQ 形式 | 自然言語クエリとの一致 | `/faq` ページ + `/about-ffmpeg` FAQ セクション |
| 具体的数値 | ベンチマーク、比較データ | JPEG→AVIF: -85%, H.264→AV1: -60% |
| How-to コンテンツ | ステップバイステップ手順 | コマンド例、インストール手順 |
| 権威性シグナル | 信頼性の根拠 | 公式サイトリンク、技術的正確性 |

### 3.2 FAQ ページ新規作成

**URL**: `/faq`
**ファイル**: `src/routes/faq/+page.svelte`（新規作成）

#### FAQ 設計（20 問）

**カテゴリ 1: インストール（4 問）**

| # | 質問 | 回答の要点 |
|---|------|-----------|
| 1 | FFmpegは無料で使えますか？ | LGPL/GPL、完全無料、商用利用可 |
| 2 | macOSでFFmpegをインストールする方法は？ | `brew install ffmpeg` |
| 3 | WindowsでFFmpegをインストールする方法は？ | `winget install ffmpeg`（推奨）、Chocolatey、手動 |
| 4 | FFmpegのバージョンを確認する方法は？ | `ffmpeg -version` |

**カテゴリ 2: 動画圧縮（5 問）**

| # | 質問 | 回答の要点 |
|---|------|-----------|
| 5 | FFmpegで動画を圧縮する最適なコマンドは？ | `ffmpeg -i input.mp4 -c:v libsvtav1 -crf 30 -preset 6 -c:a libopus output.mp4`。H.264比で約60%削減 |
| 6 | CRF値はいくつに設定すべき？ | AV1: 25-30（高品質）, 30-35（Web配信）。数値が小さいほど高品質 |
| 7 | AV1とH.264、どちらを使うべき？ | AV1推奨。60%のサイズ削減、ただしエンコード速度はH.264の3-5倍遅い |
| 8 | 動画の解像度を変更する方法は？ | `-vf scale=1920:1080` を追加。`-1` で比率維持 |
| 9 | エンコード速度を上げる方法は？ | SVT-AV1: `-preset` を上げる（6→10）。品質とのトレードオフ |

**カテゴリ 3: 画像変換（4 問）**

| # | 質問 | 回答の要点 |
|---|------|-----------|
| 10 | JPEGをAVIFに変換するコマンドは？ | `ffmpeg -i photo.jpg -c:v libsvtav1 -crf 30 -pix_fmt yuv420p10le photo.avif`。85%削減 |
| 11 | PNGをWebPに変換するコマンドは？ | `ffmpeg -i image.png -c:v libwebp -quality 85 image.webp` |
| 12 | AVIFとWebPどちらが良い？ | AVIF: 圧縮率高い。WebP: 互換性高い。2025年時点では主要ブラウザ両方対応 |
| 13 | 画像を一括変換する方法は？ | 当サイトでフォルダD&D → バッチスクリプト自動生成。またはBash: `for f in *.jpg; do ...` |

**カテゴリ 4: 音声処理（3 問）**

| # | 質問 | 回答の要点 |
|---|------|-----------|
| 14 | 動画から音声だけを抽出する方法は？ | `ffmpeg -i video.mp4 -vn -c:a libmp3lame -b:a 192k audio.mp3` |
| 15 | WAVをMP3に変換するコマンドは？ | `ffmpeg -i audio.wav -c:a libmp3lame -b:a 320k audio.mp3` |
| 16 | 音声のビットレートは何kbpsがおすすめ？ | MP3: 192-320k、AAC: 128-256k、Opus: 96-128k |

**カテゴリ 5: その他（4 問）**

| # | 質問 | 回答の要点 |
|---|------|-----------|
| 17 | 動画をGIFに変換する方法は？ | 2パス: パレット生成→GIF生成。当サイトのGIFプリセットで自動生成可 |
| 18 | 動画をトリム（切り出し）する方法は？ | `ffmpeg -ss 00:01:00 -i input.mp4 -t 30 -c copy output.mp4` |
| 19 | 再エンコードなしで動画をカットするには？ | `-c copy` を使用。`-ss` を `-i` の前に配置で高速シーク |
| 20 | 複数ファイルを一括処理するには？ | 当サイトでフォルダD&D。Bash/PowerShell/CMDスクリプトを自動生成 |

#### FAQPage JSON-LD

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "FFmpegで動画を圧縮する最適なコマンドは？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AV1コーデック（SVT-AV1）を使用した推奨コマンド: ffmpeg -i input.mp4 -c:v libsvtav1 -crf 30 -preset 6 -c:a libopus output.mp4。H.264比で約60%のファイルサイズ削減が可能です。"
      }
    },
    {
      "@type": "Question",
      "name": "JPEGをAVIFに変換するコマンドは？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ffmpeg -i photo.jpg -c:v libsvtav1 -crf 30 -pix_fmt yuv420p10le photo.avif。JPEGに比べて約85%のファイルサイズ削減が可能です。"
      }
    }
  ]
}
```

（全 20 問を同様に記載）

#### FAQ ページのメタタグ

```html
<!-- JA -->
<title>FFmpeg よくある質問（FAQ） | FFmpegコマンドジェネレーター</title>
<meta name="description" content="FFmpegのインストール方法、動画圧縮、画像変換、音声抽出のコマンド例、CRF設定、AV1/AVIFの推奨値など、よくある質問に回答します。" />

<!-- EN -->
<title>FFmpeg FAQ — Frequently Asked Questions | FFmpeg Command Generator</title>
<meta name="description" content="Common questions about FFmpeg: installation, video compression commands, image conversion, audio extraction, CRF settings, AV1/AVIF recommendations, and more." />
```

### 3.3 `/about-ffmpeg` への FAQ セクション追加

既存の「参考リンク」セクションの前に FAQ セクションを追加。

**追加する 10 問**:

1. FFmpegは無料で使えますか？
2. FFmpegの最新バージョンは？
3. FFmpegでAV1動画を作成する最適なコマンドは？
4. JPEG→AVIF変換でどれくらいファイルサイズが減る？
5. SVT-AV1とlibaomの違いは？
6. FFmpegのインストール方法は？
7. 動画から音声を抽出するコマンドは？
8. エンコードが遅すぎる場合の対処法は？
9. "codec not found" エラーの解決方法は？
10. 当サイトのコマンドジェネレーターで何ができる？

**JSON-LD**: Article スキーマに加えて FAQPage スキーマを併設。

### 3.4 ホームページ補足テキスト

ホームページのフッター上（`CommandOutput` の下）に、視覚的に表示する機能説明セクションを追加。`sr-only`（非表示）ではなく、サイトのデザインに馴染む形で表示する。

**追加セクション構成**:

```
── 対応プリセット一覧（テキスト + リスト）
── 対応コーデック
── ベンチマーク要約（数値データ）
── FFmpegコマンドジェネレーターの特徴
```

**テキスト例（JA）**:

```markdown
## FFmpegコマンドジェネレーターの機能

### 8種類のプリセット
- **画像圧縮（AVIF）**: JPEG/PNGをAVIFに変換。85%のファイルサイズ削減
- **画像圧縮（WebP）**: 広い互換性と高圧縮率を両立
- **動画圧縮（AV1）**: SVT-AV1で高効率圧縮。H.264比で約60%削減
- **動画フォーマット変換**: MP4, WebM, MOV, AVI間の変換
- **音声抽出**: 動画から音声のみを抽出（MP3, AAC, WAV, FLAC, Opus）
- **音声変換**: 音声ファイルのフォーマット変換
- **動画トリム**: 開始/終了時刻を指定してカット
- **GIF生成**: 2パスパレット生成で高品質アニメーションGIF

### 対応コーデック
**動画**: H.264 (libx264), H.265 (libx265), VP9 (libvpx-vp9), AV1 (libsvtav1), WebP (libwebp)
**音声**: AAC, MP3 (libmp3lame), Opus (libopus), Vorbis (libvorbis), FLAC, PCM

### 圧縮効果（実測データ）
- JPEG → AVIF: **85%削減**（4MB → 0.6MB, CRF 30）
- H.264 → AV1: **60%削減**（300MB → 120MB, SVT-AV1 preset 6）

### 特徴
- **バッチ処理**: フォルダをドラッグ＆ドロップで一括処理スクリプトを自動生成
- **プライバシー**: サーバーへのファイルアップロード不要。完全クライアントサイド処理
- **多言語対応**: 日本語・英語
```

### 3.5 i18n キー追加設計

**追加キー構造**:

```json
{
  "seo": {
    "home": {
      "title": "FFmpeg コマンドジェネレーター | 動画・音声・画像変換コマンドを簡単生成",
      "description": "FFmpegコマンドをGUIで簡単生成。..."
    },
    "about": {
      "title": "FFmpegとは？ — 歴史・設計思想・使い方を徹底解説 | FFmpegコマンドジェネレーター"
    },
    "faq": {
      "title": "FFmpeg よくある質問（FAQ） | FFmpegコマンドジェネレーター",
      "description": "FFmpegのインストール方法、動画圧縮、画像変換..."
    }
  },
  "faq": {
    "pageTitle": "よくある質問（FAQ）",
    "categories": {
      "install": "インストール",
      "videoCompress": "動画圧縮",
      "imageConvert": "画像変換",
      "audioProcess": "音声処理",
      "other": "その他"
    },
    "q1": {
      "question": "FFmpegは無料で使えますか？",
      "answer": "はい、FFmpegは完全無料のオープンソースソフトウェアです。..."
    }
  },
  "homeContent": {
    "sectionTitle": "FFmpegコマンドジェネレーターの機能",
    "presetsTitle": "8種類のプリセット",
    "codecsTitle": "対応コーデック",
    "benchmarkTitle": "圧縮効果（実測データ）",
    "featuresTitle": "特徴"
  }
}
```

**注意**: `ja.json` と `en.json` の両方に必ず追加すること（i18n ルールに従う）。

---

## 4. Phase 3: コンテンツ戦略（1-3 ヶ月）

### 4.1 コマンド例集ページ

**URL**: `/examples`
**ファイル**: `src/routes/examples/+page.svelte`（新規作成）

**カテゴリ構成**:

| カテゴリ | コマンド例数 | 代表的な内容 |
|----------|-------------|-------------|
| 動画圧縮 | 5 | AV1圧縮、H.265圧縮、4K→1080pダウンスケール、Web配信用、低品質プレビュー |
| 画像変換 | 4 | JPEG→AVIF、PNG→WebP、一括AVIF変換、解像度変更 |
| 音声処理 | 4 | 音声抽出（MP3）、音声抽出（FLAC）、WAV→MP3、音量正規化 |
| GIF生成 | 3 | 基本GIF、高品質パレットGIF、ファイルサイズ最小化 |
| バッチ処理 | 3 | Bashスクリプト、PowerShellスクリプト、CMDバッチ |

各コマンド例には以下を含む:
- コマンド（コピーボタン付き）
- 何をするかの 1 行説明
- 主要パラメータの解説
- 期待される結果（サイズ削減率など）

**メタタグ**:

```html
<!-- JA -->
<title>FFmpeg コマンド例集 — 動画圧縮・画像変換・音声抽出 | FFmpegコマンドジェネレーター</title>
<meta name="description" content="FFmpegのよく使うコマンド例をカテゴリ別に紹介。AV1動画圧縮、AVIF画像変換、音声抽出、GIF生成、バッチ処理スクリプトなど。コピーしてすぐ使えます。" />
```

**JSON-LD**: `HowTo` スキーマを各カテゴリに付与。

### 4.2 ブログ / 技術記事

**URL**: `/blog/[slug]`
**ファイル**:
- `src/routes/blog/+page.svelte`（記事一覧）
- `src/routes/blog/[slug]/+page.svelte`（記事詳細）

**記事管理**: `src/content/blog/` ディレクトリに Markdown ファイルを配置。mdsvex または手動でのインポート。

**初期記事案（5 本）**:

| # | タイトル（JA） | ターゲットキーワード | 文字数目安 |
|---|---------------|---------------------|-----------|
| 1 | AV1 vs H.264/H.265: 実測ベンチマーク比較 | ffmpeg av1 比較, av1 vs h264 | 3000 |
| 2 | JPEG→AVIF 一括変換ガイド: 写真ライブラリを85%圧縮 | ffmpeg avif 一括変換, jpeg avif | 2500 |
| 3 | SVT-AV1 preset 徹底比較: 速度 vs 品質 | svtav1 preset, svtav1 設定 | 2500 |
| 4 | FFmpeg バッチ処理: 数百ファイルを自動変換するスクリプト | ffmpeg バッチ, ffmpeg 一括変換 | 2000 |
| 5 | FFmpeg で高品質 GIF を作る方法（2 パスパレット生成） | ffmpeg gif 高品質, ffmpeg gif 作成 | 2000 |

**記事テンプレート**:

```svelte
<svelte:head>
  <title>{記事タイトル} | FFmpegコマンドジェネレーター</title>
  <meta name="description" content="{記事説明}" />
  <meta property="og:type" content="article" />
  <!-- Article JSON-LD -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "...",
      "datePublished": "...",
      "dateModified": "..."
    }
  </script>
</svelte:head>

<article>
  <header>
    <h1>{タイトル}</h1>
    <time>{公開日}</time>
  </header>
  <div class="prose">
    {本文}
  </div>
  <!-- CTA: コマンドジェネレーターへのリンク -->
  <section class="cta">
    <a href="/">コマンドジェネレーターで試す</a>
  </section>
</article>
```

### 4.3 内部リンク戦略

**ハブ＆スポーク構造**:

```
ホーム (/)  ←──── ハブ
  ├─→ /about-ffmpeg   （FFmpegとは？）
  ├─→ /faq            （FAQ）
  ├─→ /examples       （コマンド例集）
  └─→ /blog           （ブログ）
        ├─→ /blog/av1-vs-h264
        ├─→ /blog/jpeg-to-avif
        └─→ ...

各スポークページ → ホーム（CTA）
各スポークページ → 関連スポーク（相互リンク）
```

**具体的なリンク設置場所**:

| ページ | リンク先 | 設置場所 |
|--------|---------|---------|
| `/` | `/about-ffmpeg` | Footer（既存「FFmpegとは？」） |
| `/` | `/faq` | Footer に追加 |
| `/` | `/examples` | Footer に追加 |
| `/about-ffmpeg` | `/` | CTA セクション（既存）、FAQ 回答内 |
| `/about-ffmpeg` | `/examples` | コマンド例セクション内 |
| `/about-ffmpeg` | `/faq` | FAQ セクション末尾「もっと見る」 |
| `/faq` | `/` | 各回答内「当サイトで自動生成」 |
| `/faq` | `/about-ffmpeg` | 関連リンク |
| `/examples` | `/` | CTA「コマンドジェネレーターで試す」 |
| `/blog/*` | `/` | CTA セクション |
| `/blog/*` | `/examples` | 関連コマンド例リンク |

**Footer の更新**:

```
現在: 「FFmpegとは？」のみ
追加: 「よくある質問」「コマンド例」「ブログ」
```

---

## 5. キーワード戦略

### 5.1 日本語キーワード（Primary）

#### 高ボリューム（推定月間検索数 1000+）

| キーワード | 対象ページ | 競合度 |
|-----------|-----------|--------|
| ffmpeg コマンド | `/`, `/examples` | 中 |
| ffmpeg 使い方 | `/about-ffmpeg`, `/faq` | 高 |
| ffmpeg 動画圧縮 | `/`, `/examples` | 中 |
| ffmpeg インストール | `/faq`, `/about-ffmpeg` | 高 |
| ffmpeg gif 作成 | `/`, `/examples` | 低 |
| ffmpeg 音声抽出 | `/`, `/examples` | 低 |

#### 中ボリューム（100-1000）

| キーワード | 対象ページ |
|-----------|-----------|
| ffmpeg av1 圧縮 | `/`, `/blog/av1-vs-h264` |
| ffmpeg avif 変換 | `/`, `/blog/jpeg-to-avif` |
| ffmpeg webp 変換 | `/`, `/examples` |
| ffmpeg バッチ処理 | `/`, `/blog/batch-processing` |
| ffmpeg 動画 切り出し | `/`, `/examples` |
| ffmpeg 解像度 変更 | `/faq`, `/examples` |
| ffmpeg crf 設定 | `/faq`, `/blog/svtav1-preset` |

#### ロングテール（低競合・高コンバージョン）

| キーワード | 対象ページ |
|-----------|-----------|
| ffmpeg jpeg avif 変換 コマンド | `/faq`, `/examples` |
| ffmpeg svtav1 crf おすすめ | `/faq`, `/blog/svtav1-preset` |
| ffmpeg 一括変換 スクリプト | `/`, `/blog/batch-processing` |
| ffmpeg 10bit エンコード | `/faq` |
| ffmpeg パレット gif 高品質 | `/examples`, `/blog/gif-generation` |
| ffmpeg コマンド 生成 ツール | `/` |
| ffmpeg gui ツール おすすめ | `/` |

### 5.2 英語キーワード（Secondary）

#### 高ボリューム

| キーワード | 対象ページ |
|-----------|-----------|
| ffmpeg command generator | `/` |
| ffmpeg compress video | `/`, `/examples` |
| ffmpeg convert video | `/`, `/examples` |
| ffmpeg av1 | `/`, `/blog/av1-vs-h264` |
| ffmpeg tutorial | `/about-ffmpeg` |

#### ロングテール

| キーワード | 対象ページ |
|-----------|-----------|
| ffmpeg svt-av1 command | `/faq`, `/examples` |
| ffmpeg jpeg to avif | `/faq`, `/examples` |
| ffmpeg batch convert script | `/`, `/blog/batch-processing` |
| ffmpeg 2-pass gif generation | `/examples`, `/blog/gif-generation` |
| ffmpeg reduce video file size | `/faq` |
| best ffmpeg command generator | `/` |

### 5.3 ページ別キーワードマッピング

| ページ | Primary KW | Secondary KW |
|--------|-----------|-------------|
| `/` | ffmpeg コマンドジェネレーター, ffmpeg command generator | ffmpeg gui, ffmpeg コマンド生成 |
| `/about-ffmpeg` | ffmpegとは, what is ffmpeg | ffmpeg 歴史, ffmpeg 使い方 |
| `/faq` | ffmpeg よくある質問, ffmpeg faq | ffmpeg コマンド 一覧, ffmpeg 設定 |
| `/examples` | ffmpeg コマンド例, ffmpeg examples | ffmpeg 動画圧縮 コマンド |
| `/blog/av1-vs-h264` | av1 vs h264, ffmpeg av1 比較 | svtav1 ベンチマーク |
| `/blog/jpeg-to-avif` | jpeg avif 変換, ffmpeg avif | avif 一括変換 |

---

## 6. 成果測定（KPI）

### 6.1 SEO KPI

| 指標 | 1 ヶ月後 | 3 ヶ月後 | 6 ヶ月後 |
|------|---------|---------|---------|
| Google インプレッション数/月 | 500+ | 5,000+ | 20,000+ |
| Google クリック数/月 | 50+ | 500+ | 2,000+ |
| 主要 KW 平均掲載順位 | 50 位以内 | 20 位以内 | 10 位以内 |
| インデックス済みページ数 | 3 | 10+ | 30+ |
| 被リンク数 | — | 5+ | 20+ |

### 6.2 LLMO KPI

**測定方法**:

1. **AI アシスタント引用テスト（月 1 回）**
   - ChatGPT, Claude, Gemini に以下のクエリを投げて引用確認:
     - 「FFmpegでAV1動画を作る方法」
     - 「JPEGをAVIFに変換するコマンド」
     - 「FFmpegのおすすめGUIツール」
     - 「FFmpegバッチ処理スクリプト」
     - 「動画ファイルサイズを半分にする方法」

2. **リファラー分析**
   - Google Analytics で以下のリファラーからの流入を計測:
     - `chat.openai.com`
     - `claude.ai`
     - `gemini.google.com`
     - `perplexity.ai`

| 指標 | 3 ヶ月後 | 6 ヶ月後 |
|------|---------|---------|
| テストクエリ 10 問中の引用数 | 3+ | 7+ |
| AI リファラー流入数/月 | 計測開始 | 50+ |

### 6.3 Core Web Vitals 目標

| 指標 | 目標値 |
|------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID/INP (Interaction to Next Paint) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| Lighthouse SEO スコア | 90+ |

---

## 7. 検証方法

### 7.1 Phase 1 デプロイ後の検証

**SSR 動作確認**:
```bash
# ビルド＆プレビュー
npm run build && npm run preview

# HTML にコンテンツが含まれるか確認
curl -s http://localhost:4173/ | grep '<title>'
curl -s http://localhost:4173/about-ffmpeg | grep '<title>'

# 本番デプロイ後
curl -s https://www.cmd-gen.com/ | grep '<title>'
curl -s https://www.cmd-gen.com/ | grep 'application/ld+json'
```

**構造化データ検証**:
- [Google Rich Results Test](https://search.google.com/test/rich-results) で各ページを検証
- [Schema.org Validator](https://validator.schema.org/) で JSON-LD の構文チェック

**OGP プレビュー検証**:
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) で OG タグ確認
- [Twitter Card Validator](https://cards-dev.twitter.com/validator) で Twitter Cards 確認

**Google Search Console**:
1. サイト所有権を確認（DNS TXT レコードまたは HTML ファイル）
2. `sitemap.xml` を送信
3. URL 検査で各ページのインデックス状況を確認
4. 「ページエクスペリエンス」レポートで Core Web Vitals 確認

### 7.2 継続的な検証

| 頻度 | 検証内容 |
|------|---------|
| デプロイ毎 | `npm run build` 成功、HTML にメタタグ含有 |
| 週 1 回 | Search Console インプレッション/クリック確認 |
| 月 1 回 | LLMO テストクエリ実行、Lighthouse 再計測 |
| 新ページ追加時 | sitemap.xml 更新、メタタグ/JSON-LD 設定確認 |

---

## 付録: 実装チェックリスト

### Phase 1（1 日）

- [ ] `src/routes/+layout.ts`: `ssr = true`, `prerender = true` に変更
- [ ] `src/routes/+page.svelte`: `<svelte:head>` にメタタグ追加
- [ ] `src/routes/+page.svelte`: WebApplication + WebSite JSON-LD 追加
- [ ] `src/routes/about-ffmpeg/+page.svelte`: メタタグ強化
- [ ] `src/routes/about-ffmpeg/+page.svelte`: Article + HowTo JSON-LD 追加
- [ ] `src/app.html`: `theme-color`, `author` 追加
- [ ] `static/sitemap.xml`: 新規作成
- [ ] `static/robots.txt`: Sitemap ディレクティブ追加
- [ ] `static/og-*.png`: OG 画像 4 枚作成
- [ ] `npm run build` でビルド確認
- [ ] デプロイ後に `curl` で SSR 動作確認

### Phase 2（1-2 週間）

- [ ] `src/routes/faq/+page.svelte`: FAQ ページ新規作成
- [ ] `src/lib/i18n/ja.json`: FAQ キー追加
- [ ] `src/lib/i18n/en.json`: FAQ キー追加
- [ ] `/about-ffmpeg` に FAQ セクション追加
- [ ] ホームページに補足テキストセクション追加
- [ ] Footer に内部リンク追加
- [ ] `static/sitemap.xml` に `/faq` 追加
- [ ] Google Search Console 登録
- [ ] Google Analytics（GA4）設定

### Phase 3（1-3 ヶ月）

- [ ] `src/routes/examples/+page.svelte`: コマンド例集ページ
- [ ] `src/routes/blog/+page.svelte`: ブログ記事一覧
- [ ] `src/routes/blog/[slug]/+page.svelte`: ブログ記事詳細
- [ ] ブログ記事 5 本作成
- [ ] 各ページのメタタグ/JSON-LD 設定
- [ ] `static/sitemap.xml` 更新（または動的生成に移行）
- [ ] 内部リンク最適化
