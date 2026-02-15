# 基本設計書

## 1. システム構成

### 1.1 現在の構成（フロントエンドのみ）

```
┌─────────────────────────────────┐
│         ブラウザ (Client)        │
│                                 │
│  SvelteKit (SSG/SPA)            │
│  ┌───────────────────────────┐  │
│  │  UI Layer (Components)    │  │
│  │  ┌─────────┐ ┌─────────┐ │  │
│  │  │ Preset  │ │Advanced │ │  │
│  │  │ Mode    │ │ Mode    │ │  │
│  │  └────┬────┘ └────┬────┘ │  │
│  │       │            │      │  │
│  │  ┌────▼────────────▼────┐ │  │
│  │  │    Svelte Stores     │ │  │
│  │  └──────────┬───────────┘ │  │
│  │             │             │  │
│  │  ┌──────────▼───────────┐ │  │
│  │  │  Command Builder     │ │  │
│  │  │  (Pure Functions)    │ │  │
│  │  └──────────┬───────────┘ │  │
│  │             │             │  │
│  │  ┌──────────▼───────────┐ │  │
│  │  │  Command Output      │ │  │
│  │  │  (Display + Copy)    │ │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
│                                 │
│  Vercel (Static Hosting)        │
└─────────────────────────────────┘
```

### 1.2 将来の構成（バックエンド追加時）

```
┌──────────────┐     ┌──────────────────┐
│   ブラウザ    │────▶│  API Server      │
│  (SvelteKit) │◀────│  (Node.js)       │
└──────────────┘     │  ┌────────────┐  │
                     │  │ FFmpeg     │  │
                     │  │ (実行環境)  │  │
                     │  └────────────┘  │
                     └──────────────────┘
```

---

## 2. 画面設計

### 2.1 画面構成

アプリは単一ページ（SPA）で構成され、モード切替によりコンテンツが切り替わる。

```
┌─────────────────────────────────────────┐
│  Header                                 │
│  [Logo] [Title]    [Lang] [Theme]       │
├─────────────────────────────────────────┤
│  Mode Switch                            │
│  [Preset Mode] | [Advanced Mode]        │
├─────────────────────────────────────────┤
│                                         │
│  Main Content Area                      │
│  (モードに応じて切替)                     │
│                                         │
├─────────────────────────────────────────┤
│  Command Output                         │
│  ┌───────────────────────────────────┐  │
│  │ $ ffmpeg -i input.mp4 ...        │  │
│  │                        [Copy]    │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  Footer                                 │
│  [GitHub] [About]                       │
└─────────────────────────────────────────┘
```

### 2.2 プリセットモード画面

```
┌─────────────────────────────────────────┐
│  Preset Grid (カード一覧)                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ 🎬      │ │ 📦      │ │ 🎵      │  │
│  │ 動画    │ │ 動画    │ │ 音声    │  │
│  │ 変換    │ │ 圧縮    │ │ 抽出    │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ 🔄      │ │ ✂️      │ │ 🖼️      │  │
│  │ 音声    │ │ 動画    │ │ GIF     │  │
│  │ 変換    │ │ トリム  │ │ 生成    │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│  ┌─────────┐                           │
│  │ 📷      │                           │
│  │ 画像    │                           │
│  │ 変換    │                           │
│  └─────────┘                           │
├─────────────────────────────────────────┤
│  Preset Customizer (選択後に表示)        │
│  ┌───────────────────────────────────┐  │
│  │  入力ファイル: [input.mp4     ]   │  │
│  │  出力形式:     [WebM ▼]          │  │
│  │  コーデック:   [VP9  ▼]          │  │
│  │  品質:         [───●───] 23      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 2.3 アドバンスドモード画面

```
┌─────────────────────────────────────────┐
│  Advanced Form                          │
│                                         │
│  ── 入力設定 ──                          │
│  ファイル名: [input.mp4          ]      │
│                                         │
│  ── 出力設定 ──                          │
│  ファイル名: [output.webm        ]      │
│  フォーマット: [WebM ▼]                  │
│                                         │
│  ── 映像設定 ──                          │
│  コーデック:  [VP9 ▼]                    │
│  解像度:      [1920] x [1080]           │
│  FPS:         [30      ]               │
│  CRF:         [───●───] 23             │
│  ビットレート: [         ] kbps         │
│                                         │
│  ── 音声設定 ──                          │
│  コーデック:    [Opus ▼]                 │
│  サンプルレート: [48000 ▼]               │
│  チャンネル:    [ステレオ ▼]              │
│  ビットレート:  [128     ] kbps         │
│                                         │
│  ── フィルタ ──                          │
│  スケール: [幅] x [高さ]                 │
│                                         │
│  ── その他 ──                            │
│  □ メタデータ削除                        │
│  開始時刻: [00:00:00]                   │
│  終了時刻: [00:00:00]                   │
└─────────────────────────────────────────┘
```

---

## 3. コンポーネント構成

```
App (+layout.svelte)
├── Header
│   ├── Logo
│   ├── LanguageSwitcher
│   └── ThemeToggle (Lucide Sun/Moon)
├── DropZone (D&D ファイル/フォルダ入力)
├── ModeSwitch
├── Main Content (+page.svelte)
│   ├── PresetMode
│   │   ├── PresetGrid
│   │   │   └── PresetCard (×8, Lucide アイコン + oklch カラー)
│   │   └── PresetCustomizer
│   └── AdvancedMode
│       └── AdvancedForm
│           ├── InputSection
│           ├── OutputSection
│           ├── VideoSection
│           ├── AudioSection
│           ├── FilterSection
│           └── MiscSection
├── CommandOutput
│   ├── FfmpegInstallGuide (FFmpegインストール案内モーダル)
│   ├── PathGuideModal (コマンド実行方法ガイドモーダル)
│   ├── CommandDisplay
│   └── CopyButton
└── Footer
```

---

## 4. データフロー

```
ユーザー操作
    │
    ▼
┌──────────────────┐
│  UI Component    │  ユーザー入力を受け取る
│  (Form/Preset)   │
└────────┬─────────┘
         │ 値を更新
         ▼
┌──────────────────┐
│  Svelte Store    │  writable: options (FFmpegOptions)
│  (command.ts)    │  writable: mode ('preset' | 'advanced')
└────────┬─────────┘
         │ storeの値を参照
         ▼
┌──────────────────┐
│  derived store   │  options → buildCommand(options) → command文字列
│  (commandString) │
└────────┬─────────┘
         │ リアクティブに反映
         ▼
┌──────────────────┐
│  CommandOutput   │  コマンド表示 + コピー機能
└──────────────────┘
```

---

## 5. State管理方針

Svelte の組み込みstore機能（`writable` / `derived`）を使用する。

### 5.1 Store一覧

| Store名 | 型 | 種類 | 説明 |
|---------|---|------|------|
| `mode` | `'preset' \| 'advanced'` | writable | 現在のモード |
| `selectedPreset` | `string \| null` | writable | 選択中のプリセットID |
| `options` | `FFmpegOptions` | writable | 全FFmpegオプション |
| `commandString` | `string` | derived | 生成されたコマンド文字列 |

### 5.2 データの流れ
1. プリセット選択 → プリセットのデフォルト値で `options` を上書き
2. カスタマイザーで値変更 → `options` の該当フィールドを更新
3. アドバンスドモードで値変更 → `options` の該当フィールドを更新
4. `options` 変更 → `commandString` が自動再計算（derived）

---

## 6. ルーティング設計

SvelteKitのファイルベースルーティングを使用。現段階では単一ページ。

| パス | ファイル | 説明 |
|------|---------|------|
| `/` | `src/routes/+page.svelte` | メインページ |
| - | `src/routes/+layout.svelte` | 共通レイアウト（Header/Footer） |
| - | `src/routes/+layout.ts` | レイアウト初期化（i18n等） |

将来的にページが増える場合（例: `/about`, `/docs`）はルートを追加。

---

## 7. i18n設計

### 7.1 対応言語
- `ja`: 日本語（デフォルト）
- `en`: 英語

### 7.2 実装方針
- `sveltekit-i18n` ライブラリを使用
- 翻訳ファイルはJSON形式で `src/lib/i18n/` に配置
- ブラウザ言語を検出して初期言語を設定
- ユーザー選択は `localStorage` に保存

### 7.3 翻訳キー構造（概要）
```
{
  "common": { "copy", "reset", "input", "output" },
  "header": { "title", "subtitle" },
  "mode": { "preset", "advanced" },
  "preset": { "videoConvert", "compress", ... },
  "form": { "video", "audio", "filter", ... },
  "command": { "generated", "copied", "empty" }
}
```

---

## 8. テーマ（ダーク/ライト）設計

### 8.1 実装方針
- Tailwind CSS v4 の `@custom-variant dark` を使用（`.dark *` セレクタ）
- `<html>` タグに `class="dark"` を切替
- OS設定（`prefers-color-scheme`）を初期値として検出
- ユーザー選択は `localStorage` に保存
- FOUC防止: `app.html` の `<head>` にインラインスクリプトで初回描画前に `.dark` 適用

### 8.2 テーマデザイン
- **ライト**: ペールトーン風（高明度・低彩度のoklch値）
- **ダーク**: サイバーパンク風（ネオンマゼンタ/シアンのoklch値）
- 詳細は `docs/css-design.md` を参照

### 8.3 切替フロー
1. 初回アクセス: `app.html` のインラインスクリプトが `localStorage` → OS設定の順に判定
2. テーマ適用: `<html>` の `class` を更新（FOUC防止）
3. ユーザー切替: ThemeToggle クリック → `localStorage` 保存 → class更新

### 8.4 CSS ルール
- 色指定: `oklch()` のみ使用（hex/rgb/hsl 禁止、CI/CDで強制）
- グラデーション: `in oklab` 補間必須
- フォント: `clamp()` ベースのフルイドタイポグラフィ
- 詳細は `docs/css-design.md` を参照
