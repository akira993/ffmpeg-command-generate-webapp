# deploy-test

デプロイ済みの本番 URL に対して Chrome MCP で UI テストを実行する。
`/deploy` の後に呼び出すことを想定。

## 前提

本番 URL: `https://www.cmd-gen.com`

引数として渡されない場合は上記カスタムドメインを使用する。
デプロイ固有 URL が必要な場合は以下で取得:

```bash
gh api repos/akira993/ffmpeg-command-generate-webapp/deployments \
  --jq '.[0].id' \
  | xargs -I{} gh api \
    "repos/akira993/ffmpeg-command-generate-webapp/deployments/{}/statuses" \
  --jq '.[0].target_url'
```

## テスト手順

### 1. デスクトップ (1280×900)

- `resize_window(1280, 900)` → `navigate(<本番URL>)`
- screenshot で確認:
  - Header: タイトル・言語切替(EN)・テーマトグル
  - ModeSwitch: 「プリセット」「アドバンスド」ピル、固定幅 220px でセンタリング
  - PresetGrid: 4列×2行、8枚のカード表示
  - CommandOutput: `ffmpeg -y -i input.mp4 output.mp4` デフォルト表示
  - ActionButtons(3つ): FFmpegの導入・実行方法・ライブラリの追加

### 2. モバイル (375×812)

- `resize_window(375, 812)` → `navigate(<本番URL>)`
- screenshot で確認:
  - PresetGrid: 2列グリッド
  - 固定バーが画面下部に表示
  - Separator 下の ActionButtons が非表示（固定バーに移動済み）
  - 横スクロールが発生しないこと

### 3. 機能テスト（デスクトップで実施）

1. **ModeSwitch**: 「アドバンスド」クリック → アドバンスドフォームが表示
2. **プリセット選択**: 任意のカードをクリック → PresetCustomizer が展開、コマンドが更新
3. **言語切替**: 「EN」クリック → テキストが英語に切替、「JA」で日本語に戻る
4. **テーマ切替**: テーマトグルクリック → ライト/ダーク切替
5. **コピーボタン**: 「コピー」クリック → 「コピー済み」に変化

### 4. パフォーマンステスト

`/perf-test` スキルの手順に従い、本番 URL でパフォーマンス計測を実行する。

- ハードリロード（`Cmd+Shift+R`）後に Navigation Timing / CLS を取得
- 合格基準: FCP < 1000ms, 転送サイズ < 300KB, CLS < 0.1
- プリセットカードクリック → コマンド更新の応答が体感遅延なし

### 5. 結果レポート

以下の形式で報告する:

```
## デプロイテスト結果
- URL: https://www.cmd-gen.com
- デスクトップ:     ✅ / ⚠️ <問題があれば記載>
- モバイル:         ✅ / ⚠️ <問題があれば記載>
- 機能テスト:       ✅ / ⚠️ <問題があれば記載>
- パフォーマンス:   ✅ / ⚠️ <指標と値を記載>
```

問題が見つかった場合はスクリーンショットと合わせて詳細を報告する。
