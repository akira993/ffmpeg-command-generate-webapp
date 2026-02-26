---
title: 配布・共有ガイド
category: reference
version: "1.0.0"
description: スキルをチーム・コミュニティで共有する際のガイドライン
project: ffmpeg-command-generate-webapp
tags:
  - distribution
  - sharing
  - collaboration
last_updated: "2025-02-20"
---

# 配布・共有ガイド

作成したスキルをチームやコミュニティと共有する際のガイドライン。

## 配布方法

### 1. Git リポジトリ内共有（推奨）

スキルを `.claude/skills/` にコミットしてリポジトリで共有。

```bash
git add .claude/skills/<name>.md
git commit -m "feat: add /<name> skill for <purpose>"
git push origin main
```

**メリット:**
- バージョン管理される
- PR レビューで品質を担保できる
- プロジェクトのコンテキストと一緒に管理される

### 2. skill-creator-max テンプレートとして共有

他のプロジェクトでも使えるテンプレートを `skill-creator-max/templates/` に配置。

### 3. スタンドアロン共有

スキルファイル単体をコピーして別プロジェクトに導入。

## 共有前のチェックリスト

### 品質チェック

- [ ] `quick_validate.py` でエラーなし
- [ ] `comprehensive_validate.py` でスコア B (75+) 以上
- [ ] 実行テストで正常動作確認済み

### ドキュメント

- [ ] H1 + 説明文でスキルの目的が明確
- [ ] 前提条件が明記されている
- [ ] 手順が具体的（コマンド例付き）
- [ ] 失敗時の対応が記載されている

### セキュリティ

- [ ] 機密情報（トークン、パスワード）が含まれていない
- [ ] 内部 URL が外部公開されていない
- [ ] 個人情報が含まれていない

### 互換性

- [ ] プロジェクト固有の依存が明記されている
- [ ] 汎用的に使える部分と固有部分が区別されている
- [ ] 必要なツール・バージョンが前提に記載されている

## スキルの汎用化

プロジェクト固有のスキルを汎用化する手順:

### Step 1: 固有部分の特定

```markdown
# 元のスキル (deploy.md) の固有部分:
- リポジトリ名: akira993/ffmpeg-command-generate-webapp
- 本番 URL: https://www.cmd-gen.com
- CI ツール: GitHub Actions
- デプロイ先: Vercel
```

### Step 2: パラメータ化

固有部分をプレースホルダーに置き換える:

```markdown
# 汎用化後:
- リポジトリ名: <REPO_OWNER>/<REPO_NAME>
- 本番 URL: <PRODUCTION_URL>
- CI ツール: GitHub Actions（カスタマイズ可能）
- デプロイ先: <DEPLOY_TARGET>
```

### Step 3: テンプレートとして保存

`skill-creator-max/templates/` にテンプレートとして配置。

## コミットメッセージの規約

スキルの追加・変更に関するコミットメッセージ:

```bash
# 新規スキル追加
feat: add /<name> skill for <purpose>

# スキル改善
improve: update /<name> skill with error handling

# スキルの修正
fix: correct command example in /<name> skill

# スキル削除
remove: deprecate /<name> skill (replaced by /<new-name>)
```

## PR テンプレート

スキルの追加・変更 PR の推奨テンプレート:

```markdown
## 概要

- 新規スキル `/<name>` を追加
- 目的: <スキルの目的>
- カテゴリ: <テスト・検証 / ビルド・デプロイ / コード生成>

## テスト結果

- quick_validate: ✅ (エラーなし)
- comprehensive_validate: A (95/100)
- 実行テスト: ✅ (正常動作確認済み)

## チェックリスト

- [ ] CLAUDE.md のスキルテーブルに追記済み
- [ ] ja.json / en.json の翻訳キー追加（必要な場合）
- [ ] 実行テスト済み
```
