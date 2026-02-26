---
title: ワークフローパターン集
category: reference
version: "1.0.0"
description: スキル内で使える実行パターン・制御フローのカタログ
project: ffmpeg-command-generate-webapp
tags:
  - workflow
  - pattern
  - control-flow
last_updated: "2025-02-20"
---

# ワークフローパターン集

スキルの手順を構成する際に使える実行パターンのカタログ。

## 1. シーケンシャル実行パターン

最も基本的なパターン。手順を上から順番に実行する。

```
Step 1 → Step 2 → Step 3 → 完了
```

### 使用例: run-tests.md

```markdown
## 手順

1. `npm run check` で型チェックを実行する
2. `npm run test` でユニットテストを実行する
3. 失敗があれば原因を特定し修正方法を提案する
```

### 適用条件

- 手順間に依存関係がある
- 順序を変えると結果が変わる

## 2. ゲートチェックパターン

前提条件を先に検証し、通過した場合のみ本体を実行する。

```
Gate Check → [Pass] → Main Flow
           → [Fail] → Abort with message
```

### 使用例: deploy.md の前提チェック

```markdown
## 前提チェック

実行前に以下を確認する:
1. `npm run check` — 型エラーがないこと
2. `bash scripts/lint-css.sh` — CSS 違反がないこと
3. `git status` — コミット漏れがないこと
```

### 適用条件

- 失敗すると意味のない本体処理がある
- 前提条件が明確で検証可能

## 3. ブランチ実行パターン

条件に応じて異なる手順を実行する。

```
Condition Check → [A] → Flow A → Merge
               → [B] → Flow B → Merge
```

### 使用例: perf-test.md の URL 選択

```markdown
## 対象 URL

- **本番**: `https://www.cmd-gen.com`
- **ローカル**: `http://localhost:4173`

引数で URL が渡された場合はそちらを使用する。
```

### 適用条件

- 同じ目的だが環境や条件で手順が異なる

## 4. ループ実行パターン

同じ手順を複数の対象に対して繰り返す。

```
For each item in [A, B, C]:
    Execute Step → Collect Result
Aggregate Results
```

### 使用例: ui-test.md のマルチビューポート

```markdown
### 1. デスクトップテスト (1280x900)
  - resize → navigate → screenshot → 確認
### 2. モバイルテスト (375x812)
  - resize → navigate → screenshot → 確認
```

### 適用条件

- 同一手順を異なるパラメータで反復する
- 結果を集約して報告する

## 5. チェーン実行パターン

前のスキルの出力を次のスキルの入力として使う。

```
Skill A → [output] → Skill B → [output] → Report
```

### 使用例: deploy.md → deploy-test.md

```markdown
# deploy-test.md
デプロイ済みの本番 URL に対して Chrome MCP で UI テストを実行する。
`/deploy` の後に呼び出すことを想定。
```

### 適用条件

- 複数のスキルが1つのワークフローを構成する
- 前のスキルの成果物が次の入力になる

## 6. フォールバックパターン

主手順が失敗した場合の代替手順を用意する。

```
Primary → [Success] → Continue
        → [Failure] → Fallback → Continue
```

### 使用例: deploy.md の URL 取得

```markdown
URL が空の場合は 30 秒待ってリトライ
（Vercel デプロイは CI 完了後数十秒かかる場合がある）。
```

### 適用条件

- 一時的な失敗が想定される
- リトライで回復する可能性がある

## 7. パイプライン実行パターン

複数のフェーズを直列に実行し、各フェーズで中間結果を出力する。

```
Phase 1 → [result 1] → Phase 2 → [result 2] → Phase 3 → Final Report
```

### 使用例: deploy.md の 4 フェーズ

```
前提チェック → push → CI 待機 → URL 取得 → 結果レポート
```

### 適用条件

- 長い処理を論理的な区切りで分割したい
- 中間結果をユーザーに逐次報告したい

## 8. 集約レポートパターン

複数のチェック結果を1つのレポートにまとめる。

```
Check A → ✅
Check B → ⚠️  → Aggregate → Final Report
Check C → ✅
```

### 使用例: deploy-test.md の結果レポート

```markdown
## デプロイテスト結果
- URL: https://www.cmd-gen.com
- デスクトップ:     ✅ / ⚠️
- モバイル:         ✅ / ⚠️
- 機能テスト:       ✅ / ⚠️
- パフォーマンス:   ✅ / ⚠️
```

### 適用条件

- 複数の独立したチェック項目がある
- 一覧性のある最終レポートが必要

## パターンの組み合わせ

複雑なスキルは複数のパターンを組み合わせて構成する。

### deploy.md の構造分析

```
[ゲートチェック] 前提条件 3 点
  ↓
[シーケンシャル] push → CI 待機
  ↓
[フォールバック] URL 取得（リトライあり）
  ↓
[集約レポート] 結果まとめ
  ↓
[ブランチ] 失敗時の対応テーブル
```
