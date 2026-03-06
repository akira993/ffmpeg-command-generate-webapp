---
title: "Cursor エディタ ワークフロー完全設計書"
description: "Cursor IDE設定（.cursor/rules/*.mdc、MCP設定、Agent mode）"
category: "workflow"
created: "2026-02-27"
updated: "2026-03-07"
---

# Cursor エディタ ワークフロー完全設計書

> **対象**: macOS 環境でモダンフロントエンドプロジェクトに MCP 統合開発環境を構築する
> **MCP 構成**: CocoIndex + Cipher + Serena + Chrome DevTools
> **最終更新**: 2026-02-26

---

## 目次

1. [前提条件](#1-前提条件)
2. [Cursor のインストールと設定](#2-cursor-のインストールと設定)
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

> **⚠️ 重要**: MCP 設定では `uvx` のフルパスを使用すること。

### API キー

| キー | 用途 | 取得先 |
|------|------|--------|
| Gemini API Key | Cipher の LLM・Embedding | https://aistudio.google.com/apikey（無料） |
| Cursor AI モデル | Cursor 内蔵モデル or API キー | Cursor Settings > Models |

```bash
# ~/.zshrc に追加（Cipher 用）
export GEMINI_API_KEY="AIza..."
source ~/.zshrc
```

---

## 2. Cursor のインストールと設定

### 2.1 インストール

1. https://cursor.com からダウンロード
2. `/Applications/Cursor.app` にドラッグ
3. 初回起動でアカウント設定

### 2.2 AI モデルの設定

1. `Cmd + ,` → Settings > Models
2. 使用するモデルを選択（Claude Sonnet, GPT-4, etc.）
3. API キーが必要な場合は入力

### 2.3 Composer の有効化

1. Settings > Features
2. **Composer** を有効化（Agent モードで MCP ツールを使用するために必要）
3. `Cmd + I` で Composer を起動

---

## 3. プロジェクト指示ファイルの作成

Cursor では `.cursor/rules/*.mdc` 形式でプロジェクトルールを定義する。

### 3.1 ディレクトリ構成

```
.cursor/
  rules/
    project-overview.mdc     # プロジェクト概要（常時適用）
    css.mdc                  # CSS ルール（CSS/Svelte ファイルに適用）
    framework.mdc            # フレームワーク固有ルール
    i18n.mdc                 # 国際化ルール
    architecture.mdc         # アーキテクチャルール
    implement-workflow.mdc   # 実装ワークフロー（常時適用）
    testing.mdc              # テストワークフロー
    deploy.mdc               # デプロイワークフロー
  mcp.json                   # MCP サーバー設定
```

### 3.2 .mdc ファイルフォーマット

`.mdc` ファイルは YAML frontmatter + Markdown 本文で構成される：

```markdown
---
description: "ルールの説明文"
globs: ["src/**/*.css", "src/**/*.svelte"]  # 適用対象ファイルパターン
alwaysApply: false                           # true: 常時適用 / false: glob マッチ時のみ
---

# ルール本文（Markdown）
...
```

### 3.3 プロジェクト概要ルール

`.cursor/rules/project-overview.mdc`:

```markdown
---
description: "プロジェクト概要、コマンド、重要ファイル、AI行動規範"
globs: []
alwaysApply: true
---

# [プロジェクト名]

[フレームワーク] + [言語] + [スタイリング]。[デプロイ先]。

**本番URL**: https://...

## コマンド

- `npm run dev` — 開発サーバー
- `npm run build` — ビルド
- `npm run check` — 型チェック
- `npm run test` — テスト
- `npm run lint` — Lint

## 重要ファイル

| パス | 役割 |
|------|------|
| `src/...` | ... |

## 落とし穴

- ...

## AI行動規範

1. 推測でコードを書かない：CocoIndex で現状を確認してから着手
2. 記憶を活用する：新タスクの前に Cipher で過去の決定事項を検索
3. 知識を蓄積する：タスク完了後は Cipher に結果を保存
4. 計画を提示する：実装前に計画を出力し、承認を得る
```

### 3.4 CSS ルール例

`.cursor/rules/css.mdc`:

```markdown
---
description: "CSS デザインシステムルール"
globs: ["src/**/*.css", "src/**/*.svelte", "src/**/*.tsx", "src/**/*.vue"]
alwaysApply: false
---

# CSS ルール

## プロジェクト固有のルールをここに記載

例:
- 色指定: oklch() のみ / Tailwind クラスのみ / CSS Variables のみ
- フォントサイズ: デザイントークンを使用
- グラデーション: 特定の補間空間を使用
```

### 3.5 フレームワークルール例

`.cursor/rules/framework.mdc`:

```markdown
---
description: "フレームワーク固有のコーディング規約"
globs: ["src/**/*.svelte", "src/**/*.tsx", "src/**/*.vue"]
alwaysApply: false
---

# フレームワークルール

## プロジェクト固有のルールをここに記載

例（Svelte 5）:
- `$state()`, `$derived()`, `$props()` を使用
- Svelte 4 の `writable()` 禁止
- `structuredClone` を `$state` Proxy に使わない

例（React）:
- カスタムフック命名: `use` プレフィックス
- コンポーネントは関数コンポーネントのみ

例（Vue 3）:
- Composition API (`<script setup>`) を使用
- Options API 禁止
```

### 3.6 .gitignore への追加

```gitignore
# MCP local data
.cipher/
.serena/
.cocoindex_code/

# Cursor MCP config (API キーを含む場合)
# .cursor/mcp.json
```

> **注意**: `.cursor/mcp.json` に API キーをハードコードする場合は `.gitignore` に追加すること。ラッパースクリプト方式（後述）を使えば `.gitignore` 不要。

---

## 4. MCP サーバー設定

### 設定ファイルの場所

Cursor の MCP 設定はプロジェクトルートの `.cursor/mcp.json` に格納する。

> **⚠️ Cursor の制約**: `.cursor/mcp.json` では環境変数参照（`$GEMINI_API_KEY`）が使えない場合がある。API キーは直接記載するか、ラッパースクリプトを使用する。

### 4.1 方法 A: 直接記載（シンプル、ただし鍵がファイルに残る）

`.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "cocoindex-code": {
      "command": "/Users/USERNAME/.local/bin/uvx",
      "args": [
        "--prerelease=explicit",
        "--with", "cocoindex>=1.0.0a18",
        "cocoindex-code@latest"
      ]
    },
    "cipher": {
      "command": "npx",
      "args": ["-y", "@byterover/cipher", "--mode", "mcp"],
      "env": {
        "MCP_SERVER_MODE": "aggregator",
        "OPENAI_API_KEY": "sk-dummy-bypass-for-gemini",
        "GEMINI_API_KEY": "[YOUR_GEMINI_API_KEY]",
        "EMBEDDING_PROVIDER": "gemini",
        "EMBEDDING_MODEL": "gemini-embedding-001",
        "LLM_PROVIDER": "gemini",
        "LLM_MODEL": "gemini-2.5-flash"
      }
    },
    "serena": {
      "command": "/Users/USERNAME/.local/bin/uvx",
      "args": [
        "--from", "git+https://github.com/oraios/serena",
        "serena-mcp-server",
        "--context", "ide-assistant",
        "--project", "/path/to/your-project"
      ]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"]
    }
  }
}
```

### 4.2 方法 B: ラッパースクリプト（API キーをファイルに残さない）

#### ラッパースクリプト作成

`scripts/mcp-cipher.sh`:

```bash
#!/bin/bash
export MCP_SERVER_MODE=aggregator
export OPENAI_API_KEY=sk-dummy-bypass-for-gemini
export GEMINI_API_KEY="${GEMINI_API_KEY}"
export EMBEDDING_PROVIDER=gemini
export EMBEDDING_MODEL=gemini-embedding-001
export LLM_PROVIDER=gemini
export LLM_MODEL=gemini-2.5-flash
exec npx -y @byterover/cipher --mode mcp
```

```bash
chmod +x scripts/mcp-cipher.sh
```

#### mcp.json（ラッパー版）

```json
{
  "mcpServers": {
    "cipher": {
      "command": "bash",
      "args": ["scripts/mcp-cipher.sh"]
    }
  }
}
```

### 4.3 MCP サーバーの確認

1. Cursor を再起動（または `Cmd + Shift + P` → "Reload Window"）
2. Settings > MCP を開く
3. 各サーバーの状態を確認：
   - 🟢 緑: 接続成功
   - 🔴 赤: 接続失敗（ログを確認）

### 4.4 MCP ツールの使い方

Cursor で MCP ツールを使用するには **Composer の Agent モード**を使う：

1. `Cmd + I` で Composer を開く
2. Agent モードを選択（チャットモードでは MCP ツールが使えない）
3. 自然言語で指示する（例: 「CocoIndex で buildCommand を検索して」）

---

## 5. Cipher 詳細設定

### 5.1 cipher.yml の編集（必須）

Claude Code と同一の手順。Cipher は環境変数よりも YAML を優先する。

**編集対象**: `/opt/homebrew/lib/node_modules/@byterover/cipher/memAgent/cipher.yml`

#### Gemini を使用する場合

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

### 5.2 既知のバグと回避策

Claude Code と同一の問題が発生する。MCP サーバーはツール非依存であるため：

| バグ | 回避策 |
|------|--------|
| 起動バリデーション（v0.3.0） | ダミー `OPENAI_API_KEY=sk-dummy-bypass-for-gemini` |
| 環境変数が cipher.yml に上書きされる | cipher.yml を直接編集 |
| npm update でリセット | 更新後に cipher.yml を再確認 |
| `ask_cipher` しか見えない | `MCP_SERVER_MODE=aggregator` を設定 |

### 5.3 正常動作の確認

Composer で「Cipher のメモリを検索して」と指示し、レスポンスを確認：
- `embeddingTime: 500-1000ms` → 正常
- `embeddingTime: 0ms` → フォールバックモード（cipher.yml を確認）

---

## 6. Serena オンボーディング

### 手順

1. Composer（Agent モード）を開く
2. 指示: 「Serena のオンボーディング状態を確認して（check_onboarding_performed）」
3. `false` が返った場合: 「Serena のオンボーディングを実行して（onboarding）」
4. 4 つのメモリファイルを作成するよう指示される

| メモリ名 | 内容 |
|----------|------|
| `project_overview` | プロジェクト概要・技術スタック |
| `suggested_commands` | 開発コマンド一覧 |
| `style_conventions` | コーディング規約 |
| `task_completion` | タスク完了チェックリスト |

5. Composer に各メモリの内容を指示して `write_memory` で作成

---

## 7. 実装ワークフロー定義

Cursor ではスキルの概念がないため、`.cursor/rules/implement-workflow.mdc` としてルールに組み込む：

```markdown
---
description: "新機能実装時の6ステップワークフロー（MCP 連携）"
globs: []
alwaysApply: true
---

# 実装ワークフロー

新機能の実装・大規模改修時は、以下の6ステップを必ず順番に実行すること。

## Step 1：過去の文脈の確認（Cipher）
Cipher の `cipher_memory_search` で関連する過去の決定事項を検索する。

## Step 2：現在のコードベースの把握（CocoIndex）
CocoIndex の `search` で関連する既存コード・型定義を検索する。

## Step 3：シンボル依存関係の確認（Serena）
Serena の `find_symbol` / `find_referencing_symbols` で参照元を確認する。

## Step 4：実装計画の提示と承認
Step 1〜3 の情報をもとに計画をリスト形式で出力し、ユーザーの承認を得る。

## Step 5：実装
承認後、計画に従って実装する。既存パターンを踏襲すること。

## Step 6：知識の保存（Cipher）
`cipher_extract_and_operate_memory` で実装結果を保存する。
- 機能概要、設計決定事項、注意点
- API キー等は `[MASKED]` に置換
```

### Composer での呼び出し方

Composer Agent モードで以下のように指示する：

```
新機能「ダークモード切替」を実装してください。
実装ワークフローのルールに従って、Step 1 から順番に実行してください。
```

---

## 8. 品質チェック・テストワークフロー

`.cursor/rules/testing.mdc`:

```markdown
---
description: "テスト・品質チェックワークフロー"
globs: []
alwaysApply: false
---

# テストワークフロー

## 実行手順
1. 型チェック: `npm run check`
2. ユニットテスト: `npm run test`
3. Lint: `npm run lint`
4. 失敗時は原因を特定し修正方法を提案する

## UI テスト（Chrome DevTools MCP 使用）
1. `npm run build && npm run preview` でサーバー起動
2. Chrome DevTools MCP でスクリーンショット取得
3. デスクトップ (1280×900) / モバイル (375×812) で確認
```

---

## 9. デプロイワークフロー

`.cursor/rules/deploy.mdc`:

```markdown
---
description: "デプロイワークフロー"
globs: []
alwaysApply: false
---

# デプロイワークフロー

## 前提チェック
1. `npm run check` — 型エラーなし
2. `npm run lint` — Lint 通過
3. `git status` — コミット漏れなし

## 手順
1. `git push origin main`
2. CI 待機: `gh run watch`
3. デプロイ URL 確認
```

---

## 10. 動作確認チェックリスト

```
✅ Cursor MCP ステータス
  → Settings > MCP → 4サーバーすべて 🟢

✅ CocoIndex
  → Composer: 「CocoIndex で main 関数を検索して」 → 結果が返ること

✅ Cipher
  → Composer: 「Cipher メモリを検索して」 → 結果が返ること
  → embeddingTime が 0ms でないこと

✅ Serena
  → Composer: 「Serena のオンボーディング状態を確認して」 → true

✅ Chrome DevTools
  → Chrome 起動状態で Composer: 「ブラウザのページ一覧を取得して」 → タブ一覧
```

---

## 11. トラブルシューティング

### Cursor 固有の問題

| 症状 | 原因 | 対処 |
|------|------|------|
| MCP サーバーが 🔴 | コマンドパスが間違っている | `which uvx` でフルパスを確認 |
| Composer で MCP ツールが使えない | Chat モードになっている | Agent モードに切替 |
| MCP サーバーが突然切断 | 長時間のアイドル | Cursor を再起動（Cmd+Shift+P > Reload） |
| `.cursor/mcp.json` が読み込まれない | JSON 構文エラー | コメント・末尾カンマを除去 |
| 環境変数 `$GEMINI_API_KEY` が展開されない | Cursor の制約 | 直接記載またはラッパースクリプトを使用 |

### Cipher 共通の問題

| 症状 | 原因 | 対処 |
|------|------|------|
| "No API key or Ollama configuration found" | 起動バリデーションバグ | ダミー `OPENAI_API_KEY` を設定 |
| "openai embedding failed" | cipher.yml が OpenAI のまま | cipher.yml を Gemini に変更 |
| embeddingTime が 0ms | フォールバックモード | cipher.yml + GEMINI_API_KEY を確認 |
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
| `npm update @byterover/cipher` | cipher.yml リセット | 更新後に cipher.yml を再確認 |
| Cursor アップデート | MCP 設定互換性 | 更新後に MCP ステータスを確認 |
| `.cursor/rules/` の変更 | チーム共有時に差分発生 | Git で管理し PR レビュー |
| `.cursor/mcp.json` に API キー | Git にコミットすると漏洩 | `.gitignore` に追加 or ラッパースクリプト |
| `.serena/` の削除 | オンボーディングメモリ消失 | 再オンボーディング |

### Claude Code との並行運用

同一プロジェクトで Claude Code と Cursor を並行運用する場合：

- `.claude/rules/` と `.cursor/rules/` は内容を同期させること
- MCP サーバーは同じサーバーを使用するが、設定ファイルが異なる
- Cipher のデータは共有される（同じ `.cipher/` ディレクトリ）
- Serena のデータも共有される（同じ `.serena/` ディレクトリ）

---

## 13. 参考：FFmpeg Command Generator での実例

### .cursor/rules/ のファイル構成

```
.cursor/
  rules/
    project-overview.mdc   # alwaysApply: true — SvelteKit 2, 本番URL, コマンド一覧
    css.mdc                # globs: ["src/**/*.css", "src/**/*.svelte"] — oklch() only
    svelte5.mdc            # globs: ["src/**/*.svelte*"] — Runes, structuredClone 禁止
    i18n.mdc               # globs: ["src/lib/i18n/**"] — ja/en 両方更新必須
    ffmpeg-builder.mdc     # globs: ["src/lib/ffmpeg/**"] — コマンド組立順序
    implement-workflow.mdc # alwaysApply: true — 6ステップ実装ワークフロー
  mcp.json                 # 4 MCP サーバー設定
```

### .cursor/rules/css.mdc の実例

```markdown
---
description: "CSS design system enforcement - oklch only, no hex/rgb/hsl"
globs: ["src/**/*.css", "src/**/*.svelte"]
alwaysApply: false
---

# CSS ルール（CI で強制チェック）

1. **色は oklch() のみ** — #hex, rgb(), hsl() は禁止（CI が reject）
2. **グラデーションは in oklab 必須** — `linear-gradient(135deg in oklab, ...)`
3. **フォントサイズは clamp() トークン** — `var(--text-xs)` 〜 `var(--text-3xl)`
4. **命名は役割ベース** — `--color-background`, `--color-primary` 等

## トークン早見表

カラー: `--color-background`, `--color-foreground`, `--color-primary`,
        `--color-secondary`, `--color-accent`, `--color-destructive`

テキスト: `--text-xs`(12-13px) / `--text-sm`(14-15px) / `--text-base`(16-17px)
          `--text-lg`(18-19px) / `--text-xl`(20-22px) / `--text-2xl`(24-26px) / `--text-3xl`(30-33px)
```
