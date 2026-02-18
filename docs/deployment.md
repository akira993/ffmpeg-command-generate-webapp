# デプロイ手順書

## 概要

このプロジェクトは **Vercel** にデプロイされる SvelteKit アプリケーションです。
GitHub の main ブランチへの push で自動的に本番デプロイが行われます。

### デプロイ情報

| 項目 | 値 |
|------|-----|
| Vercel チーム | `akiratakahashis-projects` |
| プロダクションURL | https://ffmpeg-command-generate-webapp-jpkdns74r.vercel.app |
| GitHub リポジトリ | `akira993/ffmpeg-command-generate-webapp` |
| CI | GitHub Actions（`.github/workflows/ci.yml`） |
| 自動デプロイ | main push → 本番、PR → プレビュー |

> **注意**: Vercel チーム設定により SSO 認証が有効です。ブラウザで Vercel にログイン済みの場合のみ閲覧可能です。公開する場合は Vercel ダッシュボード → Settings → General → 「Vercel Authentication」を OFF にしてください。

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

1. ✅ `git push origin main` → GitHub Actions CI green（27秒）
2. ✅ Vercel 自動デプロイ → `state: success`
3. ✅ プロダクション URL: https://ffmpeg-command-generate-webapp-jpkdns74r.vercel.app

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

---

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `svelte.config.js` | Vercel アダプタ設定 |
| `package.json` | ビルドスクリプト |
| `.github/workflows/ci.yml` | CI ワークフロー |
| `docs/deployment.md` | このドキュメント |
