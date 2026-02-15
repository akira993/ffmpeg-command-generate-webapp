/**
 * バリデーション関数
 *
 * FFmpegオプションの入力値を検証する純粋関数群。
 * バリデーションエラーはi18nキーで返し、UIで翻訳表示する。
 */

import type { ValidationResult } from './types';
import { CODEC_FORMAT_COMPAT } from './codecs';

// ============================================================
// ファイル名
// ============================================================

/** ファイル名バリデーション */
export function validateFilename(filename: string): ValidationResult {
	if (!filename || filename.trim() === '') {
		return { valid: false, message: 'validation.filenameRequired' };
	}

	// 無効な文字チェック
	const invalidChars = /[<>"|?*\x00-\x1f]/;
	if (invalidChars.test(filename)) {
		return { valid: false, message: 'validation.filenameInvalidChars' };
	}

	return { valid: true };
}

// ============================================================
// 時刻フォーマット
// ============================================================

/**
 * 時刻フォーマットバリデーション
 *
 * 有効な形式:
 * - HH:MM:SS (e.g. "01:30:00")
 * - HH:MM:SS.mmm (e.g. "01:30:00.500")
 * - 秒数 (e.g. "90", "5400.5")
 */
export function validateTimeFormat(time: string): ValidationResult {
	if (!time || time.trim() === '') {
		return { valid: true }; // 空は許可（オプショナルフィールド）
	}

	// HH:MM:SS or HH:MM:SS.mmm
	const timeRegex = /^\d{1,2}:\d{2}:\d{2}(\.\d{1,3})?$/;
	if (timeRegex.test(time)) {
		return { valid: true };
	}

	// 秒数（正の数値）
	const seconds = Number(time);
	if (!isNaN(seconds) && seconds >= 0) {
		return { valid: true };
	}

	return { valid: false, message: 'validation.invalidTimeFormat' };
}

// ============================================================
// CRF
// ============================================================

/**
 * CRF値バリデーション
 *
 * @param crf - CRF値
 * @param min - 最小値（デフォルト: 0）
 * @param max - 最大値（デフォルト: 63、コーデックにより異なる）
 *   - H.264/H.265: 0-51
 *   - AV1 (libaom/SVT-AV1): 0-63
 */
export function validateCRF(crf: number, min = 0, max = 63): ValidationResult {
	if (!Number.isInteger(crf)) {
		return { valid: false, message: 'validation.crfMustBeInteger' };
	}

	if (crf < min || crf > max) {
		return { valid: false, message: 'validation.crfOutOfRange' };
	}

	return { valid: true };
}

// ============================================================
// 解像度
// ============================================================

/**
 * 解像度バリデーション
 *
 * FFmpegはほとんどのコーデックで偶数の解像度を要求する。
 * -1 はアスペクト比維持の自動計算を表す。
 */
export function validateResolution(width?: number, height?: number): ValidationResult {
	if (width !== undefined && width !== -1) {
		if (width <= 0) {
			return { valid: false, message: 'validation.resolutionPositive' };
		}
		if (width % 2 !== 0) {
			return { valid: false, message: 'validation.resolutionEven' };
		}
	}

	if (height !== undefined && height !== -1) {
		if (height <= 0) {
			return { valid: false, message: 'validation.resolutionPositive' };
		}
		if (height % 2 !== 0) {
			return { valid: false, message: 'validation.resolutionEven' };
		}
	}

	return { valid: true };
}

// ============================================================
// ビットレート
// ============================================================

/**
 * ビットレートフォーマットバリデーション
 *
 * 有効な形式: 数値 + k または M (e.g. "128k", "2M", "0")
 * "0" はVBR（品質ベース）を示す。
 */
export function validateBitrate(bitrate: string): ValidationResult {
	if (!bitrate || bitrate.trim() === '') {
		return { valid: true }; // 空は許可
	}

	// "0" はVBR
	if (bitrate === '0') {
		return { valid: true };
	}

	const bitrateRegex = /^\d+[kKmM]?$/;
	if (!bitrateRegex.test(bitrate)) {
		return { valid: false, message: 'validation.invalidBitrateFormat' };
	}

	return { valid: true };
}

// ============================================================
// FPS
// ============================================================

/** FPSバリデーション (1-120) */
export function validateFPS(fps: number): ValidationResult {
	if (fps < 1 || fps > 120) {
		return { valid: false, message: 'validation.fpsOutOfRange' };
	}

	return { valid: true };
}

// ============================================================
// サンプルレート
// ============================================================

const VALID_SAMPLE_RATES = [8000, 16000, 22050, 44100, 48000];

/** サンプルレートバリデーション */
export function validateSampleRate(sampleRate: number): ValidationResult {
	if (!VALID_SAMPLE_RATES.includes(sampleRate)) {
		return { valid: false, message: 'validation.invalidSampleRate' };
	}

	return { valid: true };
}

// ============================================================
// コーデック互換性
// ============================================================

/**
 * コーデックとフォーマットの互換性チェック
 *
 * 指定されたコーデックが出力フォーマットに対応しているか確認する。
 */
export function validateCodecFormatCompat(codec: string, format: string): ValidationResult {
	const compatFormats = CODEC_FORMAT_COMPAT[codec];

	if (!compatFormats) {
		// 不明なコーデックは許可（カスタム入力対応）
		return { valid: true };
	}

	if (!compatFormats.includes(format)) {
		return { valid: false, message: 'validation.codecFormatIncompat' };
	}

	return { valid: true };
}

// ============================================================
// SVT-AV1 / libaom 固有
// ============================================================

/** SVT-AV1 preset バリデーション (0-13) */
export function validateSvtav1Preset(preset: number): ValidationResult {
	if (!Number.isInteger(preset) || preset < 0 || preset > 13) {
		return { valid: false, message: 'validation.svtav1PresetOutOfRange' };
	}
	return { valid: true };
}

/** libaom cpu-used バリデーション (0-8) */
export function validateCpuUsed(cpuUsed: number): ValidationResult {
	if (!Number.isInteger(cpuUsed) || cpuUsed < 0 || cpuUsed > 8) {
		return { valid: false, message: 'validation.cpuUsedOutOfRange' };
	}
	return { valid: true };
}
