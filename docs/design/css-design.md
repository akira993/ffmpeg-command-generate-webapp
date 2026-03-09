---
title: "CSS Design System"
description: "oklchカラートークン・clamp()タイポグラフィ・ダークモード・グラデーションルール"
category: "design"
created: "2026-02-16"
updated: "2026-03-10"
---

# CSS Design System

> FFmpeg Command Generator のデザイントークン・テーマ設計仕様。
> CI/CD でルールを強制する。

---

## 1. 強制ルール

| # | ルール | CI チェック |
|---|--------|------------|
| 1 | 色指定は **`oklch()` のみ**。`#hex`, `rgb()`, `hsl()` 禁止 | `scripts/lint-css.sh` |
| 2 | グラデーションは **`in oklab`** 補間を使う | `scripts/lint-css.sh` |
| 3 | 文字サイズは **`clamp()`** ベースのトークンを使う | コードレビュー |
| 4 | トークン命名は**役割ベース** (`--color-bg`, `--color-surface`, `--color-primary`) | コードレビュー |

### 1.1 CI で自動チェックされる内容

```bash
# scripts/lint-css.sh が以下を検出するとエラー:
- app.css 内の #[0-9a-fA-F]{3,8} (hex color)
- app.css 内の rgb()/rgba()/hsl()/hsla()
- app.css 内の linear-gradient/radial-gradient で "in oklab" なしのもの
```

---

## 2. カラーシステム

### 2.1 色空間: OKLCH

すべての色は `oklch(L C H)` 形式で定義する。

- **L** (Lightness): 0 = 黒, 1 = 白
- **C** (Chroma): 0 = 無彩色, 高い = 鮮やか
- **H** (Hue): 0-360 の角度

### 2.2 Light テーマ: Pale-tone (ペールトーン)

| トークン | oklch | 説明 |
|---------|-------|------|
| `--color-background` | `oklch(0.985 0.006 290)` | 薄いラベンダー白 |
| `--color-foreground` | `oklch(0.22 0.01 280)` | ダークネイビー |
| `--color-primary` | `oklch(0.55 0.14 290)` | ソフトラベンダー |
| `--color-secondary` | `oklch(0.94 0.025 350)` | ペールローズ |
| `--color-accent` | `oklch(0.94 0.03 170)` | ペールミント |
| `--color-destructive` | `oklch(0.62 0.20 25)` | ソフトコーラル |

**特徴**: 高 Lightness (0.9+), 低 Chroma (0.01-0.04) で淡く柔らかい印象。

### 2.3 Dark テーマ: Cyberpunk (サイバーパンク)

| トークン | oklch | 説明 |
|---------|-------|------|
| `--color-background` | `oklch(0.13 0.02 280)` | ディープブルーブラック |
| `--color-foreground` | `oklch(0.92 0.01 260)` | ライトシルバー |
| `--color-primary` | `oklch(0.55 0.25 330)` | ディープマゼンタ (WCAG AAA) |
| `--color-accent` | `oklch(0.78 0.15 195)` | ネオンシアン |
| `--color-destructive` | `oklch(0.58 0.24 20)` | ネオンレッド |

**特徴**: 低 Lightness (0.12-0.28) の暗い背景に、高 Chroma (0.15-0.25) のネオンアクセント。

---

## 3. タイポグラフィ

すべての文字サイズは `clamp()` でフルイド対応:

| トークン | 定義 | 最小 → 最大 |
|---------|------|-------------|
| `--text-xs` | `clamp(0.75rem, 0.7rem + 0.15vw, 0.8125rem)` | 12px → 13px |
| `--text-sm` | `clamp(0.875rem, 0.82rem + 0.2vw, 0.9375rem)` | 14px → 15px |
| `--text-base` | `clamp(1rem, 0.94rem + 0.25vw, 1.0625rem)` | 16px → 17px |
| `--text-lg` | `clamp(1.125rem, 1.05rem + 0.3vw, 1.1875rem)` | 18px → 19px |
| `--text-xl` | `clamp(1.25rem, 1.15rem + 0.4vw, 1.375rem)` | 20px → 22px |
| `--text-2xl` | `clamp(1.5rem, 1.35rem + 0.55vw, 1.625rem)` | 24px → 26px |
| `--text-3xl` | `clamp(1.875rem, 1.7rem + 0.7vw, 2.0625rem)` | 30px → 33px |

### 3.1 適用ルール

```css
h1       → var(--text-2xl)
h2       → var(--text-xl)
h3       → var(--text-lg)
h4       → var(--text-base)
p, li    → var(--text-sm)
small    → var(--text-xs)
```

---

## 4. アイコンカラー

プリセットカードのアイコンは CSS カスタムプロパティで色管理:

| カラーキー | Light (bg / fg) | Dark (bg / fg) |
|-----------|-----------------|----------------|
| emerald | `oklch(0.94 0.04 160)` / `oklch(0.70 0.13 160)` | `oklch(0.22 0.05 155)` / `oklch(0.78 0.18 155)` |
| teal | `oklch(0.94 0.03 185)` / `oklch(0.68 0.10 185)` | `oklch(0.22 0.04 185)` / `oklch(0.78 0.15 185)` |
| violet | `oklch(0.93 0.04 295)` / `oklch(0.58 0.18 295)` | `oklch(0.20 0.06 295)` / `oklch(0.68 0.22 295)` |
| blue | `oklch(0.93 0.04 255)` / `oklch(0.60 0.16 255)` | `oklch(0.20 0.05 255)` / `oklch(0.72 0.18 255)` |
| pink | `oklch(0.94 0.04 350)` / `oklch(0.65 0.18 350)` | `oklch(0.22 0.06 340)` / `oklch(0.72 0.25 340)` |
| amber | `oklch(0.95 0.04 75)` / `oklch(0.75 0.14 75)` | `oklch(0.22 0.05 80)` / `oklch(0.82 0.18 80)` |
| rose | `oklch(0.94 0.04 15)` / `oklch(0.62 0.19 15)` | `oklch(0.22 0.06 15)` / `oklch(0.70 0.22 15)` |
| orange | `oklch(0.95 0.04 55)` / `oklch(0.72 0.16 55)` | `oklch(0.22 0.05 55)` / `oklch(0.78 0.18 55)` |

---

## 5. グラデーション

グラデーションは必ず `in oklab` 補間を使用:

```css
/* OK */
background: linear-gradient(135deg in oklab, oklch(0.55 0.14 290), oklch(0.65 0.18 330));

/* NG — CI で弾かれる */
background: linear-gradient(135deg, oklch(0.55 0.14 290), oklch(0.65 0.18 330));
```

---

## 6. ダークモード切替

### 6.1 FOUC (Flash of Unstyled Content) 防止

`app.html` に**インラインスクリプト**を配置し、CSS 描画前にテーマクラスを適用:

```html
<script>
  (function() {
    var theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

### 6.2 切替方式

- `.dark` クラスを `<html>` 要素に toggle
- `localStorage` に `'theme'` キーで永続化
- システム設定 (`prefers-color-scheme`) をフォールバック

---

## 7. ファイル構成

| ファイル | 役割 |
|---------|------|
| `src/app.css` | すべてのデザイントークン定義 (single source of truth) |
| `src/app.html` | FOUC 防止インラインスクリプト |
| `src/lib/components/common/ThemeToggle.svelte` | ダーク/ライト切替 UI |
| `scripts/lint-css.sh` | CSS ルール強制スクリプト (CI で実行) |
| `docs/css-design.md` | このドキュメント |

---

## 8. CI/CD チェック

GitHub Actions の `ci.yml` に以下のジョブが含まれる:

```yaml
- name: CSS lint (oklch enforcement)
  run: bash scripts/lint-css.sh
```

失敗条件:
- `app.css` に hex カラー (`#xxx`) が含まれる
- `app.css` に `rgb()` / `hsl()` が含まれる
- `app.css` に `in oklab` なしのグラデーションがある

---

## 9. CSS Subgrid レイアウト

### 9.1 解決する課題

プリセットカードはタイトルの行数がカードごとに異なる（例: 「GIF生成」= 1行、「画像圧縮（AVIF）」= 2行、「Image Compression (AVIF)」= 3行）。通常の Flexbox レイアウトでは、タイトル行数の違いにより **説明文（Card.Content）の開始位置がカード間でバラバラ** になる。

CSS Subgrid を使うことで、同じグリッド行にあるすべてのカードの **ヘッダー高さが最も高いカードに統一** され、説明文の開始位置が完全に揃う。

### 9.2 DOM 構造とクラス設計

```
PresetGrid (grid, grid-cols-2 lg:grid-cols-3 xl:grid-cols-4, gap-3)
│
├── wrapper div (row-span-2, grid, grid-rows-subgrid)  ← 1段目 subgrid
│     └── Card.Root (row-span-2, grid, grid-rows-subgrid, gap-0)  ← 2段目 subgrid
│           ├── Card.Header (flex, gap-2.5, pb-2)  ← Row 1
│           │     ├── Icon div (self-center)  ← 垂直中央
│           │     └── Card.Title (self-center)  ← 垂直中央
│           └── Card.Content  ← Row 2（全カードで開始位置が揃う）
│
├── wrapper div ...
│     └── Card.Root ...
│           ├── Card.Header ...
│           └── Card.Content ...
│
└── ...（8カード）
```

### 9.3 二重 Subgrid が必要な理由

CSS Subgrid は **直接の子要素** にしか行トラックを継承しない。しかし PresetGrid の直接の子は wrapper div であり、実際にヘッダーとコンテンツを持つのはその孫要素の Card.Root 内部にある。

```
PresetGrid → wrapper div → Card.Root → Card.Header / Card.Content
             ↑ 1段目        ↑ 2段目
             subgrid         subgrid
```

1段目（wrapper div）と2段目（Card.Root）の**両方**に `row-span-2 grid grid-rows-subgrid` を指定することで、PresetGrid が定義した2行トラックが Card.Header / Card.Content まで貫通する。

### 9.4 各レイヤーの役割

| レイヤー | Tailwind クラス | 役割 |
|---------|----------------|------|
| **PresetGrid** | `grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4` | 列数・間隔を定義。暗黙の行トラックは `auto` サイズ |
| **wrapper div** | `row-span-2 grid grid-rows-subgrid` | 2行トラックを占有し、subgrid で親の行サイズを継承 |
| **Card.Root** | `row-span-2 grid grid-rows-subgrid gap-0` | 同じく2行を subgrid で継承。`gap-0` で内部間隔を親に委譲 |
| **Card.Header** | `flex gap-2.5 pb-2` | Row 1 を占有。flex で横並び。`pb-2` で下余白を確保 |
| **Card.Content** | （デフォルト） | Row 2 を占有。全カードで開始位置が揃う |

### 9.5 Card.Header 内部のレイアウト戦略

#### 問題: grid vs flex

Card.Header のベースクラス（shadcn/ui）は `grid auto-rows-min grid-rows-[auto_auto] items-start` だが、Subgrid 環境下でアイコンとタイトルを横並びにするには **flex に変更** する必要がある。`class` prop で `flex gap-2.5 pb-2` を渡すと、Tailwind Merge (`twMerge`) により `grid` → `flex` が正しくオーバーライドされる。

#### アイコン・タイトルの垂直中央揃え

Subgrid により Card.Header の高さは **同じ行で最もタイトルが長いカードに合わせて拡張** される。例えば4列中1枚が3行タイトルなら、残り3枚のヘッダーも同じ高さになる。

この余剰スペース内でアイコンとタイトルを垂直中央に配置するため、**`self-center`** を使用:

```svelte
<!-- アイコン: self-center で垂直中央 -->
<div class="flex h-8 w-8 shrink-0 self-center items-center justify-center rounded-lg" ...>
  <IconComponent size={18} strokeWidth={2} />
</div>

<!-- タイトル: self-center で垂直中央 -->
<Card.Title class="self-center text-sm">...</Card.Title>
```

**`items-center` ではなく `self-center` を使う理由:**

`items-center` を Card.Header に指定すると、flex コンテナの交差軸方向に全子要素を一括で中央揃えにする。これは一見正しいが、**Subgrid で高さが均等化される前提** では問題ない。ただし、将来的にヘッダー内に追加要素（バッジ等）が入る可能性を考慮し、各要素が独立して配置を制御できる `self-center` を採用した。

### 9.6 gap 制御

| 場所 | gap の値 | 説明 |
|------|----------|------|
| PresetGrid | `gap-3`（0.75rem） | カード間の列間隔・行間隔を一括定義 |
| Card.Root | `gap-0` | subgrid 使用時は親の gap が伝搬するため、Card.Root 自体の gap は 0 に |
| Card.Header 内 | `gap-2.5`（0.625rem） | アイコンとタイトル間の横間隔 |

**重要**: Card.Root のベースクラスに `gap-6` があるが、`gap-0` で上書きしている。これにより Card.Header と Card.Content 間の間隔は PresetGrid の `gap-3` のみで制御される。

### 9.7 レスポンシブ動作

| ブレークポイント | 列数 | 1行あたりのカード数 |
|----------------|------|-------------------|
| デフォルト（〜1023px） | 2列 | 2 |
| `lg`（1024px〜） | 3列 | 3 |
| `xl`（1280px〜） | 4列 | 4 |

列数が変わるとグリッド行の構成も変わるが、Subgrid は常に同じ行内のカード同士でヘッダー高さを揃える。

### 9.8 フォールバック（非対応ブラウザ）

CSS Subgrid は 2023年12月以降の主要ブラウザで Baseline 対応済み（Chrome 117+, Firefox 71+, Safari 16+, Edge 117+）。非対応ブラウザでは:

- `grid-rows: subgrid` が無視される
- Card.Root のベースクラス `flex flex-col` がフォールバックとして機能
- ヘッダー高さは揃わないが、各カード単体のレイアウトは崩れない（グレースフルデグラデーション）

### 9.9 Storybook での検証

`PresetCard.stories.svelte` に **SubgridAlignment** ストーリーを用意:

```svelte
<Story name="SubgridAlignment">
  {#snippet template()}
    <div class="grid grid-cols-4 gap-3">
      {#each presetList.slice(0, 4) as preset}
        <PresetCard {preset} selected={false} onselect={() => {}} />
      {/each}
    </div>
  {/snippet}
</Story>
```

4列固定でタイトル行数の異なるカードを並べ、Card.Content の開始位置とアイコン・タイトルの垂直中央揃えを視覚的に確認できる。
