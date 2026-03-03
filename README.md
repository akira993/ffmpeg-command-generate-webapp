# FFmpeg Command Generator

GUIで簡単にFFmpegコマンドを生成するWebアプリ。

**本番URL**: https://www.cmd-gen.com

## Features

- **8種類のプリセット**: 画像変換(AVIF)、画像変換(WebP)、動画圧縮(AV1)、動画変換(VP9)、音声抽出、音声変換、動画トリム、GIF生成
- **ドラッグ＆ドロップ**: ファイル/フォルダをD&Dで入力、メディアの幅/高さを自動検出
- **アスペクト比ロック**: D&D時にアスペクト比を自動計算・ロック
- **コーデック/コンテナ選択**: ドロップダウンで簡単切替（互換性フィルタ付き）
- **一括処理**: Bash / PowerShell / cmd スクリプトを自動生成
- **初心者ガイド**: FFmpegインストール方法 + コマンド実行方法 + コーデックライブラリ追加をOS別に案内
- **日英対応**: 日本語・英語の切り替え（HTML lang属性も連動）
- **FFmpeg紹介ページ**: `/about-ffmpeg` — FFmpegの歴史・設計思想・ユースケース・圧縮比較表（JA/EN対応）
- **ダーク/ライトテーマ**: ペールトーン(Light) / サイバーパンク(Dark)
- **Cookie同意 + GA4 Consent Mode v2**: GDPR/CCPA対応のプライバシー管理
- **Web フォント**: Noto Sans JP（日本語）/ Inter（英語）を woff2 でセルフホスト（言語別切替）
- **Storybook**: 15コンポーネント / 55ストーリーのUIカタログ

## Tech Stack

| 技術 | バージョン |
|------|-----------|
| SvelteKit | 2.x |
| Svelte | 5.x (Runes) |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| UI コンポーネント | 独自実装（CVA + Svelte 5 Runes） |
| @lucide/svelte | latest |
| sveltekit-i18n | latest |
| Vitest | 4.x |
| Storybook | 10.x |

> UI コンポーネントは [RabeeUI パターン](docs/rabeeui-migration-report.md)（CVA + Context API）で独自実装しています。bits-ui / shadcn-svelte は使用していません。

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
│   ├── stores/           # Svelte 5 Runes Store (command, consent)
│   ├── i18n/             # 日英翻訳ファイル
│   └── a11y/             # WCAG コントラスト比計算ユーティリティ
├── routes/               # SvelteKit ルーティング（/, /about-ffmpeg, /privacy）
├── app.css               # デザイントークン・テーマ・Web フォント定義
└── app.html              # FOUC防止スクリプト・GA4 Consent Mode
tests/
└── ffmpeg/               # Vitest ユニットテスト
scripts/
├── lint-css.sh           # CSS oklch ルール CI スクリプト
└── subset-fonts.py       # Web フォントサブセット化
.storybook/               # Storybook 設定（main.ts, preview.ts）
```

## Documentation

| ドキュメント | 内容 |
|-------------|------|
| [docs/requirements.md](docs/requirements.md) | 要件定義 |
| [docs/basic-design.md](docs/basic-design.md) | 基本設計 |
| [docs/detailed-design.md](docs/detailed-design.md) | 詳細設計 |
| [docs/css-design.md](docs/css-design.md) | CSS設計（oklchカラー・テーマ） |
| [docs/onboarding-guide.md](docs/onboarding-guide.md) | 初めて使う人向けガイドUX |
| [docs/test-design.md](docs/test-design.md) | テスト設計 |
| [docs/test-manual.md](docs/test-manual.md) | 手動テスト手順 |
| [docs/deployment.md](docs/deployment.md) | デプロイ・CI/CD |
| [docs/seo-llmo-design.md](docs/seo-llmo-design.md) | SEO / LLM 最適化設計 |
| [docs/seo-external-setup.md](docs/seo-external-setup.md) | SEO 外部サービス設定 |
| [docs/rabeeui-migration-report.md](docs/rabeeui-migration-report.md) | RabeeUI 移行レポート（bits-ui 排除） |
| [docs/typescript-6.0-migration-plan.md](docs/typescript-6.0-migration-plan.md) | TypeScript 6.0 移行計画 |
| [CHANGELOG.md](CHANGELOG.md) | 変更履歴 |

## CSS Rules (Enforced by CI)

- oklch() のみ使用（hex/rgb/hsl 禁止）
- グラデーション: `in oklab` 補間必須
- フォント: `clamp()` ベースのフルイドタイポグラフィ

## Deployment

**`main` push → GitHub Actions CI（型チェック・CSS lint・build・Storybook build）→ Vercel 本番自動デプロイ**

| プロジェクト | URL | ビルドコマンド |
|-------------|-----|---------------|
| メインアプリ | `www.cmd-gen.com` | `npm run build` |
| Storybook | Vercel 別プロジェクト | `npm run build-storybook` |

## License

MIT
