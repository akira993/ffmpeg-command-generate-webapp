# perf-test

Chrome MCP を使って対象 URL のパフォーマンス計測を実行する。

## 対象 URL

- **本番**: `https://www.cmd-gen.com`
- **ローカル**: `http://localhost:4173`（`npm run build && npm run preview`）

引数で URL が渡された場合はそちらを使用する。

## 計測手順

### 1. キャッシュなしリロード

対象 URL に navigate した後、`Cmd+Shift+R`（ハードリロード）で初回ロードを再現し、3 秒待機する。

### 2. Navigation Timing を取得

Chrome MCP の `javascript_tool` で以下を実行し、結果を収集する:

```javascript
(() => {
  const nav = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByType('paint');
  const fcp = paint.find(e => e.name === 'first-contentful-paint');
  const lcp = performance.getEntriesByType('largest-contentful-paint');
  const lcpEntry = lcp.length ? lcp[lcp.length - 1] : null;
  const resources = performance.getEntriesByType('resource');

  const totalTransferSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  const totalDecodedSize = resources.reduce((sum, r) => sum + (r.decodedBodySize || 0), 0);
  const jsResources = resources.filter(r => r.initiatorType === 'script' || r.name.endsWith('.js'));
  const cssResources = resources.filter(r => r.initiatorType === 'css' || r.name.endsWith('.css'));

  return {
    timing: {
      ttfb_ms: Math.round(nav.responseStart - nav.requestStart),
      fcp_ms: fcp ? Math.round(fcp.startTime) : null,
      lcp_ms: lcpEntry ? Math.round(lcpEntry.startTime) : null,
      domInteractive_ms: Math.round(nav.domInteractive),
      domContentLoaded_ms: Math.round(nav.domContentLoadedEventEnd),
      loadComplete_ms: Math.round(nav.loadEventEnd),
    },
    transfer: {
      totalResources: resources.length,
      transferSize_KB: Math.round(totalTransferSize / 1024),
      decodedSize_KB: Math.round(totalDecodedSize / 1024),
      js_count: jsResources.length,
      js_transfer_KB: Math.round(jsResources.reduce((s, r) => s + (r.transferSize || 0), 0) / 1024),
      css_count: cssResources.length,
      css_transfer_KB: Math.round(cssResources.reduce((s, r) => s + (r.transferSize || 0), 0) / 1024),
    },
    protocol: nav.nextHopProtocol,
  };
})()
```

### 3. CLS を取得

```javascript
(() => {
  return new Promise(resolve => {
    let cls = 0;
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
    setTimeout(() => resolve({ cls: Math.round(cls * 1000) / 1000 }), 1000);
  });
})()
```

### 4. インタラクション応答テスト

1. プリセットカード（例: 画像圧縮 AVIF）をクリック
2. クリック前後の `performance.now()` 差分でコマンド更新の応答時間を確認
3. 体感遅延がないこと（< 100ms）を目視確認

## 合格基準

| 指標 | 目標値 | 備考 |
|------|--------|------|
| TTFB | < 200ms | Vercel Edge |
| FCP | < 1000ms | 初回描画 |
| DOMContentLoaded | < 500ms | JS パース完了 |
| Load Complete | < 1500ms | 全リソース読込 |
| 転送サイズ合計 | < 300KB | gzip 圧縮後 |
| JS 転送サイズ | < 200KB | gzip 圧縮後 |
| CLS | < 0.1 | レイアウトシフト |
| インタラクション応答 | < 100ms | 体感遅延なし |

## 結果レポート

以下の形式で報告する:

```
## パフォーマンステスト結果
- URL: <テスト対象URL>
- TTFB:               XXms ✅/⚠️
- FCP:                XXms ✅/⚠️
- DOMContentLoaded:   XXms ✅/⚠️
- Load Complete:      XXms ✅/⚠️
- 転送サイズ:          XX KB ✅/⚠️
- JS サイズ:           XX KB ✅/⚠️
- CLS:                X.XX ✅/⚠️
- インタラクション応答: ✅/⚠️
```

⚠️ が 1 つでもある場合は、ボトルネックの原因と改善案を併記する。
