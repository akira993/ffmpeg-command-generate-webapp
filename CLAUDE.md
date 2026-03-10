---
title: "CLAUDE.md — FFmpeg Command Generator"
description: "プロジェクト概要・コーディングルール・AI行動規範の総合リファレンス"
category: "root"
created: "2025-05-18"
updated: "2026-03-07"
---

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
npm run storybook    # Storybook http://localhost:6006
npm run build-storybook  # Storybook 静的ビルド
```

## 重要ファイル

| パス | 役割 |
|------|------|
| `src/lib/ffmpeg/builder.ts` | `buildCommand()` — コア生成ロジック |
| `src/lib/ffmpeg/types.ts` | `FFmpegOptions` など全型定義 |
| `src/lib/ffmpeg/presets.ts` | 8種のプリセット定義 |
| `src/lib/stores/command.svelte.ts` | `CommandStore` (Svelte 5 Runes) |
| `src/lib/stores/compact.svelte.ts` | `CompactStore` — PWA コンパクトモード（1:3リサイズ + UI圧縮） |
| `src/lib/stores/consent.svelte.ts` | `ConsentStore` — Cookie 同意 + GA4 Consent Mode v2 |
| `src/lib/i18n/ja.json` / `en.json` | 翻訳ファイル |
| `src/routes/privacy/+page.svelte` | プライバシーポリシーページ（GDPR/CCPA対応、日英切替） |
| `src/app.css` | デザイントークン（oklch カラー）+ Web フォント定義 |
| `src/service-worker.ts` | Service Worker — アセットプリキャッシュ + オフライン対応 |
| `static/manifest.webmanifest` | PWA マニフェスト（アプリ名・アイコン・display:standalone） |
| `static/icons/` | PWA アイコン（192/512px 標準+マスカブル、180px apple-touch-icon） |
| `tests/ffmpeg/` | Vitest ユニットテスト |
| `.storybook/` | Storybook 設定（main.ts, preview.ts） |

## 落とし穴・非自明なルール

- **CSS**: `oklch()` のみ使用。`#hex`/`rgb()`/`hsl()` は CI で弾かれる → `.claude/rules/css.md`
- **Svelte 5**: `$state` Proxy は `structuredClone` 不可。`JSON.parse(JSON.stringify(...))` を使う → `.claude/rules/svelte5.md`
- **i18n**: キー追加時は `ja.json` と `en.json` の両方に必ず追加 → `.claude/rules/i18n.md`
- **コーデックラベルの翻訳**: `codecs.ts` の `VIDEO_CODEC_LABELS` / `AUDIO_CODEC_LABELS` は技術名以外（`copy`, `pcm_s16le`）が日本語。コンポーネント側で `$derived` を使い翻訳済みラベルマップを生成して上書きする（`PresetCustomizer.svelte` 参照）
- **言語判定は `$locale` ストアを使う**: `document.documentElement.lang` は非リアクティブで言語切替に追従しない。`import { locale } from '$lib/i18n'` して `$locale` を使うこと
- **GIF 生成**: `buildCommand()` は改行区切りで 2 コマンドを返す（パレット生成 + GIF 生成）
- **コーデック排他**: `copyStreams=true` のとき個別コーデック指定は無視される → `.claude/rules/ffmpeg-builder.md`
- **GA4 Consent Mode**: `app.html` で `analytics_storage: 'denied'` がデフォルト。`consentStore` が同意時に `granted` へ更新する。GA スクリプトは常にロードされるが Cookie は同意後のみ
- **お問い合わせフォーム**: プライバシーポリシーページ（`/privacy`）のセクション11に Google Form へのリンクボタンを設置。GDPR/CCPA の権利行使もこのフォーム経由で受付
- **Web フォント**: Noto Sans JP（日本語）/ Inter（英語）を静的ウェイト（400/700）の woff2 でセルフホスト。`html[lang]` 属性で言語別に切替（`app.css` の `@layer base`）。サブセット化スクリプトは `scripts/subset-fonts.py`、ソース ttf は `scripts/font-sources/`（gitignore 対象）。Noto Sans JP はアプリ内で使用する漢字のみサブセット（翻訳やページ追加時はスクリプト再実行が必要）。Inter は Variable Font ではなく静的インスタンスで配信
- **Storybook**: グローバルストア依存のストーリーは `{@const _ = (() => { ... })()}` パターンで状態を設定 → `.claude/rules/storybook.md`
- **PWA**: `src/service-worker.ts` が存在すれば SvelteKit が自動登録。`$service-worker` モジュールの `build`/`files`/`version` でキャッシュ管理。マニフェストの `theme_color`/`background_color` は hex 値（JSON なので oklch ルール対象外）
- **PWA アイコン**: `scripts/generate-pwa-icons.mjs` でマスカブルアイコンを生成（`sharp` 使用）。favicon.svg を変更したら再実行が必要
- **Markdown**: 全 `.md` ファイルに YAML フロントマター必須（`title`, `description`, `category`, `created`, `updated`） → `.claude/rules/markdown.md`

## デプロイフロー

**`main` push → GitHub Actions CI（型チェック・CSS lint・build・Storybook build）→ Vercel 本番自動デプロイ**

`vercel` CLI は使用しない。デプロイは必ず `git push origin main` 経由で行う。

| プロジェクト | URL | ビルドコマンド |
|-------------|-----|---------------|
| メインアプリ | `www.cmd-gen.com` | `npm run build` |
| Storybook | Vercel 別プロジェクト | `npm run build-storybook` |

両方とも同じ GitHub リポジトリから自動デプロイされる。

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

## MCP サーバー

本プロジェクトでは 4 つの MCP サーバーを使用する。詳細は `.claude/docs/mcp-setup-guide.md` を参照。

| MCP | 用途 | 備考 |
|-----|------|------|
| **CocoIndex** | AST ベースのセマンティックコード検索 | `uvx` で起動 |
| **Cipher** | 長期記憶（メモリ保存・検索） | Gemini API（ローカル運用）。`cipher.yml` の設定が環境変数より優先 |
| **Serena** | LSP ベースのシンボル解析 | 初回 `onboarding` 必要。`.serena/` は git 管理外 |
| **Chrome DevTools** | ブラウザ自動テスト・UI 検証 | `npx` で起動 |

## スキル（`.claude/skills/` に定義）

| スキル | 用途 |
|--------|------|
| `run-tests` | Vitest + 型チェック実行 |
| `css-lint` | CSS oklch ルール違反チェック |
| `ui-test` | Chrome MCP でローカル UI テスト（PC/モバイル） |
| `i18n-check` | en.json / ja.json のキー整合性チェック |
| `perf-test` | Chrome MCP でパフォーマンス計測（Navigation Timing / CLS） |
| `deploy` | push → CI 待機 → デプロイ URL 取得まで一連実行 |
| `deploy-test` | 本番 URL に対して Chrome MCP で UI + パフォーマンステスト |
| `implement_workflow` | CocoIndex + Cipher + Serena を使った新機能実装ワークフロー |
| `storybook-check` | Storybook ビルド検証（全ストーリーのコンパイル確認） |

## ドキュメント構成

| パス | 内容 |
|------|------|
| `CLAUDE.md` | プロジェクト概要・ルール・AI 行動規範（本ファイル） |
| `.claude/rules/` | CSS・Svelte5・i18n・FFmpeg ビルダー・Storybook・Markdown のコーディングルール |
| `.claude/skills/` | スキル定義（テスト・デプロイ・実装ワークフローなど） |
| `.claude/docs/mcp-setup-guide.md` | MCP セットアップ詳細・トラブルシューティング |
| `docs/design/` | 基本設計・詳細設計・CSS デザイン・要件定義・コンパクトモード設計 |
| `docs/seo/` | SEO/LLMO 戦略・外部セットアップ手順 |
| `docs/testing/` | テスト設計・手動テストチェックリスト |
| `docs/deploy/` | Vercel デプロイ・CI/CD 設定 |
| `docs/workflow/` | Claude Code・Cursor・Codex ワークフロー |
| `docs/migration/` | 移行レポート・移行計画 |
| `docs/guides/` | オンボーディング・UI再現ガイド |

## AI行動規範

### 基本原則
1. 推測でコードを書かない：必ず CocoIndex で現状を確認してから着手
2. 記憶を活用する：新しいタスクの前に Cipher で過去の決定事項を検索
3. 知識を蓄積する：タスク完了後は Cipher に結果を保存
4. 計画を提示する：実装前に計画をリスト形式で出力し、承認を得る

### ワークフロー自動適用
- **新機能実装・大規模改修時** → `.claude/skills/implement_workflow.md` を読み込んで従う
- 機密情報は `[MASKED]` に置き換えて記録する
- MCP の問題発生時 → `.claude/docs/mcp-setup-guide.md` を参照
