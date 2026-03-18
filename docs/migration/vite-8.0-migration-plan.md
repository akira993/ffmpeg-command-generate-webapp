---
title: "Vite 8.0 移行計画書"
description: "Vite 7.3.1 から 8.0.0 への移行計画・ブロッカー状況・実行手順"
category: "migration"
created: "2026-03-18"
updated: "2026-03-18"
---

# Vite 8.0 移行計画書

**作成日**: 2026-03-18
**現行バージョン**: Vite 7.3.1
**移行先バージョン**: Vite 8.0.0
**ステータス**: **待機中**（`@tailwindcss/vite` の安定リリース待ち）

---

## 1. 背景

Vite 8.0.0 が 2026-03-12 にリリースされた。主な変更は esbuild/Rollup から **Rolldown/Oxc** への移行で、10-30x の高速ビルドが期待できる。本プロジェクト（SvelteKit 2 + Svelte 5 + Tailwind CSS v4）をアップデートする。

---

## 2. ブロッカー: `@tailwindcss/vite`

| パッケージ | 最新安定版 | peerDependencies | Vite 8 対応 |
|---|---|---|---|
| `@tailwindcss/vite` | 4.2.1 | `^5 \|\| ^6 \|\| ^7` | **未対応** |
| `@tailwindcss/vite` (insiders) | `0.0.0-insiders.f302fce` | `^5.2.0 \|\| ^6 \|\| ^7 \|\| ^8` | 対応済み |

- tailwindcss/tailwindcss PR #19790（2026-03-12 マージ済み）で Vite 8 対応コードが追加されている
- insiders ビルドには反映済みだが、正式リリース（4.2.2 or 4.3.0）はまだ出ていない
- **決定: 安定リリースを待つ**（insiders や `--legacy-peer-deps` は使わない）

### リリース確認方法

```bash
npm view @tailwindcss/vite@latest version peerDependencies
# peerDependencies に ^8 が含まれていればアップデート可能
```

---

## 3. 互換性マトリクス

| パッケージ | 現在 | 更新後 | Vite 8 対応 |
|---|---|---|---|
| `vite` | ^7.3.1 | ^8.0.0 | ✅ |
| `@sveltejs/vite-plugin-svelte` | ^6.2.4 | ^7.0.0 | ✅ `^8.0.0` |
| `@sveltejs/kit` | ^2.50.2 | ^2.55.0+ | ✅ `^8.0.0` |
| `vitest` | ^4.0.18 | ^4.1.0+ | ✅ `^8.0.0-0` |
| `@sveltejs/adapter-vercel` | ^6.3.1 | ^6.3.3+ | ✅ (間接) |
| `@sveltejs/adapter-auto` | ^7.0.0 | ^7.0.1+ | ✅ (間接) |
| `storybook` | ^10.2.13 | ^10.2.19+ | ✅ `^8.0.0` |
| `@storybook/sveltekit` | ^10.2.13 | ^10.2.19+ | ✅ `^8.0.0` |
| `tailwindcss` | ^4.1.18 | 変更不要 | ✅ (Vite 非依存) |
| `@tailwindcss/vite` | ^4.1.18 | **待機中** | ❌ (4.2.1 時点) |

### 環境要件

- **Node.js**: 20.19+ or 22.12+ → 現在 22.21.1 ✅
- **ブラウザターゲット**: Chrome 111+, Firefox 114+, Safari 16.4+（Vite 7 の Safari 16.0 から若干上昇）

---

## 4. プロジェクトへの影響分析

### 影響なし（該当しない変更）

- `esbuild` / `rollupOptions` のカスタム設定 → なし（`vite.config.ts` は plugins のみ）
- `build.commonjsOptions` → 使っていない
- UMD/IIFE/AMD/SystemJS 出力 → 使っていない
- `esbuild.supported` → 使っていない
- プロパティマングリング → 使っていない
- `import.meta.hot.accept` with URL → 使っていない

### 注意点

| 項目 | 影響度 | 詳細 |
|------|--------|------|
| CJS interop の変更 | 中 | デフォルトインポートの挙動が統一される。`sveltekit-i18n`（CJS）が影響を受ける可能性 |
| CSS minification | 低 | Lightning CSS がデフォルトに。oklch() のみ使用のため問題なしの見込み |
| ブラウザターゲット引き上げ | 低 | Safari 16.0 → 16.4。実質的に影響軽微 |

---

## 5. ブロッカー解消後の実行手順

### Step 1: パッケージ更新

```bash
npm install vite@^8.0.0 @sveltejs/vite-plugin-svelte@^7.0.0 @sveltejs/kit@^2.55.0 vitest@^4.1.0 @tailwindcss/vite@latest
```

※ Storybook 関連（`^10.2.13`）は semver で自動解決される（Vite 8 対応済み）
※ `@sveltejs/adapter-vercel`, `@sveltejs/adapter-auto` も semver 範囲内で自動解決

### Step 2: 設定ファイル確認

- `vite.config.ts` — 変更不要（plugins のみのシンプル構成で Vite 8 互換）
- `svelte.config.js` — 変更不要
- `tsconfig.json` — 変更不要

### Step 3: 検証

```bash
# 1. 開発サーバー起動確認
npm run dev

# 2. SSG ビルド + プレビュー
npm run build && npm run preview

# 3. 型チェック
npm run check

# 4. ユニットテスト
npm run test

# 5. CSS lint
bash scripts/lint-css.sh

# 6. Storybook 起動確認
npm run storybook

# 7. Storybook ビルド
npm run build-storybook
```

### Step 4: UI 目視確認

Chrome DevTools MCP で PC + モバイル表示を確認する。

### Step 5: コミット & デプロイ

```bash
git add package.json package-lock.json
git commit -m "chore: update Vite 7.3 → 8.0 and related dependencies"
git push origin main
```

---

## 6. 対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `package.json` | バージョン更新のみ |
| `package-lock.json` | `npm install` で自動更新 |
| `vite.config.ts` | 変更不要（確認のみ） |

---

## 7. リスクと対策

| リスク | 対策 |
|--------|------|
| `sveltekit-i18n` の CJS interop 問題 | Step 3 の検証で `npm run dev` + `npm run build` で確認。問題があればインポート形式を調整 |
| CSS minification 差異 | `bash scripts/lint-css.sh` + 目視確認で検証 |
| Storybook 互換性 | `npm run build-storybook` で確認。失敗時は Storybook のバージョンを明示的に更新 |

---

## 8. 参考リンク

- [Vite 8.0 リリースノート](https://vite.dev/blog/announcing-vite8)
- [Rolldown](https://rolldown.rs/) — Rust ベースの Rollup 互換バンドラー
- [Oxc](https://oxc-project.github.io/) — Rust ベースの JS ツールチェーン
- [tailwindcss PR #19790](https://github.com/tailwindlabs/tailwindcss/pull/19790) — Vite 8 対応
