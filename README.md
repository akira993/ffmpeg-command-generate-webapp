# FFmpeg Command Generator

GUIで簡単にFFmpegコマンドを生成するWebアプリ。

## Features

- **8種類のプリセット**: 画像圧縮(AVIF/WebP)、動画圧縮(AV1)、動画変換、音声抽出、音声変換、動画トリム、GIF生成
- **ドラッグ＆ドロップ**: ファイル/フォルダをD&Dで入力、メディアの幅/高さを自動検出
- **アスペクト比ロック**: D&D時にアスペクト比を自動計算・ロック
- **コーデック/コンテナ選択**: ドロップダウンで簡単切替（互換性フィルタ付き）
- **一括処理**: Bash / PowerShell / cmd スクリプトを自動生成
- **初心者ガイド**: FFmpegインストール方法 + コマンド実行方法 + コーデックライブラリ追加をOS別に案内
- **日英対応**: 日本語・英語の切り替え（HTML lang属性も連動）
- **FFmpeg紹介ページ**: `/about-ffmpeg` — FFmpegの歴史・設計思想・ユースケース・圧縮比較表（JA/EN対応）
- **ダーク/ライトテーマ**: ペールトーン(Light) / サイバーパンク(Dark)

## Tech Stack

| 技術 | バージョン |
|------|-----------|
| SvelteKit | 2.x |
| Svelte | 5.x (Runes) |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| shadcn-svelte | latest |
| @lucide/svelte | latest |
| sveltekit-i18n | latest |

## Getting Started

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動
npm run dev

# 型チェック
npm run check

# プロダクションビルド
npm run build
```

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/           # shadcn-svelte UI コンポーネント
│   │   ├── layout/       # Header, Footer
│   │   ├── command/      # CommandOutput
│   │   ├── preset/       # PresetCard, PresetGrid, PresetCustomizer
│   │   ├── common/       # DropZone, ThemeToggle, ActionButtons, FfmpegInstallGuide, PathGuideModal, LibraryInstallGuide
│   │   └── form/         # Advanced mode form sections
│   ├── ffmpeg/           # コマンド生成ロジック・プリセット定義・バリデーション
│   ├── stores/           # Svelte Stores (command state)
│   └── i18n/             # 日英翻訳ファイル
├── routes/               # SvelteKit ルーティング（/, /about-ffmpeg）
├── app.css               # デザイントークン・テーマ定義
└── app.html              # FOUC防止スクリプト
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
| [docs/deployment.md](docs/deployment.md) | デプロイ・CI/CD |
| [CHANGELOG.md](CHANGELOG.md) | 変更履歴 |

## CSS Rules (Enforced by CI)

- oklch() のみ使用（hex/rgb/hsl 禁止）
- グラデーション: `in oklab` 補間必須
- フォント: `clamp()` ベースのフルイドタイポグラフィ

## Deployment

Vercel で自動デプロイ。`main` ブランチへの push で本番デプロイが走る。

## License

MIT
