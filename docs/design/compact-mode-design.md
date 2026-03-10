---
title: "コンパクトモード設計書"
description: "PWAスタンドアロン時のウィンドウ1:3縦長リサイズとUI圧縮機能の設計"
category: "design"
created: "2026-03-11"
updated: "2026-03-11"
---

# コンパクトモード設計書

## 1. 概要

PWAとしてインストールされたアプリにおいて、ウィンドウを1:3の縦長アスペクト比にリサイズし、同時にUIをコンパクト化してスクロールを最小限にする機能。

### 目的

- スマートフォン的な縦長レイアウトで操作に集中できる環境を提供
- 不要な情報（サブタイトル、プリセット説明文）を非表示にし、画面効率を最大化
- PWAインストールの付加価値として差別化

### 対象環境

- PWAスタンドアロンモード（`display-mode: standalone`）でのみ有効
- 通常ブラウザでは機能自体が非表示

---

## 2. 機能仕様

### 2.1 トグルボタン

| 項目 | 内容 |
|------|------|
| 配置 | ヘッダー右側（LanguageSwitcher / ThemeToggle の隣） |
| アイコン | `Smartphone`（lucide-svelte）— 縦長端末を示唆 |
| 表示条件 | `display-mode: standalone` が `true` の場合のみ |
| 動作 | クリックでコンパクトモードのON/OFFをトグル |

### 2.2 ウィンドウリサイズ

| 項目 | 内容 |
|------|------|
| アスペクト比 | 1:3（幅:高さ） |
| API | `window.resizeTo(width, height)` |
| 算出ロジック | 画面高さ基準で計算し、はみ出しを防止 |

**リサイズ計算:**

```typescript
function calculateCompactSize(): { width: number; height: number } {
  const screenH = window.screen.availHeight;
  const screenW = window.screen.availWidth;
  const ratio = 3; // height / width = 3

  // 画面高さに収まるよう計算
  let h = Math.min(screenH, Math.round(screenW * ratio));
  let w = Math.round(h / ratio);

  // 画面高さを超える場合は高さ基準で再計算
  if (h > screenH) {
    h = screenH;
    w = Math.round(h / ratio);
  }

  return { width: w, height: h };
}
```

**復元:** トグル前のウィンドウサイズを保持し、解除時に `resizeTo` で元サイズに戻す。

### 2.3 UI圧縮（コンパクトモード ON 時の変更）

| 対象 | 通常時 | コンパクト時 |
|------|--------|-------------|
| ヘッダー タイトル | `text-xl` | `text-sm` |
| ヘッダー サブタイトル | 表示 | 非表示 |
| ヘッダー トグルアイコン | Smartphone（OFF） | Monitor + `bg-primary/10`（ON） |
| PresetCard レイアウト | Subgrid（`row-span-2`） | 独自 `flex items-center`（均一高さ） |
| PresetCard 説明文 | 表示 | 非表示 |
| PresetCard タイトル | `text-sm` | `text-sm`（カード内パディング半減） |
| PresetCard パディング | `px-6 py-6` | `px-3 py-2` |
| Footer パディング | `py-4` | `py-1` |
| Footer モバイル底余白 | 動的（CSS変数 `--mobile-bar-h` + 余白） | 同左 |
| +page.svelte セクション間余白 | `space-y-6` | `space-y-2` |
| +page.svelte 底余白 | `pb-20` | `pb-6` |

### 2.4 非PWA環境での動作

通常ブラウザでは:
- トグルボタンは**レンダリングされない**
- `CompactStore.isPWA` が `false` のため、全コンポーネントは通常表示のまま
- 既存UIへの影響は一切なし

---

## 3. 技術設計

### 3.1 新規ファイル

#### `src/lib/stores/compact.svelte.ts` — CompactStore

```typescript
class CompactStore {
  // --- 状態 ---
  isCompact = $state(false);
  isPWA = $state(false);

  // トグル前のウィンドウサイズを保持（復元用）
  private previousSize: { width: number; height: number } | null = null;

  /** onMount 内で呼び出す */
  init(): void {
    this.isPWA =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
  }

  /** コンパクトモードをトグル */
  toggle(): void {
    if (!this.isPWA) return;

    if (this.isCompact) {
      // 復元
      if (this.previousSize) {
        window.resizeTo(this.previousSize.width, this.previousSize.height);
      }
      this.isCompact = false;
    } else {
      // コンパクト化
      this.previousSize = {
        width: window.outerWidth,
        height: window.outerHeight,
      };
      const { width, height } = this.calculateCompactSize();
      window.resizeTo(width, height);
      this.isCompact = true;
    }
  }

  private calculateCompactSize(): { width: number; height: number } {
    const screenH = window.screen.availHeight;
    const ratio = 3;

    let h = screenH;
    let w = Math.round(h / ratio);

    return { width: w, height: h };
  }
}

export const compactStore = new CompactStore();
```

### 3.2 変更ファイル

#### `src/lib/components/layout/Header.svelte`

- `compactStore` をインポート
- LanguageSwitcher / ThemeToggle の隣にトグルボタンを追加
- `isPWA` が `true` の場合のみボタンを描画
- サブタイトル `<p>` を `{#if !compactStore.isCompact}` で条件レンダリング

#### `src/lib/components/preset/PresetCard.svelte`

- `compactStore` をインポート
- `Card.Content`（説明テキスト）を `{#if !compactStore.isCompact}` で条件レンダリング
- Subgrid の `row-span` を `compactStore.isCompact` で切替:
  - 通常: `row-span-2 grid grid-rows-subgrid`
  - コンパクト: `row-span-1`（Subgrid 不要）

#### `src/routes/+layout.svelte`

- `onMount` 内で `compactStore.init()` を呼び出し（PWA判定）

#### `src/routes/+page.svelte`

- セクション間余白: `space-y-6` → コンパクト時 `space-y-2`

#### `src/routes/+page.svelte`（モバイル固定バー計測）

- `ResizeObserver` でモバイル固定バーの高さを計測
- CSS変数 `--mobile-bar-h` を `document.documentElement` に設定
- テキスト折り返しなどによる高さ変化にも動的に追従

#### `src/lib/components/layout/Footer.svelte`

- パディング圧縮: `py-4` → コンパクト時 `py-1`（クラスベース）
- モバイル底余白: CSS変数 `--mobile-bar-h` を参照し `calc(var(--mobile-bar-h, 4rem) + 0.75rem)` で動的計算
- デスクトップ（`min-width: 640px`）では `padding-bottom: 0`（メディアクエリ）

#### `src/lib/i18n/ja.json` / `en.json`

```json
// ja.json
"header.compactMode": "コンパクト表示",
"header.normalMode": "通常表示"

// en.json
"header.compactMode": "Compact view",
"header.normalMode": "Normal view"
```

### 3.3 PWA判定方式

```typescript
// CSS メディアクエリ（推奨）
window.matchMedia('(display-mode: standalone)').matches

// iOS Safari フォールバック
(window.navigator as any).standalone === true
```

**注意:** `window` はブラウザ専用APIのため、`onMount` 内で実行すること（Svelte 5 ルール準拠）。

---

## 4. 動作フロー

```
ユーザーがヘッダーのトグルボタンをクリック
  │
  ├─ isCompact === false（通常 → コンパクト）
  │    ├─ 現在のウィンドウサイズを previousSize に保存
  │    ├─ window.resizeTo(screenH/3, screenH) 実行
  │    ├─ isCompact = true
  │    ├─ サブタイトル非表示
  │    ├─ PresetCard 説明文非表示
  │    ├─ セクション間余白圧縮（space-y-6 → space-y-2）
  │    └─ Footer パディング圧縮
  │
  └─ isCompact === true（コンパクト → 通常）
       ├─ window.resizeTo(previousSize) で復元
       ├─ isCompact = false
       └─ 全UI要素を通常表示に戻す
```

---

## 5. 制約・注意事項

| 項目 | 内容 |
|------|------|
| macOS Chrome | `window.resizeTo()` が制限される場合がある |
| iOS Safari | スタンドアロンモードでも `resizeTo` は動作しない |
| Windows Chrome | 概ね動作する |
| SSR | `window` は `onMount` 内でのみ使用（SvelteKit SSR 制約） |
| `$state` Proxy | `previousSize` はプリミティブオブジェクトのため `structuredClone` 問題なし |

---

## 6. 計測指標（GA4）

| イベント名 | 発火タイミング |
|-----------|---------------|
| `compact_mode_on` | コンパクトモード有効化時 |
| `compact_mode_off` | コンパクトモード解除時 |
| `pwa_compact_available` | PWAスタンドアロンでアプリ起動時 |

---

## 7. 今後の拡張（Phase 2 以降）

- **Chrome拡張版リサイザー**: `chrome.windows.update()` による確実なリサイズ → `docs/design/chrome-extension-design.md`
- **サイズプリセット**: iPhone / Pixel / タブレット等の端末サイズ選択
- **自動コンパクト**: ウィンドウ幅が一定以下になったら自動的にコンパクト表示
