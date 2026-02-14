# テスト設計書

## 1. テスト方針

### 1.1 使用ツール
- **Vitest**: ユニットテストフレームワーク
- **Playwright**: E2Eテスト（将来実装）

### 1.2 テスト対象の優先度
1. **最優先**: コマンド生成ロジック（`buildCommand()`）— アプリのコア機能
2. **高**: プリセット適用ロジック — 正しいデフォルト値が設定されるか
3. **高**: バリデーション関数 — 入力値の妥当性チェック
4. **中**: Store操作 — プリセット適用・リセット等
5. **低**: UIコンポーネント（E2Eで将来カバー）

### 1.3 テストファイル配置
```
tests/
└── ffmpeg/
    ├── builder.test.ts       # コマンド生成テスト
    ├── presets.test.ts        # プリセットテスト
    └── validators.test.ts    # バリデーションテスト
```

---

## 2. ユニットテスト: コマンド生成 (`builder.test.ts`)

### 2.1 フォーマット変換

| # | テストケース | 入力 | 期待出力 |
|---|-------------|------|---------|
| 1 | MP4→WebM基本変換 | input.mp4, VP9, Opus | `ffmpeg -y -i input.mp4 -c:v libvpx-vp9 -crf 30 -c:a libopus -b:a 128k output.webm` |
| 2 | MP4→MOV変換 | input.mp4, H.264 | `ffmpeg -y -i input.mp4 -c:v libx264 -c:a aac output.mov` |
| 3 | WebM→MP4変換 | input.webm, H.264, AAC | `ffmpeg -y -i input.webm -c:v libx264 -c:a aac output.mp4` |
| 4 | コーデック指定なし | input.mp4 → output.webm | `ffmpeg -y -i input.mp4 output.webm` |

### 2.2 動画圧縮

| # | テストケース | 入力 | 期待出力 |
|---|-------------|------|---------|
| 5 | CRF指定圧縮 | CRF=28, medium | `ffmpeg -y -i input.mp4 -c:v libx264 -crf 28 -preset medium -c:a aac output.mp4` |
| 6 | ビットレート指定 | bitrate=2M | `ffmpeg -y -i input.mp4 -c:v libx264 -b:v 2M -c:a aac output.mp4` |
| 7 | プリセット変更 | preset=slow | `... -preset slow ...` を含む |

### 2.3 音声抽出

| # | テストケース | 入力 | 期待出力 |
|---|-------------|------|---------|
| 8 | MP3抽出 | noVideo, MP3, 192k | `ffmpeg -y -i input.mp4 -vn -c:a libmp3lame -b:a 192k output.mp3` |
| 9 | AAC抽出 | noVideo, AAC | `ffmpeg -y -i input.mp4 -vn -c:a aac output.aac` |
| 10 | WAV抽出 | noVideo, PCM | `ffmpeg -y -i input.mp4 -vn -c:a pcm_s16le output.wav` |
| 11 | FLAC抽出 | noVideo, FLAC | `ffmpeg -y -i input.mp4 -vn -c:a flac output.flac` |

### 2.4 音声変換

| # | テストケース | 入力 | 期待出力 |
|---|-------------|------|---------|
| 12 | WAV→MP3 | input.wav, MP3 | `ffmpeg -y -i input.wav -vn -c:a libmp3lame -b:a 192k output.mp3` |
| 13 | MP3→AAC | input.mp3, AAC | `ffmpeg -y -i input.mp3 -vn -c:a aac output.aac` |
| 14 | サンプルレート指定 | ar=44100 | `... -ar 44100 ...` を含む |

### 2.5 動画トリム

| # | テストケース | 入力 | 期待出力 |
|---|-------------|------|---------|
| 15 | 開始+終了時刻 | ss=00:01:00, to=00:02:00, copy | `ffmpeg -y -ss 00:01:00 -i input.mp4 -to 00:02:00 -c copy output.mp4` |
| 16 | 開始+duration | ss=00:01:00, t=30 | `ffmpeg -y -ss 00:01:00 -i input.mp4 -t 30 -c copy output.mp4` |
| 17 | 開始時刻のみ | ss=00:05:00 | `ffmpeg -y -ss 00:05:00 -i input.mp4 -c copy output.mp4` |
| 18 | 再エンコード | copyStreams=false | `-c copy` を含まない |

### 2.6 GIF生成

| # | テストケース | 入力 | 期待出力 |
|---|-------------|------|---------|
| 19 | 基本GIF | fps=10, w=320 | パレット生成 + GIF生成の2コマンド |
| 20 | カスタムFPS | fps=15 | `fps=15` を含む |
| 21 | カスタム幅 | w=480 | `scale=480:-1` を含む |
| 22 | 開始+duration付き | ss=5, t=3 | `-ss 5 -t 3` を含む |

### 2.7 画像変換

| # | テストケース | 入力 | 期待出力 |
|---|-------------|------|---------|
| 23 | PNG→WebP | input.png → output.webp | `ffmpeg -y -i input.png output.webp` |
| 24 | リサイズ付き | scale w=800 | `ffmpeg -y -i input.png -vf "scale=800:-1" output.webp` |
| 25 | JPEG→AVIF | input.jpg → output.avif | `ffmpeg -y -i input.jpg output.avif` |

### 2.8 複合・その他

| # | テストケース | 入力 | 期待出力 |
|---|-------------|------|---------|
| 26 | メタデータ削除 | stripMetadata=true | `-map_metadata -1` を含む |
| 27 | 上書きフラグなし | overwrite=false | `-y` を含まない |
| 28 | 解像度指定 | 1280x720 | `-vf "scale=1280:720"` を含む |
| 29 | チャンネル指定 | channels=1 | `-ac 1` を含む |

---

## 3. ユニットテスト: バリデーション (`validators.test.ts`)

### 3.1 ファイル名バリデーション

| # | テストケース | 入力 | 期待結果 |
|---|-------------|------|---------|
| 30 | 正常なファイル名 | `"video.mp4"` | valid: true |
| 31 | 空文字 | `""` | valid: false |
| 32 | スペースのみ | `"   "` | valid: false |
| 33 | 拡張子なし | `"video"` | valid: true |
| 34 | パス付き | `"path/to/video.mp4"` | valid: true |

### 3.2 時刻フォーマットバリデーション

| # | テストケース | 入力 | 期待結果 |
|---|-------------|------|---------|
| 35 | HH:MM:SS形式 | `"01:30:00"` | valid: true |
| 36 | 秒数形式 | `"90"` | valid: true |
| 37 | 小数秒 | `"90.5"` | valid: true |
| 38 | 不正な形式 | `"abc"` | valid: false |
| 39 | 負の値 | `"-10"` | valid: false |
| 40 | 空文字 | `""` | valid: false |

### 3.3 CRFバリデーション

| # | テストケース | 入力 | 期待結果 |
|---|-------------|------|---------|
| 41 | 正常値 (23) | `23` | valid: true |
| 42 | 最小値 (0) | `0` | valid: true |
| 43 | 最大値 (51) | `51` | valid: true |
| 44 | 範囲外 (52) | `52` | valid: false |
| 45 | 負の値 | `-1` | valid: false |

### 3.4 解像度バリデーション

| # | テストケース | 入力 | 期待結果 |
|---|-------------|------|---------|
| 46 | 正常 (1920x1080) | `1920, 1080` | valid: true |
| 47 | 奇数幅 | `1921, 1080` | valid: false |
| 48 | 奇数高さ | `1920, 1081` | valid: false |
| 49 | -1（自動） | `1280, -1` | valid: true |
| 50 | ゼロ | `0, 1080` | valid: false |

### 3.5 ビットレートバリデーション

| # | テストケース | 入力 | 期待結果 |
|---|-------------|------|---------|
| 51 | kbps形式 | `"128k"` | valid: true |
| 52 | Mbps形式 | `"2M"` | valid: true |
| 53 | 数値のみ | `"128000"` | valid: true |
| 54 | 不正形式 | `"fast"` | valid: false |

---

## 4. ユニットテスト: プリセット (`presets.test.ts`)

| # | テストケース | 検証内容 |
|---|-------------|---------|
| 55 | 全プリセットが定義されている | 7つのプリセットが存在 |
| 56 | 各プリセットにdefaultsが定義されている | defaults が空でない |
| 57 | 各プリセットにeditableFieldsが定義されている | editableFields が空でない |
| 58 | editableFieldsがdefaultsのキーに対応 | 存在しないフィールドを参照していない |
| 59 | プリセット適用後にコマンド生成可能 | buildCommand がエラーにならない |
| 60 | 各プリセットのデフォルトで正しいコマンド生成 | 期待されるコマンドパターンと一致 |

---

## 5. エッジケーステスト

| # | テストケース | 入力 | 期待結果 |
|---|-------------|------|---------|
| 61 | デフォルト値のみ | getDefaultOptions() | 有効なコマンド文字列 |
| 62 | 全フィールド空 | すべて空/undefined | 最小限のコマンド（エラーにならない） |
| 63 | コーデック+ストリームコピー | codec指定 + copyStreams=true | copyStreamsが優先 |
| 64 | noVideo + 映像設定 | noVideo=true + codec指定 | -vn が出力、codec は無視 |
| 65 | noAudio + 音声設定 | noAudio=true + codec指定 | -an が出力、codec は無視 |

---

## 6. E2Eテスト方針（将来実装）

### 6.1 使用ツール
- Playwright

### 6.2 テストシナリオ
1. プリセット選択 → カスタマイズ → コマンド表示 → コピー
2. アドバンスドモード → 各設定入力 → コマンド表示 → コピー
3. モード切替（プリセット↔アドバンスド）
4. 言語切替（日↔英）
5. テーマ切替（ライト↔ダーク）
6. モバイルレイアウト確認
7. キーボード操作でのフォーム操作
