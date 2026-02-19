# css-lint

`app.css` の CSS ルール違反（oklch 強制）をチェックする。

## 手順

1. `bash scripts/lint-css.sh` を実行する
2. 違反があれば該当行を特定して修正を提案する

## チェックルール（CIと同一）

| ルール | 禁止パターン | 許可パターン |
|--------|------------|------------|
| 色指定 | `#rrggbb`, `rgb()`, `rgba()`, `hsl()`, `hsla()` | `oklch(L C H)` のみ |
| グラデーション | `linear-gradient(deg, ...)` で `in oklab` なし | `linear-gradient(deg in oklab, ...)` |
| フォントサイズ | ハードコード `px`/`rem` 直書き | `var(--text-xs)` 〜 `var(--text-3xl)` |

## トークン早見表

### カラートークン
- `--color-background`, `--color-foreground`
- `--color-primary`, `--color-secondary`, `--color-accent`
- `--color-destructive`
- `--color-icon-{key}`, `--color-icon-{key}-bg`
  (key: emerald / teal / violet / blue / pink / amber / rose / orange)

### タイポグラフィトークン
- `--text-xs` (12-13px) / `--text-sm` (14-15px) / `--text-base` (16-17px)
- `--text-lg` (18-19px) / `--text-xl` (20-22px)
- `--text-2xl` (24-26px) / `--text-3xl` (30-33px)

## 修正例

```css
/* NG */
color: #ff0000;
background: linear-gradient(135deg, oklch(0.5 0.2 0), oklch(0.7 0.1 180));

/* OK */
color: oklch(0.58 0.24 20);
background: linear-gradient(135deg in oklab, oklch(0.5 0.2 0), oklch(0.7 0.1 180));
```
