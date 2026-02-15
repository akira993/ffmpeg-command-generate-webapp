/**
 * コーデック・フォーマット定数
 *
 * FFmpegで使用するコーデック、フォーマット、推奨パラメータの定数定義。
 * UIのドロップダウン選択肢やデフォルト値の生成に使用。
 */

import type { VideoCodec, AudioCodec, EncoderPreset, PixelFormat } from './types';

// ============================================================
// コーデック表示名マッピング
// ============================================================

/** 映像コーデック表示名 */
export const VIDEO_CODEC_LABELS: Record<VideoCodec, string> = {
	libx264: 'H.264 (libx264)',
	libx265: 'H.265/HEVC (libx265)',
	libvpx: 'VP8 (libvpx)',
	'libvpx-vp9': 'VP9 (libvpx-vp9)',
	'libaom-av1': 'AV1 (libaom — 高品質)',
	libsvtav1: 'AV1 (SVT-AV1 — 高速)',
	libwebp: 'WebP (libwebp)',
	copy: 'コピー（再エンコードなし）'
};

/** 音声コーデック表示名 */
export const AUDIO_CODEC_LABELS: Record<AudioCodec, string> = {
	aac: 'AAC',
	libmp3lame: 'MP3 (libmp3lame)',
	libopus: 'Opus (libopus)',
	libvorbis: 'Vorbis (libvorbis)',
	flac: 'FLAC',
	pcm_s16le: 'PCM (非圧縮)',
	copy: 'コピー（再エンコードなし）'
};

// ============================================================
// フォーマット定義
// ============================================================

/** 対応する映像フォーマット */
export const VIDEO_FORMATS = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv'] as const;
export type VideoFormat = (typeof VIDEO_FORMATS)[number];

/** 対応する音声フォーマット */
export const AUDIO_FORMATS = ['mp3', 'aac', 'wav', 'flac', 'ogg', 'opus'] as const;
export type AudioFormat = (typeof AUDIO_FORMATS)[number];

/** 対応する画像フォーマット */
export const IMAGE_FORMATS = ['avif', 'webp', 'png', 'jpg', 'jpeg', 'tiff', 'bmp'] as const;
export type ImageFormat = (typeof IMAGE_FORMATS)[number];

// ============================================================
// コーデック ↔ フォーマット互換テーブル
// ============================================================

/** 映像コーデックが対応する出力フォーマット */
export const CODEC_FORMAT_COMPAT: Record<string, string[]> = {
	libx264: ['mp4', 'mov', 'mkv', 'avi', 'flv'],
	libx265: ['mp4', 'mov', 'mkv'],
	libvpx: ['webm', 'mkv'],
	'libvpx-vp9': ['webm', 'mkv'],
	'libaom-av1': ['mp4', 'mkv', 'webm', 'avif'],
	libsvtav1: ['mp4', 'mkv', 'webm'],
	libwebp: ['webp'],
	aac: ['mp4', 'mov', 'mkv', 'aac'],
	libmp3lame: ['mp3', 'mkv'],
	libopus: ['ogg', 'webm', 'mkv', 'opus'],
	libvorbis: ['ogg', 'webm', 'mkv'],
	flac: ['flac', 'mkv'],
	pcm_s16le: ['wav', 'mkv']
};

/** 音声コーデックと映像コーデックの推奨ペア */
export const RECOMMENDED_AUDIO_CODEC: Partial<Record<VideoCodec, AudioCodec>> = {
	libx264: 'aac',
	libx265: 'aac',
	libvpx: 'libvorbis',
	'libvpx-vp9': 'libopus',
	'libaom-av1': 'libopus',
	libsvtav1: 'libopus'
};

// ============================================================
// AVIF（画像圧縮）推奨パラメータ
// ============================================================

/**
 * AVIF画像圧縮の推奨設定
 *
 * libaom-av1 + still-picture で静止画に最適化。
 * 10bit (yuv420p10le) は8bitソースでも圧縮効率が向上する。
 * tune=iq は2025年最新の静止画向けチューニング。
 *
 * @see https://darekkay.com/blog/avif-images/
 */
export const AVIF_DEFAULTS = {
	codec: 'libaom-av1' as VideoCodec,
	stillPicture: true,
	crf: 30,
	pixFmt: 'yuv420p10le' as PixelFormat,
	aomParams: 'tune=iq',
	/** CRF範囲: 0(最高品質) ~ 63(最低品質) */
	crfRange: { min: 0, max: 63 },
	/** cpu-used範囲: 0(最遅/高品質) ~ 8(最速) — 推奨は2-4 */
	cpuUsedRange: { min: 0, max: 8 },
	cpuUsedDefault: 4
} as const;

// ============================================================
// AV1（動画圧縮）推奨パラメータ
// ============================================================

/**
 * SVT-AV1 動画圧縮の推奨設定
 *
 * libsvtav1 は libaom より大幅に高速で実用的。
 * preset 6 が速度/品質のバランスポイント。
 * tune=0 は知覚品質優先。
 *
 * CRF 30 ≒ x265 CRF 21 ≒ x264 CRF 16 相当の品質。
 *
 * @see https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/Docs/Ffmpeg.md
 */
export const SVT_AV1_DEFAULTS = {
	codec: 'libsvtav1' as VideoCodec,
	crf: 30,
	svtav1Preset: 6,
	pixFmt: 'yuv420p10le' as PixelFormat,
	svtav1Params: 'tune=0:enable-overlays=1:scd=1',
	audioCodec: 'libopus' as AudioCodec,
	audioBitrate: '128k',
	/** CRF範囲: 1(最高品質) ~ 63(最低品質) */
	crfRange: { min: 1, max: 63 },
	/** preset範囲: 0(最遅/高品質) ~ 13(最速) — 推奨は4-8 */
	presetRange: { min: 0, max: 13 }
} as const;

/**
 * libaom-av1 動画圧縮の設定（低速だが高品質）
 */
export const LIBAOM_AV1_DEFAULTS = {
	codec: 'libaom-av1' as VideoCodec,
	crf: 30,
	cpuUsed: 4,
	pixFmt: 'yuv420p10le' as PixelFormat,
	aomParams: 'tune=0',
	crfRange: { min: 0, max: 63 },
	cpuUsedRange: { min: 0, max: 8 }
} as const;

// ============================================================
// WebP（画像圧縮）推奨パラメータ
// ============================================================

/**
 * WebP画像圧縮の推奨設定
 *
 * libwebp は -quality で品質を制御（0-100, 高いほど高品質）。
 * CRFではなくqualityパラメータを使用する。
 * -lossless 1 でロスレス圧縮も可能。
 *
 * @see https://www.ffmpeg.org/ffmpeg-codecs.html#libwebp
 */
export const WEBP_DEFAULTS = {
	codec: 'libwebp' as VideoCodec,
	quality: 75,
	/** quality範囲: 0(最低品質) ~ 100(最高品質) */
	qualityRange: { min: 0, max: 100 }
} as const;

// ============================================================
// H.264 / H.265 パラメータ
// ============================================================

export const H264_DEFAULTS = {
	codec: 'libx264' as VideoCodec,
	crf: 23,
	preset: 'medium' as EncoderPreset,
	pixFmt: 'yuv420p' as PixelFormat,
	crfRange: { min: 0, max: 51 }
} as const;

export const H265_DEFAULTS = {
	codec: 'libx265' as VideoCodec,
	crf: 28,
	preset: 'medium' as EncoderPreset,
	pixFmt: 'yuv420p10le' as PixelFormat,
	crfRange: { min: 0, max: 51 }
} as const;

// ============================================================
// サンプルレート選択肢
// ============================================================

export const SAMPLE_RATES = [8000, 16000, 22050, 44100, 48000] as const;

// ============================================================
// 拡張子 → MIMEタイプ推定
// ============================================================

export const EXTENSION_TO_TYPE: Record<string, 'video' | 'audio' | 'image'> = {
	// 映像
	mp4: 'video',
	webm: 'video',
	mov: 'video',
	avi: 'video',
	mkv: 'video',
	flv: 'video',
	// 音声
	mp3: 'audio',
	aac: 'audio',
	wav: 'audio',
	flac: 'audio',
	ogg: 'audio',
	opus: 'audio',
	// 画像
	jpg: 'image',
	jpeg: 'image',
	png: 'image',
	webp: 'image',
	avif: 'image',
	tiff: 'image',
	bmp: 'image',
	gif: 'image'
};
