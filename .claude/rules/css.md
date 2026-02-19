# CSS ルール

## 強制ルール（CI でチェック済み）

1. **色は `oklch()` のみ** — `#hex`, `rgb()`, `hsl()` は禁止
2. **グラデーションは `in oklab`** — `linear-gradient(135deg in oklab, ...)` 必須
3. **フォントサイズは `clamp()` トークン** — `var(--text-xs)` 〜 `var(--text-3xl)`
4. **命名は役割ベース** — `--color-bg`, `--color-primary` 等

違反すると `bash scripts/lint-css.sh` と GitHub Actions が失敗する。

## トークン早見表

カラー: `--color-background`, `--color-foreground`, `--color-primary`, `--color-secondary`, `--color-accent`, `--color-destructive`

アイコンカラー: `--color-icon-{key}` / `--color-icon-{key}-bg`
key: `emerald` / `teal` / `violet` / `blue` / `pink` / `amber` / `rose` / `orange`

テキスト: `--text-xs`(12-13px) / `--text-sm`(14-15px) / `--text-base`(16-17px) / `--text-lg`(18-19px) / `--text-xl`(20-22px) / `--text-2xl`(24-26px) / `--text-3xl`(30-33px)

## 修正例

```css
/* NG */ color: #ff0000;
/* OK */ color: oklch(0.58 0.24 20);

/* NG */ background: linear-gradient(135deg, oklch(0.5 0.2 0), oklch(0.7 0.1 180));
/* OK */ background: linear-gradient(135deg in oklab, oklch(0.5 0.2 0), oklch(0.7 0.1 180));
```
