---
description: 新機能の実装・大規模改修を行う際に使用するワークフロー。過去の文脈確認→現状把握→シンボル解析→計画承認→実装→記憶保存のサイクルを確実に実行する。
---

# 新機能実装の厳格なワークフロー

推測でコードを書くことを禁止する。必ず以下のステップを順番に実行せよ。

## Step 1：過去の文脈の確認（Cipher）

`cipher_memory_search` を使って、実装する機能に関連する過去の決定事項・設計方針を検索せよ。

**使用ツール**: `mcp__cipher__cipher_memory_search`
- `query`: 実装する機能に関連するキーワード
- 結果が見つかった場合、過去の決定事項を踏襲すること

## Step 2：現在のコードベースの把握（CocoIndex）

`cocoindex-code` を使って、関連する既存コンポーネント・関数・型定義を検索せよ。
全ファイルを読み込まず、関連するコードブロックのみを取得すること。

**使用ツール**: `mcp__cocoindex-code__search`
- `query`: 自然言語やコード断片で検索
- `refresh_index`: `true`（最新のコードを反映）

## Step 3：シンボル依存関係の確認（Serena）

Serena の `find_symbol` や `find_referencing_symbols` を使って、
修正対象の関数・コンポーネントがどこから参照されているかを確認せよ。

**使用ツール**:
- `mcp__serena__find_symbol` — シンボル名で検索（`include_body: true` で実装も取得可能）
- `mcp__serena__find_referencing_symbols` — 参照元の一覧取得
- `mcp__serena__get_symbols_overview` — ファイル内のシンボル全体像の把握

## Step 4：実装計画の提示と承認

Step 1〜3の情報をもとに実装計画をリスト形式で出力し、ユーザーの承認を得るまで実装を開始しないこと。

計画には以下を含めること：
- 変更対象ファイルと変更内容の概要
- 影響を受ける既存コンポーネント（Step 3 の参照情報に基づく）
- テスト方針（新規テスト追加 / 既存テスト修正）
- i18n キーの追加が必要な場合はその旨を明記

## Step 5：実装

承認後、計画に従って実装する。既存の設計パターンを踏襲し、独自の判断でアーキテクチャを変更しないこと。

実装時のルール：
- CSS は `oklch()` のみ使用（`.claude/rules/css.md` 参照）
- Svelte 5 Runes パターンに従う（`.claude/rules/svelte5.md` 参照）
- i18n キーは `ja.json` と `en.json` の両方に追加（`.claude/rules/i18n.md` 参照）

## Step 6：知識の保存（Cipher）

実装完了後、以下を `cipher_extract_and_operate_memory` で保存せよ。

- 実装した機能の概要
- 重要な設計上の決定事項とその理由
- 注意点・落とし穴
- APIキー・シークレット情報は必ず `[MASKED]` に置き換えること

**使用ツール**: `mcp__cipher__cipher_extract_and_operate_memory`
- `interaction`: 保存したい内容をテキストで渡す
