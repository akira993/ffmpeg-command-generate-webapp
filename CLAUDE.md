# CLAUDE.md — FFmpeg Command Generator

SvelteKit 2 + Svelte 5 (Runes) + TypeScript + Tailwind CSS v4。フロントエンドのみ（Vercel SSG）。

**本番URL**: https://www.cmd-gen.com（`cmd-gen.com` → `www.cmd-gen.com` へ 307 リダイレクト）

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
| `src/lib/stores/consent.svelte.ts` | `ConsentStore` — Cookie 同意 + GA4 Consent Mode v2 |
| `src/lib/i18n/ja.json` / `en.json` | 翻訳ファイル |
| `src/routes/privacy/+page.svelte` | プライバシーポリシーページ（GDPR/CCPA対応、日英切替） |
| `src/app.css` | デザイントークン（oklch カラー） |
| `tests/ffmpeg/` | Vitest ユニットテスト |

## 落とし穴・非自明なルール

- **CSS**: `oklch()` のみ使用。`#hex`/`rgb()`/`hsl()` は CI で弾かれる → `.claude/rules/css.md`
- **Svelte 5**: `$state` Proxy は `structuredClone` 不可。`JSON.parse(JSON.stringify(...))` を使う → `.claude/rules/svelte5.md`
- **i18n**: キー追加時は `ja.json` と `en.json` の両方に必ず追加 → `.claude/rules/i18n.md`
- **GIF 生成**: `buildCommand()` は改行区切りで 2 コマンドを返す（パレット生成 + GIF 生成）
- **コーデック排他**: `copyStreams=true` のとき個別コーデック指定は無視される → `.claude/rules/ffmpeg-builder.md`
- **GA4 Consent Mode**: `app.html` で `analytics_storage: 'denied'` がデフォルト。`consentStore` が同意時に `granted` へ更新する。GA スクリプトは常にロードされるが Cookie は同意後のみ
- **お問い合わせフォーム**: プライバシーポリシーページ（`/privacy`）のセクション11に Google Form へのリンクボタンを設置。GDPR/CCPA の権利行使もこのフォーム経由で受付

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
| `/perf-test` | Chrome MCP でパフォーマンス計測（Navigation Timing / CLS） |
| `/deploy` | push → CI 待機 → デプロイ URL 取得まで一連実行 |
| `/deploy-test` | 本番 URL に対して Chrome MCP で UI + パフォーマンステスト |
| `/implement` | CocoIndex + Cipher を使った新機能実装ワークフロー |

## AI行動規範

### 基本原則
1. 推測でコードを書かない：必ず CocoIndex で現状を確認してから着手
2. 記憶を活用する：新しいタスクの前に Cipher で過去の決定事項を検索
3. 知識を蓄積する：タスク完了後は Cipher に結果を保存
4. 計画を提示する：実装前に計画をリストで出力し、承認を得る

### ワークフロー自動適用
- **新機能実装・大規模改修時** → `.claude/skills/implement_workflow.md` を読み込んで従う
- 機密情報は `[MASKED]` に置き換えて記録する
