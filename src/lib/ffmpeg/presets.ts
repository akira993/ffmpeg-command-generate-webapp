/**
 * プリセット定義
 *
 * 7つのプリセットを定義。各プリセットは:
 * - デフォルトのFFmpegオプション
 * - ユーザーが編集可能なフィールド
 * - 表示情報（アイコン、i18nキー）
 *
 * 画像圧縮(AVIF)と動画圧縮(AV1)は最新の推奨パラメータで最適化済み。
 */

import type { PresetDefinition, PresetId } from './types';
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
				aomParams: AVIF_DEFAULTS.aomParams,
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
			video: { codec: 'libvpx-vp9', crf: 30, noVideo: false },
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

/**
 * プリセットのデフォルト値からBatchOptionsを推定する
 *
 * ファイル名の拡張子から入力/出力の拡張子を取得。
 */
export function inferBatchOptions(preset: PresetDefinition): {
	inputExtensions: string[];
	outputExtension: string;
} {
	const inputFilename = preset.defaults.input?.filename ?? '';
	const outputFilename = preset.defaults.output?.filename ?? '';

	const inputExt = getExtension(inputFilename);
	const outputExt = getExtension(outputFilename);

	// 画像の場合は主要な画像拡張子すべて
	if (preset.category === 'image') {
		return {
			inputExtensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'],
			outputExtension: outputExt || 'avif'
		};
	}

	// 動画の場合
	if (preset.category === 'video') {
		return {
			inputExtensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
			outputExtension: outputExt || 'mkv'
		};
	}

	// 音声の場合
	return {
		inputExtensions: [inputExt || 'wav'],
		outputExtension: outputExt || 'mp3'
	};
}

function getExtension(filename: string): string {
	const parts = filename.split('.');
	return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}
