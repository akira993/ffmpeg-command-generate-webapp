---
title: "Chrome拡張機能リサイザー設計書"
description: "Chrome拡張機能によるウィンドウ縦長リサイズ機能の設計（Phase 2）"
category: "design"
created: "2026-03-11"
updated: "2026-03-11"
---

# Chrome拡張機能リサイザー設計書

## 1. 概要

Chrome拡張機能として独立したウィンドウリサイザーを提供する。
`chrome.windows.update()` API により、PWA版（`window.resizeTo()`）では制限されるケースでも確実なリサイズを実現する。

### PWA版との比較

| 項目 | PWA版（Phase 1） | Chrome拡張版（本設計） |
|------|-----------------|---------------------|
| 設計書 | `compact-mode-design.md` | 本ファイル |
| リサイズAPI | `window.resizeTo()` | `chrome.windows.update()` |
| 信頼性 | OS/ブラウザにより制限あり | API保証でほぼ100% |
| 導入方法 | PWAインストール | 拡張機能インストール |
| UI圧縮 | あり（コンパクトモード） | なし（リサイズのみ） |
| 対象ブラウザ | PWA対応ブラウザ全般 | Chrome系のみ |

### 実装時期

PWA版（Phase 1）のユーザー反応を評価後に着手。詳細は本ファイル末尾の「評価基準」を参照。

---

## 2. ファイル構成

```
chrome-extension/
├── manifest.json     # 拡張機能マニフェスト（Manifest V3）
├── popup.html        # ポップアップUI
├── popup.js          # ポップアップのロジック
└── icons/
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

> **注意:** Chrome拡張は本Webアプリとは別リポジトリで管理する想定。

---

## 3. manifest.json

```json
{
  "manifest_version": 3,
  "name": "FFmpeg Command Generator Window Resizer",
  "version": "1.0.0",
  "description": "ウィンドウを縦長（1:3比率）に変更します",
  "permissions": ["windows"],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16":  "icons/icon-16.png",
      "48":  "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  "icons": {
    "16":  "icons/icon-16.png",
    "48":  "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

---

## 4. popup.html

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      width: 220px;
      padding: 16px;
      font-family: sans-serif;
    }
    button {
      width: 100%;
      padding: 10px;
      font-size: 14px;
      cursor: pointer;
      border: none;
      border-radius: 6px;
      background: oklch(0.55 0.15 250);
      color: white;
      margin-bottom: 8px;
    }
    button:hover { background: oklch(0.45 0.15 250); }
    #status { font-size: 12px; color: oklch(0.5 0 0); margin-top: 8px; }
  </style>
</head>
<body>
  <button id="btn-portrait">縦長 (1:3)</button>
  <button id="btn-landscape">横長 (3:1)</button>
  <div id="status"></div>
  <script src="popup.js"></script>
</body>
</html>
```

---

## 5. popup.js

```javascript
function setStatus(msg, isError = false) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.style.color = isError ? 'oklch(0.55 0.2 25)' : 'oklch(0.55 0.15 155)';
}

/**
 * アスペクト比ベースでリサイズ
 * 画面サイズに収まるよう計算
 */
async function resizeWindow(widthRatio, heightRatio) {
  try {
    const win = await chrome.windows.getCurrent();
    const ratio = heightRatio / widthRatio;

    const screenH = win.height; // 現在の高さを基準にフル活用
    let h = screen.availHeight;
    let w = Math.round(h / ratio);

    // 画面幅を超える場合は幅基準で再計算
    if (w > screen.availWidth) {
      w = screen.availWidth;
      h = Math.round(w * ratio);
    }

    await chrome.windows.update(win.id, { width: w, height: h });
    setStatus(`変更しました: ${w} × ${h}`);
  } catch (e) {
    setStatus('変更に失敗しました', true);
    console.error(e);
  }
}

document.getElementById('btn-portrait').addEventListener('click', () => {
  resizeWindow(1, 3);
});

document.getElementById('btn-landscape').addEventListener('click', () => {
  resizeWindow(3, 1);
});
```

---

## 6. 動作フロー

```
ユーザーが拡張機能アイコンをクリック
  │
  └─ ポップアップが表示される
        │
        ├─ 「縦長」ボタン → chrome.windows.update({ width: h/3, height: h })
        │                          → 即座にウィンドウが変更される
        │
        └─ 「横長」ボタン → chrome.windows.update({ width: w, height: w/3 })
```

---

## 7. 配布方法

| 方法 | 難易度 | 適用場面 |
|------|--------|---------|
| Chromeウェブストア公開 | 高（審査あり） | 一般ユーザー向け |
| 開発者モードで配布（zipファイル） | 低 | テスト・クローズドユーザー向け |
| グループポリシーで配布 | 中 | 企業内管理端末向け |

> **一般公開する場合:** Chromeウェブストア経由が必須。審査期間は1〜3営業日が目安。

---

## 8. 制約・注意事項

| 項目 | 内容 |
|------|------|
| Chrome専用 | Firefox・Safari・Edge では動作しない |
| インストール必須 | ユーザーへのインストール案内が必要 |
| ストア審査 | 公開する場合 Google の審査が必要 |
| 最小化・フルスクリーン時 | 事前に通常表示に戻す必要がある場合あり |
| 権限 | `windows` のみに限定し最小権限を維持 |

---

## 9. 計測指標（KPI）

| 指標 | 計測方法 |
|------|---------|
| インストール数 | Chrome Web Store 管理画面 |
| ボタンクリック数 | `chrome.storage` でカウント |
| 週次アクティブユーザー | Chrome Web Store 管理画面 |
| ストアレビュー・評価 | Chrome Web Store |

---

## 10. PWA版との評価基準

PWA版（Phase 1）と Chrome拡張版を並行リリースし、以下の基準で評価する。

| 評価軸 | PWA版 | Chrome拡張版 |
|--------|-------|-------------|
| 導入ハードル | PWAインストール率で計測 | 拡張インストール数で計測 |
| 機能の確実性 | `resize_success` 率で計測 | ほぼ100%（API保証） |
| ユーザー継続利用 | 月次アクティブ数 | 月次アクティブ数 |
| サポートコスト | フォールバック問い合わせ数 | OS・ブラウザ互換問い合わせ数 |

### 削除判断の目安

- **PWA版を削除する条件:** インストール率が低い、または `resize_failed` が30%を超える
- **Chrome拡張版を削除する条件:** インストール数がPWA版の利用数を大きく下回る、またはストア審査・管理コストが見合わない
