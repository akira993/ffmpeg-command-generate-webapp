---
title: YAML フロントマター仕様ガイド
category: reference
version: "1.0.0"
description: Markdownファイルに付与するYAMLフロントマターの仕様と記述ルール
project: ffmpeg-command-generate-webapp
tags:
  - yaml
  - frontmatter
  - specification
last_updated: "2025-02-20"
---

# YAML フロントマター仕様ガイド

skill-creator-max のリファレンス・テンプレートファイルに付与する YAML フロントマターの仕様。

## 基本構造

```yaml
---
title: ドキュメントのタイトル
category: reference | template | guide
version: "1.0.0"
description: 1行の説明文
project: ffmpeg-command-generate-webapp
tags:
  - tag1
  - tag2
last_updated: "YYYY-MM-DD"
---
```

## フィールド定義

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `title` | string | 必須 | ドキュメントのタイトル（日本語OK） |
| `category` | string | 必須 | `reference`, `template`, `guide` のいずれか |
| `version` | string | 必須 | セマンティックバージョニング |
| `description` | string | 必須 | 1行の説明文 |
| `project` | string | 推奨 | 対象プロジェクト名 |
| `tags` | list | 推奨 | 検索用タグ（英語小文字ケバブケース） |
| `last_updated` | string | 推奨 | 最終更新日（ISO 8601） |
| `author` | string | 任意 | 著者名 |
| `requires` | list | 任意 | 必要な外部ツール |
| `compatible_with` | list | 任意 | 互換性のある環境 |
| `deprecated` | boolean | 任意 | 非推奨フラグ |

## カテゴリ定義

### reference

リファレンスドキュメント。特定のトピックについての詳細情報。

```yaml
category: reference
```

### template

スキル作成のテンプレート。コピーして使用する。

```yaml
category: template
```

### guide

ステップバイステップのガイド。手順に従って作業する。

```yaml
category: guide
```

## バージョニングルール

セマンティックバージョニング（SemVer）に従う:

- **メジャー（1.0.0 → 2.0.0）**: 構造の大幅変更、後方互換性なし
- **マイナー（1.0.0 → 1.1.0）**: 新セクション追加、後方互換あり
- **パッチ（1.0.0 → 1.0.1）**: 誤字修正、表現改善

## タグの命名規則

| ルール | 例 |
|--------|------|
| 英語小文字 | `workflow`, `testing` |
| ケバブケース | `code-generation`, `error-handling` |
| 単数形 | `pattern`（`patterns` ではない） |
| 具体的 | `vitest` > `test-framework` |

### 推奨タグ一覧

- `guide`, `reference`, `template`
- `workflow`, `pattern`, `checklist`
- `testing`, `deploy`, `codegen`
- `advanced`, `beginner`, `intermediate`
- `chrome-mcp`, `bash`, `vitest`
- `svelte`, `typescript`, `css`

## 注意事項

1. **Claude Code のスキルファイル（.claude/skills/*.md）自体にはフロントマターは不要**
   - フロントマターは skill-creator-max のリファレンス・テンプレートファイル用
   - `.claude/skills/` 内のスキルは `# title` で始まる純粋な Markdown

2. **YAML の値にコロンが含まれる場合はクォートする**
   ```yaml
   # NG
   description: 対象: すべてのファイル
   # OK
   description: "対象: すべてのファイル"
   ```

3. **日付は文字列として扱う**
   ```yaml
   # NG (YAML パーサーが日付オブジェクトと解釈する可能性)
   last_updated: 2025-02-20
   # OK
   last_updated: "2025-02-20"
   ```
