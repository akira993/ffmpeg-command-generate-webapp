---
title: スキル README テンプレート
category: template
version: "1.0.0"
description: スキルセットの README として使えるテンプレート
project: ffmpeg-command-generate-webapp
tags:
  - template
  - readme
  - documentation
last_updated: "2025-02-20"
usage: >
  プロジェクトのスキルセットを説明する README を作成する際に使用する。
  CLAUDE.md のスキルテーブルと整合性を保つこと。
  YAML フロントマターは実際の README では削除すること。
---

# {{PROJECT_NAME}} — Claude Code スキル一覧

{{プロジェクトの1行説明}}

## スキル一覧

| コマンド | カテゴリ | 概要 | 追加日 |
|----------|----------|------|--------|
| `/{{skill-1}}` | {{カテゴリ}} | {{概要}} | {{YYYY-MM-DD}} |
| `/{{skill-2}}` | {{カテゴリ}} | {{概要}} | {{YYYY-MM-DD}} |
| `/{{skill-3}}` | {{カテゴリ}} | {{概要}} | {{YYYY-MM-DD}} |

## カテゴリ別ガイド

### テスト・検証

品質を担保するためのチェック系スキル。

| コマンド | 実行タイミング | 所要時間 |
|----------|--------------|---------|
| `/{{test-skill-1}}` | {{タイミング}} | {{時間}} |
| `/{{test-skill-2}}` | {{タイミング}} | {{時間}} |

### ビルド・デプロイ

CI/CD とデプロイに関するスキル。

| コマンド | 実行タイミング | 所要時間 |
|----------|--------------|---------|
| `/{{deploy-skill-1}}` | {{タイミング}} | {{時間}} |

### コード生成・変換

コード生成やリファクタリングに関するスキル。

| コマンド | 実行タイミング | 所要時間 |
|----------|--------------|---------|
| `/{{codegen-skill-1}}` | {{タイミング}} | {{時間}} |

## 推奨ワークフロー

### PR 前チェック

```
/{{test-skill-1}} → /{{test-skill-2}} → /{{test-skill-3}} → PR 作成
```

### フルデプロイ

```
/{{test-skill-1}} → /{{deploy-skill-1}} → /{{deploy-test-skill-1}}
```

## スキルの追加方法

1. `skill-creator-max/scripts/init_skill.py` で雛形生成
2. `.claude/skills/<name>.md` に手順を記述
3. `skill-creator-max/scripts/quick_validate.py` で構文チェック
4. Claude Code で実行テスト
5. CLAUDE.md のスキルテーブルに追記
6. この README を更新

## 品質レポート

```bash
# 全スキルの品質分析
python3 skill-creator-max/scripts/analyze_skill.py .claude/skills/ --suggest
```

最終更新: {{YYYY-MM-DD}}
