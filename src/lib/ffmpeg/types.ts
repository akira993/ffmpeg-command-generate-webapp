/**
 * FFmpeg コマンドジェネレーター 型定義
 *
 * FFmpegの全オプションを表現する型システム。
 * プリセットモード・アドバンスドモード両方で使用される。
 */

// ============================================================
// メイン型
// ============================================================

/** FFmpegの全オプションを表す型 */
export interface FFmpegOptions {
	input: InputOptions;
	output: OutputOptions;
	video: VideoOptions;
	audio: AudioOptions;
	filter: FilterOptions;
	misc: MiscOptions;
}

/** 入力ファイル設定 */
export interface InputOptions {
	/** 入力ファイル名 */
	filename: string;
	/** 開始時刻 (HH:MM:SS or 秒数) — 入力前に置くとシーク高速化 */
	startTime?: string;
}

/** 出力ファイル設定 */
export interface OutputOptions {
	/** 出力ファイル名 */
	filename: string;
	/** 出力フォーマット (-f) */
	format?: string;
	/** 上書き (-y) */
	overwrite: boolean;
}

/** 映像設定 */
export interface VideoOptions {
	/** 映像コーデック (-c:v) */
	codec?: VideoCodec;
	/** 解像度 */
	resolution?: Resolution;
	/** フレームレート (-r) */
	framerate?: number;
	/** ビットレート (-b:v) */
	bitrate?: string;
	/** CRF値 — コーデックにより範囲が異なる */
	crf?: number;
	/** エンコーダプリセット — H.264/H.265用 */
	preset?: EncoderPreset;
	/** 映像無効化 (-vn) */
	noVideo: boolean;
	/** libaom cpu-used (0-8) — AVIF/libaom-av1 用速度設定 */
	cpuUsed?: number;
	/** SVT-AV1 プリセット (0-13) */
	svtav1Preset?: number;
	/** SVT-AV1 追加パラメータ (-svtav1-params) */
	svtav1Params?: string;
	/** libaom 追加パラメータ (-aom-params) */
	aomParams?: string;
	/** ピクセルフォーマット (-pix_fmt) */
	pixFmt?: PixelFormat;
	/** 品質 (-quality) — libwebp用 (0-100, 高いほど高品質) */
	quality?: number;
	/** ロスレスモード (-lossless 1) — libwebp用 */
	lossless?: boolean;
}

/** 音声設定 */
export interface AudioOptions {
	/** 音声コーデック (-c:a) */
	codec?: AudioCodec;
	/** サンプルレート (-ar) */
	sampleRate?: number;
	/** チャンネル数 (-ac) */
	channels?: number;
	/** ビットレート (-b:a) */
	bitrate?: string;
	/** 音声無効化 (-an) */
	noAudio: boolean;
}

/** フィルタ設定 */
export interface FilterOptions {
	/** スケール（リサイズ） */
	scale?: { width?: number; height?: number };
	/** クロップ */
	crop?: { width: number; height: number; x: number; y: number };
	/** FPS */
	fps?: number;
	/** カスタムフィルタ */
	customFilter?: string;
}

/** その他の設定 */
export interface MiscOptions {
	/** メタデータ削除 (-map_metadata -1) */
	stripMetadata: boolean;
	/** 持続時間 (-t) */
	duration?: string;
	/** 終了時刻 (-to) */
	endTime?: string;
	/** ストリームコピー (-c copy) — codec指定と排他 */
	copyStreams: boolean;
}

// ============================================================
// 一括処理（バッチ）型
// ============================================================

/** 一括処理の設定 */
export interface BatchOptions {
	/** 入力ファイル拡張子フィルタ (e.g. ['jpg', 'jpeg', 'png']) */
	inputExtensions: string[];
	/** 出力拡張子 (e.g. 'avif') */
	outputExtension: string;
}

/** 一括処理スクリプトの出力形式 */
export interface BatchScript {
	bash: string;
	powershell: string;
	cmd: string;
}

/** D&Dで取得したファイル情報 */
export interface FileInfo {
	/** ファイル名（拡張子含む） */
	name: string;
	/** 相対パス（フォルダD&D時） */
	relativePath?: string;
	/** ファイルサイズ（バイト） */
	size?: number;
	/** MIMEタイプ */
	type?: string;
	/** 幅（px） — 画像/動画のみ */
	width?: number;
	/** 高さ（px） — 画像/動画のみ */
	height?: number;
}

// ============================================================
// 列挙型・ユニオン型
// ============================================================

/** 映像コーデック */
export type VideoCodec =
	| 'libx264' // H.264
	| 'libx265' // H.265/HEVC
	| 'libvpx' // VP8
	| 'libvpx-vp9' // VP9
	| 'libaom-av1' // AV1 (libaom — 高品質/低速、AVIF静止画に最適)
	| 'libsvtav1' // AV1 (SVT-AV1 — 高速/実用的、動画圧縮に最適)
	| 'libwebp' // WebP
	| 'copy'; // ストリームコピー

/** 音声コーデック */
export type AudioCodec =
	| 'aac'
	| 'libmp3lame' // MP3
	| 'libopus' // Opus — AV1とのベストペア
	| 'libvorbis' // Vorbis
	| 'flac'
	| 'pcm_s16le' // PCM
	| 'copy'; // ストリームコピー

/** H.264/H.265 エンコーダプリセット */
export type EncoderPreset =
	| 'ultrafast'
	| 'superfast'
	| 'veryfast'
	| 'faster'
	| 'fast'
	| 'medium'
	| 'slow'
	| 'slower'
	| 'veryslow';

/** ピクセルフォーマット */
export type PixelFormat =
	| 'yuv420p' // 8bit (標準)
	| 'yuv420p10le' // 10bit (AV1/AVIF推奨)
	| 'yuv444p' // 4:4:4 8bit
	| 'yuv444p10le'; // 4:4:4 10bit

/** 解像度 */
export interface Resolution {
	width?: number;
	height?: number;
}

// ============================================================
// プリセット型
// ============================================================

/** プリセットID */
export type PresetId =
	| 'video-convert'
	| 'video-compress'
	| 'audio-extract'
	| 'audio-convert'
	| 'video-trim'
	| 'gif-generate'
	| 'image-convert'
	| 'image-webp';

/** プリセットカテゴリ */
export type PresetCategory = 'video' | 'audio' | 'image';

/** プリセット定義 */
export interface PresetDefinition {
	id: PresetId;
	/** 表示アイコン（Lucideアイコン名） */
	icon: string;
	/** アイコン背景色のTailwindクラス */
	iconColor: string;
	/** i18n翻訳キー（名前） */
	nameKey: string;
	/** i18n翻訳キー（説明） */
	descriptionKey: string;
	/** デフォルト値 */
	defaults: Partial<FFmpegOptions>;
	/** 編集可能なフィールドパス */
	editableFields: string[];
	/** カテゴリ */
	category: PresetCategory;
}

/** バリデーション結果 */
export interface ValidationResult {
	valid: boolean;
	/** エラーメッセージ（i18nキー） */
	message?: string;
}

// ============================================================
// アプリケーション状態型
// ============================================================

/** アプリケーションモード */
export type AppMode = 'preset' | 'advanced';

/** スクリプトタイプ（一括処理の出力形式） */
export type ScriptType = 'bash' | 'powershell' | 'cmd';
