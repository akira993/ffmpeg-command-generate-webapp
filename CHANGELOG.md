# Changelog

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
