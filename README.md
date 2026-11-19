# FFmpeg Command Generator

GUIで簡単にFFmpegコマンドを生成するWebアプリ。

**本番URL**: https://www.cmd-gen.com

## Features

- **8種類のプリセット**: 画像変換(AVIF)、画像変換(WebP)、動画圧縮(AV1/SVT-AV1)、動画変換(VP9)、音声抽出、音声変換、動画トリム、GIF生成
- **ドラッグ＆ドロップ**: ファイル/フォルダをD&Dで入力、メディアの幅/高さを自動検出
- **アスペクト比ロック**: D&D時にアスペクト比を自動計算し、ロック中は幅と高さを連動（ロックは既定でオン、ボタンで切替）
- **コーデック/コンテナ選択**: ドロップダウンで簡単切替（互換性フィルタ付き）
- **一括処理**: Bash / PowerShell / cmd スクリプトを自動生成
- **初心者ガイド**: FFmpegインストール方法 + コマンド実行方法 + コーデックライブラリ追加をOS別に案内
- **日英対応**: 日本語・英語の切り替え（HTML lang属性も連動）
- **FFmpeg紹介ページ**: `/about-ffmpeg` — FFmpegの歴史・設計思想・ユースケース・圧縮比較表（JA/EN対応）
- **ダーク/ライトテーマ**: ペールトーン(Light) / サイバーパンク(Dark)
- **PWA**: インストール可能、オフライン対応（Service Worker によるアセットキャッシュ）
- **コンパクトモード**: PWA standalone 起動時に、ボタンで 1:3 縦長リサイズ + UI 圧縮を切り替え
- **SEO**: SSR + OGP / Twitter Cards + JSON-LD 構造化データ + sitemap.xml + GA4
- **Cookie同意 + GA4 Consent Mode v2**: GDPR/CCPA対応のプライバシー管理
- **プライバシーポリシー**: `/privacy` — GDPR/CCPA 対応、お問い合わせフォーム付き
- **Web フォント**: Noto Sans JP（日本語）/ Inter（英語）を woff2 でセルフホスト（言語別切替）
- **CSS Subgrid**: プリセットカードのアイコン・タイトル・説明文を行単位で揃える
- **Storybook**: UI コンポーネントのカタログ

## Tech Stack

| 技術 | バージョン |
|------|-----------|
| SvelteKit | 3.x |
| Svelte | 5.x (Runes) |
| TypeScript | 6.x |
| Tailwind CSS | 4.x |
| Vite | 8.x |
| UI コンポーネント | 独自実装（CVA + Svelte 5 Runes） |
| @lucide/svelte | 1.x |
| sveltekit-i18n | 3.x |
| Vitest | 5.x |
| Storybook | 10.x |

> UI コンポーネントは RabeeUI パターン（CVA + Context API）で独自実装しています。bits-ui / shadcn-svelte は使用していません。

## Getting Started

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動
npm run dev

# 型チェック
npm run check

# ユニットテスト
npm run test

# CSS ルールチェック（CI と同一）
bash scripts/lint-css.sh

# プロダクションビルド
npm run build

# Storybook 起動
npm run storybook
```

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/           # 独自 UI コンポーネント（CVA + Context API）
│   │   │                 # button, card, dialog, input, label,
│   │   │                 # select, separator, slider, tabs, badge
│   │   ├── layout/       # Header, Footer
│   │   ├── command/      # CommandOutput
│   │   ├── preset/       # PresetCard, PresetGrid, PresetCustomizer
│   │   └── common/       # DropZone, ThemeToggle, ActionButtons,
│   │                     # FfmpegInstallGuide, PathGuideModal,
│   │                     # LibraryInstallGuide, LanguageSwitcher,
│   │                     # ModeSwitch, CookieConsent
│   ├── ffmpeg/           # コマンド生成ロジック・プリセット定義・バリデーション
│   ├── stores/           # Svelte 5 Runes Store (command, compact, consent)
│   ├── i18n/             # 日英翻訳ファイル
│   └── a11y/             # WCAG コントラスト比計算ユーティリティ
├── routes/               # SvelteKit ルーティング（/, /about-ffmpeg, /privacy）
├── service-worker/       # PWA オフラインキャッシュ
├── app.css               # デザイントークン・テーマ・Web フォント定義
└── app.html              # FOUC防止スクリプト・GA4 Consent Mode
static/
├── manifest.webmanifest  # PWA マニフェスト
├── icons/                # PWA アイコン（192/512px 標準+マスカブル、180px apple-touch-icon）
├── fonts/                # セルフホスト woff2（Noto Sans JP / Inter）
├── og-*.png              # OGP 画像（ホーム・About × JA/EN）
├── sitemap.xml           # サイトマップ
└── robots.txt            # クローラ設定
tests/
└── ffmpeg/               # Vitest ユニットテスト
scripts/
├── lint-css.sh           # CSS oklch ルール CI スクリプト
├── subset-fonts.py       # Web フォントサブセット化
└── generate-pwa-icons.mjs  # PWA アイコン生成（sharp）
.storybook/               # Storybook 設定（main.ts, preview.ts）
```

## CSS Rules (Enforced by CI)

- oklch() のみ使用（hex/rgb/hsl 禁止）
- グラデーション: `in oklab` 補間必須
- フォント: `clamp()` ベースのフルイドタイポグラフィ（CI では検査しない）

## Deployment

**`main` push → GitHub Actions CI（書式の確認・CSS lint・ユニットテスト・型チェック・build・Storybook build）→ Vercel 本番自動デプロイ**

| プロジェクト | URL | ビルドコマンド |
|-------------|-----|---------------|
| メインアプリ | `www.cmd-gen.com` | `npm run build` |
| Storybook | Vercel 別プロジェクト | `npm run build-storybook` |

## License

MIT
