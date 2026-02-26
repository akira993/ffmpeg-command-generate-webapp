---
title: フェーズ別スキル作成ガイド
category: reference
version: "1.0.0"
description: スキル作成の全フェーズを段階的に解説するメインガイド
project: ffmpeg-command-generate-webapp
tags:
  - guide
  - phases
  - workflow
last_updated: "2025-02-20"
---

# フェーズ別スキル作成ガイド

Claude Code のスキル（`.claude/skills/*.md`）を作成する際の、フェーズごとの手順書。

## Phase 1: 要件定義

### 1.1 スキルの目的を明確にする

以下の質問に答えられる状態にする:

- **何を** 自動化するのか？（例: UIテスト、デプロイ、コード生成）
- **いつ** 使うのか？（例: PR 前、リリース時、開発中）
- **誰が** 使うのか？（例: 自分のみ、チーム全員）
- **頻度** は？（例: 毎コミット、週次、必要時のみ）

### 1.2 既存スキルとの重複確認

```bash
# 既存スキル一覧
ls .claude/skills/

# 分析レポートで類似スキルを確認
python3 skill-creator-max/scripts/analyze_skill.py .claude/skills/
```

### 1.3 カテゴリ選定

| カテゴリ | 用途 | このプロジェクトの例 |
|----------|------|---------------------|
| テスト・検証 | テスト実行、リント、品質チェック | run-tests, css-lint, i18n-check |
| ビルド・デプロイ | CI/CD、環境構築 | deploy |
| コード生成・変換 | コード生成、リファクタリング | (未作成) |
| 汎用 | 上記に該当しない | (未作成) |

## Phase 2: 構造設計

### 2.1 セクション構成

このプロジェクトのスキルは以下の構造パターンに従う:

```markdown
# skill-name

1行の説明文（このスキルが何をするか）。

## 前提（任意）

実行前に必要な条件。

## 手順（必須）

1. 最初のステップ
2. 次のステップ
3. 確認ステップ

## 失敗時の対応（推奨）

| 状況 | 対応 |
|------|------|

## 結果レポート（推奨）

出力形式の定義。
```

### 2.2 セクション要不要の判断

| セクション | 必須度 | 判断基準 |
|-----------|--------|----------|
| H1 + 説明 | 必須 | 常に |
| 手順 | 必須 | 常に |
| 前提 | 推奨 | 環境依存がある場合 |
| 失敗時の対応 | 推奨 | 外部ツール呼び出しがある場合 |
| 結果レポート | 推奨 | ユーザーへの報告が必要な場合 |
| チェックポイント | 任意 | 複数の確認項目がある場合 |

## Phase 3: 実装

### 3.1 雛形生成

```bash
python3 skill-creator-max/scripts/init_skill.py
```

### 3.2 手順の記述ルール

**良い手順の条件:**

1. **具体的**: 「テストを実行する」→「`npm run test` で Vitest を実行する」
2. **順序明確**: 依存関係のあるステップは番号付きリストで
3. **判断基準付き**: 「成功なら次へ、失敗なら〜」
4. **コマンド例付き**: 実行すべきコマンドをコードブロックで提示

**このプロジェクトの実例（deploy.md）:**

```markdown
### 2. CI 完了待機

(bash コマンド)

- `conclusion: success` → 次へ
- `conclusion: failure` → エラーを確認し、修正して再実行
```

### 3.3 失敗パターンの設計

既存スキル `deploy.md` のパターン:

```markdown
| 状況 | 対応 |
|------|------|
| CI type check 失敗 | `npm run check` で特定・修正して再 push |
| CI CSS lint 失敗 | oklch に修正して再 push |
| CI build 失敗 | ローカル再現、SSR 制約確認 |
```

## Phase 4: 検証

### 4.1 クイックチェック

```bash
python3 skill-creator-max/scripts/quick_validate.py .claude/skills/<name>.md
```

### 4.2 総合バリデーション

```bash
python3 skill-creator-max/scripts/comprehensive_validate.py .claude/skills/
```

### 4.3 トリガーテスト

```bash
python3 skill-creator-max/scripts/test_trigger.py .claude/skills/
```

### 4.4 実際の実行テスト

Claude Code で `/<name>` を実行し、期待通りに動作するか確認する。

## Phase 5: 登録・文書化

### 5.1 CLAUDE.md への追記

```markdown
| `/<name>` | スキルの説明 |
```

### 5.2 チームへの共有

- PR で `.claude/skills/<name>.md` をコミット
- PR 説明にスキルの目的・使い方を記載
