# deploy

`main` branch に push して、CI 完了 → Vercel 本番デプロイ URL を取得するまでの一連のフローを実行する。

## 前提チェック

実行前に以下を確認する:
1. `npm run check` — 型エラーがないこと
2. `bash scripts/lint-css.sh` — CSS oklch 違反がないこと
3. `git status` — コミット漏れがないこと（未コミットの変更があれば先にコミットを促す）

## 手順

### 1. push

```bash
git push origin main
```

### 2. CI 完了待機

```bash
# 最新 run の ID を取得して完了まで待機（最大 5 分）
gh run list --limit 1 --json databaseId --jq '.[0].databaseId' \
  | xargs gh run watch --exit-status
```

- `conclusion: success` → 次へ
- `conclusion: failure` → `gh run view <id> --log-failed` でエラーを確認し、原因を修正して再実行

### 3. Vercel デプロイ URL 取得

```bash
gh api repos/akira993/ffmpeg-command-generate-webapp/deployments \
  --jq '.[0].id' \
  | xargs -I{} gh api \
    "repos/akira993/ffmpeg-command-generate-webapp/deployments/{}/statuses" \
  --jq '.[0].target_url'
```

URL が空の場合は 30 秒待ってリトライ（Vercel デプロイは CI 完了後数十秒かかる場合がある）。

### 4. 結果レポート

以下の形式でユーザーに報告する:

```
✅ デプロイ完了
- Commit: <コミットハッシュ> <コミットメッセージ>
- CI:     成功（所要時間）
- URL:    https://...vercel.app
```

## 失敗時の対応

| 状況 | 対応 |
|------|------|
| CI type check 失敗 | `npm run check` でエラー箇所を特定・修正してから再 push |
| CI CSS lint 失敗 | `bash scripts/lint-css.sh` でチェック、`oklch()` に修正して再 push |
| CI build 失敗 | `npm run build` でローカル再現、SvelteKit SSR 制約を確認 |
| Vercel URL が取得できない | Vercel ダッシュボードで手動確認を促す |
