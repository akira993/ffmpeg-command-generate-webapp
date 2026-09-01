/**
 * プリセット定義
 *
 * 8つのプリセットを定義。各プリセットは:
 * - デフォルトのFFmpegオプション
 * - ユーザーが編集可能なフィールド
 * - 表示情報（アイコン、i18nキー）
 *
 * 画像圧縮(AVIF)と動画圧縮(AV1)は最新の推奨パラメータで最適化済み。
 */

import type { BatchOptions, PresetDefinition, PresetId } from './types';
import { AVIF_DEFAULTS, SVT_AV1_DEFAULTS, WEBP_DEFAULTS } from './codecs';

// ============================================================
// プリセット定義
// ============================================================

export const PRESETS: Record<PresetId, PresetDefinition> = {
	// ----------------------------------------------------------------
	// 画像変換・圧縮（AVIF特化）
	// ----------------------------------------------------------------
	'image-convert': {
		id: 'image-convert',
		icon: 'image',
		iconColor: 'emerald',
		nameKey: 'preset.imageConvert.name',
		descriptionKey: 'preset.imageConvert.desc',
		category: 'image',
		defaults: {
			input: { filename: 'input.png' },
			output: { filename: 'output.avif', overwrite: true },
			video: {
				codec: AVIF_DEFAULTS.codec,
				crf: AVIF_DEFAULTS.crf,
				bitrate: '0',
				pixFmt: AVIF_DEFAULTS.pixFmt,
				noVideo: false
			},
			audio: { noAudio: true },
			filter: {},
			misc: { stripMetadata: false, copyStreams: false }
		},
		editableFields: [
			'input.filename',
			'output.filename',
			'video.crf',
			'filter.scale.width',
			'filter.scale.height'
		]
	},

	// ----------------------------------------------------------------
	// 画像変換・圧縮（WebP）
	// ----------------------------------------------------------------
	'image-webp': {
		id: 'image-webp',
		icon: 'globe',
		iconColor: 'teal',
		nameKey: 'preset.imageWebp.name',
		descriptionKey: 'preset.imageWebp.desc',
		category: 'image',
		defaults: {
			input: { filename: 'input.png' },
			output: { filename: 'output.webp', overwrite: true },
			video: {
				codec: WEBP_DEFAULTS.codec,
				quality: WEBP_DEFAULTS.quality,
				noVideo: false
			},
			audio: { noAudio: true },
			filter: {},
			misc: { stripMetadata: false, copyStreams: false }
		},
		editableFields: [
			'input.filename',
			'output.filename',
			'video.quality',
			'filter.scale.width',
			'filter.scale.height'
		]
	},

	// ----------------------------------------------------------------
	// 動画圧縮（SVT-AV1 デフォルト）
	// ----------------------------------------------------------------
	'video-compress': {
		id: 'video-compress',
		icon: 'archive',
		iconColor: 'violet',
		nameKey: 'preset.videoCompress.name',
		descriptionKey: 'preset.videoCompress.desc',
		category: 'video',
		defaults: {
			input: { filename: 'input.mp4' },
			output: { filename: 'output.mp4', overwrite: true },
			video: {
				codec: SVT_AV1_DEFAULTS.codec,
				crf: SVT_AV1_DEFAULTS.crf,
				svtav1Preset: SVT_AV1_DEFAULTS.svtav1Preset,
				pixFmt: SVT_AV1_DEFAULTS.pixFmt,
				svtav1Params: SVT_AV1_DEFAULTS.svtav1Params,
				noVideo: false
			},
			audio: {
				codec: SVT_AV1_DEFAULTS.audioCodec,
				bitrate: SVT_AV1_DEFAULTS.audioBitrate,
				noAudio: false
			},
			filter: {},
			misc: { stripMetadata: false, copyStreams: false }
		},
		editableFields: [
			'input.filename',
			'output.filename',
			'video.codec',
			'audio.codec',
			'output.format',
			'video.crf',
			'video.svtav1Preset',
			'audio.bitrate'
		]
	},

	// ----------------------------------------------------------------
	// 動画フォーマット変換
	// ----------------------------------------------------------------
	'video-convert': {
		id: 'video-convert',
		icon: 'clapperboard',
		iconColor: 'blue',
		nameKey: 'preset.videoConvert.name',
		descriptionKey: 'preset.videoConvert.desc',
		category: 'video',
		defaults: {
			input: { filename: 'input.mp4' },
			output: { filename: 'output.webm', overwrite: true },
			video: { codec: 'libvpx-vp9', crf: 30, bitrate: '0', noVideo: false },
			audio: { codec: 'libopus', bitrate: '128k', noAudio: false },
			filter: {},
			misc: { stripMetadata: false, copyStreams: false }
		},
		editableFields: [
			'input.filename',
			'output.filename',
			'video.codec',
			'audio.codec',
			'output.format',
			'video.crf',
			'audio.bitrate'
		]
	},

	// ----------------------------------------------------------------
	// 音声抽出
	// ----------------------------------------------------------------
	'audio-extract': {
		id: 'audio-extract',
		icon: 'music',
		iconColor: 'pink',
		nameKey: 'preset.audioExtract.name',
		descriptionKey: 'preset.audioExtract.desc',
		category: 'audio',
		defaults: {
			input: { filename: 'input.mp4' },
			output: { filename: 'output.mp3', overwrite: true },
			video: { noVideo: true },
			audio: { codec: 'libmp3lame', bitrate: '192k', noAudio: false },
			filter: {},
			misc: { stripMetadata: false, copyStreams: false }
		},
		editableFields: [
			'input.filename',
			'output.filename',
			'audio.codec',
			'output.format',
			'audio.bitrate'
		]
	},

	// ----------------------------------------------------------------
	// 音声変換
	// ----------------------------------------------------------------
	'audio-convert': {
		id: 'audio-convert',
		icon: 'repeat',
		iconColor: 'amber',
		nameKey: 'preset.audioConvert.name',
		descriptionKey: 'preset.audioConvert.desc',
		category: 'audio',
		defaults: {
			input: { filename: 'input.wav' },
			output: { filename: 'output.mp3', overwrite: true },
			video: { noVideo: true },
			audio: { codec: 'libmp3lame', bitrate: '192k', noAudio: false },
			filter: {},
			misc: { stripMetadata: false, copyStreams: false }
		},
		editableFields: [
			'input.filename',
			'output.filename',
			'audio.codec',
			'output.format',
			'audio.bitrate',
			'audio.sampleRate'
		]
	},

	// ----------------------------------------------------------------
	// 動画トリム
	// ----------------------------------------------------------------
	'video-trim': {
		id: 'video-trim',
		icon: 'scissors',
		iconColor: 'rose',
		nameKey: 'preset.videoTrim.name',
		descriptionKey: 'preset.videoTrim.desc',
		category: 'video',
		defaults: {
			input: { filename: 'input.mp4', startTime: '00:00:00' },
			output: { filename: 'output.mp4', overwrite: true },
			video: { noVideo: false },
			audio: { noAudio: false },
			filter: {},
			misc: { stripMetadata: false, copyStreams: true, endTime: '00:00:30' }
		},
		editableFields: [
			'input.filename',
			'input.startTime',
			'output.filename',
			'misc.endTime',
			'misc.duration',
			'misc.copyStreams'
		]
	},

	// ----------------------------------------------------------------
	// GIF生成
	// ----------------------------------------------------------------
	'gif-generate': {
		id: 'gif-generate',
		icon: 'film',
		iconColor: 'orange',
		nameKey: 'preset.gifGenerate.name',
		descriptionKey: 'preset.gifGenerate.desc',
		category: 'video',
		defaults: {
			input: { filename: 'input.mp4' },
			output: { filename: 'output.gif', overwrite: true },
			video: { noVideo: false },
			audio: { noAudio: true },
			filter: { fps: 10, scale: { width: 320, height: -1 } },
			misc: { stripMetadata: false, copyStreams: false }
		},
		editableFields: [
			'input.filename',
			'output.filename',
			'filter.fps',
			'filter.scale.width',
			'input.startTime',
			'misc.duration'
		]
	}
};

// ============================================================
// ヘルパー
// ============================================================

export const VIDEO_INPUT_EXTENSIONS = [
	'mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v',
	'mpg', 'mpeg', 'ts', 'm2ts', 'mts', '3gp', 'ogv'
];

export const AUDIO_INPUT_EXTENSIONS = [
	'mp3', 'm4a', 'aac', 'flac', 'wav', 'aiff', 'aif',
	'ogg', 'oga', 'opus', 'wma', 'mka'
];

export const FFMPEG_IMAGE_INPUT_EXTENSIONS = [
	'jpg', 'jpeg', 'jfif', 'png', 'gif', 'webp', 'bmp',
	'tif', 'tiff', 'heic', 'heif', 'avif'
];

/** ① 直接 cwebp で読める入力形式 */
export const CWEBP_DIRECT_EXTENSIONS = [
	'png', 'jpg', 'jpeg', 'jfif', 'tif', 'tiff', 'pnm', 'pgm', 'ppm', 'pam'
];

/** ② ffmpeg で PNG に変換してから cwebp に渡す入力形式（cwebp が直接読めない） */
export const CWEBP_PREPROCESS_EXTENSIONS = ['heic', 'heif', 'avif', 'bmp'];

/** ③ gif2webp でアニメーションを保持したまま変換する入力形式 */
export const CWEBP_GIF_EXTENSIONS = ['gif'];

export const CWEBP_IMAGE_INPUT_EXTENSIONS = [
	...CWEBP_DIRECT_EXTENSIONS,
	...CWEBP_PREPROCESS_EXTENSIONS,
	...CWEBP_GIF_EXTENSIONS
];

const FORMAT_FAMILIES: Record<string, string> = {
	jpg: 'jpg',
	jpeg: 'jpg',
	jfif: 'jpg',
	tif: 'tif',
	tiff: 'tif',
	aif: 'aif',
	aiff: 'aif',
	mpg: 'mpg',
	mpeg: 'mpg',
	ogg: 'ogg',
	oga: 'ogg'
};

/** 全プリセットを配列で取得 */
export function getAllPresets(): PresetDefinition[] {
	return Object.values(PRESETS);
}

/** IDからプリセットを取得 */
export function getPresetById(id: PresetId): PresetDefinition | undefined {
	return PRESETS[id];
}

/** カテゴリでフィルタ */
export function getPresetsByCategory(category: 'video' | 'audio' | 'image'): PresetDefinition[] {
	return getAllPresets().filter((p) => p.category === category);
}

/** プリセット固有の一括処理入力ポリシーを返す */
export function inferBatchOptions(preset: PresetDefinition): BatchOptions {
	switch (preset.id) {
		case 'image-convert':
			return {
				inputExtensions: [...FFMPEG_IMAGE_INPUT_EXTENSIONS],
				allowSameFormatInput: false
			};
		case 'image-webp':
			return {
				inputExtensions: [...CWEBP_IMAGE_INPUT_EXTENSIONS],
				allowSameFormatInput: false
			};
		case 'video-compress':
		case 'video-trim':
			return {
				inputExtensions: [...VIDEO_INPUT_EXTENSIONS],
				allowSameFormatInput: true
			};
		case 'video-convert':
		case 'audio-extract':
		case 'gif-generate':
			return {
				inputExtensions: [...VIDEO_INPUT_EXTENSIONS],
				allowSameFormatInput: false
			};
		case 'audio-convert':
			return {
				inputExtensions: [...AUDIO_INPUT_EXTENSIONS],
				allowSameFormatInput: false
			};
	}
}

/** ユーザー指定の出力ファイル名から安全な拡張子を取得する */
export function getValidatedOutputExtension(filename: string): string | null {
	const extension = getFileExtension(filename);
	return extension && /^[a-z0-9]{1,5}$/.test(extension) ? extension : null;
}

/** ファイル名から小文字化した拡張子を取得する */
export function getFileExtension(filename: string): string | null {
	const lastDot = filename.lastIndexOf('.');
	if (lastDot < 0 || lastDot === filename.length - 1) return null;
	return filename.slice(lastDot + 1).toLowerCase();
}

/** 同一形式入力を許可しないプリセットでは出力形式ファミリーを除外する */
export function resolveBatchInputExtensions(
	batch: BatchOptions,
	outputExtension: string
): string[] {
	if (batch.allowSameFormatInput) return [...batch.inputExtensions];

	const outputFamily = FORMAT_FAMILIES[outputExtension] ?? outputExtension;
	return batch.inputExtensions.filter((extension) => {
		const inputFamily = FORMAT_FAMILIES[extension] ?? extension;
		return inputFamily !== outputFamily;
	});
}
