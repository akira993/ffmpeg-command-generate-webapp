# Changelog

## [Unreleased]

### Added
- FFmpegインストールガイドモーダル（macOS / Windows / Linux 対応）
- 実行方法モーダルからインストールガイドへの導線
- オンボーディングUXドキュメント (`docs/onboarding-guide.md`)

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
