import { describe, expect, it } from 'vitest';
import { buildBatchCommand, buildCwebpBatchCommand } from '../../src/lib/ffmpeg/builder';
import {
	AUDIO_INPUT_EXTENSIONS,
	CWEBP_IMAGE_INPUT_EXTENSIONS,
	PRESETS,
	VIDEO_INPUT_EXTENSIONS,
	getFileExtension,
	getValidatedOutputExtension,
	inferBatchOptions,
	resolveBatchInputExtensions
} from '../../src/lib/ffmpeg/presets';
import { commandStore } from '../../src/lib/stores/command.svelte';
import type { BatchOptions, BatchScript, FFmpegOptions, PresetId } from '../../src/lib/ffmpeg/types';

function createOptions(outputFilename: string): FFmpegOptions {
	return {
		input: { filename: 'input.mp4' },
		output: { filename: outputFilename, overwrite: true },
		video: { codec: 'libx264', noVideo: false },
		audio: { codec: 'aac', noAudio: false },
		filter: {},
		misc: { stripMetadata: false, copyStreams: false }
	};
}

function requireScript(script: BatchScript | null): BatchScript {
	expect(script).not.toBeNull();
	return script as BatchScript;
}

function getPresetOptions(presetId: PresetId): FFmpegOptions {
	return structuredClone(PRESETS[presetId].defaults) as FFmpegOptions;
}

describe('batch input policy', () => {
	it('CC2-01 uses only the preset allowlist independently of dropped filenames', () => {
		commandStore.applyPreset('image-convert');
		commandStore.setDroppedFiles([{ name: 'clip.mxf' }, { name: 'other.mxf' }]);
		const script = requireScript(commandStore.batchScript);

		expect(script.bash).toContain(
			resolveBatchInputExtensions(
				inferBatchOptions(PRESETS['image-convert']),
				'avif'
			).join('|')
		);
		expect(script.bash).not.toContain('mxf');

		commandStore.clearDroppedFiles();
		commandStore.resetOptions();
	});

	it('CC2-02 derives the output extension from options.output.filename', () => {
		const script = requireScript(
			buildBatchCommand(createOptions('user-selected.MKV'), inferBatchOptions(PRESETS['video-compress']))
		);
		expect(script.bash).toContain('OUTPUT_EXT="mkv"');
		expect(script.powershell).toContain('$outputExt = "mkv"');
		expect(script.cmd).toContain('set "OUTPUT_EXT=mkv"');
	});

	it('CC2-03 normalizes safe output extensions and rejects unsafe values', () => {
		expect(getValidatedOutputExtension('result.JPEG')).toBe('jpeg');
		for (const filename of [
			'result',
			'result.',
			'result.a b',
			'result.jp;g',
			'result.$(id)',
			'result.toolong'
		]) {
			expect(
				buildBatchCommand(createOptions(filename), inferBatchOptions(PRESETS['image-convert']))
			).toBeNull();
		}
	});

	it('CC2-04 excludes every member of the selected output format family', () => {
		const imageBatch = inferBatchOptions(PRESETS['image-convert']);
		expect(resolveBatchInputExtensions(imageBatch, 'jpg')).not.toEqual(
			expect.arrayContaining(['jpg', 'jpeg', 'jfif'])
		);
		expect(resolveBatchInputExtensions(imageBatch, 'tif')).not.toEqual(
			expect.arrayContaining(['tif', 'tiff'])
		);

		const audioBatch = inferBatchOptions(PRESETS['audio-convert']);
		expect(resolveBatchInputExtensions(audioBatch, 'aif')).not.toEqual(
			expect.arrayContaining(['aif', 'aiff'])
		);
		expect(resolveBatchInputExtensions(audioBatch, 'ogg')).not.toEqual(
			expect.arrayContaining(['ogg', 'oga'])
		);

		const videoBatch = inferBatchOptions(PRESETS['video-convert']);
		expect(resolveBatchInputExtensions(videoBatch, 'mpg')).not.toEqual(
			expect.arrayContaining(['mpg', 'mpeg'])
		);
		expect(resolveBatchInputExtensions(imageBatch, 'heif')).toContain('heic');
	});

	it('CC2-05 declares the same-format policy for every preset', () => {
		const allowed: PresetId[] = ['video-compress', 'video-trim'];
		const excluded: PresetId[] = [
			'image-convert',
			'image-webp',
			'video-convert',
			'audio-extract',
			'audio-convert',
			'gif-generate'
		];

		for (const presetId of allowed) {
			expect(inferBatchOptions(PRESETS[presetId]).allowSameFormatInput).toBe(true);
			const script = requireScript(
				buildBatchCommand(createOptions('output.mp4'), inferBatchOptions(PRESETS[presetId]))
			);
			expect(script.bash).toContain('mp4');
		}
		for (const presetId of excluded) {
			expect(inferBatchOptions(PRESETS[presetId]).allowSameFormatInput).toBe(false);
		}
	});

	it('CC2-06 includes HEIC and HEIF in all image-convert shell scripts', () => {
		const script = requireScript(
			buildBatchCommand(createOptions('output.avif'), inferBatchOptions(PRESETS['image-convert']))
		);
		expect(script.bash).toContain('heic|heif');
		expect(script.powershell).toContain('"*.heic"');
		expect(script.powershell).toContain('"*.heif"');
		expect(script.cmd).toContain('(*.heic)');
		expect(script.cmd).toContain('(*.heif)');
	});

	it('CC2-07 limits image-webp inputs to formats supported by cwebp', () => {
		const batch = inferBatchOptions(PRESETS['image-webp']);
		expect(batch.inputExtensions).toEqual(CWEBP_IMAGE_INPUT_EXTENSIONS);
		expect(batch.inputExtensions).not.toEqual(
			expect.arrayContaining(['heic', 'heif', 'gif', 'bmp'])
		);

		const script = requireScript(buildCwebpBatchCommand(createOptions('output.webp'), batch));
		expect(script.bash).not.toMatch(/heic|heif|gif|bmp/);
	});

	it('CC2-08 uses video inputs for audio extraction and audio inputs for audio conversion', () => {
		expect(inferBatchOptions(PRESETS['audio-extract']).inputExtensions).toEqual(
			VIDEO_INPUT_EXTENSIONS
		);
		const audioExtensions = resolveBatchInputExtensions(
			inferBatchOptions(PRESETS['audio-convert']),
			'ogg'
		);
		expect(audioExtensions).not.toEqual(expect.arrayContaining(['ogg', 'oga']));
		expect(audioExtensions.every((extension) => AUDIO_INPUT_EXTENSIONS.includes(extension))).toBe(true);
	});

	it('CC2-09 handles uppercase, extensionless, and invalid-extension input filenames', () => {
		const allowed = new Set(inferBatchOptions(PRESETS['image-convert']).inputExtensions);
		expect(getFileExtension('PHOTO.JPG')).toBe('jpg');
		expect(allowed.has(getFileExtension('PHOTO.JPG') ?? '')).toBe(true);
		expect(getFileExtension('README')).toBeNull();
		expect(allowed.has(getFileExtension('photo.jp$') ?? '')).toBe(false);
	});
});

describe('shell consistency', () => {
	const batch: BatchOptions = {
		inputExtensions: ['jpg', 'png'],
		allowSameFormatInput: false
	};
	const script = requireScript(buildBatchCommand(createOptions('output.avif'), batch));
	const cwebpScript = requireScript(buildCwebpBatchCommand(createOptions('output.webp'), batch));

	it('CC3-01 scans non-recursively in bash, PowerShell, and cmd', () => {
		expect(script.bash).toContain('for f in *; do');
		expect(script.powershell).not.toContain('-Recurse');
		expect(script.cmd).toContain('for %%f in (*.jpg)');
	});

	it('CC3-02 keeps PowerShell Include effective with an explicit -Path wildcard', () => {
		expect(script.powershell).toContain('Get-ChildItem -Path * -File -Include');
	});

	it('CC3-03 adds the input extension only for base names already seen in the same run', () => {
		for (const generatedScript of [script, cwebpScript]) {
			expect(generatedScript.bash).toContain('if has_seen_base "$base"; then');
			expect(generatedScript.powershell).toContain('if (-not $seenBaseNames.Add($_.BaseName))');
			expect(generatedScript.cmd).toContain('type nul > "%SEEN_FILE%"');
			expect(generatedScript.cmd).toContain('findstr /l /x /c:"%%~nf" "%SEEN_FILE%"');
			expect(generatedScript.cmd).toContain('if not errorlevel 1');
			expect(generatedScript.cmd).toContain('del "%SEEN_FILE%"');
			expect(generatedScript.cmd).not.toContain('SEEN_%~n1');
			expect(generatedScript.bash).not.toContain('[ -e "$out" ]');
			expect(generatedScript.powershell).not.toContain('Test-Path $out');
			expect(generatedScript.cmd).not.toContain('if exist "%OUT%"');
		}
	});

	it('CC3-04 generates case-insensitive extension handling for all shells', () => {
		for (const generatedScript of [script, cwebpScript]) {
			expect(generatedScript.bash).toContain("tr '[:upper:]' '[:lower:]'");
			expect(generatedScript.powershell).toContain('.ToLower()');
			expect(generatedScript.cmd).toContain('for %%f in (*.jpg) do (');
			expect(generatedScript.cmd).toContain('%%~nf_jpg.%OUTPUT_EXT%');
		}
	});

	it('CC3-05 emits CRLF line endings only for cmd scripts', () => {
		for (const generatedScript of [script, cwebpScript]) {
			expect(generatedScript.cmd).toContain('\r\n');
			expect(generatedScript.cmd.replaceAll('\r\n', '')).not.toContain('\n');
			expect(generatedScript.bash).not.toContain('\r\n');
			expect(generatedScript.powershell).not.toContain('\r\n');
		}
	});

	for (const preset of Object.values(PRESETS)) {
		it(`CC3-06 does not use position-dependent label lookup for ${preset.id}`, () => {
			const batch = inferBatchOptions(preset);
			const options = getPresetOptions(preset.id);
			const generatedScript = requireScript(
				preset.id === 'image-webp'
					? buildCwebpBatchCommand(options, batch)
					: buildBatchCommand(options, batch)
			);
			const expectedLoopCount = resolveBatchInputExtensions(
				batch,
				getValidatedOutputExtension(options.output.filename) as string
			).length;

			expect(generatedScript.cmd).not.toMatch(/\bcall\s+:/i);
			expect(generatedScript.cmd).not.toMatch(/^\s*:[^:]/m);
			expect(generatedScript.cmd).not.toMatch(/\bgoto\b/i);
			expect(generatedScript.cmd).not.toMatch(/\benabledelayedexpansion\b/i);
			expect(generatedScript.cmd).toContain('setlocal DisableDelayedExpansion');
			expect(generatedScript.cmd.match(/^for %%f in /gm)).toHaveLength(expectedLoopCount);
		});
	}
});
