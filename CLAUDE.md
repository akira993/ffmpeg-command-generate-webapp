# CLAUDE.md — FFmpeg Command Generator

SvelteKit 2 + Svelte 5 (Runes) + TypeScript + Tailwind CSS v4。フロントエンドのみ（Vercel SSG）。

## コマンド

```bash
npm run dev          # 開発サーバー http://localhost:5173
npm run build && npm run preview  # ビルド確認 http://localhost:4173
npm run check        # 型チェック
npm run test         # Vitest ユニットテスト
bash scripts/lint-css.sh  # CSS oklch ルールチェック（CI と同一）
```

## 重要ファイル

| パス | 役割 |
|------|------|
| `src/lib/ffmpeg/builder.ts` | `buildCommand()` — コア生成ロジック |
| `src/lib/ffmpeg/types.ts` | `FFmpegOptions` など全型定義 |
| `src/lib/ffmpeg/presets.ts` | 7種のプリセット定義 |
| `src/lib/stores/command.svelte.ts` | `CommandStore` (Svelte 5 Runes) |
| `src/lib/i18n/ja.json` / `en.json` | 翻訳ファイル |
| `src/app.css` | デザイントークン（oklch カラー） |
| `tests/ffmpeg/` | Vitest ユニットテスト |

## 落とし穴・非自明なルール

- **CSS**: `oklch()` のみ使用。`#hex`/`rgb()`/`hsl()` は CI で弾かれる → `.claude/rules/css.md`
- **Svelte 5**: `$state` Proxy は `structuredClone` 不可。`JSON.parse(JSON.stringify(...))` を使う → `.claude/rules/svelte5.md`
- **i18n**: キー追加時は `ja.json` と `en.json` の両方に必ず追加 → `.claude/rules/i18n.md`
- **GIF 生成**: `buildCommand()` は改行区切りで 2 コマンドを返す（パレット生成 + GIF 生成）
- **コーデック排他**: `copyStreams=true` のとき個別コーデック指定は無視される → `.claude/rules/ffmpeg-builder.md`

## デプロイフロー

**`main` push → GitHub Actions CI（型チェック・CSS lint・build）→ Vercel 本番自動デプロイ**

`vercel` CLI は使用しない。デプロイは必ず `git push origin main` 経由で行う。

```bash
# CI 完了まで待機
gh run list --limit 1 --json databaseId --jq '.[0].databaseId' \
  | xargs gh run watch --exit-status

# 最新デプロイ URL 取得
gh api repos/akira993/ffmpeg-command-generate-webapp/deployments \
  --jq '.[0].id' | xargs -I{} gh api \
  "repos/akira993/ffmpeg-command-generate-webapp/deployments/{}/statuses" \
  --jq '.[0].target_url'
```

## スキル（必要時に呼び出す）

| コマンド | 用途 |
|----------|------|
| `/run-tests` | Vitest + 型チェック実行 |
| `/css-lint` | CSS oklch ルール違反チェック |
| `/ui-test` | Chrome MCP でローカル UI テスト（PC/モバイル） |
| `/i18n-check` | en.json / ja.json のキー整合性チェック |
| `/deploy` | push → CI 待機 → デプロイ URL 取得まで一連実行 |
| `/deploy-test` | 本番 URL に対して Chrome MCP で UI テスト |
