---
title: "Codex CLI ワークフロー完全設計書"
description: "Codex CLI設定（AGENTS.md、config.toml、OpenAI/Geminiオプション）"
category: "workflow"
created: "2026-02-27"
updated: "2026-03-07"
---

# Codex CLI（OpenAI）ワークフロー完全設計書

> **対象**: macOS 環境でモダンフロントエンドプロジェクトに MCP 統合開発環境を構築する
> **MCP 構成**: CocoIndex + Cipher + Serena + Chrome DevTools
> **最終更新**: 2026-02-26

---

## 目次

1. [前提条件](#1-前提条件)
2. [Codex CLI のインストール](#2-codex-cli-のインストール)
3. [プロジェクト指示ファイルの作成](#3-プロジェクト指示ファイルの作成)
4. [MCP サーバー設定](#4-mcp-サーバー設定)
5. [Cipher 詳細設定](#5-cipher-詳細設定)
6. [Serena オンボーディング](#6-serena-オンボーディング)
7. [実装ワークフロー定義](#7-実装ワークフロー定義)
8. [品質チェック・テストワークフロー](#8-品質チェックテストワークフロー)
9. [デプロイワークフロー](#9-デプロイワークフロー)
10. [動作確認チェックリスト](#10-動作確認チェックリスト)
11. [トラブルシューティング](#11-トラブルシューティング)
12. [メンテナンス注意事項](#12-メンテナンス注意事項)
13. [参考：FFmpeg Command Generator での実例](#13-参考ffmpeg-command-generator-での実例)

---

## 1. 前提条件

### 必須ソフトウェア

```bash
# Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js 20+
brew install node@20

# Python 3.11+ と uv（uvx コマンド提供）
brew install uv

# Git + GitHub CLI
brew install git gh
gh auth login

# Chrome ブラウザ（Chrome DevTools MCP 用）
# https://www.google.com/chrome/
```

### uvx パスの確認（重要）

```bash
which uvx
# 期待値: /Users/USERNAME/.local/bin/uvx

# PATH に含まれていない場合
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### API キー

| キー | 用途 | 取得先 |
|------|------|--------|
| OpenAI API Key | Codex CLI 本体 + Cipher（Option A） | https://platform.openai.com/api-keys |
| Gemini API Key | Cipher の LLM・Embedding（Option B） | https://aistudio.google.com/apikey（無料） |

**Cipher の API 選択肢**:

| Option | Cipher のバックエンド | メリット | デメリット |
|--------|---------------------|---------|-----------|
| **A: OpenAI** | OpenAI（LLM + Embedding） | 設定がシンプル。ダミーキー不要 | OpenAI API 料金が発生 |
| **B: Gemini** | Gemini（LLM + Embedding） | 無料枠で運用可能 | ダミー OPENAI_API_KEY + cipher.yml 編集が必要 |

```bash
# ~/.zshrc に追加
export OPENAI_API_KEY="sk-..."           # Codex CLI 本体用（必須）
export GEMINI_API_KEY="AIza..."          # Cipher 用（Option B の場合）
source ~/.zshrc
```

---

## 2. Codex CLI のインストール

```bash
# npm でインストール
npm install -g @openai/codex

# バージョン確認
codex --version

# 初回起動（プロジェクトディレクトリで）
cd /path/to/your-project
codex
# → 初回はプロジェクト信頼ダイアログが表示される
```

### Codex の動作モード

| モード | 説明 |
|--------|------|
| `suggest` | コマンドを提案するが実行前に確認を求める |
| `auto-edit` | ファイル編集は自動、コマンド実行は確認 |
| `full-auto` | すべて自動実行（注意して使用） |

```bash
# モード指定で起動
codex --approval-mode auto-edit
```

---

## 3. プロジェクト指示ファイルの作成

Codex は `AGENTS.md` をプロジェクト指示ファイルとして読み込む。

> **注意**: Codex は `CLAUDE.md` も `project_doc_fallback_filenames` 設定で読み込めるが、標準は `AGENTS.md`。

### 3.1 AGENTS.md（メイン指示ファイル）

Codex には Claude Code の「スキル」や「ルール」の分離概念がないため、すべてを `AGENTS.md` に統合する。

```markdown
# AGENTS.md — [プロジェクト名]

[フレームワーク] + [言語] + [スタイリング]。[デプロイ先]。

**本番URL**: https://...

## コマンド

```bash
npm run dev          # 開発サーバー
npm run build        # ビルド
npm run check        # 型チェック
npm run test         # テスト
npm run lint         # Lint
```

## 重要ファイル

| パス | 役割 |
|------|------|
| `src/...` | ... |

## コーディングルール

### CSS
- [プロジェクト固有の CSS ルール]

### フレームワーク
- [プロジェクト固有のフレームワークルール]

### 国際化
- [i18n ルール]

### アーキテクチャ
- [アーキテクチャルール]

## 落とし穴・非自明なルール

- ...

## デプロイフロー

...

## MCP サーバー

本プロジェクトでは 4 つの MCP サーバーを使用する。

| MCP | 用途 |
|-----|------|
| **CocoIndex** | セマンティックコード検索 |
| **Cipher** | 長期記憶（メモリ保存・検索） |
| **Serena** | シンボル解析 |
| **Chrome DevTools** | UI テスト |

## AI行動規範

1. 推測でコードを書かない：CocoIndex で現状を確認してから着手
2. 記憶を活用する：新タスクの前に Cipher で過去の決定事項を検索
3. 知識を蓄積する：タスク完了後は Cipher に結果を保存
4. 計画を提示する：実装前に計画をリスト形式で出力し、承認を得る

## ワークフロー

### 実装ワークフロー（新機能・大規模改修時）

推測でコードを書くことを禁止する。必ず以下のステップを順番に実行すること。

**Step 1: 過去の文脈の確認（Cipher）**
`cipher_memory_search` で関連する過去の決定事項・設計方針を検索する。

**Step 2: 現在のコードベースの把握（CocoIndex）**
`cocoindex-code search` で関連する既存コンポーネント・関数・型定義を検索する。

**Step 3: シンボル依存関係の確認（Serena）**
`find_symbol` / `find_referencing_symbols` で修正対象の参照元を確認する。

**Step 4: 実装計画の提示と承認**
Step 1〜3 の情報をもとに計画をリスト形式で出力し、ユーザーの承認を得る。

**Step 5: 実装**
承認後、計画に従って実装する。既存パターンを踏襲すること。

**Step 6: 知識の保存（Cipher）**
`cipher_extract_and_operate_memory` で以下を保存する：
- 実装した機能の概要
- 設計上の決定事項とその理由
- 注意点・落とし穴
- API キー等は `[MASKED]` に置換

### テストワークフロー

1. `npm run check` — 型チェック
2. `npm run test` — ユニットテスト
3. `npm run lint` — Lint
4. 失敗があれば原因を特定し修正方法を提案する

### デプロイワークフロー

1. 前提チェック: `npm run check` + `npm run lint` + `git status`
2. `git push origin main`
3. CI 待機: `gh run watch`
4. デプロイ URL 確認
```

### 3.2 AGENTS.md のサブディレクトリ拡張

Codex は `AGENTS.md` を階層的に解釈する。サブディレクトリに配置すると、そのディレクトリ以下でのみ適用される：

```
AGENTS.md                    # プロジェクト全体
src/lib/ffmpeg/AGENTS.md     # FFmpeg 関連コードに限定した追加ルール
tests/AGENTS.md              # テスト関連の追加ルール
```

### 3.3 .gitignore への追加

```gitignore
# MCP local data
.cipher/
.serena/
.cocoindex_code/
```

---

## 4. MCP サーバー設定

### 設定ファイルの場所

Codex の MCP 設定はプロジェクトルートの `.codex/config.toml` に格納する。

### 4.1 config.toml の作成

`.codex/config.toml`:

```toml
# Codex 基本設定
model = "o4-mini"              # 使用モデル（o4-mini, gpt-4.1 等）
approval_policy = "auto-edit"   # suggest / auto-edit / full-auto

# === CocoIndex（セマンティックコード検索）===
[mcp_servers.cocoindex-code]
command = "/Users/USERNAME/.local/bin/uvx"
args = ["--prerelease=explicit", "--with", "cocoindex>=1.0.0a18", "cocoindex-code@latest"]
```

#### Option A: Cipher に OpenAI を使用する場合

```toml
# === Cipher（長期記憶）— OpenAI バックエンド ===
[mcp_servers.cipher]
command = "npx"
args = ["-y", "@byterover/cipher", "--mode", "mcp"]

[mcp_servers.cipher.env]
MCP_SERVER_MODE = "aggregator"
OPENAI_API_KEY = ""  # shell 環境変数 $OPENAI_API_KEY が自動展開される
```

> **ポイント**: Codex は OPENAI_API_KEY を既に持っているため、Cipher もデフォルトの OpenAI 設定で動作する。cipher.yml の編集は不要。

#### Option B: Cipher に Gemini を使用する場合

```toml
# === Cipher（長期記憶）— Gemini バックエンド ===
[mcp_servers.cipher]
command = "npx"
args = ["-y", "@byterover/cipher", "--mode", "mcp"]

[mcp_servers.cipher.env]
MCP_SERVER_MODE = "aggregator"
OPENAI_API_KEY = "sk-dummy-bypass-for-gemini"
GEMINI_API_KEY = "[YOUR_GEMINI_API_KEY]"
EMBEDDING_PROVIDER = "gemini"
EMBEDDING_MODEL = "gemini-embedding-001"
LLM_PROVIDER = "gemini"
LLM_MODEL = "gemini-2.5-flash"
```

> **注意**: cipher.yml の編集も必要（Cipher 詳細設定 参照）。

```toml
# === Serena（シンボル解析）===
[mcp_servers.serena]
command = "/Users/USERNAME/.local/bin/uvx"
args = [
  "--from", "git+https://github.com/oraios/serena",
  "serena-mcp-server",
  "--context", "ide-assistant",
  "--project", "/path/to/your-project"
]

# === Chrome DevTools（UI テスト）===
[mcp_servers.chrome-devtools]
command = "npx"
args = ["chrome-devtools-mcp@latest"]
```

### 4.2 完全な config.toml（Option A: OpenAI）

```toml
model = "o4-mini"
approval_policy = "auto-edit"

[mcp_servers.cocoindex-code]
command = "/Users/USERNAME/.local/bin/uvx"
args = ["--prerelease=explicit", "--with", "cocoindex>=1.0.0a18", "cocoindex-code@latest"]

[mcp_servers.cipher]
command = "npx"
args = ["-y", "@byterover/cipher", "--mode", "mcp"]

[mcp_servers.cipher.env]
MCP_SERVER_MODE = "aggregator"

[mcp_servers.serena]
command = "/Users/USERNAME/.local/bin/uvx"
args = ["--from", "git+https://github.com/oraios/serena", "serena-mcp-server", "--context", "ide-assistant", "--project", "/path/to/your-project"]

[mcp_servers.chrome-devtools]
command = "npx"
args = ["chrome-devtools-mcp@latest"]
```

### 4.3 完全な config.toml（Option B: Gemini）

```toml
model = "o4-mini"
approval_policy = "auto-edit"

[mcp_servers.cocoindex-code]
command = "/Users/USERNAME/.local/bin/uvx"
args = ["--prerelease=explicit", "--with", "cocoindex>=1.0.0a18", "cocoindex-code@latest"]

[mcp_servers.cipher]
command = "npx"
args = ["-y", "@byterover/cipher", "--mode", "mcp"]

[mcp_servers.cipher.env]
MCP_SERVER_MODE = "aggregator"
OPENAI_API_KEY = "sk-dummy-bypass-for-gemini"
GEMINI_API_KEY = "[YOUR_GEMINI_API_KEY]"
EMBEDDING_PROVIDER = "gemini"
EMBEDDING_MODEL = "gemini-embedding-001"
LLM_PROVIDER = "gemini"
LLM_MODEL = "gemini-2.5-flash"

[mcp_servers.serena]
command = "/Users/USERNAME/.local/bin/uvx"
args = ["--from", "git+https://github.com/oraios/serena", "serena-mcp-server", "--context", "ide-assistant", "--project", "/path/to/your-project"]

[mcp_servers.chrome-devtools]
command = "npx"
args = ["chrome-devtools-mcp@latest"]
```

### 4.4 Codex 固有の MCP 設定オプション

```toml
[mcp_servers.cipher]
command = "npx"
args = ["-y", "@byterover/cipher", "--mode", "mcp"]
startup_timeout_sec = 30       # 起動タイムアウト（デフォルト: 10秒）
tool_timeout_sec = 120         # ツール実行タイムアウト（デフォルト: 60秒）

# 特定ツールのみ有効化する場合
# enabled_tools = ["cipher_memory_search", "cipher_extract_and_operate_memory"]

# 特定ツールを無効化する場合
# disabled_tools = ["cipher_bash"]
```

### 4.5 プロジェクト信頼

Codex はセキュリティのため、プロジェクトの信頼を確認する：

- **信頼済みプロジェクト**: `.codex/config.toml` と `AGENTS.md` が読み込まれる
- **未信頼プロジェクト**: プロジェクトスコープの設定はスキップされる

初回起動時に信頼ダイアログが表示されるので「Trust」を選択する。

---

## 5. Cipher 詳細設定

### Option A を選択した場合（OpenAI）

cipher.yml の編集は**不要**。デフォルト設定（OpenAI）がそのまま使用される。

`$OPENAI_API_KEY` が `~/.zshrc` に設定されていれば、Cipher は自動的に OpenAI の LLM と Embedding を使用する。

### Option B を選択した場合（Gemini）

Claude Code / Cursor と同一の手順が必要。

#### 5.1 cipher.yml の編集

**対象**: `/opt/homebrew/lib/node_modules/@byterover/cipher/memAgent/cipher.yml`

```yaml
llm:
  provider: gemini
  model: gemini-2.5-flash
  apiKey: $GEMINI_API_KEY
  maxIterations: 50

embedding:
  type: gemini
  model: gemini-embedding-001
  apiKey: $GEMINI_API_KEY
```

#### 5.2 既知のバグと回避策

| バグ | 詳細 | 回避策 |
|------|------|--------|
| **起動バリデーション**（v0.3.0） | `GEMINI_API_KEY` のみでは起動不可 | ダミー `OPENAI_API_KEY=sk-dummy-bypass-for-gemini` |
| **cipher.yml 優先度** | 環境変数より YAML が優先される | cipher.yml を直接編集 |
| **npm update リセット** | `@byterover/cipher` 更新で cipher.yml がデフォルトに戻る | 更新後に再確認 |
| **MCP_SERVER_MODE** | デフォルト `ask` では `ask_cipher` のみ | `aggregator` に設定 |

### 5.3 正常動作の確認

Codex セッションで「Cipher のメモリを検索して」と指示し、レスポンスを確認：
- **embeddingTime 500-1000ms** → 正常
- **embeddingTime 0ms** → フォールバックモード（cipher.yml を確認）

---

## 6. Serena オンボーディング

### 手順

1. Codex セッションを開始
2. 指示: 「Serena のオンボーディング状態を確認して」
3. `false` が返った場合: 「Serena のオンボーディングを実行して」
4. 4 つのメモリファイルを作成：

| メモリ名 | 内容 |
|----------|------|
| `project_overview` | プロジェクト概要・技術スタック |
| `suggested_commands` | 開発コマンド一覧 |
| `style_conventions` | コーディング規約 |
| `task_completion` | タスク完了チェックリスト |

5. `.serena/memories/` にファイルが生成される（git 管理外）

---

## 7. 実装ワークフロー定義

Codex にはスキルの概念がないため、`AGENTS.md` の「ワークフロー」セクションに記載する（3.1 参照）。

### Codex での呼び出し方

```bash
codex
# Codex セッション内で:
> 新機能「ダークモード切替」を実装してください。
> AGENTS.md の実装ワークフローに従って、Step 1 から順番に実行してください。
```

### ワークフロー専用スクリプト（オプション）

頻繁に使うワークフローはシェルスクリプトとして定義し、Codex に実行させることもできる：

`scripts/workflows/implement.sh`:

```bash
#!/bin/bash
echo "=== 実装ワークフロー ==="
echo "Step 1: Cipher メモリ検索"
echo "Step 2: CocoIndex コード検索"
echo "Step 3: Serena シンボル解析"
echo "Step 4: 計画の提示"
echo "Step 5: 実装"
echo "Step 6: Cipher に結果保存"
echo ""
echo "Codex に各ステップの実行を指示してください。"
```

> **注意**: スクリプトは手順のリマインダーとしてのみ機能する。実際の MCP 操作は Codex が行う。

---

## 8. 品質チェック・テストワークフロー

`AGENTS.md` のテストワークフローセクション（3.1 参照）に加え、以下のスクリプトを用意するとよい：

`scripts/workflows/test-all.sh`:

```bash
#!/bin/bash
set -e
echo "=== 品質チェック ==="
echo "1. 型チェック..."
npm run check
echo "2. ユニットテスト..."
npm run test
echo "3. Lint..."
npm run lint
echo "✅ すべてのチェックに合格しました"
```

Codex セッションで: 「`scripts/workflows/test-all.sh` を実行して」

---

## 9. デプロイワークフロー

`scripts/workflows/deploy.sh`:

```bash
#!/bin/bash
set -e
echo "=== デプロイ前チェック ==="
npm run check
npm run lint

echo "=== Push ==="
git push origin main

echo "=== CI 待機 ==="
gh run list --limit 1 --json databaseId --jq '.[0].databaseId' \
  | xargs gh run watch --exit-status

echo "✅ デプロイ完了"
```

---

## 10. 動作確認チェックリスト

Codex セッションで以下を確認する：

```
✅ CocoIndex
  → 「CocoIndex で main 関数を検索して」 → 結果が返ること

✅ Cipher
  → 「Cipher メモリを検索して」 → 結果が返ること
  → embeddingTime が 0ms でないこと

✅ Serena
  → 「Serena のオンボーディング状態を確認して」 → true

✅ Chrome DevTools
  → Chrome 起動状態で「ブラウザのページ一覧を取得して」 → タブ一覧
```

---

## 11. トラブルシューティング

### Codex 固有の問題

| 症状 | 原因 | 対処 |
|------|------|------|
| MCP サーバーが起動しない | コマンドパスが間違い | `which uvx` でフルパスを確認 |
| `.codex/config.toml` が無視される | プロジェクト未信頼 | `codex` 初回起動で Trust を選択 |
| TOML 構文エラー | 設定ファイルの書式ミス | TOML バリデータで確認 |
| MCP ツール実行がタイムアウト | デフォルト 60秒 | `tool_timeout_sec = 120` に設定 |
| サンドボックスで `npx` が実行できない | sandbox 制限 | `approval_policy` を確認 |

### Cipher 共通の問題

| 症状 | 原因 | 対処 |
|------|------|------|
| "No API key or Ollama configuration found" | 起動バリデーションバグ | ダミー `OPENAI_API_KEY` を設定（Option B の場合） |
| "openai embedding failed" | cipher.yml が OpenAI のまま | cipher.yml を Gemini に変更（Option B の場合） |
| embeddingTime が 0ms | フォールバックモード | cipher.yml + API キーを確認 |
| `ask_cipher` しか見えない | MCP_SERVER_MODE 未設定 | `aggregator` に設定 |
| npm update 後に動作しない | cipher.yml がリセット | cipher.yml を再編集 |

### その他共通の問題

| 症状 | 原因 | 対処 |
|------|------|------|
| "onboarding not performed" | Serena 初回 or データ削除 | `onboarding` を再実行 |
| uvx コマンドが見つからない | PATH 未設定 | フルパスを使用 |
| Chrome タブが見えない | Chrome 未起動 | Chrome を先に起動 |

---

## 12. メンテナンス注意事項

| 操作 | リスク | 対処 |
|------|--------|------|
| `npm update @byterover/cipher` | cipher.yml リセット（Option B） | 更新後に cipher.yml を確認 |
| `uvx` パッケージ更新 | CocoIndex / Serena は自動更新 | 通常は問題なし |
| Codex のアップデート | `config.toml` スキーマ変更の可能性 | 更新後に MCP 接続確認 |
| `.serena/` の削除 | オンボーディングメモリ消失 | 再オンボーディング |
| `.cipher/` の削除 | ローカルメモリデータ消失 | Cipher メモリの再構築が必要 |
| `AGENTS.md` の変更 | ルールとワークフローが一体 | 変更時は全セクションの整合性を確認 |

### Claude Code / Cursor との並行運用

同一プロジェクトで Codex と他ツールを並行運用する場合：

| 項目 | 共有される | 同期が必要 |
|------|----------|-----------|
| `.cipher/` データ | ✅ | — |
| `.serena/` データ | ✅ | — |
| `.cocoindex_code/` データ | ✅ | — |
| プロジェクトルール | ❌ | `AGENTS.md` ↔ `CLAUDE.md` ↔ `.cursor/rules/` |
| MCP 設定 | ❌ | `.codex/config.toml` ↔ `~/.claude.json` ↔ `.cursor/mcp.json` |
| Cipher の cipher.yml | ✅（共通） | — |

> **ルールの同期**: プロジェクトルールを変更した場合、対応する全ツールの指示ファイルを更新すること。

---

## 13. 参考：FFmpeg Command Generator での実例

### AGENTS.md の実例（抜粋）

```markdown
# AGENTS.md — FFmpeg Command Generator

SvelteKit 2 + Svelte 5 (Runes) + TypeScript + Tailwind CSS v4。
フロントエンドのみ（Vercel SSG）。

**本番URL**: https://www.cmd-gen.com

## コマンド

- `npm run dev` — 開発サーバー http://localhost:5173
- `npm run build && npm run preview` — ビルド確認 http://localhost:4173
- `npm run check` — 型チェック（svelte-check）
- `npm run test` — Vitest ユニットテスト
- `bash scripts/lint-css.sh` — CSS oklch ルールチェック

## コーディングルール

### CSS
- 色は oklch() のみ。#hex, rgb(), hsl() は CI で reject される
- グラデーションは in oklab 必須: `linear-gradient(135deg in oklab, ...)`
- フォントサイズは clamp() トークン: `var(--text-xs)` 〜 `var(--text-3xl)`

### Svelte 5
- `$state()`, `$derived()`, `$props()`, `$effect()` を使用
- Svelte 4 の writable() / readable() は禁止
- `$state` Proxy は structuredClone 不可 → `JSON.parse(JSON.stringify())` を使う
- ブラウザ API は onMount 内で使う（SSR 制約）

### i18n
- ja.json と en.json の両方に必ずキーを追加
- 補間構文: `{{variable}}`
- 言語判定は `$locale` ストアを使う（document.documentElement.lang は非リアクティブ）

### FFmpeg コマンド生成
- コマンド組立順序: ffmpeg → global → input opts → -i → video → audio → filters → misc → output
- GIF 生成: 改行区切り 2 コマンド（パレット生成 + GIF 生成）
- copyStreams=true → 個別コーデック指定は無視
```

### .codex/config.toml の実例（Option B: Gemini）

```toml
model = "o4-mini"
approval_policy = "auto-edit"

[mcp_servers.cocoindex-code]
command = "/Users/akiratakahashi/.local/bin/uvx"
args = ["--prerelease=explicit", "--with", "cocoindex>=1.0.0a18", "cocoindex-code@latest"]

[mcp_servers.cipher]
command = "npx"
args = ["-y", "@byterover/cipher", "--mode", "mcp"]

[mcp_servers.cipher.env]
MCP_SERVER_MODE = "aggregator"
OPENAI_API_KEY = "sk-dummy-bypass-for-gemini"
GEMINI_API_KEY = "[MASKED]"
EMBEDDING_PROVIDER = "gemini"
EMBEDDING_MODEL = "gemini-embedding-001"
LLM_PROVIDER = "gemini"
LLM_MODEL = "gemini-2.5-flash"

[mcp_servers.serena]
command = "/Users/akiratakahashi/.local/bin/uvx"
args = ["--from", "git+https://github.com/oraios/serena", "serena-mcp-server", "--context", "ide-assistant", "--project", "/Users/akiratakahashi/Projects/ffmpeg-command-generate-webapp"]

[mcp_servers.chrome-devtools]
command = "npx"
args = ["chrome-devtools-mcp@latest"]
```

### 3ツール比較まとめ

| 項目 | Claude Code | Cursor | Codex CLI |
|------|------------|--------|-----------|
| 指示ファイル | `CLAUDE.md` | `.cursor/rules/*.mdc` | `AGENTS.md` |
| ルール分離 | `.claude/rules/*.md` | `.mdc` frontmatter + globs | `AGENTS.md` に統合 |
| スキル | `.claude/skills/*.md` | `.mdc` + Composer | `AGENTS.md` + スクリプト |
| MCP 設定 | JSON in `~/.claude.json` | JSON in `.cursor/mcp.json` | TOML in `.codex/config.toml` |
| 設定スコープ | グローバル（プロジェクトキー） | プロジェクトローカル | プロジェクトローカル |
| AI モデル | Claude | 選択可 | GPT-4 / o4-mini |
| Cipher 推奨 | Gemini（無料） | Gemini（無料） | OpenAI（Codex と共用可） |
