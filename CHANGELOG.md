---
title: "Changelog"
description: "プロジェクトのバージョン履歴と変更内容"
category: "root"
created: "2026-02-16"
updated: "2026-03-18"
---

# Changelog

## [0.11.0] - 2026-03-18

### Added
- PWA コンパクトモード — `display-mode: standalone` 検出で 1:3 縦長リサイズ + UI 圧縮を自動適用
- `CompactStore`（`src/lib/stores/compact.svelte.ts`）— `isCompact` / `isPWA` 状態管理、前回サイズ復元
- フッター動的パディング — フッター高さを `ResizeObserver` で計測し `padding-bottom` を自動調整
- `mobile-web-app-capable` メタタグ追加（iOS PWA 対応）
- Vite 8.0 移行計画書（`docs/migration/vite-8.0-migration-plan.md`）
- ブラウザターゲットを Chrome・Safari 最新安定版のみに更新

### Fixed
- コンパクトモードのカードタイトルサイズ・余白・フッター重なり修正
- コンパクトモードの UI 改善（カード均一化・状態表示・タイトル縮小）

## [0.10.0] - 2026-03-07

### Added
- PWA 対応 — `manifest.webmanifest`、`service-worker.ts`（オフラインキャッシュ）、アイコン（192/512px 標準+マスカブル、180px apple-touch-icon）
- `scripts/generate-pwa-icons.mjs` — `sharp` で SVG ファビコンからマスカブルアイコンを自動生成
- CSS Subgrid でプリセットカードのアイコン・タイトル・説明文のアライメントを統一
- CSS Subgrid レイアウト設計ドキュメント（`docs/design/css-subgrid-layout.md`）
- Chrome 拡張機能リサイザー設計書（`docs/design/chrome-extension-design.md`）

### Fixed
- PresetCard のアイコンとタイトルの垂直中央揃え統一
- モバイル固定バーの UI 改善
- スマホ時の PresetCard gap 縮小

## [0.9.0] - 2026-03-04

### Added
- Web フォント セルフホスティング — Noto Sans JP（日本語）/ Inter（英語）を woff2 で配信、`html[lang]` 属性で言語別切替
- `scripts/subset-fonts.py` — アプリ内使用漢字のみをサブセット化するスクリプト
- builder ユニットテスト追加（`tests/ffmpeg/builder.test.ts`）+ 監査指摘の修正

### Changed
- 英語フォントを Noto Sans → Inter に変更

### Performance
- フォントファイル最適化 — 944KB → 305KB (-67.7%)

## [0.8.0] - 2026-02-27

### Added
- Storybook 10 導入 — 15コンポーネント / 58ストーリーの UI カタログ + `@storybook/addon-svelte-csf` v5
- Storybook CI 検証（`npm run build-storybook`）を GitHub Actions に追加
- i18n デコレータ（ja/en 切替）+ テーマデコレータ（light/dark 切替）

### Changed
- RabeeUI パターンへの完全移行 — bits-ui 依存を排除し CVA + Context API の独自 UI コンポーネントに統一
- `docs/rabeeui-migration-report.md` → `docs/migration/rabeeui-migration-report.md` へ移動

### Fixed
- 英語切替時のコーデック/ライブラリガイドで日本語ラベルが残る問題を修正

## [0.7.0] - 2026-02-25

### Added
- プライバシーポリシーページ（`/privacy`）— GDPR/CCPA 対応、日英切替、セクション11にお問い合わせフォーム
- Cookie 同意バナー（`CookieConsent` コンポーネント）+ GA4 Consent Mode v2 統合
- `ConsentStore`（`src/lib/stores/consent.svelte.ts`）— 同意状態の永続化 + `analytics_storage` 制御
- お問い合わせフォーム（Google Form リンクボタン）

### Changed
- WebP 変換を `ffmpeg` → `cwebp` コマンドに置換（より高品質・高速）
- ライブラリインストールガイドに `cwebp` の手順を追加

## [0.6.0] - 2026-02-20

### Added
- SSR 有効化 + OGP / Twitter Cards メタタグ（全ページ）
- JSON-LD 構造化データ（`SoftwareApplication` スキーマ）
- GA4（Google Analytics 4）統合（Consent Mode v2 準拠）
- `sitemap.xml` / `robots.txt` 自動生成
- OGP 画像 4 枚（ホーム・About FFmpeg × JA/EN）
- `fb:app_id` メタタグ

### Fixed
- X (Twitter) Card 画像表示修正 — `twitter:card` 先頭配置・`image:alt` 追加
- OG 画像 URL にキャッシュバスター追加
- `fb:app_id` を `app.html` に移動（Facebook Debugger 警告修正）

## [0.5.3] - 2026-02-19

### Changed
- AV1 エンコーダを `libaom-av1` → `libsvtav1` に統一（高速エンコード）
- バッチスクリプト（Bash / PowerShell / cmd）を `libsvtav1` 対応に全面改修

### Fixed
- ModeSwitch の固定幅レイアウト・ホバー改善
- outline ボタンのダークテーマ時テキスト色修正
- ファビコン設定、ModeSwitch 余白調整
- モバイル時の zoom 制御、フォントサイズ 1.1 倍化

## [0.5.2] - 2026-02-18

### Fixed
- FfmpegInstallGuide: `whitespace-pre` + `overflow-x-auto` を `break-all` に変更し横スクロールを禁止（Homebrewコマンドを1行に統一）
- ModeSwitch: スライドピルの位置指定を `transform: translateX` → `left` プロパティに変更し、初期表示時の中央ズレを修正

### Changed
- ダークテーマ `--color-primary` を `oklch(0.72 0.25 330)` → `oklch(0.55 0.25 330)` に変更（白前景テキストとの WCAG AAA 9.24:1 を確保）
- ダークテーマ `--color-primary-foreground` を `oklch(0.13 0.02 280)` → `oklch(0.99 0.005 290)` (白) に変更

### Added
- デザインシステムテスト (`src/lib/a11y/contrast.test.ts`) — CSS構文ルール・カラートークン値・タイポグラフィ・WCAGコントラスト比を検証する28テスト
- `src/lib/a11y/contrast.ts` — WCAG相対輝度計算ユーティリティ (oklch → OKLab → linear sRGB)
- `scripts/lint-css.sh` — hex/rgb禁止・in oklab強制 CIスクリプト

## [0.5.1] - 2026-02-18

### Fixed
- モバイル時にSeparator下のActionButtonsと固定バーが重複表示される問題を修正（`hidden sm:block`）
- モバイル時にフッターが固定バーに隠れる問題を修正（`pb-16 sm:pb-0`）
- `min-h-screen` → `min-h-dvh` に変更（iOS Safariブラウザツールバー対応）

## [0.5.0] - 2026-02-18

### Added
- アクションボタンコンポーネント（FFmpegの導入 / 実行方法 / ライブラリの追加）
- モバイル固定バー（画面下部にアクションボタンを常時表示）
- 「ライブラリの追加」モーダル — OS別の追加コーデックライブラリインストール手順
- 非デフォルトコーデックに「*」マークと警告ヒント表示（別途インストール必要）
- フッターに「FFmpegとは？」リンク
- `/about-ffmpeg` ページ — FFmpegの歴史・設計思想・ユースケース・圧縮比較表（JA/EN対応、8000文字以上）
- 動画コーデック / 音声コーデック のラベル分離
- `NON_DEFAULT_VIDEO_CODECS` / `NON_DEFAULT_AUDIO_CODECS` 定数セット

### Changed
- モバイルプリセットグリッドを1カラム → 2カラムに変更
- FfmpegInstallGuide / PathGuideModal を `$bindable` Props化（外部からの開閉制御対応）
- アクションボタン（FFmpegの導入、実行方法）をCommandOutput内からSeparator下に移動
- モーダル状態管理を `+page.svelte` に一元化

## [0.4.1] - 2026-02-17

### Added
- FFmpegインストールガイドモーダル（macOS / Windows / Linux 対応）
- 実行方法モーダルからインストールガイドへの導線
- Windows向け AV1/AVIF 拡張機能（Microsoft Store）の案内を追加
- 実行方法モーダルにスクロール対応を追加
- Emoji → Lucide アイコンに統一（📁→FolderIcon, ℹ️→InfoIcon）

### Changed
- AV1動画圧縮のデフォルト出力を `.mkv` → `.mp4` に変更

## [0.4.0] - 2026-02-16

### Added
- コーデック・コンテナ・音声ビットレートのドロップダウン選択（動画/音声系プリセット）
- アスペクト比ロック機能（D&D時に自動計算、デフォルトON）
- D&Dでメディアの幅/高さを自動取得し設定に反映
- HTML lang属性を言語切替に連動（JA/EN）

### Fixed
- FFmpegインストールガイドモーダルがスクロールできない問題を修正
- 実行方法モーダルのmacOSヒントを正しい手順に修正（サービスメニュー経由）
- AVIFコマンドの`-still-picture`オプションを削除（ffmpeg 8.x互換性）
- CRF/品質/エンコード速度スライダーがコマンドに反映されない問題を修正
  - `$state` Proxy で `structuredClone` が使えない問題を `JSON.parse/JSON.stringify` で解決
  - bits-ui Slider `onValueChange` のシグネチャ修正（配列→単数値）
  - `getOptionValue` のリアクティビティ修正（`$derived` 経由に変更）
- バッチモード時にスケールフィールドをグレーアウトに変更

### Removed
- フッターのGitHubリンクを削除
- `VideoOptions.stillPicture` プロパティを削除（ffmpeg 8.x非対応）

## [0.3.0] - 2025-02-16

### Added
- ペールトーン(Light) + サイバーパンク(Dark) テーマ実装
- oklch() カラーシステム全面導入
- clamp() フルイドタイポグラフィ
- FOUC防止インラインスクリプト
- CSS設計ドキュメント (`docs/css-design.md`)
- CSSリントスクリプト (`scripts/lint-css.sh`) — CI/CDに組込み

### Changed
- Lucide Svelte アイコンに差し替え（絵文字 → SVGアイコン）
- プリセットカードのアイコンをoklchベースのカラフルカラーに変更
- ThemeToggle を Lucide Sun/Moon アイコンに統一

## [0.2.0] - 2025-02-15

### Added
- WebP画像圧縮プリセット (`image-webp`)

### Fixed
- Vercel 500エラー修正 — `command.ts` を `command.svelte.ts` にリネーム（Svelte 5 runes対応）
- Node.js 20 ランタイム固定 + i18n初期化保護

## [0.1.0] - 2025-02-15

### Added
- MVP実装 — 7プリセット対応
  - 画像圧縮(AVIF)、動画圧縮(AV1)、動画フォーマット変換、音声抽出、音声変換、動画トリム、GIF生成
- ドラッグ＆ドロップファイル/フォルダ入力
- 一括処理(バッチモード) — Bash / PowerShell / cmd スクリプト生成
- コマンド実行方法ガイドモーダル
- 日本語 / 英語 i18n対応
- ダーク / ライトテーマ切替
- GitHub Actions CI/CD + Vercel自動デプロイ

## [0.0.0] - 2025-02-15

### Added
- プロジェクト初期化（SvelteKit + TypeScript + Tailwind CSS v4 + shadcn-svelte）
- 設計ドキュメント一式
