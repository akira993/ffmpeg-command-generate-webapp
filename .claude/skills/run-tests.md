# run-tests

Vitest ユニットテストと型チェックを実行し、結果をレポートする。

## 手順

1. `npm run check` で TypeScript / Svelte 型チェックを実行する
2. `npm run test` で Vitest ユニットテスト（`tests/ffmpeg/` 以下）を実行する
3. 失敗があれば原因を特定し、修正方法を提案する
4. `npm run build-storybook` で Storybook ビルドを実行し、全ストーリーがコンパイルできることを確認する

## テスト対象

- `tests/ffmpeg/builder.test.ts` — `buildCommand()` コア生成ロジック（最優先）
- `src/lib/a11y/contrast.test.ts` — デザインシステム総合テスト（oklch・WCAG コントラスト）
- `src/lib/components/**/*.stories.svelte` — Storybook ストーリー（build-storybook で検証）

## 失敗時の対応

- 型エラー: 該当ファイルを Read して原因を確認し修正する
- テスト失敗: `src/lib/ffmpeg/builder.ts` / `validators.ts` の実装と期待値を照合する
- ビルドエラー: `npm run build` でローカル再現し、SvelteKit SSR 制約（`window`/`document` は `onMount` 内）を確認する
- Storybook ビルドエラー: 該当 stories ファイルの import パスとコンポーネント Props を確認。`preview.ts` デコレータに起因する場合は `.storybook/preview.ts` を確認
