---
title: MCP 連携ガイド
category: reference
version: "1.0.0"
description: Chrome MCP や他の MCP サーバーとスキルを連携させるためのガイド
project: ffmpeg-command-generate-webapp
tags:
  - mcp
  - chrome
  - integration
  - browser-automation
last_updated: "2025-02-20"
---

# MCP 連携ガイド

Chrome MCP（Model Context Protocol）を活用するスキルを設計するためのガイド。

## このプロジェクトでの MCP 活用

### 使用中の MCP スキル

| スキル | MCP 機能 | 用途 |
|--------|----------|------|
| `/ui-test` | Chrome DevTools | UI レイアウト検証 |
| `/perf-test` | Chrome DevTools + JavaScript | パフォーマンス計測 |
| `/deploy-test` | Chrome DevTools | 本番 UI 検証 |

## Chrome MCP の主要操作

### ウィンドウ操作

```markdown
- `resize_window(1280, 900)` — デスクトップサイズに変更
- `resize_window(375, 812)` — iPhone サイズに変更
```

### ナビゲーション

```markdown
- `navigate("http://localhost:4173")` — ローカルプレビューに移動
- `navigate("https://www.cmd-gen.com")` — 本番に移動
```

### スクリーンショット

```markdown
- screenshot で画面キャプチャ
- 目視で確認すべき項目を Markdown に列挙する
```

### JavaScript 実行

```markdown
Chrome MCP の `javascript_tool` で以下を実行:
(完全な JavaScript コードをコードブロックに含める)
```

## スキルに MCP 操作を組み込むパターン

### パターン 1: レスポンシブテスト

```markdown
### デスクトップテスト (1280x900)

- `resize_window(1280, 900)` → `navigate(URL)`
- screenshot で以下を確認:
  - (具体的なチェック項目を列挙)

### モバイルテスト (375x812)

- `resize_window(375, 812)` → `navigate(URL)`
- screenshot で以下を確認:
  - (具体的なチェック項目を列挙)
```

### パターン 2: インタラクションテスト

```markdown
### 機能テスト

1. 要素 A をクリック → 期待される変化を確認
2. 入力フォームに値を入力 → 結果を確認
3. 言語切替 → UI テキストが変わることを確認
```

### パターン 3: パフォーマンス計測

```markdown
### パフォーマンス計測

1. 対象 URL にナビゲート
2. ハードリロード（`Cmd+Shift+R`）で初回ロードを再現
3. 3 秒待機
4. `javascript_tool` で Navigation Timing API を取得
5. `javascript_tool` で CLS を取得
6. 合格基準と比較して判定
```

## スキルに MCP を組み込む際の設計ルール

### 1. 前提条件を明記する

```markdown
## 前提

ローカルの preview サーバーが起動していること:

(起動コマンドをコードブロックで示す)
```

### 2. チェック項目を具体的に列挙する

**NG（曖昧）:**
```markdown
- screenshot でレイアウトを確認
```

**OK（具体的）:**
```markdown
- screenshot で以下を確認:
  - Header: ロゴ・タイトル・言語切替・テーマトグル
  - PresetGrid: 4列グリッド、8枚のカード
  - CommandOutput: コマンド表示エリア + コピーボタン
```

### 3. JavaScript コードは完全な形で提供する

計測やDOM操作に必要なJSコードは、即座に実行可能な完全な形で
コードブロック内に記述する。

### 4. 合格基準を数値で定義する

```markdown
| 指標 | 目標値 | 備考 |
|------|--------|------|
| FCP | < 1000ms | 初回描画 |
| CLS | < 0.1 | レイアウトシフト |
```

### 5. ビューポートサイズを明示する

```markdown
| デバイス | 幅 | 高さ | 用途 |
|---------|-----|------|------|
| デスクトップ | 1280 | 900 | 標準 PC |
| モバイル | 375 | 812 | iPhone SE/13 mini |
| タブレット | 768 | 1024 | iPad |
```

## トラブルシューティング

| 問題 | 原因 | 対処 |
|------|------|------|
| screenshot が真っ白 | ページ読み込み未完了 | navigate 後に wait を追加 |
| JavaScript 実行エラー | 非同期処理の完了前に取得 | setTimeout/Promise で待機 |
| レイアウトが崩れて見える | viewport サイズ未設定 | resize_window を先に実行 |
| 要素が見つからない | DOM 未構築 | wait_for で要素出現を待機 |
