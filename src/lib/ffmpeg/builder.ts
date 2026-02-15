/**
 * FFmpeg コマンド生成ロジック
 *
 * FFmpegOptions からコマンド文字列を組み立てる純粋関数群。
 *
 * コマンド組立順序:
 *   ffmpeg [global] [input options] -i input [output options] [filters] output
 *
 * 1. ffmpeg
 * 2. グローバルオプション (-y)
 * 3. 入力オプション (-ss 開始時刻 ※入力前に置くとシーク高速化)
 * 4. -i input
 * 5. 映像オプション (-c:v, -crf, -b:v, -r, -preset, -vn, -still-picture, -pix_fmt)
 * 6. 音声オプション (-c:a, -ar, -ac, -b:a, -an)
 * 7. ストリームコピー (-c copy ※codec指定と排他)
 * 8. フィルタ (-vf "scale=...,fps=...")
 * 9. その他 (-map_metadata -1, -t, -to)
 * 10. 出力ファイル
 */

import type { FFmpegOptions, BatchOptions, BatchScript, FilterOptions } from './types';

// ============================================================
// メイン関数: 個別コマンド生成
// ============================================================

/**
 * FFmpegOptions から単一のコマンド文字列を生成する
 *
 * GIF生成の場合は2コマンド（パレット生成 + GIF生成）を改行区切りで返す。
 */
export function buildCommand(options: FFmpegOptions): string {
	// GIF生成の特殊処理
	if (isGifOutput(options)) {
		return buildGifCommands(options);
	}

	const parts: string[] = ['ffmpeg'];

	// 2. グローバルオプション
	if (options.output.overwrite) {
		parts.push('-y');
	}

	// 3. 入力オプション
	parts.push(...buildInputOptions(options));

	// 4. -i input
	parts.push('-i', quoteFilename(options.input.filename));

	// 5-6. ストリームコピー or 映像/音声オプション
	if (options.misc.copyStreams) {
		parts.push('-c', 'copy');
	} else {
		parts.push(...buildVideoOptions(options));
		parts.push(...buildAudioOptions(options));
	}

	// 8. フィルタ
	const filterStr = buildVideoFilter(options.filter);
	if (filterStr) {
		parts.push('-vf', `"${filterStr}"`);
	}

	// 9. その他
	parts.push(...buildMiscOptions(options));

	// 10. 出力ファイル
	parts.push(quoteFilename(options.output.filename));

	return parts.join(' ');
}

// ============================================================
// メイン関数: 一括処理スクリプト生成
// ============================================================

/**
 * FFmpegOptions + BatchOptions から3プラットフォーム分のスクリプトを生成する
 *
 * 個別コマンドのオプション部分を抽出し、forループで囲む。
 */
export function buildBatchCommand(options: FFmpegOptions, batch: BatchOptions): BatchScript {
	// コマンドのオプション部分を生成（入力/出力ファイル名は変数に置換）
	const optionParts = buildOptionParts(options);

	const inputGlob = batch.inputExtensions.map((ext) => `*.${ext}`).join(' ');
	const outExt = batch.outputExtension;

	// Bash (macOS/Linux)
	const bash = buildBashScript(optionParts, inputGlob, outExt, options);

	// PowerShell (Windows)
	const powershell = buildPowerShellScript(optionParts, batch.inputExtensions, outExt, options);

	// cmd (Windows Batch)
	const cmd = buildCmdScript(optionParts, inputGlob, outExt, options);

	return { bash, powershell, cmd };
}

// ============================================================
// 内部: オプション部品の生成
// ============================================================

/** 入力オプション部分 */
function buildInputOptions(options: FFmpegOptions): string[] {
	const parts: string[] = [];

	// -ss は入力前に置くとシーク高速化
	if (options.input.startTime) {
		parts.push('-ss', options.input.startTime);
	}

	return parts;
}

/** 映像オプション部分 */
function buildVideoOptions(options: FFmpegOptions): string[] {
	const parts: string[] = [];
	const v = options.video;

	if (v.noVideo) {
		parts.push('-vn');
		return parts;
	}

	// コーデック
	if (v.codec) {
		parts.push('-c:v', v.codec);
	}

	// 静止画モード (AVIF)
	if (v.stillPicture) {
		parts.push('-still-picture', '1');
	}

	// CRF
	if (v.crf !== undefined) {
		parts.push('-crf', String(v.crf));
	}

	// ビットレート (-b:v 0 はVBRモードを示す)
	if (v.bitrate !== undefined) {
		parts.push('-b:v', v.bitrate);
	}

	// ピクセルフォーマット
	if (v.pixFmt) {
		parts.push('-pix_fmt', v.pixFmt);
	}

	// H.264/H.265 エンコーダプリセット
	if (v.preset) {
		parts.push('-preset', v.preset);
	}

	// SVT-AV1 プリセット
	if (v.svtav1Preset !== undefined) {
		parts.push('-preset', String(v.svtav1Preset));
	}

	// SVT-AV1 追加パラメータ
	if (v.svtav1Params) {
		parts.push('-svtav1-params', v.svtav1Params);
	}

	// libaom 追加パラメータ
	if (v.aomParams) {
		parts.push('-aom-params', v.aomParams);
	}

	// libaom cpu-used
	if (v.cpuUsed !== undefined) {
		parts.push('-cpu-used', String(v.cpuUsed));
	}

	// フレームレート
	if (v.framerate) {
		parts.push('-r', String(v.framerate));
	}

	// 解像度 (フィルタではなく直接指定の場合)
	// → 通常はフィルタで処理するため、ここでは省略

	return parts;
}

/** 音声オプション部分 */
function buildAudioOptions(options: FFmpegOptions): string[] {
	const parts: string[] = [];
	const a = options.audio;

	if (a.noAudio) {
		parts.push('-an');
		return parts;
	}

	if (a.codec) {
		parts.push('-c:a', a.codec);
	}

	if (a.bitrate) {
		parts.push('-b:a', a.bitrate);
	}

	if (a.sampleRate) {
		parts.push('-ar', String(a.sampleRate));
	}

	if (a.channels) {
		parts.push('-ac', String(a.channels));
	}

	return parts;
}

/** フィルタ文字列の構築 */
export function buildVideoFilter(filter: FilterOptions): string | null {
	const filters: string[] = [];

	// スケール
	if (filter.scale && (filter.scale.width || filter.scale.height)) {
		const w = filter.scale.width ?? -1;
		const h = filter.scale.height ?? -1;
		filters.push(`scale=${w}:${h}`);
	}

	// クロップ
	if (filter.crop) {
		const c = filter.crop;
		filters.push(`crop=${c.width}:${c.height}:${c.x}:${c.y}`);
	}

	// FPS
	if (filter.fps) {
		filters.push(`fps=${filter.fps}`);
	}

	// カスタムフィルタ
	if (filter.customFilter) {
		filters.push(filter.customFilter);
	}

	return filters.length > 0 ? filters.join(',') : null;
}

/** その他オプション部分 */
function buildMiscOptions(options: FFmpegOptions): string[] {
	const parts: string[] = [];
	const m = options.misc;

	if (m.stripMetadata) {
		parts.push('-map_metadata', '-1');
	}

	if (m.duration) {
		parts.push('-t', m.duration);
	}

	if (m.endTime) {
		parts.push('-to', m.endTime);
	}

	return parts;
}

// ============================================================
// 内部: GIF生成の特殊処理
// ============================================================

function isGifOutput(options: FFmpegOptions): boolean {
	return options.output.filename.toLowerCase().endsWith('.gif');
}

/**
 * GIF生成は2パスコマンドを生成する（パレット生成 + GIF生成）
 *
 * パレット付きで高品質なGIFを生成するための標準手法。
 */
function buildGifCommands(options: FFmpegOptions): string {
	const input = quoteFilename(options.input.filename);
	const output = quoteFilename(options.output.filename);
	const fps = options.filter.fps ?? 10;
	const scaleW = options.filter.scale?.width ?? 320;
	const scaleH = options.filter.scale?.height ?? -1;

	const filterBase = `fps=${fps},scale=${scaleW}:${scaleH}:flags=lanczos`;

	const inputOpts = options.input.startTime ? `-ss ${options.input.startTime} ` : '';
	const durationOpt = options.misc.duration ? ` -t ${options.misc.duration}` : '';
	const overwrite = options.output.overwrite ? '-y ' : '';

	// パス1: パレット生成
	const pass1 = `ffmpeg ${overwrite}${inputOpts}-i ${input}${durationOpt} -vf "${filterBase},palettegen" palette.png`;

	// パス2: GIF生成（パレット使用）
	const pass2 = `ffmpeg ${overwrite}${inputOpts}-i ${input} -i palette.png${durationOpt} -lavfi "${filterBase} [x]; [x][1:v] paletteuse" ${output}`;

	return `${pass1}\n${pass2}`;
}

// ============================================================
// 内部: 一括処理スクリプト生成
// ============================================================

/**
 * コマンドの入力/出力を除いたオプション部分を生成
 */
function buildOptionParts(options: FFmpegOptions): string {
	const parts: string[] = [];

	if (options.output.overwrite) {
		parts.push('-y');
	}

	if (options.misc.copyStreams) {
		parts.push('-c copy');
	} else {
		parts.push(...buildVideoOptions(options));
		parts.push(...buildAudioOptions(options));
	}

	const filterStr = buildVideoFilter(options.filter);
	if (filterStr) {
		parts.push('-vf', `"${filterStr}"`);
	}

	parts.push(...buildMiscOptions(options));

	return parts.join(' ');
}

function buildBashScript(
	optionParts: string,
	inputGlob: string,
	outExt: string,
	options: FFmpegOptions
): string {
	const lines: string[] = ['#!/bin/bash', ''];

	// AVIF 静止画の場合、-b:v 0 はオプション部分に含まれている
	const inputOpts = options.input.startTime ? `-ss ${options.input.startTime} ` : '';

	lines.push(`for f in ${inputGlob}; do`);
	lines.push(`  ffmpeg ${inputOpts}-i "$f" ${optionParts} "\${f%.*}.${outExt}"`);
	lines.push('done');

	return lines.join('\n');
}

function buildPowerShellScript(
	optionParts: string,
	extensions: string[],
	outExt: string,
	options: FFmpegOptions
): string {
	const lines: string[] = [];
	const includeFilter = extensions.map((ext) => `*.${ext}`).join(',');

	const inputOpts = options.input.startTime ? `-ss ${options.input.startTime} ` : '';

	lines.push(`Get-ChildItem -Include ${includeFilter} -Recurse | ForEach-Object {`);
	lines.push(
		`  ffmpeg ${inputOpts}-i $_.FullName ${optionParts} "$($_.DirectoryName)\\$($_.BaseName).${outExt}"`
	);
	lines.push('}');

	return lines.join('\n');
}

function buildCmdScript(
	optionParts: string,
	inputGlob: string,
	outExt: string,
	options: FFmpegOptions
): string {
	const inputOpts = options.input.startTime ? `-ss ${options.input.startTime} ` : '';

	return `for %%f in (${inputGlob}) do ffmpeg ${inputOpts}-i "%%f" ${optionParts} "%%~nf.${outExt}"`;
}

// ============================================================
// ユーティリティ
// ============================================================

/** ファイル名にスペースが含まれる場合にクォートする */
function quoteFilename(filename: string): string {
	if (filename.includes(' ')) {
		return `"${filename}"`;
	}
	return filename;
}

/** 値が空（undefined, null, 空文字列）かどうかの判定 */
export function isOptionEmpty(value: unknown): boolean {
	if (value === undefined || value === null) return true;
	if (typeof value === 'string' && value.trim() === '') return true;
	return false;
}
