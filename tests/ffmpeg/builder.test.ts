/**
 * builder.test.ts — FFmpeg コマンド生成ロジックのユニットテスト
 *
 * テスト区分:
 *   1. buildCommand() — 基本コマンド生成
 *   2. コーデック排他ルール — copyStreams / noVideo / noAudio
 *   3. GIF 2パス生成
 *   4. buildVideoFilter() — フィルタ文字列構築
 *   5. buildCwebpCommand() — cwebp コマンド生成
 *   6. buildBatchCommand() / buildCwebpBatchCommand() — バッチスクリプト
 *   7. isOptionEmpty() — ユーティリティ
 *   8. エッジケース
 */

import { describe, it, expect } from 'vitest';
import {
	buildCommand,
	buildVideoFilter,
	buildCwebpCommand,
	buildBatchCommand,
	buildCwebpBatchCommand,
	isOptionEmpty
} from '../../src/lib/ffmpeg/builder';
import type { FFmpegOptions, BatchOptions, FilterOptions } from '../../src/lib/ffmpeg/types';

// ─── ヘルパー: デフォルトオプション生成 ──────────────────────────────────────

function createDefaultOptions(overrides: Partial<{
	input: Partial<FFmpegOptions['input']>;
	output: Partial<FFmpegOptions['output']>;
	video: Partial<FFmpegOptions['video']>;
	audio: Partial<FFmpegOptions['audio']>;
	filter: Partial<FFmpegOptions['filter']>;
	misc: Partial<FFmpegOptions['misc']>;
}> = {}): FFmpegOptions {
	return {
		input: { filename: 'input.mp4', ...overrides.input },
		output: { filename: 'output.mp4', overwrite: true, ...overrides.output },
		video: { noVideo: false, ...overrides.video },
		audio: { noAudio: false, ...overrides.audio },
		filter: { ...overrides.filter },
		misc: { stripMetadata: false, copyStreams: false, ...overrides.misc }
	};
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. buildCommand() 基本コマンド生成
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('buildCommand', () => {
	describe('基本構造', () => {
		it('最小構成のコマンドを生成する', () => {
			const opts = createDefaultOptions();
			const cmd = buildCommand(opts);
			expect(cmd).toBe('ffmpeg -y -i input.mp4 output.mp4');
		});

		it('overwrite=false で -y を含まない', () => {
			const opts = createDefaultOptions({ output: { filename: 'output.mp4', overwrite: false } });
			const cmd = buildCommand(opts);
			expect(cmd).not.toContain('-y');
			expect(cmd).toBe('ffmpeg -i input.mp4 output.mp4');
		});

		it('コマンド組立順序が正しい (ffmpeg → -y → -ss → -i → codec → filter → misc → output)', () => {
			const opts = createDefaultOptions({
				input: { filename: 'input.mp4', startTime: '00:01:00' },
				video: { codec: 'libx264', crf: 23, noVideo: false },
				audio: { codec: 'aac', bitrate: '128k', noAudio: false },
				filter: { scale: { width: 1920, height: 1080 } },
				misc: { stripMetadata: true, copyStreams: false }
			});
			const cmd = buildCommand(opts);

			// 各部分の位置を検証
			const yIdx = cmd.indexOf('-y');
			const ssIdx = cmd.indexOf('-ss');
			const iIdx = cmd.indexOf('-i');
			const cvIdx = cmd.indexOf('-c:v');
			const caIdx = cmd.indexOf('-c:a');
			const vfIdx = cmd.indexOf('-vf');
			const mapIdx = cmd.indexOf('-map_metadata');

			expect(yIdx).toBeLessThan(ssIdx);
			expect(ssIdx).toBeLessThan(iIdx);
			expect(iIdx).toBeLessThan(cvIdx);
			expect(cvIdx).toBeLessThan(caIdx);
			expect(caIdx).toBeLessThan(vfIdx);
			expect(vfIdx).toBeLessThan(mapIdx);
		});
	});

	describe('入力オプション', () => {
		it('-ss を入力前に配置する（高速シーク）', () => {
			const opts = createDefaultOptions({
				input: { filename: 'input.mp4', startTime: '00:01:30' }
			});
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-ss 00:01:30 -i input.mp4');
		});

		it('startTime が未設定なら -ss を含まない', () => {
			const opts = createDefaultOptions();
			const cmd = buildCommand(opts);
			expect(cmd).not.toContain('-ss');
		});
	});

	describe('映像オプション', () => {
		it('映像コーデックを指定する', () => {
			const opts = createDefaultOptions({ video: { codec: 'libx264', noVideo: false } });
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-c:v libx264');
		});

		it('CRF を指定する', () => {
			const opts = createDefaultOptions({ video: { crf: 23, noVideo: false } });
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-crf 23');
		});

		it('ビットレートを指定する', () => {
			const opts = createDefaultOptions({ video: { bitrate: '2M', noVideo: false } });
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-b:v 2M');
		});

		it('-b:v 0 を VBR モードとして指定できる', () => {
			const opts = createDefaultOptions({ video: { bitrate: '0', noVideo: false } });
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-b:v 0');
		});

		it('ピクセルフォーマットを指定する', () => {
			const opts = createDefaultOptions({ video: { pixFmt: 'yuv420p10le', noVideo: false } });
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-pix_fmt yuv420p10le');
		});

		it('H.264/H.265 エンコーダプリセットを指定する', () => {
			const opts = createDefaultOptions({ video: { preset: 'slow', noVideo: false } });
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-preset slow');
		});

		it('SVT-AV1 プリセットを指定する', () => {
			const opts = createDefaultOptions({
				video: { codec: 'libsvtav1', svtav1Preset: 6, noVideo: false }
			});
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-preset 6');
		});

		it('SVT-AV1 追加パラメータを指定する', () => {
			const opts = createDefaultOptions({
				video: { codec: 'libsvtav1', svtav1Params: 'tune=0:enable-overlays=1:scd=1', noVideo: false }
			});
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-svtav1-params tune=0:enable-overlays=1:scd=1');
		});

		it('フレームレートを指定する', () => {
			const opts = createDefaultOptions({ video: { framerate: 30, noVideo: false } });
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-r 30');
		});

		it('libwebp quality を指定する', () => {
			const opts = createDefaultOptions({ video: { quality: 80, noVideo: false } });
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-quality 80');
		});

		it('libwebp lossless を指定する', () => {
			const opts = createDefaultOptions({ video: { lossless: true, noVideo: false } });
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-lossless 1');
		});
	});

	describe('音声オプション', () => {
		it('音声コーデックを指定する', () => {
			const opts = createDefaultOptions({ audio: { codec: 'aac', noAudio: false } });
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-c:a aac');
		});

		it('音声ビットレートを指定する', () => {
			const opts = createDefaultOptions({ audio: { bitrate: '192k', noAudio: false } });
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-b:a 192k');
		});

		it('サンプルレートを指定する', () => {
			const opts = createDefaultOptions({ audio: { sampleRate: 44100, noAudio: false } });
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-ar 44100');
		});

		it('チャンネル数を指定する', () => {
			const opts = createDefaultOptions({ audio: { channels: 2, noAudio: false } });
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-ac 2');
		});
	});

	describe('その他オプション', () => {
		it('メタデータ削除を指定する', () => {
			const opts = createDefaultOptions({ misc: { stripMetadata: true, copyStreams: false } });
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-map_metadata -1');
		});

		it('duration を指定する', () => {
			const opts = createDefaultOptions({ misc: { duration: '10', copyStreams: false, stripMetadata: false } });
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-t 10');
		});

		it('endTime を指定する', () => {
			const opts = createDefaultOptions({ misc: { endTime: '00:00:30', copyStreams: false, stripMetadata: false } });
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-to 00:00:30');
		});
	});

	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// 2. コーデック排他ルール
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

	describe('コーデック排他ルール', () => {
		it('copyStreams=true で -c copy を出力し、個別コーデックを含まない', () => {
			const opts = createDefaultOptions({
				video: { codec: 'libx264', crf: 23, noVideo: false },
				audio: { codec: 'aac', bitrate: '128k', noAudio: false },
				misc: { copyStreams: true, stripMetadata: false }
			});
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-c copy');
			expect(cmd).not.toContain('-c:v');
			expect(cmd).not.toContain('-c:a');
			expect(cmd).not.toContain('-crf');
			expect(cmd).not.toContain('-b:a');
		});

		it('noVideo=true で -vn のみ出力し、映像コーデック設定を含まない', () => {
			const opts = createDefaultOptions({
				video: { codec: 'libx264', crf: 23, noVideo: true }
			});
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-vn');
			expect(cmd).not.toContain('-c:v');
			expect(cmd).not.toContain('-crf');
		});

		it('noAudio=true で -an のみ出力し、音声コーデック設定を含まない', () => {
			const opts = createDefaultOptions({
				audio: { codec: 'aac', bitrate: '128k', noAudio: true }
			});
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-an');
			expect(cmd).not.toContain('-c:a');
			expect(cmd).not.toContain('-b:a');
		});

		it('copyStreams=true でフィルタが出力されない', () => {
			const opts = createDefaultOptions({
				misc: { copyStreams: true, stripMetadata: false },
				filter: { scale: { width: 1920, height: 1080 }, fps: 30 }
			});
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-c copy');
			expect(cmd).not.toContain('-vf');
			expect(cmd).not.toContain('scale=');
		});

		it('noVideo + noAudio で -vn -an 両方出力', () => {
			const opts = createDefaultOptions({
				video: { noVideo: true },
				audio: { noAudio: true }
			});
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-vn');
			expect(cmd).toContain('-an');
		});
	});

	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// 3. GIF 2パス生成
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

	describe('GIF 2パス生成', () => {
		it('.gif 出力で2パスコマンドを改行区切りで返す', () => {
			const opts = createDefaultOptions({
				output: { filename: 'output.gif', overwrite: true },
				filter: { fps: 10, scale: { width: 320, height: -1 } }
			});
			const cmd = buildCommand(opts);
			const lines = cmd.split('\n');
			expect(lines).toHaveLength(2);
		});

		it('パス1でパレット生成コマンドを出力する', () => {
			const opts = createDefaultOptions({
				output: { filename: 'output.gif', overwrite: true },
				filter: { fps: 10, scale: { width: 320, height: -1 } }
			});
			const lines = buildCommand(opts).split('\n');
			expect(lines[0]).toContain('palettegen');
			expect(lines[0]).toContain('palette.png');
			expect(lines[0]).toContain('fps=10,scale=320:-1:flags=lanczos');
		});

		it('パス2で paletteuse コマンドを出力する', () => {
			const opts = createDefaultOptions({
				output: { filename: 'output.gif', overwrite: true },
				filter: { fps: 10, scale: { width: 320, height: -1 } }
			});
			const lines = buildCommand(opts).split('\n');
			expect(lines[1]).toContain('paletteuse');
			expect(lines[1]).toContain('-i palette.png');
			expect(lines[1]).toContain('-lavfi');
			expect(lines[1]).toContain('output.gif');
		});

		it('GIF で -y オプションが両パスに含まれる', () => {
			const opts = createDefaultOptions({
				output: { filename: 'output.gif', overwrite: true },
				filter: { fps: 10, scale: { width: 320, height: -1 } }
			});
			const lines = buildCommand(opts).split('\n');
			expect(lines[0]).toMatch(/^ffmpeg -y /);
			expect(lines[1]).toMatch(/^ffmpeg -y /);
		});

		it('GIF で -ss と -t が反映される', () => {
			const opts = createDefaultOptions({
				input: { filename: 'input.mp4', startTime: '00:00:05' },
				output: { filename: 'output.gif', overwrite: true },
				filter: { fps: 10, scale: { width: 320, height: -1 } },
				misc: { duration: '3', copyStreams: false, stripMetadata: false }
			});
			const lines = buildCommand(opts).split('\n');
			expect(lines[0]).toContain('-ss 00:00:05');
			expect(lines[0]).toContain('-t 3');
			expect(lines[1]).toContain('-ss 00:00:05');
			expect(lines[1]).toContain('-t 3');
		});

		it('.GIF (大文字) でも GIF モードが適用される', () => {
			const opts = createDefaultOptions({
				output: { filename: 'output.GIF', overwrite: true },
				filter: { fps: 10, scale: { width: 320 } }
			});
			const cmd = buildCommand(opts);
			expect(cmd.split('\n')).toHaveLength(2);
		});

		it('GIF でデフォルト fps=10, scale=320:-1 が適用される', () => {
			const opts = createDefaultOptions({
				output: { filename: 'output.gif', overwrite: true },
				filter: {}
			});
			const lines = buildCommand(opts).split('\n');
			expect(lines[0]).toContain('fps=10,scale=320:-1:flags=lanczos');
		});
	});

	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// プリセット統合テスト
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

	describe('プリセット統合テスト', () => {
		it('AVIF 画像変換 (image-convert)', () => {
			const opts = createDefaultOptions({
				input: { filename: 'input.png' },
				output: { filename: 'output.avif', overwrite: true },
				video: { codec: 'libsvtav1', crf: 30, bitrate: '0', pixFmt: 'yuv420p10le', noVideo: false },
				audio: { noAudio: true },
				misc: { stripMetadata: false, copyStreams: false }
			});
			const cmd = buildCommand(opts);
			expect(cmd).toContain('ffmpeg -y -i input.png');
			expect(cmd).toContain('-c:v libsvtav1');
			expect(cmd).toContain('-crf 30');
			expect(cmd).toContain('-b:v 0');
			expect(cmd).toContain('-pix_fmt yuv420p10le');
			expect(cmd).toContain('-an');
			expect(cmd).toContain('output.avif');
		});

		it('動画圧縮 SVT-AV1 (video-compress)', () => {
			const opts = createDefaultOptions({
				video: {
					codec: 'libsvtav1', crf: 30, svtav1Preset: 6,
					pixFmt: 'yuv420p10le', svtav1Params: 'tune=0:enable-overlays=1:scd=1',
					noVideo: false
				},
				audio: { codec: 'libopus', bitrate: '128k', noAudio: false }
			});
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-c:v libsvtav1');
			expect(cmd).toContain('-crf 30');
			expect(cmd).toContain('-preset 6');
			expect(cmd).toContain('-svtav1-params tune=0:enable-overlays=1:scd=1');
			expect(cmd).toContain('-c:a libopus');
			expect(cmd).toContain('-b:a 128k');
		});

		it('音声抽出 (audio-extract)', () => {
			const opts = createDefaultOptions({
				video: { noVideo: true },
				audio: { codec: 'libmp3lame', bitrate: '192k', noAudio: false },
				output: { filename: 'output.mp3', overwrite: true }
			});
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-vn');
			expect(cmd).toContain('-c:a libmp3lame');
			expect(cmd).toContain('-b:a 192k');
			expect(cmd).toContain('output.mp3');
			expect(cmd).not.toContain('-c:v');
		});

		it('動画トリム (video-trim) — copyStreams で高速処理', () => {
			const opts = createDefaultOptions({
				input: { filename: 'input.mp4', startTime: '00:00:00' },
				misc: { copyStreams: true, endTime: '00:00:30', stripMetadata: false }
			});
			const cmd = buildCommand(opts);
			expect(cmd).toContain('-ss 00:00:00');
			expect(cmd).toContain('-c copy');
			expect(cmd).toContain('-to 00:00:30');
			expect(cmd).not.toContain('-c:v');
			expect(cmd).not.toContain('-c:a');
		});
	});

	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// 8. エッジケース
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

	describe('エッジケース', () => {
		it('スペースを含むファイル名をクォートする', () => {
			const opts = createDefaultOptions({
				input: { filename: 'my video.mp4' },
				output: { filename: 'my output.mp4', overwrite: true }
			});
			const cmd = buildCommand(opts);
			expect(cmd).toContain('"my video.mp4"');
			expect(cmd).toContain('"my output.mp4"');
		});

		it('スペースを含まないファイル名はクォートしない', () => {
			const opts = createDefaultOptions();
			const cmd = buildCommand(opts);
			expect(cmd).not.toContain('"input.mp4"');
			expect(cmd).not.toContain('"output.mp4"');
		});

		it('全オプション未設定でも正常なコマンドを生成する', () => {
			const opts: FFmpegOptions = {
				input: { filename: 'in.mp4' },
				output: { filename: 'out.mp4', overwrite: false },
				video: { noVideo: false },
				audio: { noAudio: false },
				filter: {},
				misc: { stripMetadata: false, copyStreams: false }
			};
			const cmd = buildCommand(opts);
			expect(cmd).toBe('ffmpeg -i in.mp4 out.mp4');
		});
	});
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. buildVideoFilter()
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('buildVideoFilter', () => {
	it('フィルタなしで null を返す', () => {
		expect(buildVideoFilter({})).toBeNull();
	});

	it('scale フィルタを生成する', () => {
		expect(buildVideoFilter({ scale: { width: 1920, height: 1080 } })).toBe('scale=1920:1080');
	});

	it('scale で height 省略時に -1 を使用する', () => {
		expect(buildVideoFilter({ scale: { width: 1280 } })).toBe('scale=1280:-1');
	});

	it('scale で width 省略時に -1 を使用する', () => {
		expect(buildVideoFilter({ scale: { height: 720 } })).toBe('scale=-1:720');
	});

	it('crop フィルタを生成する', () => {
		expect(buildVideoFilter({ crop: { width: 640, height: 480, x: 10, y: 20 } }))
			.toBe('crop=640:480:10:20');
	});

	it('fps フィルタを生成する', () => {
		expect(buildVideoFilter({ fps: 24 })).toBe('fps=24');
	});

	it('カスタムフィルタを含める', () => {
		expect(buildVideoFilter({ customFilter: 'transpose=1' })).toBe('transpose=1');
	});

	it('複数フィルタをカンマ区切りで結合する', () => {
		const filter: FilterOptions = {
			scale: { width: 1920, height: 1080 },
			fps: 30,
			customFilter: 'eq=brightness=0.1'
		};
		expect(buildVideoFilter(filter)).toBe('scale=1920:1080,fps=30,eq=brightness=0.1');
	});

	it('scale の width/height 両方が未設定で空オブジェクトなら scale を含まない', () => {
		expect(buildVideoFilter({ scale: {} })).toBeNull();
	});
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. buildCwebpCommand()
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('buildCwebpCommand', () => {
	it('基本的な cwebp コマンドを生成する', () => {
		const opts = createDefaultOptions({
			input: { filename: 'input.png' },
			output: { filename: 'output.webp', overwrite: true },
			video: { quality: 75, noVideo: false }
		});
		const cmd = buildCwebpCommand(opts);
		expect(cmd).toBe('cwebp -q 75 input.png -o output.webp');
	});

	it('quality 未設定でデフォルト 75 を使用する', () => {
		const opts = createDefaultOptions({
			input: { filename: 'input.png' },
			output: { filename: 'output.webp', overwrite: true }
		});
		const cmd = buildCwebpCommand(opts);
		expect(cmd).toContain('-q 75');
	});

	it('リサイズオプションを含む', () => {
		const opts = createDefaultOptions({
			input: { filename: 'input.png' },
			output: { filename: 'output.webp', overwrite: true },
			video: { quality: 80, noVideo: false },
			filter: { scale: { width: 800, height: 600 } }
		});
		const cmd = buildCwebpCommand(opts);
		expect(cmd).toContain('-resize 800 600');
	});

	it('scale の負の値を 0（自動算出）にマッピングする', () => {
		const opts = createDefaultOptions({
			input: { filename: 'input.png' },
			output: { filename: 'output.webp', overwrite: true },
			filter: { scale: { width: 800, height: -1 } }
		});
		const cmd = buildCwebpCommand(opts);
		expect(cmd).toContain('-resize 800 0');
	});

	it('スペース付きファイル名をクォートする', () => {
		const opts = createDefaultOptions({
			input: { filename: 'my image.png' },
			output: { filename: 'my output.webp', overwrite: true }
		});
		const cmd = buildCwebpCommand(opts);
		expect(cmd).toContain('"my image.png"');
		expect(cmd).toContain('"my output.webp"');
	});
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. buildBatchCommand()
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('buildBatchCommand', () => {
	const batch: BatchOptions = {
		inputExtensions: ['mp4', 'mov', 'avi'],
		outputExtension: 'mkv'
	};

	it('Bash / PowerShell / cmd の3形式を返す', () => {
		const opts = createDefaultOptions({
			video: { codec: 'libx264', crf: 23, noVideo: false },
			audio: { codec: 'aac', noAudio: false }
		});
		const result = buildBatchCommand(opts, batch);
		expect(result).toHaveProperty('bash');
		expect(result).toHaveProperty('powershell');
		expect(result).toHaveProperty('cmd');
	});

	it('Bash スクリプトが shebang で始まる', () => {
		const opts = createDefaultOptions();
		const result = buildBatchCommand(opts, batch);
		expect(result.bash).toMatch(/^#!\/bin\/bash/);
	});

	it('Bash スクリプトに case パターンを含む', () => {
		const opts = createDefaultOptions();
		const result = buildBatchCommand(opts, batch);
		expect(result.bash).toContain('mp4|mov|avi');
	});

	it('PowerShell スクリプトに Include フィルタを含む', () => {
		const opts = createDefaultOptions();
		const result = buildBatchCommand(opts, batch);
		expect(result.powershell).toContain('"*.mp4"');
		expect(result.powershell).toContain('"*.mov"');
		expect(result.powershell).toContain('"*.avi"');
	});

	it('cmd スクリプトが @echo off で始まる', () => {
		const opts = createDefaultOptions();
		const result = buildBatchCommand(opts, batch);
		expect(result.cmd).toMatch(/^@echo off/);
	});

	it('cmd スクリプトで出力拡張子と同一の入力拡張子をスキップする', () => {
		const batchSameExt: BatchOptions = {
			inputExtensions: ['mp4', 'mov', 'mkv'],
			outputExtension: 'mkv'
		};
		const opts = createDefaultOptions();
		const result = buildBatchCommand(opts, batchSameExt);
		// mkv → mkv の for ループは生成されない
		const forLines = result.cmd.split('\n').filter(l => l.startsWith('for'));
		expect(forLines.every(l => !l.includes('*.mkv'))).toBe(true);
	});

	it('copyStreams=true でバッチスクリプトに -c copy が含まれる', () => {
		const opts = createDefaultOptions({ misc: { copyStreams: true, stripMetadata: false } });
		const result = buildBatchCommand(opts, batch);
		expect(result.bash).toContain('-c copy');
		expect(result.powershell).toContain('-c copy');
		expect(result.cmd).toContain('-c copy');
	});

	it('-ss オプションがバッチスクリプトに含まれる', () => {
		const opts = createDefaultOptions({
			input: { filename: 'input.mp4', startTime: '00:01:00' }
		});
		const result = buildBatchCommand(opts, batch);
		expect(result.bash).toContain('-ss 00:01:00');
		expect(result.powershell).toContain('-ss 00:01:00');
		expect(result.cmd).toContain('-ss 00:01:00');
	});
});

describe('buildCwebpBatchCommand', () => {
	const batch: BatchOptions = {
		inputExtensions: ['jpg', 'jpeg', 'png'],
		outputExtension: 'webp'
	};

	it('3形式のスクリプトを返す', () => {
		const opts = createDefaultOptions({ video: { quality: 80, noVideo: false } });
		const result = buildCwebpBatchCommand(opts, batch);
		expect(result).toHaveProperty('bash');
		expect(result).toHaveProperty('powershell');
		expect(result).toHaveProperty('cmd');
	});

	it('cwebp コマンドを使用する（ffmpeg ではない）', () => {
		const opts = createDefaultOptions({ video: { quality: 80, noVideo: false } });
		const result = buildCwebpBatchCommand(opts, batch);
		expect(result.bash).toContain('cwebp');
		expect(result.bash).not.toContain('ffmpeg');
		expect(result.powershell).toContain('cwebp');
		expect(result.cmd).toContain('cwebp');
	});

	it('品質オプションが含まれる', () => {
		const opts = createDefaultOptions({ video: { quality: 90, noVideo: false } });
		const result = buildCwebpBatchCommand(opts, batch);
		expect(result.bash).toContain('-q 90');
	});

	it('リサイズオプションが含まれる', () => {
		const opts = createDefaultOptions({
			video: { quality: 75, noVideo: false },
			filter: { scale: { width: 800, height: 600 } }
		});
		const result = buildCwebpBatchCommand(opts, batch);
		expect(result.bash).toContain('-resize 800 600');
	});
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. isOptionEmpty()
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('isOptionEmpty', () => {
	it('undefined は空', () => {
		expect(isOptionEmpty(undefined)).toBe(true);
	});

	it('null は空', () => {
		expect(isOptionEmpty(null)).toBe(true);
	});

	it('空文字列は空', () => {
		expect(isOptionEmpty('')).toBe(true);
	});

	it('空白のみの文字列は空', () => {
		expect(isOptionEmpty('   ')).toBe(true);
	});

	it('値のある文字列は空でない', () => {
		expect(isOptionEmpty('hello')).toBe(false);
	});

	it('0 は空でない', () => {
		expect(isOptionEmpty(0)).toBe(false);
	});

	it('false は空でない', () => {
		expect(isOptionEmpty(false)).toBe(false);
	});
});
