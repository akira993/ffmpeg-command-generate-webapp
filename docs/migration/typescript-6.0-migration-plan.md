---
title: "TypeScript 6.0 移行計画書"
description: "TypeScript 5.9 から 6.0 への移行計画と影響範囲の分析（移行完了）"
category: "migration"
created: "2026-02-20"
updated: "2026-03-25"
---

# TypeScript 6.0 移行計画書

**作成日**: 2026-02-20
**移行実施日**: 2026-03-25
**TS 6.0 正式リリース日**: 2026-03-23
**移行前バージョン**: TypeScript 5.9.3 → **移行後: TypeScript 6.0.2**

---

## 1. 背景

TypeScript 6.0 は **JavaScript ベースで書かれた最後のメジャーバージョン** である。
次の TypeScript 7.0（2026 Q2〜夏予定）は Go 言語で完全に書き直され、10 倍の高速化が見込まれる。
6.0 はその橋渡しとして、レガシーオプションの削除・デフォルト値の厳格化が主眼。

---

## 2. 移行前のプロジェクト構成

| 項目 | 移行前 | 移行後 |
|------|--------|--------|
| TypeScript | 5.9.3 | **6.0.2** |
| svelte-check | 4.3.6 | **4.4.5** |
| フレームワーク | SvelteKit 2 + Svelte 5 (Runes) | 変更なし |
| ビルドツール | Vite 7.3 | 変更なし |
| テスト | Vitest 4.0.18 | 変更なし |
| CSS | Tailwind CSS v4 | 変更なし |
| デプロイ先 | Vercel（SSG, `adapter-vercel`） | 変更なし |
| `package.json` `type` | `"module"`（ESM） | 変更なし |
| CI | GitHub Actions（Node 20） | **Node 22 に引き上げ** |

---

## 3. TS 6.0 の主要な破壊的変更と本プロジェクトへの影響

### 3.1 影響あり（対応済み）

| 変更 | 詳細 | 対応内容 |
|------|------|----------|
| **`types` デフォルトが `[]` に** | `@types/*` が自動検出されなくなる | `tsconfig.json` に `"types": ["node"]` を追加 |
| **`esModuleInterop` 常時有効** | `false` に設定不可 | `tsconfig.json` から冗長な `"esModuleInterop": true` を削除 |

### 3.2 影響なし（確認済み）

| 変更 | 確認結果 |
|------|----------|
| `strict` デフォルト `true` | 既に `strict: true` を明示設定済み |
| `module` デフォルト `es2022` | `.svelte-kit/tsconfig.json` で `"module": "esnext"` が上書き |
| `target` デフォルト `es2025` | `.svelte-kit/tsconfig.json` で `"target": "esnext"` が上書き |
| `moduleResolution` デフォルト `bundler` | 既に `"bundler"` を明示設定済み |
| `allowSyntheticDefaultImports` 常時有効 | `esModuleInterop: true` により暗黙的に有効だった |
| `rootDir` デフォルト `.` | `.svelte-kit/tsconfig.json` の `rootDirs` が上書き |
| `dom.iterable` が `dom` に統合 | `lib` に `DOM.Iterable` が含まれるが冗長なだけで実害なし（SvelteKit 生成設定） |
| `noUncheckedSideEffectImports` デフォルト `true` | `.svelte` 内の CSS import は Svelte コンパイラが処理し TS 対象外。`.storybook/preview.ts` の CSS import は svelte-check の対象外。**エラー発生せず** |
| `moduleResolution: "classic"` 削除 | `"bundler"` を使用中で無関係 |
| AMD / UMD / SystemJS 出力削除 | ESM プロジェクトのため無関係 |
| `--outFile` 削除 | Vite でバンドルしているため無関係 |
| `moduleResolution: "node"/"node10"` 非推奨 | `"bundler"` を使用中で無関係 |
| `baseUrl` 非推奨 | 未使用（SvelteKit の `paths` で管理） |

### 3.3 注意事項

| 項目 | 詳細 |
|------|------|
| `/// <reference no-default-lib="true"/>` 非推奨 | `src/service-worker.ts` の1行目で使用中。ただし `.svelte-kit/tsconfig.json` が Service Worker を `exclude` しているため svelte-check の対象外。SvelteKit が生成するパターンのため、SvelteKit 側の対応を待つ |
| `@sveltejs/kit` peerOptional 警告 | `peerOptional typescript@"^5.3.3"` のため npm 警告が出るが、Optional なので破壊的ではない。SvelteKit の次期リリースで範囲が拡大される見込み |

### 3.4 注目すべき新機能

| 機能 | 概要 |
|------|------|
| ES2025 型定義 | `Set` メソッド群、`Iterator` ヘルパー、`Promise.try` 等が `es2025` lib に安定化 |
| Temporal API 型 | ランタイム対応が進めば将来利用可能 |
| `dom.iterable` の `dom` 統合 | `lib` 設定がシンプルに |
| 30-40% 高速インクリメンタルビルド | 開発体験の向上 |
| `--stableTypeOrdering` | TS 7.0（Go 版）移行テスト用フラグ |
| `this` 非使用関数の型推論改善 | Svelte のコールバック型推論にもプラス |
| `#/` サブパスインポート | `@/` 相当のエイリアスが Node.js ネイティブで利用可能に |

---

## 4. tsconfig.json の変更

### 移行前

```jsonc
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "rewriteRelativeImportExtensions": true,
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

### 移行後

```jsonc
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "rewriteRelativeImportExtensions": true,
    "allowJs": true,
    "checkJs": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler",
    "types": ["node"]
  }
}
```

**差分:**

| 変更 | 理由 |
|------|------|
| `esModuleInterop: true` 削除 | TS 6.0 で常時有効。指定不要（冗長） |
| `"types": ["node"]` 追加 | デフォルトが `[]` に変更されたため、`@types/node` を明示的に含める |

---

## 5. 依存パッケージの互換性（確認済み）

| パッケージ | バージョン | TS 6.0 互換性 | 備考 |
|-----------|-----------|---------------|------|
| `svelte-check` | 4.3.6 → **4.4.5** | **互換** | `peerDependencies: typescript >= 5.0.0` |
| `@sveltejs/kit` | 2.51.0 | **互換** | `peerOptional typescript ^5.3.3` で警告のみ |
| `sveltekit-i18n` | 2.4.2 | **互換** | `skipLibCheck: true` により問題なし |
| `vitest` | 4.0.18 | **互換** | esbuild でトランスパイル、型チェックは行わない |
| `@types/node` | 25.2.3 | **互換** | TS 6.0 対応済み |
| `storybook` | 10.2.13 | **互換** | Vite 経由でビルド、TS は直接関与しない |
| `vite` | 7.3.1 | **互換** | esbuild でトランスパイル |

---

## 6. 検証結果（2026-03-25 実施）

| 検証項目 | コマンド | 結果 |
|----------|---------|------|
| 型チェック | `npm run check` | **0 ERRORS, 0 WARNINGS** (482 files) |
| ユニットテスト | `npm run test` | **103 tests passed** |
| 本番ビルド | `npm run build` | **成功** (561ms client + 1.55s server) |
| CSS lint | `bash scripts/lint-css.sh` | **PASSED** |
| Storybook ビルド | `npm run build-storybook` | **成功** |

---

## 7. ロールバック手順

問題発生時は即座に元のバージョンに戻せる。

```bash
npm install typescript@5.9.3 svelte-check@4.3.6 --save-dev
git checkout main -- tsconfig.json
```

---

## 8. TypeScript 7.0 への展望

TS 6.0 移行完了後、以下を意識しておく:

- TS 7.0（Go ベース）は 2026 Q2〜夏に予定
- TS 6.0 で非推奨化された項目（`/// <reference no-default-lib="true"/>` 等）は TS 7.0 で完全削除
- `src/service-worker.ts` の `/// <reference no-default-lib="true"/>` は SvelteKit 側の対応が必要
- 本プロジェクトは `ignoreDeprecations` を使用していないため、TS 7.0 移行時の追加対応は最小限
- `--stableTypeOrdering` フラグで TS 7.0 との型順序互換性を事前テスト可能

---

## 9. チェックリスト

- [x] 検証ブランチ作成
- [x] `npm install typescript@6.0 svelte-check@latest --save-dev`
- [x] `tsconfig.json` に `types: ["node"]` 追加
- [x] `tsconfig.json` から `esModuleInterop` 削除
- [x] `npm run check` 通過
- [x] `npm run test` 通過
- [x] `npm run build` 通過
- [x] `bash scripts/lint-css.sh` 通過
- [x] `npm run build-storybook` 通過
- [x] 副作用 import エラーの確認 → エラーなし
- [x] 依存パッケージ互換性確認
- [ ] PR 作成・レビュー・マージ
- [ ] 本番デプロイ確認
- [ ] CI Node バージョン引き上げ検討（別 PR でも可）
