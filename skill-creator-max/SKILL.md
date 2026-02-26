---
name: skill-creator-max
version: "1.0.0"
description: Claude Code スキル作成・管理・検証のためのメタツールキット
author: akira993
project: ffmpeg-command-generate-webapp
created: "2025-02-20"
tags:
  - meta-tool
  - skill-creation
  - claude-code
  - developer-experience
requires:
  - python3
  - claude-code
compatible_with:
  - SvelteKit
  - TypeScript
  - Any Claude Code project
---

# skill-creator-max

Claude Code のスキル（`.claude/skills/*.md`）を効率的に作成・検証・分析するためのメタツールキット。

このプロジェクト（FFmpeg Command Generator）で実績のある 7 つのスキル定義パターンを基盤に、新しいスキルの雛形生成から品質検証までをカバーする。

## 概要

```
skill-creator-max/
├── SKILL.md                          # このファイル（エントリポイント）
├── scripts/                          # Python 自動化スクリプト
│   ├── init_skill.py                 # スキル雛形生成（対話式）
│   ├── quick_validate.py             # 構文クイックチェック
│   ├── comprehensive_validate.py     # 総合バリデーション
│   ├── test_trigger.py               # スキルトリガー条件テスト
│   └── analyze_skill.py              # 既存スキル分析・統計
├── references/                       # リファレンスドキュメント群
│   ├── phase-by-phase-guide.md       # フェーズ別作成ガイド
│   ├── category-questions.md         # カテゴリ別質問集
│   ├── advanced-features.md          # 高度な機能パターン
│   ├── technical-requirements.md     # 技術要件チェックリスト
│   ├── yaml-frontmatter-guide.md     # YAML フロントマター仕様
│   ├── workflow-patterns.md          # ワークフローパターン集
│   ├── mcp-integration-guide.md      # MCP 連携ガイド
│   ├── testing-and-iteration.md      # テスト・反復改善ガイド
│   ├── distribution-guide.md         # 配布・共有ガイド
│   ├── troubleshooting.md            # トラブルシューティング
│   ├── workflows.md                  # 実践ワークフロー集
│   ├── output-patterns.md            # 出力フォーマットパターン
│   └── progressive-disclosure-patterns.md  # 段階的開示パターン
└── templates/                        # スキルテンプレート群
    ├── SKILL_template.md             # 汎用スキルテンプレート
    ├── category1_template.md         # テスト・検証系テンプレート
    ├── category2_template.md         # ビルド・デプロイ系テンプレート
    ├── category3_template.md         # コード生成・変換系テンプレート
    └── README_template.md            # スキル README テンプレート
```

## クイックスタート

### 新しいスキルを作成する

```bash
python3 skill-creator-max/scripts/init_skill.py
```

対話式でスキル名・カテゴリ・説明を入力すると、`.claude/skills/<name>.md` に雛形が生成される。

### 既存スキルを検証する

```bash
# クイックチェック（構文のみ）
python3 skill-creator-max/scripts/quick_validate.py .claude/skills/run-tests.md

# 総合バリデーション（全スキル）
python3 skill-creator-max/scripts/comprehensive_validate.py .claude/skills/
```

### スキルを分析する

```bash
# 全スキルの統計・品質レポート
python3 skill-creator-max/scripts/analyze_skill.py .claude/skills/
```

## このプロジェクトの既存スキル

| コマンド | カテゴリ | 概要 |
|----------|----------|------|
| `/run-tests` | テスト・検証 | Vitest + 型チェック |
| `/css-lint` | テスト・検証 | CSS oklch ルール違反チェック |
| `/i18n-check` | テスト・検証 | 翻訳キー整合性チェック |
| `/ui-test` | テスト・検証 | Chrome MCP で UI テスト |
| `/perf-test` | テスト・検証 | パフォーマンス計測 |
| `/deploy` | ビルド・デプロイ | push → CI → デプロイ URL |
| `/deploy-test` | テスト・検証 | 本番 UI + パフォーマンス |

## 設計原則

1. **プロジェクト整合性**: このプロジェクトの既存スキル形式（Markdown、手順ベース）に準拠
2. **段階的開示**: 初心者はテンプレート、上級者はリファレンスを参照
3. **自動検証**: Python スクリプトで品質を機械的に担保
4. **再利用性**: テンプレートは他のプロジェクトにも転用可能
