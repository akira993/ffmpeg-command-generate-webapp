---
title: 実践ワークフロー集
category: reference
version: "1.0.0"
description: スキルを活用した具体的な開発ワークフローの事例集
project: ffmpeg-command-generate-webapp
tags:
  - workflow
  - practice
  - example
last_updated: "2025-02-20"
---

# 実践ワークフロー集

このプロジェクトで実際に使われているスキルチェーンと開発ワークフロー。

## ワークフロー 1: フルデプロイサイクル

新機能を開発してデプロイし、検証するまでの一連の流れ。

```
開発 → /run-tests → /css-lint → /i18n-check → /deploy → /deploy-test
```

### Step-by-step

1. **機能開発**: コード変更
2. **`/run-tests`**: 型チェック + ユニットテスト
3. **`/css-lint`**: CSS oklch ルール違反チェック
4. **`/i18n-check`**: 翻訳キーの整合性確認
5. **コミット & push**: `git commit && git push origin main`
6. **`/deploy`**: CI 待機 → デプロイ URL 取得
7. **`/deploy-test`**: 本番 UI + パフォーマンステスト

### 所要時間目安

| ステップ | 目安 |
|---------|------|
| /run-tests | 10-30秒 |
| /css-lint | 5秒 |
| /i18n-check | 10秒 |
| /deploy (CI) | 1-3分 |
| /deploy-test | 1-2分 |

## ワークフロー 2: 品質チェックサイクル

PR 作成前に品質を担保するためのチェック。

```
/run-tests → /css-lint → /i18n-check → PR 作成
```

### 判断基準

| チェック | 合格条件 | 不合格時 |
|---------|---------|---------|
| /run-tests | 型エラー 0、テスト全合格 | 修正してリトライ |
| /css-lint | 違反 0 | oklch に変換 |
| /i18n-check | 欠落キー 0 | 両言語にキー追加 |

## ワークフロー 3: UI 変更確認サイクル

UI の変更後にレスポンシブ対応を確認する。

```
npm run build && npm run preview → /ui-test → (修正) → /ui-test
```

### チェックポイント

- デスクトップ (1280x900): 4列グリッド、ActionButtons の位置
- モバイル (375x812): 2列グリッド、固定バー、横スクロールなし
- 機能: プリセット選択、言語切替、テーマ切替

## ワークフロー 4: パフォーマンス改善サイクル

パフォーマンス指標を計測し、改善を繰り返す。

```
/perf-test (ベースライン) → 改善 → /perf-test (改善後) → 比較
```

### 改善前後の比較テンプレート

```
## パフォーマンス改善結果
| 指標 | 改善前 | 改善後 | 変化 |
|------|--------|--------|------|
| FCP  | XXms   | XXms   | -XX% |
| LCP  | XXms   | XXms   | -XX% |
| CLS  | X.XX   | X.XX   | -XX% |
| 転送サイズ | XXKB | XXKB | -XX% |
```

## ワークフロー 5: 新スキル作成サイクル

skill-creator-max を使って新しいスキルを作成する。

```
init_skill.py → quick_validate.py → 実行テスト → comprehensive_validate.py → CLAUDE.md 追記
```

### Step-by-step

1. **雛形生成**
   ```bash
   python3 skill-creator-max/scripts/init_skill.py
   ```

2. **内容を記述**: 手順、前提条件、失敗時対応を記入

3. **構文チェック**
   ```bash
   python3 skill-creator-max/scripts/quick_validate.py .claude/skills/<name>.md
   ```

4. **Claude Code で実行テスト**: `/<name>` を実行

5. **品質チェック**
   ```bash
   python3 skill-creator-max/scripts/comprehensive_validate.py .claude/skills/
   ```

6. **CLAUDE.md に追記**

## ワークフロー 6: スキル棚卸しサイクル

定期的にスキルの品質と有用性を確認する。

```
analyze_skill.py --suggest → 改善 → comprehensive_validate.py
```

### Step-by-step

1. **現状分析**
   ```bash
   python3 skill-creator-max/scripts/analyze_skill.py .claude/skills/ --suggest
   ```

2. **改善提案の確認**: 各スキルの💡提案を確認

3. **優先度の高い改善を実施**: スコア D 以下のスキルを優先的に改善

4. **再バリデーション**
   ```bash
   python3 skill-creator-max/scripts/comprehensive_validate.py .claude/skills/ --strict
   ```
