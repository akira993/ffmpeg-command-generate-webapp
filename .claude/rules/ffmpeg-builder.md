# FFmpeg コマンド生成ルール

## コマンド組立順序

```
ffmpeg [global] [input opts] -i input [video opts] [audio opts] [filters] [misc] output
```

1. `ffmpeg`
2. グローバル: `-y`（上書き）
3. 入力オプション: `-ss`（入力前に置くと高速シーク）
4. `-i input`
5. 映像: `-c:v`, `-crf`, `-b:v`, `-r`, `-preset`, `-vn`
6. 音声: `-c:a`, `-ar`, `-ac`, `-b:a`, `-an`
7. ストリームコピー: `-c copy`（コーデック指定と排他）
8. フィルタ: `-vf "scale=...,fps=..."`
9. その他: `-map_metadata -1`, `-t`, `-to`
10. 出力ファイル

## 特殊ケース

### GIF 生成（2パス）

`buildCommand()` は改行区切りで 2 コマンドを返す:
```bash
# 1パス目: パレット生成
ffmpeg -i input.mp4 -vf "fps=10,scale=320:-1:flags=lanczos,palettegen" palette.png
# 2パス目: GIF 生成
ffmpeg -i input.mp4 -i palette.png -lavfi "fps=10,scale=320:-1:flags=lanczos [x]; [x][1:v] paletteuse" output.gif
```

### 排他ルール

- `copyStreams=true` → 個別コーデック指定は無視
- `noVideo=true` → 映像コーデック設定を無視して `-vn` だけ出力
- `noAudio=true` → 音声コーデック設定を無視して `-an` だけ出力

## テストファイル

`tests/ffmpeg/builder.test.ts` — コマンド生成ロジックのユニットテスト（最優先）
