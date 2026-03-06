---
title: "Markdown ルール"
description: "全 .md ファイルに YAML フロントマターを強制するルール"
category: "rules"
created: "2026-03-07"
updated: "2026-03-07"
---

# Markdown ルール

## YAML フロントマター（必須）

**すべての `.md` ファイルには YAML フロントマターを付けること。**
`node_modules/` 配下は対象外。

### 必須フィールド

```yaml
---
title: "ドキュメントのタイトル"
description: "1行の簡潔な説明"
category: "カテゴリ名"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
---
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `title` | string | ドキュメントのタイトル |
| `description` | string | 1行の簡潔な説明（50〜120文字目安） |
| `category` | string | 分類（下記参照） |
| `created` | date | 作成日（`YYYY-MM-DD`） |
| `updated` | date | 最終更新日（`YYYY-MM-DD`） |

### カテゴリ一覧

| category | 用途 | ディレクトリ |
|----------|------|-------------|
| `root` | プロジェクトルート | `/` |
| `design` | 設計ドキュメント | `docs/design/` |
| `seo` | SEO・LLMO 関連 | `docs/seo/` |
| `testing` | テスト設計・手順 | `docs/testing/` |
| `deploy` | デプロイ・CI/CD | `docs/deploy/` |
| `workflow` | エディタ・AI ワークフロー | `docs/workflow/` |
| `migration` | 移行レポート・計画 | `docs/migration/` |
| `guides` | ガイド・チュートリアル | `docs/guides/` |
| `rules` | コーディングルール | `.claude/rules/` |
| `skills` | スキル定義 | `.claude/skills/` |
| `docs` | Claude 内部ドキュメント | `.claude/docs/` |
