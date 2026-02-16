# 詳細設計書

## 1. ディレクトリ構成

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/              # shadcn-svelte コンポーネント
│   │   ├── layout/
│   │   │   ├── Header.svelte
│   │   │   └── Footer.svelte
│   │   ├── command/
│   │   │   └── CommandOutput.svelte
│   │   ├── preset/
│   │   │   ├── PresetCard.svelte
│   │   │   ├── PresetGrid.svelte
│   │   │   └── PresetCustomizer.svelte
│   │   ├── form/
│   │   │   ├── AdvancedForm.svelte
│   │   │   ├── InputSection.svelte
│   │   │   ├── OutputSection.svelte
│   │   │   ├── VideoSection.svelte
│   │   │   ├── AudioSection.svelte
│   │   │   ├── FilterSection.svelte
│   │   │   └── MiscSection.svelte
│   │   └── common/
│   │       ├── LanguageSwitcher.svelte
│   │       ├── ThemeToggle.svelte        # Lucide Sun/Moon アイコン使用
│   │       ├── ModeSwitch.svelte
│   │       ├── DropZone.svelte           # D&D ファイル/フォルダ入力
│   │       ├── PathGuideModal.svelte     # コマンド実行方法ガイド
│   │       └── FfmpegInstallGuide.svelte # FFmpegインストールガイド（OS別タブ）
│   ├── ffmpeg/
│   │   ├── types.ts          # 型定義
│   │   ├── builder.ts        # コマンド生成ロジック
│   │   ├── presets.ts        # プリセット定義
│   │   ├── codecs.ts         # コーデック・フォーマット定数
│   │   └── validators.ts     # バリデーション関数
│   ├── stores/
│   │   └── command.ts        # Svelte Store
│   └── i18n/
│       ├── index.ts          # i18n設定
│       ├── en.json           # 英語翻訳
│       └── ja.json           # 日本語翻訳
├── routes/
│   ├── +layout.svelte
│   ├── +layout.ts
│   └── +page.svelte
├── app.css
└── app.html
```

---

## 2. 型定義 (`src/lib/ffmpeg/types.ts`)

### 2.1 メイン型

```typescript
// FFmpegの全オプションを表す型
interface FFmpegOptions {
  input: InputOptions;
  output: OutputOptions;
  video: VideoOptions;
  audio: AudioOptions;
  filter: FilterOptions;
  misc: MiscOptions;
}

interface InputOptions {
  filename: string;        // 入力ファイル名
  startTime?: string;      // 開始時刻 (HH:MM:SS or 秒数)
}

interface OutputOptions {
  filename: string;        // 出力ファイル名
  format?: string;         // 出力フォーマット (-f)
  overwrite: boolean;      // 上書き (-y)
}

interface VideoOptions {
  codec?: VideoCodec;      // 映像コーデック (-c:v)
  resolution?: Resolution; // 解像度
  framerate?: number;      // フレームレート (-r)
  bitrate?: string;        // ビットレート (-b:v)
  crf?: number;            // CRF値
  quality?: number;        // WebP品質 (0-100)
  svtav1Preset?: number;   // SVT-AV1 エンコード速度 (0-13)
  preset?: EncoderPreset;  // エンコーダプリセット
  noVideo: boolean;        // 映像無効化 (-vn)
}

interface FileInfo {
  name: string;            // ファイル名
  size: number;            // ファイルサイズ(bytes)
  type: string;            // MIMEタイプ
  width?: number;          // メディア幅(px) — D&D時に自動取得
  height?: number;         // メディア高さ(px) — D&D時に自動取得
}

interface AudioOptions {
  codec?: AudioCodec;      // 音声コーデック (-c:a)
  sampleRate?: number;     // サンプルレート (-ar)
  channels?: number;       // チャンネル数 (-ac)
  bitrate?: string;        // ビットレート (-b:a)
  noAudio: boolean;        // 音声無効化 (-an)
}

interface FilterOptions {
  scale?: { width?: number; height?: number };
  crop?: { width: number; height: number; x: number; y: number };
  fps?: number;
  customFilter?: string;
}

interface MiscOptions {
  stripMetadata: boolean;  // メタデータ削除 (-map_metadata -1)
  duration?: string;       // 持続時間 (-t)
  endTime?: string;        // 終了時刻 (-to)
  copyStreams: boolean;    // ストリームコピー (-c copy)
}
```

### 2.2 列挙型・ユニオン型

```typescript
type VideoCodec =
  | 'libx264'    // H.264
  | 'libx265'    // H.265/HEVC
  | 'libvpx'     // VP8
  | 'libvpx-vp9' // VP9
  | 'libaom-av1' // AV1
  | 'copy';      // コピー

type AudioCodec =
  | 'aac'
  | 'libmp3lame' // MP3
  | 'libopus'    // Opus
  | 'libvorbis'  // Vorbis
  | 'flac'
  | 'pcm_s16le'  // PCM
  | 'copy';      // コピー

type EncoderPreset =
  | 'ultrafast' | 'superfast' | 'veryfast' | 'faster'
  | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow';

interface Resolution {
  width?: number;
  height?: number;
}
```

### 2.3 プリセット型

```typescript
type PresetId =
  | 'video-convert'
  | 'video-compress'
  | 'audio-extract'
  | 'audio-convert'
  | 'video-trim'
  | 'gif-generate'
  | 'image-convert'
  | 'image-webp';

interface PresetDefinition {
  id: PresetId;
  icon: string;                   // Lucide アイコン名（ICON_MAPのキー）
  iconColor: string;              // アイコンカラーキー（emerald, teal, violet等）
  nameKey: string;                // i18n翻訳キー（名前）
  descriptionKey: string;         // i18n翻訳キー（説明）
  defaults: Partial<FFmpegOptions>;  // デフォルト値
  editableFields: string[];       // 編集可能なフィールドパス
  category: 'video' | 'audio' | 'image';
}
```

### 2.4 アイコンシステム

プリセットカードでは **@lucide/svelte** ライブラリのアイコンを使用。

| icon キー | Lucide コンポーネント | iconColor | 用途 |
|-----------|---------------------|-----------|------|
| `image` | Image | emerald | 画像圧縮(AVIF) |
| `globe` | Globe | teal | 画像圧縮(WebP) |
| `archive` | Archive | violet | 動画圧縮 |
| `clapperboard` | Clapperboard | blue | 動画変換 |
| `music` | Music | pink | 音声抽出 |
| `repeat` | Repeat | amber | 音声変換 |
| `scissors` | Scissors | rose | 動画トリム |
| `film` | Film | orange | GIF生成 |

アイコンカラーは CSS カスタムプロパティ `--color-icon-{key}` / `--color-icon-{key}-bg` で定義（`src/app.css` の `:root` / `.dark` 内）。

---

## 3. コマンド生成ロジック (`src/lib/ffmpeg/builder.ts`)

### 3.1 関数シグネチャ

```typescript
function buildCommand(options: FFmpegOptions): string
```

### 3.2 コマンド組立順序

FFmpegコマンドは以下の順序で組み立てる:

```
ffmpeg [global options] [input options] -i input [output options] [filters] output
```

1. `ffmpeg` コマンド
2. グローバルオプション（`-y` 上書き）
3. 入力オプション（`-ss` 開始時刻 ※入力前に置くとシーク高速化）
4. `-i input` 入力ファイル
5. 映像オプション（`-c:v`, `-crf`, `-b:v`, `-r`, `-preset`, `-vn`）
6. 音声オプション（`-c:a`, `-ar`, `-ac`, `-b:a`, `-an`）
7. ストリームコピー（`-c copy` ※codec指定と排他）
8. フィルタ（`-vf "scale=...,fps=..."`)
9. その他（`-map_metadata -1`, `-t`, `-to`）
10. 出力ファイル

### 3.3 GIF生成の特殊処理

GIF生成はパレット生成を含む2パスコマンドとなる:

```bash
# パレット生成
ffmpeg -i input.mp4 -vf "fps=10,scale=320:-1:flags=lanczos,palettegen" palette.png

# GIF生成（パレット使用）
ffmpeg -i input.mp4 -i palette.png -lavfi "fps=10,scale=320:-1:flags=lanczos [x]; [x][1:v] paletteuse" output.gif
```

この場合、`buildCommand()` は改行で区切られた2つのコマンドを返す。

### 3.4 ヘルパー関数

```typescript
// フィルタ文字列の構築
function buildVideoFilter(options: FFmpegOptions): string | null

// 入力オプション文字列の構築
function buildInputOptions(options: FFmpegOptions): string[]

// 出力オプション文字列の構築
function buildOutputOptions(options: FFmpegOptions): string[]

// オプションが空かどうかの判定
function isOptionEmpty(value: unknown): boolean
```

---

## 4. プリセット定義 (`src/lib/ffmpeg/presets.ts`)

### 4.1 各プリセットの詳細

#### 1. 動画フォーマット変換 (`video-convert`)
```typescript
{
  id: 'video-convert',
  defaults: {
    input: { filename: 'input.mp4' },
    output: { filename: 'output.webm', overwrite: true },
    video: { codec: 'libvpx-vp9', crf: 30 },
    audio: { codec: 'libopus', bitrate: '128k' },
  },
  editableFields: [
    'input.filename',
    'output.filename',
    'video.codec',
    'audio.codec',
  ],
}
```

#### 2. 動画圧縮 (`video-compress`)
```typescript
{
  id: 'video-compress',
  defaults: {
    input: { filename: 'input.mp4' },
    output: { filename: 'output.mkv', overwrite: true },
    video: { codec: 'libsvtav1', crf: 30, svtav1Preset: 6 },
    audio: { codec: 'libopus', bitrate: '128k' },
  },
  editableFields: [
    'input.filename',
    'output.filename',
    'video.codec',           // ← 新規: コーデック選択ドロップダウン
    'audio.codec',           // ← 新規: 音声コーデック選択ドロップダウン
    'output.format',         // ← 新規: コンテナフォーマット選択ドロップダウン
    'video.crf',
    'video.svtav1Preset',
    'audio.bitrate',         // ← ドロップダウン化 (64k〜320k)
    'filter.scale.width',
    'filter.scale.height',
  ],
}
```

#### 3. 音声抽出 (`audio-extract`)
```typescript
{
  id: 'audio-extract',
  defaults: {
    input: { filename: 'input.mp4' },
    output: { filename: 'output.mp3', overwrite: true },
    video: { noVideo: true },
    audio: { codec: 'libmp3lame', bitrate: '192k' },
  },
  editableFields: [
    'input.filename',
    'output.filename',
    'audio.codec',
    'audio.bitrate',
  ],
}
```

#### 4. 音声変換 (`audio-convert`)
```typescript
{
  id: 'audio-convert',
  defaults: {
    input: { filename: 'input.wav' },
    output: { filename: 'output.mp3', overwrite: true },
    video: { noVideo: true },
    audio: { codec: 'libmp3lame', bitrate: '192k' },
  },
  editableFields: [
    'input.filename',
    'output.filename',
    'audio.codec',
    'audio.bitrate',
    'audio.sampleRate',
  ],
}
```

#### 5. 動画トリム (`video-trim`)
```typescript
{
  id: 'video-trim',
  defaults: {
    input: { filename: 'input.mp4', startTime: '00:00:00' },
    output: { filename: 'output.mp4', overwrite: true },
    misc: { copyStreams: true, endTime: '00:00:30' },
  },
  editableFields: [
    'input.filename',
    'input.startTime',
    'output.filename',
    'misc.endTime',
    'misc.duration',
    'misc.copyStreams',
  ],
}
```

#### 6. GIF生成 (`gif-generate`)
```typescript
{
  id: 'gif-generate',
  defaults: {
    input: { filename: 'input.mp4' },
    output: { filename: 'output.gif', overwrite: true },
    filter: { fps: 10, scale: { width: 320, height: -1 } },
    audio: { noAudio: true },
  },
  editableFields: [
    'input.filename',
    'output.filename',
    'filter.fps',
    'filter.scale.width',
    'input.startTime',
    'misc.duration',
  ],
}
```

#### 7. 画像変換 (`image-convert`)
```typescript
{
  id: 'image-convert',
  defaults: {
    input: { filename: 'input.png' },
    output: { filename: 'output.webp', overwrite: true },
    video: { noVideo: false },
    audio: { noAudio: true },
  },
  editableFields: [
    'input.filename',
    'output.filename',
    'filter.scale.width',
    'filter.scale.height',
  ],
}
```

---

## 5. コンポーネント仕様

### 5.1 `PresetCard`
| 項目 | 内容 |
|------|------|
| Props | `preset: PresetDefinition`, `selected: boolean` |
| イベント | `on:select(presetId)` |
| 責務 | プリセットをカード形式で表示。クリックで選択 |

### 5.2 `PresetGrid`
| 項目 | 内容 |
|------|------|
| Props | なし |
| 責務 | 全プリセットをグリッド表示。選択状態を管理 |

### 5.3 `PresetCustomizer`
| 項目 | 内容 |
|------|------|
| Props | `preset: PresetDefinition` |
| 責務 | 選択されたプリセットの編集可能フィールドをフォーム表示。値変更でstoreを更新 |

### 5.4 `AdvancedForm`
| 項目 | 内容 |
|------|------|
| Props | なし |
| 責務 | 全オプションのフォームを表示。各セクションコンポーネントを統合 |

### 5.5 `CommandOutput`
| 項目 | 内容 |
|------|------|
| Props | なし (storeから取得) |
| 責務 | 生成コマンドの表示とクリップボードコピー機能。FfmpegInstallGuide・PathGuideModal・Copyボタンをヘッダーに配置 |

### 5.6 `ModeSwitch`
| 項目 | 内容 |
|------|------|
| Props | なし |
| 責務 | プリセット/アドバンスドモードの切替 |

### 5.7 `LanguageSwitcher`
| 項目 | 内容 |
|------|------|
| Props | なし |
| 責務 | 言語切替ボタン。localStorageに保存 |

### 5.8 `ThemeToggle`
| 項目 | 内容 |
|------|------|
| Props | なし |
| 責務 | ダーク/ライトテーマ切替。Lucide Sun/Moonアイコン使用。localStorageに保存 |

### 5.9 `PathGuideModal`
| 項目 | 内容 |
|------|------|
| Props | なし |
| 責務 | コマンドの実行方法をステップガイドで表示。OS別ターミナルの開き方Tips付き。インストールガイドへのリンクあり |

### 5.10 `FfmpegInstallGuide`
| 項目 | 内容 |
|------|------|
| Props | なし |
| 責務 | FFmpegのインストール方法をOS別タブ（macOS/Windows/Linux）で案内。インストール確認コマンド・公式サイトリンク付き |
| 外部API | `export function show()` — 外部からモーダルを開く |

---

## 6. Store設計 (`src/lib/stores/command.svelte.ts`)

Svelte 5 の runes (`$state`, `$derived`) を使用したクラスベースの状態管理。

```typescript
class CommandStore {
  // --- 状態 ---
  mode = $state<AppMode>('preset');
  selectedPreset = $state<PresetId | null>(null);
  options = $state<FFmpegOptions>(createDefaultOptions());
  batchMode = $state(false);
  droppedFiles = $state<FileInfo[]>([]);
  activeScriptType = $state<ScriptType>('bash');
  aspectRatioLocked = $state(true);           // アスペクト比ロック（デフォルトON）
  originalAspectRatio = $state<number | null>(null); // 元メディアのアスペクト比

  // --- 算出プロパティ ---
  commandString = $derived(buildCommand(this.options));
  batchScript = $derived.by((): BatchScript | null => { ... });
  fileCount = $derived(this.droppedFiles.length);

  // --- アクション ---
  applyPreset(presetId: PresetId): void { ... }
  resetOptions(): void { ... }
  setDroppedFiles(files: FileInfo[]): void { ... }  // D&D時にメディア寸法も反映
  clearDroppedFiles(): void { ... }
  updateOption(path: string, value: unknown): void {
    // $state Proxy は structuredClone 不可のため JSON 経由でディープコピー
    const newOptions = JSON.parse(JSON.stringify(this.options));
    // ネストしたパスに値を設定
    ...
    this.options = newOptions;
  }
}

export const commandStore = new CommandStore();
```

---

## 7. i18n翻訳キー構造

```json
{
  "common": {
    "copy": "コピー",
    "copied": "コピーしました",
    "reset": "リセット",
    "input": "入力",
    "output": "出力",
    "apply": "適用"
  },
  "header": {
    "title": "FFmpeg コマンドジェネレーター",
    "subtitle": "GUIで簡単にFFmpegコマンドを生成"
  },
  "mode": {
    "preset": "プリセット",
    "advanced": "アドバンスド"
  },
  "preset": {
    "videoConvert": { "name": "動画フォーマット変換", "desc": "..." },
    "videoCompress": { "name": "動画圧縮", "desc": "..." },
    "audioExtract": { "name": "音声抽出", "desc": "..." },
    "audioConvert": { "name": "音声変換", "desc": "..." },
    "videoTrim": { "name": "動画トリム", "desc": "..." },
    "gifGenerate": { "name": "GIF生成", "desc": "..." },
    "imageConvert": { "name": "画像変換・リサイズ", "desc": "..." }
  },
  "form": {
    "filename": "ファイル名",
    "format": "フォーマット",
    "codec": "コーデック",
    "resolution": "解像度",
    "framerate": "フレームレート",
    "bitrate": "ビットレート",
    "crf": "CRF (品質)",
    "sampleRate": "サンプルレート",
    "channels": "チャンネル",
    "startTime": "開始時刻",
    "endTime": "終了時刻",
    "duration": "持続時間",
    "noVideo": "映像なし",
    "noAudio": "音声なし",
    "stripMetadata": "メタデータ削除",
    "copyStreams": "ストリームコピー（再エンコードなし）"
  },
  "command": {
    "generated": "生成されたコマンド",
    "empty": "オプションを設定してください",
    "copied": "コマンドをコピーしました"
  },
  "pathGuide": {
    "buttonLabel": "実行方法",
    "title": "コマンドの実行方法",
    "description": "...",
    "step1-4": "...",
    "tipTitle": "...", "tipMac": "...", "tipWindows": "...", "tipLinux": "...",
    "warning": "...",
    "installPrompt": "FFmpegがまだインストールされていない場合は",
    "installLink": "インストールガイド"
  },
  "installGuide": {
    "buttonLabel": "FFmpegの導入",
    "title": "FFmpegのインストール方法",
    "description": "...",
    "mac": { "homebrewTitle": "...", "homebrewDesc": "...", "installTitle": "..." },
    "windows": { "wingetTitle": "...", "wingetDesc": "...", "chocoTitle": "...", "manualTitle": "...", "manualDesc": "..." },
    "verifyTitle": "インストール確認",
    "verifyDesc": "...",
    "officialSite": "..."
  }
}
```

---

## 8. バリデーション仕様 (`src/lib/ffmpeg/validators.ts`)

### 8.1 バリデーション関数

```typescript
// ファイル名バリデーション
function validateFilename(filename: string): ValidationResult

// 時刻フォーマットバリデーション (HH:MM:SS or 秒数)
function validateTimeFormat(time: string): ValidationResult

// CRF範囲チェック (0-51)
function validateCRF(crf: number): ValidationResult

// 解像度バリデーション（偶数チェック等）
function validateResolution(width?: number, height?: number): ValidationResult

// ビットレートフォーマットバリデーション (例: "128k", "2M")
function validateBitrate(bitrate: string): ValidationResult

// コーデックとフォーマットの互換性チェック
function validateCodecFormatCompat(codec: string, format: string): ValidationResult
```

### 8.2 ValidationResult型

```typescript
interface ValidationResult {
  valid: boolean;
  message?: string;  // エラーメッセージ（i18nキー）
}
```

### 8.3 バリデーションルール

| フィールド | ルール |
|-----------|--------|
| ファイル名 | 空でない、無効な文字を含まない |
| 時刻 | `HH:MM:SS` または正の数値（秒） |
| CRF | 0〜51の整数 |
| 解像度 | 正の偶数（FFmpegは偶数を要求） |
| ビットレート | 数値 + `k` または `M` |
| FPS | 1〜120の正数 |
| サンプルレート | 8000, 16000, 22050, 44100, 48000 のいずれか |
