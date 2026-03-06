---
title: "storybook-check スキル"
description: "Storybookビルド検証（全ストーリーのコンパイル確認）"
category: "skills"
created: "2026-02-27"
updated: "2026-03-07"
---

# storybook-check

Storybook の全ストーリーがビルド可能かを検証する。

## 手順

1. `npm run build-storybook` を実行し、全ストーリーがコンパイルできることを確認する
2. エラーがあれば該当ストーリーファイルを特定し、修正方法を提案する

## よくあるエラー

| エラー | 原因 | 修正 |
|--------|------|------|
| `Cannot find module` | import パスの間違い | `$lib/...` パスまたは相対パスを確認 |
| `is not a valid prop` | コンポーネント Props の変更に stories が追従していない | stories の args / テンプレートを更新 |
| `CSS parse error` | `#hex` / `rgb()` 等の禁止色指定 | `oklch()` に変換 |

## オプション: ブラウザでの目視確認

Chrome DevTools MCP を使用して Storybook UI を確認する場合:

1. `preview_start` で storybook サーバーを起動（`.claude/launch.json` の `storybook` エントリ使用）
2. `preview_screenshot` で各ストーリーのスクリーンショットを取得
3. レイアウト崩れやテーマ/言語切替の動作を確認
