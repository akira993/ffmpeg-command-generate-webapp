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
- `--text-xs` (11-12px) / `--text-sm` (13-14px) / `--text-base` (15-16px)
- `--text-lg` (17-18px) / `--text-xl` (19-20px)
- `--text-2xl` (22-24px) / `--text-3xl` (28-30px)

## 修正例

```css
/* NG */
color: #ff0000;
background: linear-gradient(135deg, oklch(0.5 0.2 0), oklch(0.7 0.1 180));

/* OK */
color: oklch(0.58 0.24 20);
background: linear-gradient(135deg in oklab, oklch(0.5 0.2 0), oklch(0.7 0.1 180));
```
