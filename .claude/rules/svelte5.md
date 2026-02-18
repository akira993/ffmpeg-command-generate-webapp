# Svelte 5 Runes ルール

## 使うべきもの

- `$state()`, `$derived()`, `$derived.by()`, `$props()`, `$effect()`
- クラスベース Store: `class FooStore { x = $state(...); y = $derived(...) }`

## 禁止

- Svelte 4 の `writable()` / `readable()` / `derived()` Store（このプロジェクトでは使わない）

## 重要な落とし穴

**`$state` Proxy は `structuredClone` 不可。**
ディープコピーが必要な場合は必ず `JSON.parse(JSON.stringify(...))` を使う:

```typescript
// NG
const copy = structuredClone(this.options);  // エラー

// OK
const copy = JSON.parse(JSON.stringify(this.options));
```

## SvelteKit SSR 制約

`window`, `document`, `localStorage` などブラウザ専用 API は `onMount` 内で使う。
ビルドは通るがVercel で実行時エラーになる原因になる。
