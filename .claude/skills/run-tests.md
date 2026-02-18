# run-tests

Vitest ユニットテストと型チェックを実行し、結果をレポートする。

## 手順

1. `npm run check` で TypeScript / Svelte 型チェックを実行する
2. `npm run test` で Vitest ユニットテスト（`tests/ffmpeg/` 以下）を実行する
3. 失敗があれば原因を特定し、修正方法を提案する

## テスト対象

- `tests/ffmpeg/builder.test.ts` — `buildCommand()` コア生成ロジック（最優先）
- `tests/ffmpeg/presets.test.ts` — プリセット定義・デフォルト値
- `tests/ffmpeg/validators.test.ts` — バリデーション関数

## 失敗時の対応

- 型エラー: 該当ファイルを Read して原因を確認し修正する
- テスト失敗: `src/lib/ffmpeg/builder.ts` / `validators.ts` の実装と期待値を照合する
- ビルドエラー: `npm run build` でローカル再現し、SvelteKit SSR 制約（`window`/`document` は `onMount` 内）を確認する
