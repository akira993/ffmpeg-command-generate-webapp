# デプロイ手順書

## 概要

このプロジェクトは **Vercel** にデプロイされる SvelteKit アプリケーションです。
GitHub の main ブランチへの push で自動的に本番デプロイが行われます。

### デプロイ情報

| 項目 | 値 |
|------|-----|
| Vercel チーム | `akiratakahashis-projects` |
| Vercel ダッシュボード | https://vercel.com/akiratakahashis-projects/ffmpeg-command-generate-webapp |
| プロダクションURL | 固定ドメイン取得予定（※下記「URL構造」参照） |
| GitHub リポジトリ | `akira993/ffmpeg-command-generate-webapp` |
| CI | GitHub Actions（`.github/workflows/ci.yml`） |
| 自動デプロイ | main push → 本番、PR → プレビュー |

> **注意**: Vercel チーム設定により SSO 認証が有効です。ブラウザで Vercel にログイン済みの場合のみ閲覧可能です。公開する場合は Vercel ダッシュボード → Settings → General → 「Vercel Authentication」を OFF にしてください。

### Vercel URL 構造

Vercel は各デプロイにユニークな URL を付与する：

| 種類 | URL形式 | 備考 |
|------|---------|------|
| デプロイ固有URL | `https://ffmpeg-command-generate-webapp-{hash}.vercel.app` | デプロイごとに変わる |
| プロジェクトURL | `https://ffmpeg-command-generate-webapp.vercel.app` | 最新の本番デプロイを指す（要確認） |
| カスタムドメイン | 未設定（取得予定） | Vercel ダッシュボード → Settings → Domains で設定 |

**最新デプロイ URL の取得方法**:

```bash
gh api repos/akira993/ffmpeg-command-generate-webapp/deployments \
  --jq '.[0].id' | xargs -I{} gh api \
  "repos/akira993/ffmpeg-command-generate-webapp/deployments/{}/statuses" \
  --jq '.[0].target_url'
```

> ⚠️ 古いデプロイの URL でアクセスすると 500 エラーになる場合がある。常に最新 URL を確認すること。

---

## ローカル開発

### 前提条件

- Node.js 20 以上
- npm

### コマンド

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動（http://localhost:5173）
npm run dev

# 型チェック
npm run check

# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

---

## Vercel デプロイ

### セットアップ済み（GitHub 連携）

Vercel ダッシュボード（https://vercel.com/new?teamSlug=akiratakahashis-projects）から GitHub リポジトリを直接インポート済み。

**自動デプロイが有効:**
- **main ブランチへの push** → 自動で本番デプロイ
- **Pull Request** → 自動でプレビューデプロイ（PR コメントに URL が付与）

### CLI からのデプロイ（オプション）

```bash
# Vercel CLI インストール
npm i -g vercel

# ログイン
vercel login

# プロジェクトリンク
vercel link --scope akiratakahashis-projects

# プレビューデプロイ
vercel

# 本番デプロイ
vercel --prod
```

### ビルド設定

| 項目 | 値 |
|------|-----|
| Framework | SvelteKit |
| Build Command | `vite build` |
| Output Directory | `.svelte-kit` |
| Install Command | `npm install` |
| Node.js Version | 20.x |

これらは `@sveltejs/adapter-vercel` が自動検出するため、通常は手動設定不要です。

### 環境変数

現時点で環境変数は不要です。将来的に認証や外部 API を追加する場合は、Vercel ダッシュボードの Settings > Environment Variables で設定してください。

---

## CI/CD（GitHub Actions）

### ワークフロー

`.github/workflows/ci.yml` で以下を自動実行：

- **トリガー**: main ブランチへの push、Pull Request
- **ジョブ**:
  1. `npm ci` — 依存関係インストール
  2. `npm run check` — 型チェック（svelte-check）
  3. `npm run build` — プロダクションビルド

### デプロイフロー全体

```
開発者が PR を作成
  ↓
GitHub Actions: 型チェック + ビルド（CI）      ← .github/workflows/ci.yml
  ↓
Vercel: プレビューデプロイ（PR コメントに URL） ← 自動
  ↓
コードレビュー & 動作確認
  ↓
main にマージ
  ↓
GitHub Actions: 型チェック + ビルド（CI）
  ↓
Vercel: 本番デプロイ（自動）                    ← akiratakahashis-projects チーム
```

### 確認済みフロー（2026-02-18）

1. ✅ `git push origin main` → GitHub Actions CI green
2. ✅ Vercel 自動デプロイ → `state: success`
3. ✅ 最新デプロイ URL で正常動作確認（Chrome MCP テスト済み）

> ※ デプロイ固有 URL は毎回変わる。上記「Vercel URL 構造」の `gh api` コマンドで最新 URL を確認。

---

## トラブルシューティング

### ビルドが失敗する

```bash
# ローカルでビルドを再現
npm run check    # 型エラーの確認
npm run build    # ビルドエラーの確認
```

### Vercel デプロイが失敗する

1. Vercel ダッシュボードの Deployments でログを確認
2. Node.js バージョンが 20.x になっているか確認
3. `adapter-vercel` が正しく設定されているか `svelte.config.js` を確認

### ローカルで動くが Vercel で動かない

- SSR 関連のエラーの場合、`+page.ts` に `export const ssr = false;` を追加して CSR のみにする
- ブラウザ専用 API（`window`, `document`）は `onMount` 内で使用する

### デプロイ成功なのに 500 が出る

1. **URL が古い**: Vercel は各デプロイに固有の URL（`-{hash}.vercel.app`）を付与する。
   古いデプロイの URL では 500 になる場合がある。上記「Vercel URL 構造」の方法で最新 URL を確認。

2. **Vercel 認証**: SSO 認証が有効な場合、ブラウザで Vercel にログインが必要。
   Vercel ダッシュボード → Settings → General → 「Vercel Authentication」を確認。

3. **再デプロイ**: サーバー関数の不整合が疑われる場合:
   ```bash
   git commit --allow-empty -m "chore: trigger redeploy"
   git push origin main
   ```

---

## Chrome MCP による UI テスト

デプロイ前に Claude in Chrome MCP で PC/モバイル両方の UI テストを実施する。

### テスト手順

1. **ローカル preview サーバー起動**
   ```bash
   npm run build && npm run preview
   # → http://localhost:4173
   ```

2. **デスクトップテスト (1280x900)**
   - `resize_window(1280, 900)` → `navigate("http://localhost:4173")`
   - screenshot → Header, PresetGrid(4列), ActionButtons(3ボタン), Footer 確認
   - scroll → フッター「FFmpegとは？」リンク確認、固定バー非表示確認

3. **モバイルテスト (375x812)**
   - `resize_window(375, 812)` → `navigate("http://localhost:4173")`
   - screenshot → Separator 下 ActionButtons **非表示**, 固定バー **表示**, 2列グリッド確認
   - scroll → フッターが固定バーに隠れず全文表示
   - click(固定バーの「FFmpeg の導入」) → モーダル開閉テスト

4. **本番デプロイ後の確認**
   ```bash
   # 最新デプロイURLを取得
   gh api repos/akira993/ffmpeg-command-generate-webapp/deployments \
     --jq '.[0].id' | xargs -I{} gh api \
     "repos/akira993/ffmpeg-command-generate-webapp/deployments/{}/statuses" \
     --jq '.[0].target_url'
   ```
   取得した URL で上記 2-3 を再実施。

---

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `svelte.config.js` | Vercel アダプタ設定 |
| `package.json` | ビルドスクリプト |
| `.github/workflows/ci.yml` | CI ワークフロー |
| `docs/deployment.md` | このドキュメント |
| `docs/test-manual.md` | 手動テスト手順書 |
