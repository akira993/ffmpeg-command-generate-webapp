---
title: 技術要件チェックリスト
category: reference
version: "1.0.0"
description: スキル定義における技術的な要件と制約の一覧
project: ffmpeg-command-generate-webapp
tags:
  - technical
  - requirements
  - checklist
last_updated: "2025-02-20"
---

# 技術要件チェックリスト

スキル定義が技術的に正しいことを保証するためのチェックリスト。

## Markdown 構造要件

### 必須

- [ ] H1 タイトルが 1 つだけ存在する
- [ ] H1 直後に 1 行以上の説明文がある
- [ ] `## 手順` セクションが存在する
- [ ] 手順は番号付きリスト（`1. 2. 3.`）で記述
- [ ] コードブロックは言語タグ付き（```bash, ```javascript）
- [ ] コードブロックは開始と終了が対になっている
- [ ] テーブルの列数が行ごとに統一されている

### 推奨

- [ ] `## 前提` セクション
- [ ] `## 失敗時の対応` セクション
- [ ] `## 結果レポート` セクション
- [ ] コマンド例が 1 つ以上含まれる

### 禁止

- [ ] 複数の H1 が存在しない
- [ ] HTML タグを直接使用しない
- [ ] 相対パスが不正確でない

## このプロジェクト固有の技術制約

### CSS ルール（oklch 強制）

スキルが CSS を生成・修正する場合:

| 項目 | 制約 |
|------|------|
| 色指定 | `oklch()` のみ（`#hex`, `rgb()`, `hsl()` 禁止） |
| グラデーション | `linear-gradient(deg in oklab, ...)` 必須 |
| フォントサイズ | `var(--text-xs)` 〜 `var(--text-3xl)` トークン使用 |
| CI チェック | `bash scripts/lint-css.sh` で検証 |

### Svelte 5 Runes ルール

スキルがコンポーネントを操作する場合:

| 項目 | 制約 |
|------|------|
| 状態管理 | `$state()`, `$derived()`, `$effect()` のみ |
| Store | クラスベース Store（Svelte 4 の writable/readable 禁止） |
| ディープコピー | `JSON.parse(JSON.stringify(...))` を使用（`structuredClone` 禁止） |
| SSR | `window`/`document` は `onMount` 内のみ |

### i18n ルール

スキルが UI テキストを追加・変更する場合:

| 項目 | 制約 |
|------|------|
| 翻訳ファイル | `ja.json` と `en.json` の両方に必ず追加 |
| 補間構文 | `{{variable}}` 形式 |
| キー構造 | 既存の階層に従う |

### FFmpeg ビルダールール

スキルがコマンド生成ロジックに関わる場合:

| 項目 | 制約 |
|------|------|
| 引数順序 | `ffmpeg [global] [input] -i input [video] [audio] [filter] output` |
| GIF 生成 | 改行区切りで 2 コマンド（パレット + GIF） |
| copyStreams | `true` のとき個別コーデック指定は無視 |
| noVideo/noAudio | 対応するコーデック設定を無視して `-vn`/`-an` のみ |

## コマンド実行環境

### 利用可能なツール

| ツール | 用途 | 備考 |
|--------|------|------|
| Bash | シェルコマンド実行 | npm, git, gh, bash script |
| Chrome MCP | ブラウザ操作 | UI テスト、パフォーマンス計測 |
| Read | ファイル読み込み | ソースコード確認 |
| Grep | テキスト検索 | パターンマッチ |
| Edit | ファイル編集 | 部分書き換え |
| Write | ファイル作成 | 新規ファイル生成 |

### 利用不可のツール

- `structuredClone`（Svelte 5 Proxy の制約）
- `vercel` CLI（デプロイは git push 経由のみ）
- ブラウザの `window`/`document`（SSR 環境、onMount 外）

## パフォーマンス基準

スキルがパフォーマンス計測に関わる場合の基準値:

| 指標 | 目標値 | 補足 |
|------|--------|------|
| TTFB | < 200ms | Vercel Edge |
| FCP | < 1000ms | 初回描画 |
| DOMContentLoaded | < 500ms | JS パース完了 |
| Load Complete | < 1500ms | 全リソース |
| 転送サイズ合計 | < 300KB | gzip 後 |
| JS 転送サイズ | < 200KB | gzip 後 |
| CLS | < 0.1 | レイアウトシフト |
| インタラクション応答 | < 100ms | 体感遅延なし |

## バリデーション方法

```bash
# 構文チェック
python3 skill-creator-max/scripts/quick_validate.py .claude/skills/<name>.md

# 総合バリデーション
python3 skill-creator-max/scripts/comprehensive_validate.py .claude/skills/ --strict

# トリガーテスト
python3 skill-creator-max/scripts/test_trigger.py .claude/skills/
```
