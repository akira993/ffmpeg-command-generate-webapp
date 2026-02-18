# ui-test

Chrome MCP を使ってローカル preview サーバーで PC / モバイル UI テストを実行する。

## 前提

ローカルの preview サーバーが起動していること:
```bash
npm run build && npm run preview
# → http://localhost:4173
```

## テスト手順

### 1. デスクトップテスト (1280×900)

- `resize_window(1280, 900)` → `navigate("http://localhost:4173")`
- screenshot で以下を確認:
  - Header: ロゴ・タイトル・言語切替・テーマトグル
  - ModeSwitchピル: プリセット / アドバンスド切替
  - PresetGrid: 4列グリッド、8枚のカード
  - CommandOutput: コマンド表示エリア + コピーボタン + ActionButtons(3ボタン)
  - Footer: 「FFmpegとは？」リンク
- scroll でフッターが固定バーに隠れないことを確認

### 2. モバイルテスト (375×812)

- `resize_window(375, 812)` → `navigate("http://localhost:4173")`
- screenshot で以下を確認:
  - Separator 下の ActionButtons が **非表示**（モバイルでは固定バーに移動）
  - 固定バーが画面下部に **表示**
  - PresetGrid が 2列グリッド
  - 横スクロールが発生しないこと（`overflow-x: hidden`）
- scroll → フッターが固定バーに隠れず全文表示されること
- click(固定バーの「FFmpegの導入」) → FfmpegInstallGuide モーダルが開くこと
- click(固定バーの「実行方法」) → PathGuideModal が開くこと

### 3. 機能テスト（両サイズで実施）

- プリセットカードをクリック → PresetCustomizer が展開
- 言語切替（JA ↔ EN）→ UI テキストが切り替わること
- テーマトグル → ライト / ダーク切替

## チェックポイント早見表

| 項目 | デスクトップ | モバイル |
|------|------------|---------|
| PresetGrid 列数 | 4列 | 2列 |
| ActionButtons 位置 | CommandOutput 内（Separator 下） | 固定バー（画面下） |
| 固定バー表示 | なし | あり |
| 横スクロール | なし | なし |
