# MCP セットアップガイド

本プロジェクトでは 4 つの MCP サーバーを使用している。
問題が発生した場合はこのドキュメントを参照すること。

## MCP サーバー一覧

| MCP | 用途 | プロバイダ |
|-----|------|-----------|
| **CocoIndex** | AST ベースのセマンティックコード検索 | `uvx` |
| **Cipher** | 長期記憶（メモリ保存・検索） | `npx` + Gemini API |
| **Serena** | LSP ベースのシンボル解析・リファクタリング | `uvx` |
| **Chrome DevTools** | ブラウザ自動テスト・UI 検証 | `npx` |

## 設定ファイルの場所

| ファイル | 役割 |
|----------|------|
| `~/.claude.json` → `projects["/Users/akiratakahashi/Projects/ffmpeg-command-generate-webapp"].mcpServers` | MCP サーバー定義（接続コマンド・環境変数） |
| `/opt/homebrew/lib/node_modules/@byterover/cipher/memAgent/cipher.yml` | Cipher の LLM・Embedding プロバイダ設定 |
| `.serena/memories/` | Serena のオンボーディングメモリ（git 管理外） |
| `.cipher/` | Cipher のローカルデータ（git 管理外） |

---

## CocoIndex（コード検索）

### 設定

```json
{
  "cocoindex-code": {
    "type": "stdio",
    "command": "/Users/akiratakahashi/.local/bin/uvx",
    "args": [
      "--prerelease=explicit",
      "--with", "cocoindex>=1.0.0a18",
      "cocoindex-code@latest"
    ],
    "env": {}
  }
}
```

### 主なツール

- `mcp__cocoindex-code__search` — 自然言語やコード断片でセマンティック検索

### トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| 起動しない | `uvx` のパスが違う | `which uvx` で確認し `command` を修正 |
| 検索結果が古い | インデックス未更新 | `refresh_index: true`（デフォルト）で検索 |

---

## Cipher（長期記憶）

### 設定

```json
{
  "cipher": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@byterover/cipher", "--mode", "mcp"],
    "env": {
      "MCP_SERVER_MODE": "aggregator",
      "OPENAI_API_KEY": "sk-dummy-bypass-for-gemini",
      "GEMINI_API_KEY": "[MASKED]",
      "EMBEDDING_PROVIDER": "gemini",
      "EMBEDDING_MODEL": "gemini-embedding-001",
      "LLM_PROVIDER": "gemini",
      "LLM_MODEL": "gemini-2.5-flash"
    }
  }
}
```

### 重要：cipher.yml の設定

**環境変数だけでは不十分。** Cipher は以下の YAML ファイルを優先的に読み込む：

```
/opt/homebrew/lib/node_modules/@byterover/cipher/memAgent/cipher.yml
```

このファイルの `llm` セクションと `embedding` セクションが実際に使用される。
環境変数 `LLM_PROVIDER` / `EMBEDDING_PROVIDER` は YAML の設定に上書きされるため、
**プロバイダを変更する場合は必ず cipher.yml を直接編集すること。**

現在の cipher.yml 設定（Gemini）：

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

### 既知のバグ：起動バリデーション（v0.3.0）

Cipher v0.3.0 は起動時に以下のいずれかの API キーをチェックする：
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `OPENROUTER_API_KEY`
- `OLLAMA_BASE_URL`
- AWS 認証情報

**`GEMINI_API_KEY` だけでは起動チェックを通過できない**（Gemini がサポートプロバイダとして記載されているにもかかわらず）。

**回避策**: ダミーの `OPENAI_API_KEY=sk-dummy-bypass-for-gemini` を設定して起動チェックをパスさせる。
実際の LLM/Embedding は cipher.yml で Gemini に向けているため、このダミーキーが使われることはない。

### 主なツール

| ツール | 用途 |
|--------|------|
| `cipher_memory_search` | キーワードでメモリ検索 |
| `cipher_extract_and_operate_memory` | メモリの保存（ADD/UPDATE/DELETE） |
| `cipher_search_reasoning_patterns` | 過去の推論パターン検索 |

### MCP_SERVER_MODE

- `aggregator`（使用中）: 全ツールが公開される（memory_search, extract_and_operate, reasoning 系）
- `ask`（デフォルト）: `ask_cipher` のみ公開

### トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| "No API key or Ollama configuration found" | 起動バリデーションの既知バグ | `OPENAI_API_KEY` にダミー値を設定 |
| "openai embedding failed: Invalid API key" | cipher.yml が OpenAI のまま | cipher.yml の embedding セクションを Gemini に変更 |
| embeddingTime が 0ms | フォールバックモード（ベクトル検索無効） | cipher.yml と GEMINI_API_KEY を確認 |
| embeddingTime が 500-1000ms | 正常（Gemini embedding 応答時間） | 問題なし |
| ツールが `ask_cipher` のみ | `MCP_SERVER_MODE` が未設定 | `"MCP_SERVER_MODE": "aggregator"` を追加 |
| npm パッケージ更新後に設定がリセット | cipher.yml が npm パッケージ内にある | `npm update` 後に cipher.yml を再編集 |

### メンテナンス注意事項

`@byterover/cipher` を `npm update` すると cipher.yml がデフォルトに戻る可能性がある。
更新後は必ず以下を確認すること：

```bash
# cipher.yml の LLM/Embedding 設定を確認
head -30 /opt/homebrew/lib/node_modules/@byterover/cipher/memAgent/cipher.yml
```

---

## Serena（シンボル解析）

### 設定

```json
{
  "serena": {
    "type": "stdio",
    "command": "/Users/akiratakahashi/.local/bin/uvx",
    "args": [
      "--from", "git+https://github.com/oraios/serena",
      "serena-mcp-server",
      "--context", "ide-assistant",
      "--project", "/Users/akiratakahashi/Projects/ffmpeg-command-generate-webapp"
    ],
    "env": {}
  }
}
```

### オンボーディング

初回起動時に `check_onboarding_performed` → `onboarding` を実行し、以下のメモリを作成済み：

| メモリ名 | 内容 |
|----------|------|
| `project_overview` | プロジェクト概要・技術スタック |
| `suggested_commands` | 開発コマンド一覧 |
| `style_conventions` | コーディング規約 |
| `task_completion` | タスク完了チェックリスト |

### 主なツール

| ツール | 用途 |
|--------|------|
| `find_symbol` | シンボル名でコード検索 |
| `find_referencing_symbols` | シンボルの参照元を検索 |
| `get_symbols_overview` | ファイル内のシンボル一覧取得 |
| `replace_symbol_body` | シンボルのコード置換 |
| `rename_symbol` | シンボルのリネーム（全参照追従） |
| `search_for_pattern` | 正規表現でコードベース検索 |

### トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| 起動しない | `uvx` のパスが違う | `which uvx` で確認 |
| "onboarding not performed" | 初回 or `.serena/` が削除された | `onboarding` ツールを再実行 |
| シンボル検索が遅い | LSP サーバーの初期化中 | 数秒待って再試行 |

---

## Chrome DevTools（ブラウザテスト）

### 設定

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

### 主なツール

- `take_screenshot` / `take_snapshot` — UI キャプチャ
- `navigate_page` — ページ遷移
- `click` / `fill` — インタラクション
- `performance_start_trace` / `performance_stop_trace` — パフォーマンス計測

---

## 全 MCP の接続確認方法

Claude Code を再起動した後、以下のコマンドで各 MCP の動作を確認できる：

```
# CocoIndex: コード検索テスト
→ mcp__cocoindex-code__search で "buildCommand" を検索

# Cipher: メモリ保存・検索テスト
→ cipher_memory_search で任意のクエリを検索
→ embeddingTime が 0ms でないことを確認

# Serena: オンボーディング状態確認
→ check_onboarding_performed で true を確認

# Chrome DevTools: ページ一覧取得
→ list_pages でブラウザタブ一覧を確認
```

---

## gitignore

以下はリポジトリ管理外：

```gitignore
# MCP local data
.cipher/
.serena/
```
