# 初めて使う人向けガイド（Onboarding UX）

## 概要

FFmpeg Command Generator は、初めて FFmpeg を使うユーザーでも迷わずコマンドを生成・実行できるよう、以下のガイド UI を提供する。

---

## ガイド UI 一覧

### 1. FFmpegインストールガイド（`FfmpegInstallGuide.svelte`）

| 項目 | 内容 |
|------|------|
| **配置** | コマンド出力エリアのヘッダー行（「実行方法」ボタンの左） |
| **ラベル** | 「FFmpegの導入」/ "Install FFmpeg" |
| **形式** | モーダルダイアログ（OS別タブ切り替え） |

#### 対応OS・インストール方法

| OS | 方法 | コマンド |
|----|------|---------|
| **macOS** | Homebrew | `brew install ffmpeg` |
| **Windows** | winget（推奨） | `winget install Gyan.FFmpeg` |
| **Windows** | Chocolatey | `choco install ffmpeg` |
| **Windows** | 手動ダウンロード | gyan.dev からバイナリ取得 |
| **Linux (Ubuntu/Debian)** | apt | `sudo apt update && sudo apt install ffmpeg` |
| **Linux (Fedora)** | dnf | `sudo dnf install ffmpeg` |
| **Linux (Arch)** | pacman | `sudo pacman -S ffmpeg` |

#### インストール確認

```bash
ffmpeg -version
```

バージョン情報が表示されれば成功。

---

### 2. コマンド実行方法ガイド（`PathGuideModal.svelte`）

| 項目 | 内容 |
|------|------|
| **配置** | コマンド出力エリアのヘッダー行（コピーボタンの左） |
| **ラベル** | 「実行方法」/ "How to Run" |
| **形式** | モーダルダイアログ |

#### 内容

1. コマンドをコピーボタンでコピー
2. ターミナルを開く
3. ファイルのあるフォルダに `cd` で移動
4. コマンドを貼り付けて実行

#### OS別ターミナルの開き方（Tips）

- **macOS**: Finder でフォルダを右クリック → 「フォルダに新規ターミナルタブ」
- **Windows**: エクスプローラーのアドレスバーに `cmd` と入力して Enter
- **Linux**: ファイルマネージャでフォルダを右クリック → 「ターミナルで開く」

---

## 導線設計

```
コマンド出力エリア
  ├── [FFmpegの導入] ボタン → インストールガイドモーダル
  │                              └── 公式サイトへのリンク (ffmpeg.org)
  ├── [実行方法] ボタン → 実行方法モーダル
  │                        └── 「インストールガイド」へのテキストリンク ──→ インストールガイドモーダルを開く
  └── [コピー] ボタン
```

### ユーザーフロー

1. **初回ユーザー**: プリセット選択 → コマンド生成 → 「FFmpegの導入」で環境構築 → 「実行方法」で実行手順確認 → コピー＆実行
2. **リピーター**: プリセット選択 → コマンド生成 → コピー＆実行（ガイド不要）

### 相互導線

- **実行方法モーダル** → インストールガイドへのリンクあり（FFmpeg未インストールの場合の案内）
- **インストールガイドモーダル** → 公式サイト (ffmpeg.org) へのリンクあり

---

## i18n キー構造

### `installGuide.*`（インストールガイド用）

```
installGuide.buttonLabel     — ボタンラベル
installGuide.title           — モーダルタイトル
installGuide.description     — 説明文
installGuide.mac.*           — macOS固有テキスト
installGuide.windows.*       — Windows固有テキスト
installGuide.verifyTitle     — インストール確認セクション
installGuide.verifyDesc      — 確認手順の説明
installGuide.officialSite    — 公式サイトへの案内
```

### `pathGuide.*`（実行方法用・追加分）

```
pathGuide.installPrompt      — インストールガイドへの導線テキスト
pathGuide.installLink        — リンクテキスト
```

---

## コンポーネント一覧

| ファイル | 役割 |
|----------|------|
| `src/lib/components/common/FfmpegInstallGuide.svelte` | インストールガイドモーダル |
| `src/lib/components/common/PathGuideModal.svelte` | 実行方法モーダル |
| `src/lib/components/command/CommandOutput.svelte` | 両モーダルを配置するコンテナ |
| `src/lib/i18n/ja.json` | 日本語翻訳 |
| `src/lib/i18n/en.json` | 英語翻訳 |
