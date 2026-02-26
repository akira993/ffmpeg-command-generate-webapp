---
title: テスト・反復改善ガイド
category: reference
version: "1.0.0"
description: スキルのテスト方法と継続的な品質改善のプロセス
project: ffmpeg-command-generate-webapp
tags:
  - testing
  - iteration
  - quality
last_updated: "2025-02-20"
---

# テスト・反復改善ガイド

作成したスキルの品質を検証し、継続的に改善していくためのプロセス。

## テストの3レベル

### Level 1: 構文テスト（自動）

ファイル構造の正しさを機械的にチェック。

```bash
python3 skill-creator-max/scripts/quick_validate.py .claude/skills/<name>.md
```

**チェック項目:**
- H1 タイトルの存在
- コードブロックの閉じ忘れ
- テーブル構文の整合性
- 必須セクションの有無

### Level 2: 品質テスト（半自動）

内容の充実度を数値化してチェック。

```bash
python3 skill-creator-max/scripts/comprehensive_validate.py .claude/skills/ --strict
```

**チェック項目:**
- 品質スコア（0-100）
- セクション充実度
- エラーハンドリングの有無
- レポート形式の定義

### Level 3: 実行テスト（手動）

Claude Code で実際にスキルを実行して動作確認。

```
Claude Code で /<name> を入力して実行
```

**チェック項目:**
- 期待通りの手順が実行されるか
- エラー時に適切な対応がなされるか
- レポートが定義通りの形式で出力されるか
- 他のスキルとの連携が機能するか

## 反復改善プロセス

### Step 1: 初期バージョン作成

```bash
python3 skill-creator-max/scripts/init_skill.py
```

最小限の構造でスキルを作成する。

### Step 2: 構文チェック

```bash
python3 skill-creator-max/scripts/quick_validate.py .claude/skills/<name>.md
```

エラーをすべて解消する。

### Step 3: 品質チェック

```bash
python3 skill-creator-max/scripts/comprehensive_validate.py .claude/skills/<name>.md
```

スコア 60 以上を目標にする。

### Step 4: 実行テスト

Claude Code で `/<name>` を実行し、以下を確認:

1. **Happy Path**: 正常系が期待通りに動作するか
2. **Error Path**: エラー時の挙動が定義通りか
3. **Edge Case**: 境界条件での動作

### Step 5: フィードバック反映

テスト結果から改善点を特定:

| 問題 | 対応 |
|------|------|
| 手順が曖昧 | より具体的なコマンド・条件を追記 |
| エラー対応が不足 | 失敗パターンとリカバリ手順を追加 |
| レポートが不明瞭 | 出力フォーマットを詳細化 |
| トリガーが直感的でない | スキル名・説明文を見直し |

### Step 6: 再チェック

```bash
# 構文 + 品質 + トリガー をまとめてチェック
python3 skill-creator-max/scripts/quick_validate.py .claude/skills/<name>.md && \
python3 skill-creator-max/scripts/comprehensive_validate.py .claude/skills/ && \
python3 skill-creator-max/scripts/test_trigger.py .claude/skills/
```

## 品質目標

| グレード | スコア | 基準 |
|---------|--------|------|
| A | 90+ | プロダクション品質。全セクション充実 |
| B | 75-89 | 実用レベル。主要セクション完備 |
| C | 60-74 | 最低限使える。改善の余地あり |
| D | 40-59 | 不十分。主要セクションが欠落 |
| F | 0-39 | 使用不可。大幅な修正が必要 |

### このプロジェクトの既存スキル品質

品質の確認は以下で実行:

```bash
python3 skill-creator-max/scripts/analyze_skill.py .claude/skills/ --suggest
```

## 改善のコツ

### 1. 実行ログを活用する

スキル実行時に Claude がどのように解釈したかを観察し、
曖昧な箇所や解釈の揺れを特定する。

### 2. エラーパターンを蓄積する

実際に発生したエラーを「失敗時の対応」テーブルに追記していく。
初期リリースで完璧を目指さず、運用しながら充実させる。

### 3. 他のスキルとのパターン統一

プロジェクト内のスキル群で以下を統一する:
- セクション名（「手順」「失敗時の対応」「結果レポート」）
- レポートの絵文字表記（✅/⚠️/❌）
- コードブロックの言語タグ
- テーブルの列構成

### 4. 定期的な棚卸し

月次で以下を確認:
- 使われていないスキルはないか
- 手順が古くなっていないか（ツールバージョンアップ等）
- 新しいパターンが抽出できないか
