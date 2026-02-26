# Pencil.dev UI 再現 調査レポート

> 調査日: 2026-02-20
> 対象: https://docs.pencil.dev/
> Pencil MCP: 接続済み

## Context

現在の FFmpeg Command Generator WebApp の UI デザインを Pencil.dev 上に再現できるかを調査した。Pencil MCP は接続済みで、エディタの状態確認やコンポーネント一覧の取得が可能。

---

## 1. Pencil MCP の現状

### 接続状態

Pencil MCP サーバーに接続済み。以下のツールが利用可能:

- `get_editor_state` -- エディタの状態取得
- `batch_get` -- ノードの検索・読み取り
- `batch_design` -- Insert/Copy/Update/Replace/Move/Delete/Image 操作
- `get_screenshot` -- ノードのスクリーンショット
- `snapshot_layout` -- レイアウト構造の確認
- `get_variables` / `set_variables` -- 変数・テーマの管理
- `find_empty_space_on_canvas` -- キャンバスの空きスペース検索
- `get_style_guide` / `get_style_guide_tags` -- スタイルガイド取得
- `get_guidelines` -- デザインガイドライン取得

### 利用可能なリユーザブルコンポーネント（100個）

確認済みのコンポーネント（抜粋）:

**ボタン系:**
- Button (Default / Ghost / Outline / Secondary / Destructive)
- Button/Large (同上の Large バリアント)
- Icon Button (Default / Secondary / Destructive / Outline / Ghost / Large variants)

**フォーム系:**
- Input Group (Default / Filled)
- Select Group (Default / Filled)
- Textarea Group (Default)
- Input OTP Group (Default / Filled)
- Checkbox (Default / Checked)
- Checkbox Description (Default / Checked)
- Radio (Default / Selected)
- Radio Description (Default / Selected)
- Switch (Default / Checked)
- Slider -- 未確認、必要なら Frame で自作

**カード系:**
- Card
- Card Image
- Card Action
- Card Plain

**モーダル系:**
- Dialog
- Modal/Left
- Modal/Center
- Modal/Center Icon

**ナビゲーション系:**
- Tabs
- Tab Item (Active / Inactive)
- Sidebar, Sidebar Section Title, Sidebar Item (Active / Default)
- Breadcrumb Item (Default / Active / Separator / Ellipsis)
- Pagination, Pagination Item (Default / Active / Ellipsis)

**データ表示系:**
- Table, Table Row, Table Cell, Table Column Header
- Data Table, Data Table Header, Data Table Footer

**通知系:**
- Alert (Error / Success / Warning / Info)
- Tooltip

**その他:**
- Label (Success / Orange / Violet / Secondary)
- Icon Label (Secondary / Success / Violet / Orange)
- Avatar (Text / Image)
- Accordion (Open / Closed)
- Separator (未確認、Divider 等)
- Progress
- Search Box (Default / Filled)
- Dropdown
- List Item (Checked / Unchecked), List Item Title, List Divider

---

## 2. 現在の UI 構成と再現マッピング

### ページレイアウト

```
Header（タイトル + 言語切替 + テーマ切替）
  ↓
DropZone（ファイル D&D エリア）
  ↓
Separator
  ↓
ModeSwitch（プリセット / 詳細 切替）
  ↓
PresetGrid（7枚のプリセットカード）
  ↓
PresetCustomizer（選択したプリセットの設定フォーム）
  ↓
Separator
  ↓
ActionButtons（インストール / パス / ライブラリ の3ボタン）
  ↓
CommandOutput（生成されたコマンド表示 + コピー）
  ↓
Footer（説明 + About FFmpeg リンク）
```

### コンポーネント対応表

| 画面要素 | Pencil コンポーネント | 方法 |
|---------|---------------------|------|
| Header | Frame + Text + Button (Ghost) | カスタムフレーム構築 |
| DropZone | Frame（破線ボーダー） | カスタムフレーム |
| ModeSwitch | Tabs or Tab Item | Tab Item (Active/Inactive) を並べる |
| PresetCard x7 | Card | Card コンポーネント x7 |
| PresetCustomizer | Input Group + Select Group + Slider | フォーム要素の組み合わせ |
| CommandOutput | Card Plain + Text（monospace） | カスタムカード |
| ActionButtons | Button x3 | Button (Outline) x3 |
| PathGuideModal | Dialog or Modal/Center | Modal コンポーネント |
| FfmpegInstallGuide | Dialog or Modal/Left | Modal コンポーネント |
| LibraryInstallGuide | Dialog or Modal/Center | Modal コンポーネント |
| ThemeToggle | Icon Button (Ghost) | Sun/Moon アイコンボタン |
| LanguageSwitcher | Button (Ghost) | テキストボタン |
| Footer | Frame + Text | カスタムフレーム |

---

## 3. デザイン仕様

### レイアウト仕様

- **最大幅**: 896px（max-w-4xl）
- **水平パディング**: 16px
- **PresetGrid**: 2列（モバイル）→ 3列（タブレット）→ 4列（デスクトップ）
- **フォーム**: 1列（モバイル）→ 2列（デスクトップ）

### カラートークン（oklch）

**ライトテーマ:**
- Background: oklch(0.99 0.005 280)
- Foreground: oklch(0.25 0.02 280)
- Primary: oklch(0.68 0.12 290) (ラベンダー)
- Secondary: oklch(0.72 0.1 350) (ローズ)
- Accent: oklch(0.82 0.1 170) (ミント)

**ダークテーマ:**
- Background: oklch(0.18 0.02 280)
- Foreground: oklch(0.93 0.01 280)
- Primary: oklch(0.72 0.2 330) (マゼンタ)
- Accent: oklch(0.78 0.15 195) (シアン)

### タイポグラフィ

- `--text-xs`: clamp(12px, ..., 13px)
- `--text-sm`: clamp(14px, ..., 15px)
- `--text-base`: clamp(16px, ..., 17px)
- `--text-lg`: clamp(18px, ..., 19px)
- `--text-xl`: clamp(20px, ..., 22px)
- `--text-2xl`: clamp(24px, ..., 26px)
- `--text-3xl`: clamp(30px, ..., 33px)

---

## 4. 再現手順（提案）

### Phase 1: デスクトップ画面（ライトテーマ）

1. 新規 .pen ファイル作成 or 現在のファイルにフレーム追加
2. 896px 幅のメインフレームを作成
3. Header セクション構築
4. DropZone エリア構築
5. ModeSwitch + PresetGrid 配置
6. PresetCustomizer フォーム構築
7. CommandOutput セクション構築
8. Footer 配置

### Phase 2: モバイル画面（オプション）

1. 375px 幅のフレームを別途作成
2. 2列グリッドのプリセットカード
3. 下部固定の ActionButtons バー

### Phase 3: ダークテーマ（オプション）

1. デスクトップ画面を複製
2. Pencil の変数機能でダークテーマのカラーを設定
3. 背景・テキスト・ボーダーのカラーを切替

### Phase 4: モーダル状態（オプション）

1. PathGuideModal の開いた状態
2. FfmpegInstallGuide の開いた状態
3. LibraryInstallGuide の開いた状態

---

## 5. 工数見積もり

| フェーズ | 工数 |
|---------|------|
| デスクトップ画面（ライトテーマ） | 30-60分 |
| モバイル画面 | 20-30分 |
| ダークテーマバリアント | 20-30分 |
| モーダル状態 | 15-20分 |
| **合計** | **1.5-2.5時間** |

---

## 6. 制約事項

- **レスポンシブ**: Pencil は固定幅デザイン。複数フレームで表現
- **インタラクション**: 静的デザインのみ。フォーム操作やドロップダウン展開は状態ごとにフレームを分ける
- **アニメーション**: Pencil 上では再現不可
- **Lucide アイコン**: Pencil のアイコンセットから類似アイコンを選択 or SVG として配置
