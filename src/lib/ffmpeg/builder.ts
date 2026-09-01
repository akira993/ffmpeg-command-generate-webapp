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
 * 5. 映像オプション (-c:v, -crf, -b:v, -r, -preset, -vn, -pix_fmt)
 * 6. 音声オプション (-c:a, -ar, -ac, -b:a, -an)
 * 7. ストリームコピー (-c copy ※codec指定と排他)
 * 8. フィルタ (-vf "scale=...,fps=...")
 * 9. その他 (-map_metadata -1, -t, -to)
 * 10. 出力ファイル
 */

import type { FFmpegOptions, BatchOptions, BatchScript, FilterOptions } from './types';
import {
	getFileExtension,
	getValidatedOutputExtension,
	resolveBatchInputExtensions,
	CWEBP_DIRECT_EXTENSIONS,
	CWEBP_PREPROCESS_EXTENSIONS,
	CWEBP_GIF_EXTENSIONS
} from './presets';

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

		// 8. フィルタ（ストリームコピー時はフィルタ適用不可）
		const filterStr = buildVideoFilter(options.filter);
		if (filterStr) {
			parts.push('-vf', `"${filterStr}"`);
		}
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
export function buildBatchCommand(options: FFmpegOptions, batch: BatchOptions): BatchScript | null {
	const outExt = getValidatedOutputExtension(options.output.filename);
	if (!outExt) return null;

	// コマンドのオプション部分を生成（入力/出力ファイル名は変数に置換）
	const optionParts = buildOptionParts(options);
	const extensions = resolveBatchInputExtensions(batch, outExt);

	// case パターン文字列（Bash / cmd 用）
	const casePattern = extensions.join('|');

	// Bash (macOS/Linux)
	const bash = buildBashScript(optionParts, casePattern, outExt, options);

	// PowerShell (Windows)
	const powershell = buildPowerShellScript(optionParts, extensions, outExt, options);

	// cmd (Windows Batch)
	const cmd = buildCmdScript(optionParts, extensions, outExt, options);

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

	// libwebp quality
	if (v.quality !== undefined) {
		parts.push('-quality', String(v.quality));
	}

	// libwebp lossless
	if (v.lossless) {
		parts.push('-lossless', '1');
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
	// -nostdin: 2コマンドをまとめてコピペ実行した際、2行目を標準入力として
	// 読み捨ててしまい無言で失敗する事故を防ぐ（複数コマンドを返す経路のみ付与）
	const pass1 = `ffmpeg -nostdin ${overwrite}${inputOpts}-i ${input}${durationOpt} -vf "${filterBase},palettegen" palette.png`;

	// パス2: GIF生成（パレット使用）
	const pass2 = `ffmpeg -nostdin ${overwrite}${inputOpts}-i ${input} -i palette.png${durationOpt} -lavfi "${filterBase} [x]; [x][1:v] paletteuse" ${output}`;

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

/**
 * Bash スクリプト生成（macOS / Linux）
 *
 * - 全ファイルを走査し、拡張子を小文字化して case で判定
 * - 大文字拡張子（.JPG 等）にも対応
 * - 入力拡張子の大文字小文字を区別しない
 * - 出力名が衝突した場合のみ入力拡張子を付与
 * - 出力先フォルダを自動作成
 */
function buildBashScript(
	optionParts: string,
	casePattern: string,
	outExt: string,
	options: FFmpegOptions
): string {
	const inputOpts = options.input.startTime ? `-ss ${options.input.startTime} ` : '';
	const lines: string[] = [
		'#!/bin/bash',
		'',
		`OUTPUT_EXT="${outExt}"`,
		`OUTPUT_DIR="$(basename "$(pwd)")_\${OUTPUT_EXT}"`,
		'mkdir -p "$OUTPUT_DIR"',
		"SEEN_BASES=''",
		'',
		'has_seen_base() {',
		'  while IFS= read -r seen_base; do',
		'    [ "$seen_base" = "x$1" ] && return 0',
		'  done <<EOF',
		'$SEEN_BASES',
		'EOF',
		'  return 1',
		'}',
		'',
		'for f in *; do',
		'  [ -f "$f" ] || continue',
		'  ext="${f##*.}"',
		'  ext_lower=$(echo "$ext" | tr \'[:upper:]\' \'[:lower:]\')',
		`  case "$ext_lower" in`,
		`    ${casePattern})`,
		'      base="${f%.*}"',
		'      out="$OUTPUT_DIR/${base}.$OUTPUT_EXT"',
		'      if has_seen_base "$base"; then',
		'        out="$OUTPUT_DIR/${base}_${ext_lower}.$OUTPUT_EXT"',
		'      else',
		'        SEEN_BASES="${SEEN_BASES}\nx${base}"',
		'      fi',
		`      ffmpeg ${inputOpts}-i "$f" ${optionParts} "$out"`,
		'      ;;',
		'  esac',
		'done'
	];

	return lines.join('\n');
}

/**
 * PowerShell スクリプト生成（Windows）
 *
 * - -Include で大文字小文字両方にマッチ（PowerShell は case-insensitive）
 * - -Path * を明示して非再帰で走査
 * - 出力名が衝突した場合のみ入力拡張子を付与
 * - 出力先フォルダを自動作成
 */
function buildPowerShellScript(
	optionParts: string,
	extensions: string[],
	outExt: string,
	options: FFmpegOptions
): string {
	const includeFilter = extensions.map((ext) => `"*.${ext}"`).join(', ');
	const inputOpts = options.input.startTime ? `-ss ${options.input.startTime} ` : '';

	const lines: string[] = [
		`$outputExt = "${outExt}"`,
		`$outputDir = "$(Split-Path -Leaf (Get-Location))_$outputExt"`,
		'New-Item -ItemType Directory -Force -Path $outputDir | Out-Null',
		'$seenBaseNames = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)',
		'',
		`Get-ChildItem -Path * -File -Include ${includeFilter} |`,
		'  ForEach-Object {',
		'    $inputExt = $_.Extension.TrimStart(\'.\').ToLower()',
		'    $out = Join-Path $outputDir "$($_.BaseName).$outputExt"',
		'    if (-not $seenBaseNames.Add($_.BaseName)) { $out = Join-Path $outputDir "$($_.BaseName)_$inputExt.$outputExt" }',
		`    ffmpeg ${inputOpts}-i $_.FullName ${optionParts} $out`,
		'  }'
	];

	return lines.join('\n');
}

/**
 * cmd スクリプト生成（Windows バッチ）
 *
 * - 拡張子ごとに for ループ（cmd は case-insensitive で大文字も自動マッチ）
 * - 出力名が衝突した場合のみ入力拡張子を付与
 * - 出力先フォルダを自動作成
 */
function buildCmdScript(
	optionParts: string,
	extensions: string[],
	outExt: string,
	options: FFmpegOptions
): string {
	const inputOpts = options.input.startTime ? `-ss ${options.input.startTime} ` : '';

	const lines: string[] = [
		'@echo off',
		'setlocal DisableDelayedExpansion',
		`set "OUTPUT_EXT=${outExt}"`,
		'for %%I in (.) do set "FOLDER_NAME=%%~nxI"',
		'set "OUTPUT_DIR=%FOLDER_NAME%_%OUTPUT_EXT%"',
		'if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"',
		'set "SEEN_FILE=%TEMP%\\ffmpeg-batch-seen-%RANDOM%-%RANDOM%.tmp"',
		'type nul > "%SEEN_FILE%"',
		''
	];

	// cmd では拡張子ごとに for ループを回す（case-insensitive なので大文字も自動マッチ）
	for (const ext of extensions) {
		lines.push(
			`for %%f in (*.${ext}) do (`,
			'  findstr /l /x /c:"%%~nf" "%SEEN_FILE%" >nul 2>&1',
			'  if not errorlevel 1 (',
			`    ffmpeg ${inputOpts}-i "%%f" ${optionParts} "%OUTPUT_DIR%\\%%~nf_${ext}.%OUTPUT_EXT%"`,
			'  ) else (',
			'    >>"%SEEN_FILE%" <nul set /p "=%%~nf"',
			'    >>"%SEEN_FILE%" echo(',
			`    ffmpeg ${inputOpts}-i "%%f" ${optionParts} "%OUTPUT_DIR%\\%%~nf.%OUTPUT_EXT%"`,
			'  )',
			')'
		);
	}

	lines.push(
		'del "%SEEN_FILE%" >nul 2>&1',
		'exit /b'
	);

	// Windows の cmd スクリプトとして標準の CRLF で出力する。
	return lines.join('\r\n');
}

// ============================================================
// cwebp コマンド生成（WebP 画像圧縮）
// ============================================================

/** cwebp -resize（0=自動）の値。null は「リサイズ指定なし」 */
type CwebpResize = { width: number; height: number } | null;

/** 拡張子を direct / preprocess / gif の3群に分類したもの */
interface CwebpExtensionGroups {
	direct: string[];
	preprocess: string[];
	gif: string[];
}

/** filter.scale から cwebp -resize 用の値（0=自動）を計算する */
function computeCwebpResize(scale: FFmpegOptions['filter']['scale']): CwebpResize {
	if (!scale || (!scale.width && !scale.height)) return null;
	const w = scale.width ?? 0;
	const h = scale.height ?? 0;
	return { width: w <= 0 ? 0 : w, height: h <= 0 ? 0 : h };
}

/** cwebp の -resize 値（0=自動）を ffmpeg の -vf scale 値（-1=自動）に変換する */
function cwebpResizeToFfmpegScale(resize: { width: number; height: number }): string {
	const w = resize.width <= 0 ? -1 : resize.width;
	const h = resize.height <= 0 ? -1 : resize.height;
	return `scale=${w}:${h}`;
}

/** 拡張子を direct / preprocess / gif の3群に分類する（C6: 空群のアームは呼び出し側で出力しない） */
function partitionCwebpExtensions(extensions: string[]): CwebpExtensionGroups {
	return {
		direct: extensions.filter((ext) => CWEBP_DIRECT_EXTENSIONS.includes(ext)),
		preprocess: extensions.filter((ext) => CWEBP_PREPROCESS_EXTENSIONS.includes(ext)),
		gif: extensions.filter((ext) => CWEBP_GIF_EXTENSIONS.includes(ext))
	};
}

/** 出力ファイル名から一時ファイル名を生成する（出力ベース名 + .tmp.<ext>、D9） */
function tmpFilename(outputFilename: string, tmpExt: string): string {
	const dot = outputFilename.lastIndexOf('.');
	const base = dot > 0 ? outputFilename.slice(0, dot) : outputFilename;
	return `${base}.tmp.${tmpExt}`;
}

/**
 * cwebp コマンドを生成する（単一ファイル）
 *
 * Homebrew の ffmpeg には libwebp が含まれないため、
 * WebP 変換には Google 公式の cwebp コマンドを使用する。
 * インストール: brew install webp (macOS) / sudo apt install webp (Ubuntu)
 *
 * 入力形式によって3経路に振り分ける:
 *   ① 直接 cwebp（png/jpg/jfif/tif/pnm 等）
 *   ② ffmpeg で PNG に変換してから cwebp（heic/heif/avif/bmp — cwebp が直接読めない）
 *   ③ gif2webp（gif — アニメーション保持。可逆圧縮のため -q は付けない）
 */
export function buildCwebpCommand(options: FFmpegOptions): string {
	const quality = options.video.quality ?? 75;
	const inputExt = (getFileExtension(options.input.filename) ?? '').toLowerCase();
	const input = quoteFilename(options.input.filename);
	const output = quoteFilename(options.output.filename);
	const resize = computeCwebpResize(options.filter.scale);
	const resizeOpts = resize ? ` -resize ${resize.width} ${resize.height}` : '';

	// ② ffmpeg → PNG → cwebp（&& で連鎖: ffmpeg 失敗時に cwebp が空の tmp を読むのを防ぐ, D7）
	if (CWEBP_PREPROCESS_EXTENSIONS.includes(inputExt)) {
		const tmp = quoteFilename(tmpFilename(options.output.filename, 'png'));
		return `ffmpeg -nostdin -y -i ${input} ${tmp} && cwebp -q ${quality}${resizeOpts} ${tmp} -o ${output}`;
	}

	// ③ gif2webp（アニメ保持。リサイズ指定時のみ ffmpeg で先に scale してから渡す）
	if (CWEBP_GIF_EXTENSIONS.includes(inputExt)) {
		if (resize) {
			const tmp = quoteFilename(tmpFilename(options.output.filename, 'gif'));
			const scale = cwebpResizeToFfmpegScale(resize);
			return `ffmpeg -nostdin -y -i ${input} -vf "${scale}" ${tmp} && gif2webp ${tmp} -o ${output}`;
		}
		return `gif2webp ${input} -o ${output}`;
	}

	// ① 直接 cwebp
	const parts: string[] = ['cwebp', '-q', String(quality)];
	if (resize) {
		parts.push('-resize', String(resize.width), String(resize.height));
	}
	parts.push(input, '-o', output);

	return parts.join(' ');
}

/**
 * cwebp 一括処理スクリプトを生成する
 *
 * Bash / PowerShell / cmd の3形式で出力。入力拡張子を direct / preprocess / gif の
 * 3群に分類し、該当拡張子が1つも無い経路のコマンドは出力しない（C6）。
 */
export function buildCwebpBatchCommand(options: FFmpegOptions, batch: BatchOptions): BatchScript | null {
	const outExt = getValidatedOutputExtension(options.output.filename);
	if (!outExt) return null;

	const quality = options.video.quality ?? 75;
	const extensions = resolveBatchInputExtensions(batch, outExt);
	const groups = partitionCwebpExtensions(extensions);
	const resize = computeCwebpResize(options.filter.scale);

	const bash = buildCwebpBashScript(quality, resize, groups, outExt);
	const powershell = buildCwebpPowerShellScript(quality, resize, groups, outExt);
	const cmd = buildCwebpCmdScript(quality, resize, groups, outExt);

	return { bash, powershell, cmd };
}

function buildCwebpBashScript(
	quality: number,
	resize: CwebpResize,
	groups: CwebpExtensionGroups,
	outExt: string
): string {
	const resizeOpts = resize ? ` -resize ${resize.width} ${resize.height}` : '';
	const casePattern = [...groups.direct, ...groups.preprocess, ...groups.gif].join('|');

	// 入れ子 case（C2）: 外側で base/out/衝突回避を確定させてから、内側で経路ごとに分岐する
	const innerArms: string[] = [];

	if (groups.preprocess.length > 0) {
		innerArms.push(
			`        ${groups.preprocess.join('|')})`,
			'          tmp="${out%.*}.tmp.png"',
			`          ffmpeg -nostdin -y -loglevel error -i "$f" "$tmp" && cwebp -q ${quality}${resizeOpts} "$tmp" -o "$out"`,
			'          rm -f "$tmp"',
			'          ;;'
		);
	}

	if (groups.gif.length > 0) {
		const gifBody = resize
			? [
					'          tmp="${out%.*}.tmp.gif"',
					`          ffmpeg -nostdin -y -loglevel error -i "$f" -vf "${cwebpResizeToFfmpegScale(resize)}" "$tmp" && gif2webp "$tmp" -o "$out"`,
					'          rm -f "$tmp"'
				]
			: ['          gif2webp "$f" -o "$out"'];
		innerArms.push(`        ${groups.gif.join('|')})`, ...gifBody, '          ;;');
	}

	innerArms.push('        *)', `          cwebp -q ${quality}${resizeOpts} "$f" -o "$out"`, '          ;;');

	const lines: string[] = [
		'#!/bin/bash',
		'',
		`OUTPUT_EXT="${outExt}"`,
		`OUTPUT_DIR="$(basename "$(pwd)")_\${OUTPUT_EXT}"`,
		'mkdir -p "$OUTPUT_DIR"',
		"SEEN_BASES=''",
		'',
		'has_seen_base() {',
		'  while IFS= read -r seen_base; do',
		'    [ "$seen_base" = "x$1" ] && return 0',
		'  done <<EOF',
		'$SEEN_BASES',
		'EOF',
		'  return 1',
		'}',
		'',
		'for f in *; do',
		'  [ -f "$f" ] || continue',
		'  ext="${f##*.}"',
		'  ext_lower=$(echo "$ext" | tr \'[:upper:]\' \'[:lower:]\')',
		`  case "$ext_lower" in`,
		`    ${casePattern})`,
		'      base="${f%.*}"',
		'      out="$OUTPUT_DIR/${base}.$OUTPUT_EXT"',
		'      if has_seen_base "$base"; then',
		'        out="$OUTPUT_DIR/${base}_${ext_lower}.$OUTPUT_EXT"',
		'      else',
		'        SEEN_BASES="${SEEN_BASES}\nx${base}"',
		'      fi',
		'      case "$ext_lower" in',
		...innerArms,
		'      esac',
		'      ;;',
		'  esac',
		'done'
	];

	return lines.join('\n');
}

function buildCwebpPowerShellScript(
	quality: number,
	resize: CwebpResize,
	groups: CwebpExtensionGroups,
	outExt: string
): string {
	const resizeOpts = resize ? ` -resize ${resize.width} ${resize.height}` : '';
	const extensions = [...groups.direct, ...groups.preprocess, ...groups.gif];
	const includeFilter = extensions.map((ext) => `"*.${ext}"`).join(', ');

	// switch ($inputExt) の中では $_ は switch の入力値（文字列）を指し、パイプラインの
	// FileInfo ではなくなるため、switch の前に $file = $_ を捕獲してアーム内で使う（D6）
	const switchArms: string[] = [];

	if (groups.preprocess.length > 0) {
		const pattern = groups.preprocess.map((ext) => `'${ext}'`).join(', ');
		switchArms.push(
			`      { ${pattern} -contains $_ } {`,
			'        $tmp = $out -replace "\\.$outputExt$", \'.tmp.png\'',
			'        ffmpeg -nostdin -y -i $file.FullName $tmp',
			`        if ($LASTEXITCODE -eq 0) { cwebp -q ${quality}${resizeOpts} $tmp -o $out }`,
			'        Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue',
			'      }'
		);
	}

	if (groups.gif.length > 0) {
		if (resize) {
			switchArms.push(
				"      'gif' {",
				'        $tmp = $out -replace "\\.$outputExt$", \'.tmp.gif\'',
				`        ffmpeg -nostdin -y -i $file.FullName -vf "${cwebpResizeToFfmpegScale(resize)}" $tmp`,
				'        if ($LASTEXITCODE -eq 0) { gif2webp $tmp -o $out }',
				'        Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue',
				'      }'
			);
		} else {
			switchArms.push("      'gif' {", '        gif2webp $file.FullName -o $out', '      }');
		}
	}

	switchArms.push(
		'      default {',
		`        cwebp -q ${quality}${resizeOpts} $file.FullName -o $out`,
		'      }'
	);

	const lines: string[] = [
		`$outputExt = "${outExt}"`,
		`$outputDir = "$(Split-Path -Leaf (Get-Location))_$outputExt"`,
		'New-Item -ItemType Directory -Force -Path $outputDir | Out-Null',
		'$seenBaseNames = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)',
		'',
		`Get-ChildItem -Path * -File -Include ${includeFilter} |`,
		'  ForEach-Object {',
		'    $inputExt = $_.Extension.TrimStart(\'.\').ToLower()',
		'    $out = Join-Path $outputDir "$($_.BaseName).$outputExt"',
		'    if (-not $seenBaseNames.Add($_.BaseName)) { $out = Join-Path $outputDir "$($_.BaseName)_$inputExt.$outputExt" }',
		'    $file = $_',
		'    switch ($inputExt) {',
		...switchArms,
		'    }',
		'  }'
	];

	return lines.join('\n');
}

/** ext の分類に応じた cmd コマンド行を生成する（if 分岐/else 分岐で共用、outBase は拡張子を含まないパス） */
function cwebpCmdCommandLines(
	ext: string,
	groups: CwebpExtensionGroups,
	quality: number,
	resize: CwebpResize,
	outBase: string
): string[] {
	const resizeOpts = resize ? ` -resize ${resize.width} ${resize.height}` : '';
	const out = `"${outBase}.%OUTPUT_EXT%"`;

	if (groups.preprocess.includes(ext)) {
		const tmp = `"${outBase}.tmp.png"`;
		return [
			`ffmpeg -nostdin -y -loglevel error -i "%%f" ${tmp} && cwebp -q ${quality}${resizeOpts} ${tmp} -o ${out}`,
			`del ${tmp} >nul 2>&1`
		];
	}

	if (groups.gif.includes(ext)) {
		if (resize) {
			const tmp = `"${outBase}.tmp.gif"`;
			return [
				`ffmpeg -nostdin -y -loglevel error -i "%%f" -vf "${cwebpResizeToFfmpegScale(resize)}" ${tmp} && gif2webp ${tmp} -o ${out}`,
				`del ${tmp} >nul 2>&1`
			];
		}
		return [`gif2webp "%%f" -o ${out}`];
	}

	return [`cwebp -q ${quality}${resizeOpts} "%%f" -o ${out}`];
}

function buildCwebpCmdScript(
	quality: number,
	resize: CwebpResize,
	groups: CwebpExtensionGroups,
	outExt: string
): string {
	const extensions = [...groups.direct, ...groups.preprocess, ...groups.gif];

	const lines: string[] = [
		'@echo off',
		'setlocal DisableDelayedExpansion',
		`set "OUTPUT_EXT=${outExt}"`,
		'for %%I in (.) do set "FOLDER_NAME=%%~nxI"',
		'set "OUTPUT_DIR=%FOLDER_NAME%_%OUTPUT_EXT%"',
		'if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"',
		'set "SEEN_FILE=%TEMP%\\cwebp-batch-seen-%RANDOM%-%RANDOM%.tmp"',
		'type nul > "%SEEN_FILE%"',
		''
	];

	// ffmpeg / gif2webp は必ず if not errorlevel 1 (...) / else (...) の各ブランチ内に置く。
	// findstr の直後に置くと直前のコマンド終了コードが上書きされ「全ファイル既出」判定になる（C3）
	for (const ext of extensions) {
		lines.push(
			`for %%f in (*.${ext}) do (`,
			'  findstr /l /x /c:"%%~nf" "%SEEN_FILE%" >nul 2>&1',
			'  if not errorlevel 1 (',
			...cwebpCmdCommandLines(ext, groups, quality, resize, `%OUTPUT_DIR%\\%%~nf_${ext}`).map((l) => `    ${l}`),
			'  ) else (',
			'    >>"%SEEN_FILE%" <nul set /p "=%%~nf"',
			'    >>"%SEEN_FILE%" echo(',
			...cwebpCmdCommandLines(ext, groups, quality, resize, '%OUTPUT_DIR%\\%%~nf').map((l) => `    ${l}`),
			'  )',
			')'
		);
	}

	lines.push(
		'del "%SEEN_FILE%" >nul 2>&1',
		'exit /b'
	);

	// Windows の cmd スクリプトとして標準の CRLF で出力する。
	return lines.join('\r\n');
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
