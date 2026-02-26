# RabeeUI 移行調査レポート

> 調査日: 2026-02-20
> 対象: https://rabeeui.com/docs

## Context

現在のプロジェクトは shadcn-svelte (bits-ui v2.15.5 ベース) を使用。RabeeUI への全面差替の可否・工数・破壊度を調査した。Chrome MCP で実際のドキュメントページを開き、コンポーネントの全ソースコードを直接確認して評価を行った。

---

## 1. RabeeUI 技術スタック（確定情報）

### Svelte 5 対応: 確定

ブラウザで Button / Select / Dialog / Slider / Tabs のソースコードを全文確認。すべてのコンポーネントで以下を使用:

| Svelte 5 機能 | 使用状況 |
|---|---|
| `$props()` | 全コンポーネントで使用 |
| `$state()` | 全コンポーネントで使用 |
| `$derived()` / `$derived.by()` | 使用 |
| `$bindable()` | Select の `value`, Dialog の `open` 等 |
| `$effect()` | Dialog のイベントリスナー管理等 |
| `Snippet<[]>` 型 | children / optionContent 等 |
| `{#snippet}` / `{@render}` | Select の optionContent, Slider の minContent/maxContent |
| `<script module lang="ts">` | 型・CVA 定義の分離 |

### TypeScript 対応: 確定

- すべてのコンポーネントが `<script lang="ts">` + `<script module lang="ts">`
- `interface ButtonProps`, `interface SelectProps`, `interface DialogProps` 等の型定義あり
- `VariantProps<typeof T>` で CVA からの型推論
- `Snippet<[]>`, `ClassValue`, `HTMLButtonAttributes` 等の Svelte/標準型を活用

### Tailwind CSS v4 対応: 確定

- セットアップページの CSS が `@theme { }` ディレクティブを使用（= Tailwind v4 構文）
- `.dark` クラスによるダークテーマ切替（`@layer theme` 内で定義）

### 依存関係

| パッケージ | 用途 |
|---|---|
| `@lucide/svelte` | アイコン（現プロジェクトも使用中） |
| `class-variance-authority` (CVA) | バリアントスタイル管理（現プロジェクトは `tailwind-variants` を使用） |
| Tailwind CSS | スタイリング基盤 |

**注意**: 現プロジェクトは `tailwind-variants` (tv) を使用、RabeeUI は `class-variance-authority` (cva) を使用。両方 Tailwind のバリアント管理ライブラリだが API が異なる。

### bits-ui 依存: なし

RabeeUI は bits-ui を一切使用しない。Select / Dialog / Slider 等すべて独自実装（ネイティブ HTML + ARIA 属性）。

---

## 2. コンポーネント API 詳細比較

### Button

| | 現在 (shadcn-svelte) | RabeeUI |
|---|---|---|
| スタイル管理 | `tailwind-variants` (tv) | `class-variance-authority` (cva) |
| バリアント | default, destructive, outline, secondary, ghost, link | primary, secondary, success, danger |
| サイズ | default, sm, lg, icon, icon-sm, icon-lg | small, medium, large |
| トーン | なし | solid, ghost |
| 子要素 | `children?: Snippet` | `children?: Snippet<[]>` |
| 移行難易度 | **低** -- バリアント名のマッピングのみ |

### Select

| | 現在 (bits-ui ベース) | RabeeUI |
|---|---|---|
| 構造 | 11 サブコンポーネント (Root/Trigger/Content/Item/...) | **単一コンポーネント** |
| 使い方 | `<Select.Root><Select.Trigger>...` | `<Select options={[...]} bind:value />` |
| オプション定義 | Item コンポーネントの羅列 | `SelectOptionItem[]` 配列 |
| カスタム描画 | Slot / Snippet | `optionContent` Snippet prop |
| アクセシビリティ | bits-ui (role=listbox, aria-*) | 独自実装 (role=combobox/listbox, aria-*, keyboard) |
| 移行難易度 | **高** -- API が根本的に異なる。使用箇所すべてで書き直し |

### Dialog

| | 現在 (bits-ui ベース) | RabeeUI |
|---|---|---|
| 構造 | 10 サブコンポーネント (Root/Trigger/Content/...) | **単一コンポーネント** |
| 開閉制御 | `Dialog.Root` の open prop | `open` prop + `$bindable` |
| ボタン | 自由配置 | `positiveText` / `negativeText` 固定 |
| コールバック | 個別イベント | `onClick(result: boolean)` |
| Portal | bits-ui Portal | CSS `fixed` で直接配置 |
| 移行難易度 | **高** -- 現在の Dialog はコンテンツを自由に構成しているが、RabeeUI は positiveText/negativeText のボタンが固定 |

### Slider

| | 現在 (bits-ui ベース) | RabeeUI |
|---|---|---|
| 構造 | Root/Range/Thumb サブコンポーネント | **単一コンポーネント** |
| ラベル | なし | minContent / maxContent Snippet |
| ポインター操作 | bits-ui 内部 | 独自 PointerEvent 処理 |
| 移行難易度 | **中** |

### Tabs

| | 現在 (bits-ui ベース) | RabeeUI |
|---|---|---|
| 構造 | Root/List/Trigger/Content | **単一コンポーネント** |
| コンテンツ切替 | `Tabs.Content` に content を配置 | `currentTabId` のみ（コンテンツ切替は自前） |
| アニメーション | なし | `crossfade` トランジション |
| 移行難易度 | **中** |

### 存在しないコンポーネント

| コンポーネント | 代替案 |
|---|---|
| Toggle | RabeeUI の **Switch** で代替可能 |
| ToggleGroup | RabeeUI の **Segmented Control** で代替可能 |
| Badge | RabeeUI の **Label** で代替可能（tone prop でカラー指定） |

---

## 3. デザイントークンの差異

### カラー体系

| | 現在 | RabeeUI |
|---|---|---|
| カラー形式 | **oklch()** のみ（CI で強制） | **#hex** |
| トークン命名 | `--color-primary`, `--color-background` 等 | `--color-base-container-default`, `--color-base-foreground-default` 等 |
| ダークモード | `.dark` クラス | `.dark` クラス（同じ） |
| テーマ定義 | `@theme` + `@custom-variant` | `@theme` + `@layer theme` |

**重要**: 現プロジェクトは oklch() を CI で強制しているため、RabeeUI の `#hex` カラーをそのまま使うと CSS lint が失敗する。すべてのカラーを oklch() に変換する追加作業が必要。

### ファイル構造

| | 現在 | RabeeUI |
|---|---|---|
| パス | `$lib/components/ui/{component}/` | `$lib/components/ui/atoms/` / `modals/` |
| 1コンポーネント | 複数ファイル（本体 + index.ts） | **単一ファイル** |
| エクスポート | `index.ts` から named export | ファイルから直接 default import |

---

## 4. アクセシビリティ比較

| 機能 | bits-ui (現在) | RabeeUI |
|---|---|---|
| ARIA ロール | 完全対応 | 対応あり（Select: combobox/listbox, Slider: slider） |
| キーボード操作 | bits-ui が包括的に対応 | 部分対応（Select: Arrow/Enter, Slider: Arrow, Dialog: Escape） |
| フォーカス管理 | bits-ui のフォーカストラップ | Dialog にフォーカストラップなし |
| スクリーンリーダー | bits-ui テスト済み | 未確認 |

---

## 5. 移行工数見積もり

| フェーズ | 作業内容 | 工数 |
|---------|---------|------|
| 依存関係変更 | bits-ui 削除、CVA 追加 | 0.5日 |
| カラートークン変換 | RabeeUI の #hex を oklch() に変換 + CSS lint 通過 | 1日 |
| Button / Badge / Card / Input / Label / Separator 差替 | API 差分小、比較的容易 | 2-3日 |
| Select 差替 | API 根本変更、11サブコンポーネントから単一へ | 2-3日 |
| Dialog 差替 | API 根本変更、3つのモーダルを書き直し | 1.5-2日 |
| Slider / Tabs 差替 | API 変更中程度 | 1日 |
| Toggle から Switch, ToggleGroup から Segmented Control | 代替コンポーネントで再実装 | 1日 |
| カスタムコンポーネント修正 | 14種の import パス・props 変更 | 1.5-2日 |
| テスト・デバッグ | UI 視覚的リグレッション、アクセシビリティ確認 | 2-3日 |
| **合計** | | **12.5-16.5日（約2.5-3週間）** |

---

## 6. 総合評価

### リスク評価

| リスク項目 | 評価 |
|---|---|
| Svelte 5 互換性 | 確定対応 |
| TypeScript 対応 | 確定対応 |
| Tailwind CSS v4 | 確定対応 (@theme 使用) |
| oklch カラー互換 | #hex から oklch 変換必要 |
| アクセシビリティ | bits-ui より簡素（フォーカストラップなし等） |
| API 差分 | 大（Select / Dialog が根本的に異なる） |

### メリット

1. **bits-ui 依存の除去** -- ライブラリアップデートのリスク解消
2. **単一ファイル構成** -- 46ファイルから約13ファイルに大幅削減
3. **コードの所有権** -- すべてのコンポーネントを完全にコントロール可能
4. **CVA パターン** -- バリアントの定義が見通しやすい
5. **日本語最適化** -- 日本語テキストのサイジング・スペーシングを考慮

### デメリット

1. **oklch 変換が必須** -- CI が #hex を弾くため全カラー手動変換
2. **Select / Dialog の API 差分が大きい** -- 使用箇所の全面書き直し
3. **アクセシビリティが簡素** -- bits-ui のフォーカストラップ等を失う
4. **tailwind-variants から CVA 移行** -- スタイル管理ライブラリの変更
5. **手動メンテナンス** -- RabeeUI の更新は自分で取り込む

### 最終判断

| 項目 | 評価 |
|------|------|
| 実現可能か | 可能（技術的制約なし） |
| 工数 | 2.5-3週間 |
| 破壊度 | 高 -- UI レイヤー全面再構築 |
| 推奨か | 用途次第 |

**移行を推奨するケース:**
- bits-ui の依存を排除してコンポーネントを完全にコントロールしたい
- RabeeUI のデザイン言語・日本語最適化を活かしたい
- コンポーネントの構造をシンプルにしたい（46ファイルから13ファイル）

**移行を非推奨とするケース:**
- アクセシビリティ品質を維持・向上させたい（bits-ui の方が充実）
- 2-3週間の UI 凍結を許容できない
- oklch カラー変換のコストを避けたい
