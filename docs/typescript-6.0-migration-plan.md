# TypeScript 6.0 移行計画書

**作成日**: 2026-02-20
**移行予定日**: 2026-03-20 前後
**TS 6.0 正式リリース日**: 2026-03-17（予定）
**現行バージョン**: TypeScript 5.9.3

---

## 1. 背景

TypeScript 6.0 は **JavaScript ベースで書かれた最後のメジャーバージョン** である。
次の TypeScript 7.0（2026 Q2〜夏予定）は Go 言語で完全に書き直され、10 倍の高速化が見込まれる。
6.0 はその橋渡しとして、レガシーオプションの削除・デフォルト値の厳格化が主眼。

---

## 2. 現行プロジェクト構成

| 項目 | 値 |
|------|-----|
| フレームワーク | SvelteKit 2 + Svelte 5 (Runes) |
| ビルドツール | Vite 7.3 |
| テスト | Vitest 4.0 |
| TypeScript | 5.9.3 |
| CSS | Tailwind CSS v4 |
| デプロイ先 | Vercel（SSG, `adapter-vercel`） |
| `package.json` `type` | `"module"`（ESM） |
| CI | GitHub Actions（Node 20） |

### 現行 tsconfig.json

```jsonc
// tsconfig.json
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

### SvelteKit 生成の .svelte-kit/tsconfig.json（主要部分）

```jsonc
{
  "compilerOptions": {
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "lib": ["esnext", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "module": "esnext",
    "noEmit": true,
    "target": "esnext"
  }
}
```

---

## 3. TS 6.0 の主要な破壊的変更と本プロジェクトへの影響

### 3.1 影響あり（要対応）

| 変更 | 詳細 | 本プロジェクトへの影響 |
|------|------|----------------------|
| **`types` デフォルトが `[]` に** | `@types/*` が自動検出されなくなる | `@types/node` が暗黙に読み込まれなくなるため、明示指定が必要 |
| **`dom.iterable` が `dom` に統合** | `lib: ["DOM.Iterable"]` が不要に | `.svelte-kit/tsconfig.json` の `lib` に含まれている。SvelteKit 側の対応待ちだが、明示指定しても実害なし |
| **`noUncheckedSideEffectImports` デフォルト `true`** | `import "./styles.css"` 等の副作用 import が存在チェックされる | CSS import や Tailwind の `@import` が対象になりうる。Svelte ファイル内の CSS import を確認する必要あり |

### 3.2 影響なし（既に対応済み）

| 変更 | 理由 |
|------|------|
| `strict` デフォルト `true` | 既に `strict: true` を明示設定済み |
| `module` デフォルト `esnext` | `.svelte-kit/tsconfig.json` で `"module": "esnext"` 設定済み |
| `target` デフォルト `es2025` | `"target": "esnext"` 設定済み |
| `esModuleInterop` 常時有効（`false` 不可） | 既に `true` を明示設定済み |
| `allowSyntheticDefaultImports` 常時有効 | `esModuleInterop: true` により暗黙的に有効 |
| `moduleResolution: "classic"` 削除 | `"bundler"` を使用中 |
| AMD / UMD / SystemJS 出力削除 | ESM プロジェクトのため無関係 |
| `--outFile` 削除 | Vite でバンドルしているため無関係 |
| `moduleResolution: "node"/"node10"` 非推奨 | `"bundler"` を使用中 |

### 3.3 注目すべき新機能

| 機能 | 概要 |
|------|------|
| ES2025 型定義 | `Set` メソッド群、`Iterator` ヘルパー、`Promise.try` 等が `es2025` lib に移動 |
| Temporal API 型 | ランタイム対応が進めば将来利用可能 |
| `dom.iterable` の `dom` 統合 | `lib` 設定がシンプルに |
| 30-40% 高速インクリメンタルビルド | 開発体験の向上 |
| `--stableTypeOrdering` | TS 7.0（Go 版）移行テスト用フラグ |

---

## 4. デプロイ環境の互換性

### Vercel

- Vite + SvelteKit のビルドでは TypeScript コンパイラは**型チェック専用**（`noEmit: true`）
- 実際のトランスパイルは Vite（内部 esbuild）が担当
- TS 6.0 の型定義変更はビルド出力に影響しない
- **結論: 問題なし**

### CI（GitHub Actions）

- `npm run check`（`svelte-check`）が TS 6.0 を使う唯一の接点
- `svelte-check` v4.3+ は TS 6.0 beta に対応済み
- Node 20 → Node 22 への引き上げも検討（後述）
- **結論: `svelte-check` のバージョン確認が必要**

---

## 5. 移行ステップ

### Phase 1: 事前準備（〜3/10）

#### 1-1. 検証ブランチ作成

```bash
git checkout -b chore/typescript-6.0-migration
```

#### 1-2. TS 6.0 ベータ導入

```bash
npm install typescript@beta --save-dev
```

#### 1-3. tsconfig.json 修正

```diff
 {
   "extends": "./.svelte-kit/tsconfig.json",
   "compilerOptions": {
     "rewriteRelativeImportExtensions": true,
     "allowJs": true,
     "checkJs": true,
-    "esModuleInterop": true,
     "forceConsistentCasingInFileNames": true,
     "resolveJsonModule": true,
     "skipLibCheck": true,
     "sourceMap": true,
     "strict": true,
-    "moduleResolution": "bundler"
+    "moduleResolution": "bundler",
+    "types": ["node"]
   }
 }
```

**変更理由:**

| 変更 | 理由 |
|------|------|
| `esModuleInterop` 削除 | TS 6.0 では常時有効。明示指定は不要（指定しても害はないが冗長） |
| `types: ["node"]` 追加 | デフォルトが `[]` になるため、`@types/node` を明示的に含める |

#### 1-4. 型チェック・テスト実行

```bash
npm run check        # svelte-check
npx tsc --noEmit     # 素の tsc でも確認
npm run test         # Vitest
npm run build        # ビルド確認
```

#### 1-5. `noUncheckedSideEffectImports` 対応

TS 6.0 からデフォルト `true`。副作用 import（`import "./foo.css"` 等）が型チェックされる。
エラーが出る場合の対処法:

```jsonc
// 一時的に無効化する場合
{
  "compilerOptions": {
    "noUncheckedSideEffectImports": false
  }
}
```

または、該当する CSS ファイルに型定義を追加:

```typescript
// src/app.d.ts 等に追加
declare module '*.css' {
  const content: string;
  export default content;
}
```

---

### Phase 2: 依存パッケージの互換性確認（3/10〜3/17）

以下のパッケージが TS 6.0 と互換性があるか確認する。

| パッケージ | 確認ポイント |
|-----------|-------------|
| `svelte-check` (v4.3.6) | TS 6.0 対応バージョンか確認。必要なら更新 |
| `@sveltejs/kit` (v2.50) | `.svelte-kit/tsconfig.json` 生成内容が TS 6.0 対応か |
| `sveltekit-i18n` (v2.4.2) | 型定義に問題がないか |
| `bits-ui` (v2.15.5) | TS 6.0 strict 下で型エラーが出ないか |
| `vitest` (v4.0.18) | TS 6.0 での動作確認 |
| `@types/node` (v25.2.3) | TS 6.0 対応版か（通常問題なし） |

```bash
# 依存パッケージを最新に更新
npm update
# または個別に
npm install svelte-check@latest @sveltejs/kit@latest --save-dev
```

---

### Phase 3: CI 調整（3/14〜3/17）

#### 3-1. CI の Node バージョン検討

```yaml
# .github/workflows/ci.yml
- uses: actions/setup-node@v4
  with:
    node-version: 22  # 20 → 22 への引き上げを検討
    cache: npm
```

Node 20 は 2026-10 に EOL。この機に 22 LTS への移行も視野に入れる。
ただし TS 6.0 移行とは独立した判断のため、同時にやらなくてもよい。

#### 3-2. `svelte.config.js` の runtime 確認

```javascript
// svelte.config.js
adapter({
  runtime: 'nodejs20.x'  // Node 22 に上げる場合はここも変更
})
```

---

### Phase 4: 正式版導入・本番リリース（3/17〜3/20）

#### 4-1. 正式版インストール

```bash
# 3/17 の正式リリース後
npm install typescript@6.0 --save-dev
```

#### 4-2. 最終確認

```bash
npm run check
npm run test
npm run build && npm run preview
bash scripts/lint-css.sh
```

#### 4-3. PR 作成・マージ

```bash
git add -A
git commit -m "chore: migrate to TypeScript 6.0"
git push origin chore/typescript-6.0-migration
gh pr create --title "chore: TypeScript 6.0 移行" --body "..."
```

#### 4-4. 本番デプロイ確認

マージ後、CI → Vercel 自動デプロイを確認。

---

## 6. tsconfig.json 移行後の最終形（想定）

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

**TS 5.9 との差分まとめ:**

- `esModuleInterop: true` → 削除（TS 6.0 で常時有効、指定不要）
- `types: ["node"]` → 追加（TS 6.0 でデフォルトが `[]` に変更）

---

## 7. リスク評価

| リスク | 発生確率 | 影響度 | 対策 |
|--------|---------|--------|------|
| `svelte-check` が TS 6.0 未対応 | 低 | 高 | ベータ対応状況を事前確認。未対応なら TS 固定して待機 |
| `.svelte-kit/tsconfig.json` が非互換設定を生成 | 低 | 中 | SvelteKit のアップデートで解消。手動オーバーライドも可 |
| `sveltekit-i18n` の型定義が壊れる | 低 | 低 | `skipLibCheck: true` で回避可能 |
| `noUncheckedSideEffectImports` で CSS import エラー | 中 | 低 | 型定義追加 or オプション無効化で即座に対処可 |
| TS 6.0 正式版リリース延期 | 低 | 中 | ベータで十分検証済みなら RC 版で移行も可 |

---

## 8. ロールバック手順

問題発生時は即座に元のバージョンに戻せる。

```bash
npm install typescript@5.9.3 --save-dev
git checkout main -- tsconfig.json
```

---

## 9. TypeScript 7.0 への展望

TS 6.0 移行完了後、以下を意識しておく:

- TS 7.0（Go ベース）は 2026 Q2〜夏に予定
- TS 6.0 で「`ignoreDeprecations: "6.0"` 付きで温存」したオプションは TS 7.0 で完全削除
- 本プロジェクトは `moduleResolution: "bundler"` を使用しており、TS 7.0 で非推奨予定の `"node10"` は使っていないため、追加対応は最小限の見込み
- `--stableTypeOrdering` フラグで TS 7.0 との型順序互換性を事前テスト可能

---

## 10. チェックリスト

- [ ] 検証ブランチ作成
- [ ] `npm install typescript@beta --save-dev`
- [ ] `tsconfig.json` に `types: ["node"]` 追加
- [ ] `tsconfig.json` から `esModuleInterop` 削除（任意）
- [ ] `npm run check` 通過
- [ ] `npm run test` 通過
- [ ] `npm run build` 通過
- [ ] `bash scripts/lint-css.sh` 通過
- [ ] 副作用 import エラーの確認・対処
- [ ] 依存パッケージ互換性確認
- [ ] TS 6.0 正式版リリース後にバージョン固定
- [ ] PR 作成・レビュー・マージ
- [ ] 本番デプロイ確認
- [ ] CI Node バージョン引き上げ検討（別 PR でも可）
