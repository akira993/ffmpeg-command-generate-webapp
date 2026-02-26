# Claude Code（Desktop App）ワークフロー完全設計書

> **対象**: macOS 環境でモダンフロントエンドプロジェクトに MCP 統合開発環境を構築する
> **MCP 構成**: CocoIndex + Cipher + Serena + Chrome DevTools
> **最終更新**: 2026-02-26

---

## 目次

1. [前提条件](#1-前提条件)
2. [Claude Code のインストール](#2-claude-code-のインストール)
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
# または nvm 経由: nvm install 20 && nvm use 20

# Python 3.11+ と uv（uvx コマンド提供）
brew install uv

# Git + GitHub CLI
brew install git gh
gh auth login

# Chrome ブラウザ（Chrome DevTools MCP 用）
# https://www.google.com/chrome/ からインストール
```

### uvx パスの確認（重要）

```bash
which uvx
# 期待値: /Users/USERNAME/.local/bin/uvx

# PATH に含まれていない場合
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

> **⚠️ 重要**: MCP 設定では `uvx` のフルパスを使用すること。`uvx` だけでは Claude Code のプロセス起動で見つからない場合がある。

### API キー

| キー | 用途 | 取得先 |
|------|------|--------|
| Anthropic API Key | Claude Code 本体 | https://console.anthropic.com/ |
| Gemini API Key | Cipher の LLM・Embedding | https://aistudio.google.com/apikey（無料） |

```bash
# ~/.zshrc に追加
export ANTHROPIC_API_KEY="sk-ant-..."
export GEMINI_API_KEY="AIza..."
source ~/.zshrc
```

---

## 2. Claude Code のインストール

```bash
# インストール
brew install claude-code
# または
npm install -g @anthropic-ai/claude-code

# バージョン確認
claude --version

# プロジェクトディレクトリで初回起動（信頼ダイアログが表示される）
cd /path/to/your-project
claude
```

> **注意**: `$ANTHROPIC_API_KEY` 環境変数はシェルプロファイルに設定するが、Claude Code の Bash ツール内からは空になる場合がある。MCP サーバーの API キーは必ず `env` ブロックで明示的に渡すこと。

---

## 3. プロジェクト指示ファイルの作成

### 3.1 CLAUDE.md（メイン指示ファイル）

プロジェクトルートに `CLAUDE.md` を作成。Claude Code は起動時に自動読み込みする。

```markdown
# CLAUDE.md — [プロジェクト名]

[フレームワーク] + [言語] + [スタイリング]。[デプロイ先]。

**本番URL**: https://...

## コマンド

\`\`\`bash
npm run dev          # 開発サーバー
npm run build        # ビルド
npm run check        # 型チェック
npm run test         # テスト
npm run lint         # Lint
\`\`\`

## 重要ファイル

| パス | 役割 |
|------|------|
| `src/...` | ... |

## 落とし穴・非自明なルール

- ...

## デプロイフロー

...

## MCP サーバー

| MCP | 用途 | 備考 |
|-----|------|------|
| **CocoIndex** | セマンティックコード検索 | `uvx` で起動 |
| **Cipher** | 長期記憶 | Gemini API。`cipher.yml` が環境変数より優先 |
| **Serena** | シンボル解析 | 初回 `onboarding` 必要 |
| **Chrome DevTools** | UI テスト | `npx` で起動 |

## AI行動規範

### 基本原則
1. 推測でコードを書かない：CocoIndex で現状を確認してから着手
2. 記憶を活用する：新タスクの前に Cipher で過去の決定事項を検索
3. 知識を蓄積する：タスク完了後は Cipher に結果を保存
4. 計画を提示する：実装前に計画をリスト形式で出力し、承認を得る

### ワークフロー自動適用
- **新機能実装・大規模改修時** → `.claude/skills/implement_workflow.md` を読み込んで従う
- 機密情報は `[MASKED]` に置き換えて記録する
```

### 3.2 ルールファイル（`.claude/rules/`）

プロジェクト固有のコーディングルールを個別ファイルで管理する。

```
.claude/
  rules/
    css.md           # CSS ルール（例: oklch only, Tailwind 規約など）
    framework.md     # フレームワーク固有ルール（例: Svelte 5 Runes, React hooks 規約）
    i18n.md          # 国際化ルール
    architecture.md  # アーキテクチャルール
```

各ファイルは Claude Code がコンテキストとして自動読み込みする。

### 3.3 スキルファイル（`.claude/skills/`）

再利用可能なワークフローを定義する。

```
.claude/
  skills/
    run-tests.md           # テスト実行スキル
    lint.md                # Lint 実行スキル
    deploy.md              # デプロイスキル
    implement_workflow.md  # 実装ワークフロー（MCP 連携）
```

スキルの呼び出し: Claude Code 内で `.claude/skills/` のファイルを参照指示するか、CLAUDE.md にスキル一覧を記載する。

### 3.4 .gitignore への追加

```gitignore
# MCP local data
.cipher/
.serena/
.cocoindex_code/
```

---

## 4. MCP サーバー設定

### 設定ファイルの場所

Claude Code の MCP 設定は `~/.claude.json` のプロジェクトスコープに格納される：

```
~/.claude.json → projects["/path/to/project"].mcpServers
```

### 4.1 CocoIndex（セマンティックコード検索）

```bash
# CLI で追加
claude mcp add cocoindex-code \
  --type stdio \
  --command /Users/USERNAME/.local/bin/uvx \
  -- --prerelease=explicit --with "cocoindex>=1.0.0a18" cocoindex-code@latest
```

または `~/.claude.json` に手動追加:

```json
{
  "cocoindex-code": {
    "type": "stdio",
    "command": "/Users/USERNAME/.local/bin/uvx",
    "args": [
      "--prerelease=explicit",
      "--with", "cocoindex>=1.0.0a18",
      "cocoindex-code@latest"
    ],
    "env": {}
  }
}
```

**ツール**: `mcp__cocoindex-code__search` — 自然言語やコード断片でセマンティック検索

### 4.2 Cipher（長期記憶）

```json
{
  "cipher": {
    "type": "stdio",
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
  }
}
```

> **⚠️ `OPENAI_API_KEY` はダミー値**。Cipher v0.3.0 の起動バリデーションバグ回避用。詳細は [Cipher 詳細設定](#5-cipher-詳細設定) を参照。

**主なツール**:

| ツール | 用途 |
|--------|------|
| `cipher_memory_search` | キーワードでメモリ検索 |
| `cipher_extract_and_operate_memory` | メモリの保存（ADD/UPDATE/DELETE） |
| `cipher_search_reasoning_patterns` | 過去の推論パターン検索 |

### 4.3 Serena（シンボル解析）

```json
{
  "serena": {
    "type": "stdio",
    "command": "/Users/USERNAME/.local/bin/uvx",
    "args": [
      "--from", "git+https://github.com/oraios/serena",
      "serena-mcp-server",
      "--context", "ide-assistant",
      "--project", "/path/to/your-project"
    ],
    "env": {}
  }
}
```

**主なツール**:

| ツール | 用途 |
|--------|------|
| `find_symbol` | シンボル名でコード検索 |
| `find_referencing_symbols` | 参照元の一覧取得 |
| `get_symbols_overview` | ファイル内シンボル一覧 |
| `replace_symbol_body` | シンボルのコード置換 |
| `rename_symbol` | リネーム（全参照追従） |
| `search_for_pattern` | 正規表現検索 |

### 4.4 Chrome DevTools（UI テスト）

```json
{
  "chrome-devtools": {
    "type": "stdio",
    "command": "npx",
    "args": ["chrome-devtools-mcp@latest"],
    "env": {}
  }
}
```

**主なツール**: `take_screenshot`, `take_snapshot`, `navigate_page`, `click`, `fill`, `performance_start_trace`

### 4.5 完全な MCP 設定ブロック

`~/.claude.json` の該当プロジェクトセクションに追加する完全な JSON:

```json
{
  "mcpServers": {
    "cocoindex-code": {
      "type": "stdio",
      "command": "/Users/USERNAME/.local/bin/uvx",
      "args": ["--prerelease=explicit", "--with", "cocoindex>=1.0.0a18", "cocoindex-code@latest"],
      "env": {}
    },
    "cipher": {
      "type": "stdio",
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
      "type": "stdio",
      "command": "/Users/USERNAME/.local/bin/uvx",
      "args": ["--from", "git+https://github.com/oraios/serena", "serena-mcp-server", "--context", "ide-assistant", "--project", "/path/to/your-project"],
      "env": {}
    },
    "chrome-devtools": {
      "type": "stdio",
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"],
      "env": {}
    }
  }
}
```

> `USERNAME` と `/path/to/your-project` を実際の値に置換すること。

---

## 5. Cipher 詳細設定

### 5.1 cipher.yml の編集（必須）

Cipher は環境変数よりも YAML 設定ファイルを優先する。以下のファイルを**直接編集**する必要がある：

```
/opt/homebrew/lib/node_modules/@byterover/cipher/memAgent/cipher.yml
```

#### Gemini を使用する場合（推奨：無料）

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

#### OpenAI を使用する場合

```yaml
llm:
  provider: openai
  model: gpt-4.1-mini
  apiKey: $OPENAI_API_KEY
  maxIterations: 50

embedding:
  type: openai
  model: text-embedding-3-small
  apiKey: $OPENAI_API_KEY
```

> OpenAI を使用する場合、MCP 設定のダミー `OPENAI_API_KEY` を実際のキーに置き換えること。

### 5.2 既知のバグと回避策

#### バグ 1: 起動バリデーション（v0.3.0）

**症状**: `"No API key or Ollama configuration found"` で起動失敗

**原因**: Cipher は起動時に以下のいずれかをチェックする:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `OPENROUTER_API_KEY`
- `OLLAMA_BASE_URL`
- AWS 認証情報

`GEMINI_API_KEY` は**チェック対象に含まれていない**（Gemini がサポートプロバイダとして記載されているにもかかわらず）。

**回避策**: ダミーの `OPENAI_API_KEY=sk-dummy-bypass-for-gemini` を MCP 設定の `env` に追加する。実際の LLM/Embedding は cipher.yml で Gemini に向けているため、このダミーキーが使われることはない。

#### バグ 2: 環境変数が cipher.yml に上書きされる

**症状**: `EMBEDDING_PROVIDER=gemini` を設定しても OpenAI embedding エラーが発生

**原因**: cipher.yml の設定が環境変数より優先される。デフォルトの cipher.yml は OpenAI を指定している。

**対処**: cipher.yml を直接編集して Gemini に変更する（5.1 参照）。

#### バグ 3: npm update でリセット

**症状**: `npm update @byterover/cipher` 実行後に Cipher が動作しなくなる

**原因**: cipher.yml は npm パッケージ内にあるため、更新時にデフォルト（OpenAI）にリセットされる。

**対処**: 更新後に必ず cipher.yml を再編集する。確認コマンド：

```bash
head -30 /opt/homebrew/lib/node_modules/@byterover/cipher/memAgent/cipher.yml
```

### 5.3 MCP_SERVER_MODE の違い

| モード | 公開ツール |
|--------|----------|
| `ask`（デフォルト） | `ask_cipher` のみ |
| `aggregator`（推奨） | 全ツール（`cipher_memory_search`, `cipher_extract_and_operate_memory`, 推論系ツール） |

必ず `"MCP_SERVER_MODE": "aggregator"` を設定すること。

### 5.4 正常動作の確認方法

Cipher に記憶検索を依頼し、レスポンスの `embeddingTime` を確認する：

- **500〜1000ms** → 正常（Gemini embedding の応答時間）
- **0ms** → フォールバックモード（embedding 無効、ベクトル検索が動作していない）

---

## 6. Serena オンボーディング

Serena は初回起動時にプロジェクトのオンボーディングが必要。

### 手順

1. Claude Code を起動
2. `check_onboarding_performed` ツールを実行 → `false` が返る
3. `onboarding` ツールを実行 → Serena がプロジェクト構造を分析
4. 以下の 4 つのメモリファイルを作成するよう指示される：

| メモリ名 | 内容 |
|----------|------|
| `project_overview` | プロジェクト概要・技術スタック・アーキテクチャ |
| `suggested_commands` | 開発コマンド一覧（dev, build, test, lint） |
| `style_conventions` | コーディング規約 |
| `task_completion` | タスク完了チェックリスト |

5. `write_memory` ツールで各メモリを作成
6. `.serena/memories/` にファイルが生成される（git 管理外）

> **注意**: `.serena/` ディレクトリが削除された場合は、再度オンボーディングが必要。

---

## 7. 実装ワークフロー定義

新機能の実装・大規模改修時に使用する 6 ステップワークフロー。

`.claude/skills/implement_workflow.md` として保存する：

```markdown
---
description: 新機能の実装・大規模改修時に使用するワークフロー
---

# 実装ワークフロー（6ステップ）

推測でコードを書くことを禁止する。必ず以下のステップを順番に実行せよ。

## Step 1：過去の文脈の確認（Cipher）
`cipher_memory_search` で関連する過去の決定事項・設計方針を検索せよ。

## Step 2：現在のコードベースの把握（CocoIndex）
`cocoindex-code search` で関連する既存コンポーネント・関数・型定義を検索せよ。

## Step 3：シンボル依存関係の確認（Serena）
`find_symbol` / `find_referencing_symbols` で修正対象の参照元を確認せよ。

## Step 4：実装計画の提示と承認
Step 1〜3 の情報をもとに計画をリスト形式で出力し、承認を得ること。

## Step 5：実装
承認後、計画に従って実装する。既存パターンを踏襲すること。

## Step 6：知識の保存（Cipher）
`cipher_extract_and_operate_memory` で以下を保存せよ：
- 実装した機能の概要
- 設計上の決定事項とその理由
- 注意点・落とし穴
- API キー等の機密情報は `[MASKED]` に置換
```

---

## 8. 品質チェック・テストワークフロー

`.claude/skills/run-tests.md` のテンプレート：

```markdown
# テスト実行

## 手順
1. 型チェック: `npm run check` (または `npx tsc --noEmit`)
2. ユニットテスト: `npm run test`
3. Lint: `npm run lint`
4. 失敗時は原因を特定し修正方法を提案する

## UI テスト（Chrome DevTools MCP）
1. `npm run build && npm run preview` でローカルサーバー起動
2. Chrome DevTools MCP でスクリーンショット・スナップショット取得
3. デスクトップ (1280×900) とモバイル (375×812) の両方で確認
```

---

## 9. デプロイワークフロー

`.claude/skills/deploy.md` のテンプレート：

```markdown
# デプロイ

## 前提チェック
1. `npm run check` — 型エラーなし
2. `npm run lint` — Lint 通過
3. `git status` — コミット漏れなし

## 手順
1. `git push origin main`
2. CI 完了待機: `gh run list --limit 1 --json databaseId --jq '.[0].databaseId' | xargs gh run watch --exit-status`
3. デプロイ URL 取得（Vercel/Netlify/その他プロバイダに応じて）

## 失敗時
- CI 失敗: `gh run view <id> --log-failed` でエラー確認
```

---

## 10. 動作確認チェックリスト

Claude Code を再起動した後、以下の手順で全 MCP の動作を確認する：

```
✅ CocoIndex
  → cipher_memory_search で任意のクエリ → 結果が返ること
  → embeddingTime が 0ms でないこと

✅ Cipher
  → cipher_memory_search で任意のクエリ → 結果が返ること
  → embeddingTime が 0ms でないこと（500-1000ms が正常）

✅ Serena
  → check_onboarding_performed → true が返ること
  → find_symbol で任意のシンボル名を検索 → 結果が返ること

✅ Chrome DevTools
  → Chrome を起動した状態で list_pages → タブ一覧が返ること
```

---

## 11. トラブルシューティング

| 症状 | MCP | 原因 | 対処 |
|------|-----|------|------|
| "No API key or Ollama configuration found" | Cipher | 起動バリデーションバグ（v0.3.0） | `OPENAI_API_KEY` にダミー値を設定 |
| "openai embedding failed: Invalid API key" | Cipher | cipher.yml が OpenAI のまま | cipher.yml の embedding を Gemini に変更 |
| embeddingTime が 0ms | Cipher | フォールバックモード | cipher.yml と GEMINI_API_KEY を確認 |
| ツールが `ask_cipher` のみ | Cipher | MCP_SERVER_MODE 未設定 | `"aggregator"` に設定 |
| "Blocking execution of embedding-related tool" | Cipher | embedding 初期化失敗 | Claude Code を再起動、cipher.yml を確認 |
| サーバーが起動しない | CocoIndex/Serena | `uvx` のパスが違う | `which uvx` でフルパスを確認 |
| "onboarding not performed" | Serena | 初回 or `.serena/` 削除済み | `onboarding` ツールを再実行 |
| シンボル検索が遅い | Serena | LSP サーバーの初期化中 | 数秒待って再試行 |
| ブラウザタブが見えない | Chrome DevTools | Chrome が起動していない | Chrome を先に起動 |
| Bash ツール内で API キーが空 | 全般 | シェル環境変数の分離 | MCP 設定の `env` ブロックで明示指定 |

---

## 12. メンテナンス注意事項

| 操作 | リスク | 対処 |
|------|--------|------|
| `npm update @byterover/cipher` | cipher.yml がデフォルト（OpenAI）にリセット | 更新後に `head -30 /opt/homebrew/.../cipher.yml` で確認・再編集 |
| `uvx` パッケージ更新 | CocoIndex / Serena は自動更新される | 通常は問題なし |
| Claude Code 本体の更新 | `~/.claude.json` のスキーマ変更の可能性 | 更新後に MCP 接続を確認 |
| `.serena/` の削除 | オンボーディングメモリが消失 | 再度 `onboarding` を実行 |
| `.cipher/` の削除 | ローカルメモリデータが消失 | Cipher のメモリは再構築が必要 |
| プロジェクトルールの変更 | `.claude/rules/` の更新が必要 | CLAUDE.md と rules/ を同時に更新 |

---

## 13. 参考：FFmpeg Command Generator での実例

### 実際の CLAUDE.md 構成

```
CLAUDE.md                          # プロジェクト概要・コマンド・ルール・AI行動規範
.claude/
  rules/
    css.md                         # oklch() only, グラデーション in oklab 必須
    svelte5.md                     # Svelte 5 Runes, structuredClone 禁止
    i18n.md                        # ja.json / en.json 両方更新必須
    ffmpeg-builder.md              # コマンド組立順序, GIF 2パス, 排他ルール
  skills/
    run-tests.md                   # Vitest + svelte-check
    css-lint.md                    # bash scripts/lint-css.sh
    ui-test.md                     # Chrome MCP で PC/モバイル UI テスト
    i18n-check.md                  # 翻訳キー整合性チェック
    perf-test.md                   # Navigation Timing / CLS 計測
    deploy.md                      # push → CI → Vercel URL
    deploy-test.md                 # 本番 URL に対して UI + パフォーマンステスト
    implement_workflow.md          # 6ステップ実装ワークフロー
  docs/
    mcp-setup-guide.md             # MCP 設定詳細・トラブルシューティング
```

### 実際の Cipher 設定で起きた問題の時系列

1. `GEMINI_API_KEY` のみで起動 → 起動バリデーションエラー
2. ダミー `OPENAI_API_KEY` を追加 → 起動成功だが embedding が OpenAI に向く
3. 環境変数 `EMBEDDING_PROVIDER=gemini` を設定 → cipher.yml に上書きされる
4. cipher.yml を直接編集して Gemini に変更 → **正常動作**（embeddingTime: 777ms）

> この経験から、**cipher.yml の直接編集が最も確実**という結論に至った。
