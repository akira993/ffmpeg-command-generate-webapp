---
title: トラブルシューティング
category: reference
version: "1.0.0"
description: スキル作成・運用時に発生しやすい問題と解決策
project: ffmpeg-command-generate-webapp
tags:
  - troubleshooting
  - debug
  - faq
last_updated: "2025-02-20"
---

# トラブルシューティング

スキル作成・運用時に発生しやすい問題と解決策。

## スキルが発火しない

### 症状

Claude Code で `/<name>` と入力してもスキルが認識されない。

### 原因と対処

| 原因 | 対処 |
|------|------|
| ファイルが `.claude/skills/` にない | 正しいディレクトリに配置 |
| ファイル拡張子が `.md` でない | `.md` に変更 |
| ファイル名にスペースや特殊文字 | ケバブケースに変更（`my-skill.md`） |
| H1 タイトルが欠落 | `# skill-name` を追加 |

### 確認コマンド

```bash
ls -la .claude/skills/
python3 skill-creator-max/scripts/quick_validate.py .claude/skills/
```

## スキルが意図と違う動作をする

### 症状

スキルは発火するが、期待通りの手順で実行されない。

### 原因と対処

| 原因 | 対処 |
|------|------|
| 手順が曖昧 | 具体的なコマンド・条件を明記 |
| 条件分岐が不明確 | 「〜の場合は」「〜なら」で分岐を明記 |
| 前提条件の不備 | 前提セクションに必要条件を追加 |
| コードブロックの言語タグなし | ` ```bash `, ` ```javascript ` を追加 |

### デバッグ方法

1. スキルを実行して Claude の解釈を観察
2. 曖昧な表現を特定
3. より具体的な記述に修正
4. 再実行して確認

## コードブロックのエラー

### 症状

バリデーションで「コードブロックが閉じていない」と報告される。

### 原因と対処

```markdown
<!-- NG: 開始と終了の ``` が不一致 -->
```bash
echo "hello"

<!-- OK: 正しく閉じている -->
```bash
echo "hello"
```（ここで閉じる）
```

### 確認コマンド

```bash
python3 skill-creator-max/scripts/quick_validate.py .claude/skills/<name>.md
```

## テーブル構文エラー

### 症状

テーブルが正しくレンダリングされない。

### よくある間違い

```markdown
<!-- NG: セパレータ行がない -->
| Header 1 | Header 2 |
| Cell 1 | Cell 2 |

<!-- NG: 列数不一致 -->
| Header 1 | Header 2 |
|------|------|
| Cell 1 | Cell 2 | Cell 3 |

<!-- OK -->
| Header 1 | Header 2 |
|------|------|
| Cell 1 | Cell 2 |
```

## i18n キーの不整合

### 症状

スキルで UI テキストを追加した後、片方の言語で表示が崩れる。

### 原因

`ja.json` と `en.json` の片方にしかキーを追加していない。

### 対処

```bash
# i18n チェックスキルで確認
# Claude Code で /i18n-check を実行

# または手動で確認
python3 -c "
import json
ja = json.load(open('src/lib/i18n/ja.json'))
en = json.load(open('src/lib/i18n/en.json'))
# フラット化して比較する
"
```

## CSS ルール違反

### 症状

スキルが CSS を生成・修正した後、CI で失敗する。

### 原因と対処

| 違反 | 修正前 | 修正後 |
|------|--------|--------|
| hex カラー | `color: #ff0000` | `color: oklch(0.58 0.24 20)` |
| rgb() | `background: rgb(0,0,0)` | `background: oklch(0 0 0)` |
| グラデーション | `linear-gradient(135deg, ...)` | `linear-gradient(135deg in oklab, ...)` |
| フォントサイズ直書き | `font-size: 16px` | `font-size: var(--text-base)` |

### 確認コマンド

```bash
bash scripts/lint-css.sh
```

## Svelte 5 関連のエラー

### structuredClone エラー

```
DOMException: Failed to execute 'structuredClone'
```

**対処**: `JSON.parse(JSON.stringify(...))` に置き換え

### SSR エラー

```
ReferenceError: window is not defined
```

**対処**: `onMount` 内に移動

```typescript
import { onMount } from 'svelte';

onMount(() => {
  // window, document はここで使う
});
```

## Python スクリプトのエラー

### ModuleNotFoundError

```
ModuleNotFoundError: No module named 'xxx'
```

**対処**: skill-creator-max のスクリプトは標準ライブラリのみ使用。
Python 3.10+ が必要。

### パス関連エラー

```
FileNotFoundError: .claude/skills/ ...
```

**対処**: プロジェクトルートから実行すること。

```bash
cd /path/to/ffmpeg-command-generate-webapp
python3 skill-creator-max/scripts/quick_validate.py .claude/skills/
```

## FAQ

### Q: スキルに YAML フロントマターは必要？

**A**: `.claude/skills/` 内のスキルファイルにはフロントマター不要。
`# title` で始まる純粋な Markdown でOK。
フロントマターは skill-creator-max のリファレンス・テンプレート用。

### Q: スキルの最大サイズは？

**A**: 明確な制限はないが、100行以内が推奨。
長すぎるスキルは複数に分割する（例: deploy + deploy-test）。

### Q: 日本語と英語どちらで書くべき？

**A**: このプロジェクトでは日本語。プロジェクトの主要言語に合わせる。

### Q: スキルは何個まで作れる？

**A**: 制限なし。ただし、類似スキルが増えすぎると管理が困難になる。
`analyze_skill.py` で定期的に棚卸しする。
