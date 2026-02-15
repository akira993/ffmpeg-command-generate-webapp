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
| `--color-primary` | `oklch(0.72 0.25 330)` | ネオンマゼンタ |
| `--color-accent` | `oklch(0.78 0.15 195)` | ネオンシアン |
| `--color-destructive` | `oklch(0.58 0.24 20)` | ネオンレッド |

**特徴**: 低 Lightness (0.12-0.28) の暗い背景に、高 Chroma (0.15-0.25) のネオンアクセント。

---

## 3. タイポグラフィ

すべての文字サイズは `clamp()` でフルイド対応:

| トークン | 定義 | 最小 → 最大 |
|---------|------|-------------|
| `--text-xs` | `clamp(0.6875rem, 0.65rem + 0.1vw, 0.75rem)` | 11px → 12px |
| `--text-sm` | `clamp(0.8125rem, 0.775rem + 0.15vw, 0.875rem)` | 13px → 14px |
| `--text-base` | `clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)` | 15px → 16px |
| `--text-lg` | `clamp(1.0625rem, 1rem + 0.3vw, 1.125rem)` | 17px → 18px |
| `--text-xl` | `clamp(1.1875rem, 1.1rem + 0.4vw, 1.25rem)` | 19px → 20px |
| `--text-2xl` | `clamp(1.375rem, 1.25rem + 0.5vw, 1.5rem)` | 22px → 24px |
| `--text-3xl` | `clamp(1.75rem, 1.6rem + 0.65vw, 1.875rem)` | 28px → 30px |

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
