import {
	chmodSync,
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, delimiter, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { buildBatchCommand, buildCwebpBatchCommand } from '../../src/lib/ffmpeg/builder';
import {
	CWEBP_PREPROCESS_EXTENSIONS,
	PRESETS,
	getValidatedOutputExtension,
	inferBatchOptions
} from '../../src/lib/ffmpeg/presets';
import type { BatchScript, FFmpegOptions, PresetId } from '../../src/lib/ffmpeg/types';

const temporaryDirectories: string[] = [];

afterEach(() => {
	for (const directory of temporaryDirectories.splice(0)) {
		rmSync(directory, { recursive: true, force: true });
	}
});

function createOptions(outputFilename: string): FFmpegOptions {
	return {
		input: { filename: 'input.jpg' },
		output: { filename: outputFilename, overwrite: true },
		video: { codec: 'libsvtav1', crf: 30, noVideo: false },
		audio: { noAudio: true },
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

function createFixture(): string {
	const root = mkdtempSync(join(tmpdir(), 'ffmpeg-batch-'));
	temporaryDirectories.push(root);
	const fixture = join(root, 'fixture');
	mkdirSync(fixture);

	for (const filename of [
		'photo.jpg',
		'photo.png',
		'my holiday.jpg',
		'my holiday.png',
		'upper.JPG',
		'camera.HEIC',
		'already.avif',
		'notes.txt',
		'README',
		'bad.jp$'
	]) {
		writeFileSync(join(fixture, filename), '');
	}
	mkdirSync(join(fixture, 'nested'));
	writeFileSync(join(fixture, 'nested', 'inside.jpg'), '');
	return fixture;
}

function installFakePosixBinaries(root: string): string {
	const binDirectory = join(root, 'bin');
	mkdirSync(binDirectory, { recursive: true });
	const fakeBinary = `#!/bin/bash
printf '%s\\n' "$*" >> "$FAKE_LOG"
out="\${!#}"
mkdir -p "$(dirname "$out")"
: > "$out"
`;

	for (const name of ['ffmpeg', 'cwebp', 'gif2webp']) {
		const path = join(binDirectory, name);
		writeFileSync(path, fakeBinary);
		chmodSync(path, 0o755);
	}
	return binDirectory;
}

function runBashScript(fixture: string, script: string, filename: string): string[] {
	const root = join(fixture, '..');
	const binDirectory = installFakePosixBinaries(root);
	const logPath = join(root, `${filename}.log`);
	const scriptPath = join(root, filename);
	writeFileSync(scriptPath, script);

	const result = spawnSync('bash', [scriptPath], {
		cwd: fixture,
		encoding: 'utf8',
		env: {
			...process.env,
			PATH: `${binDirectory}${delimiter}${process.env.PATH ?? ''}`,
			FAKE_LOG: logPath
		}
	});
	expect(result.status, result.stderr).toBe(0);
	return readFileSync(logPath, 'utf8').trim().split('\n');
}

function expectImageOutputs(fixture: string, outputExtension: string): void {
	const outputDirectory = join(fixture, `${basename(fixture)}_${outputExtension}`);
	expect(existsSync(join(outputDirectory, `photo.${outputExtension}`))).toBe(true);
	expect(existsSync(join(outputDirectory, `photo_png.${outputExtension}`))).toBe(true);
	expect(existsSync(join(outputDirectory, `my holiday.${outputExtension}`))).toBe(true);
	expect(existsSync(join(outputDirectory, `my holiday_png.${outputExtension}`))).toBe(true);
	expect(existsSync(join(outputDirectory, `upper.${outputExtension}`))).toBe(true);
	expect(existsSync(join(outputDirectory, `camera.${outputExtension}`))).toBe(true);
	expect(existsSync(join(outputDirectory, `inside.${outputExtension}`))).toBe(false);
}

type FixtureCategory = 'audio' | 'image' | 'video';

// image は cwebp の3経路（直接/ffmpeg前処理/gif2webp）を Windows 実行でも踏ませるため
// heic（②経路）・gif（③経路）・bmp（②経路）を含む。video/audio は既存のまま2拡張子。
const fixtureExtensions: Record<FixtureCategory, readonly string[]> = {
	image: ['jpg', 'png', 'heic', 'gif', 'bmp'],
	video: ['mp4', 'mov'],
	audio: ['flac', 'wav']
};

function createCategoryFixture(root: string, name: string, category: FixtureCategory): string {
	const fixture = join(root, name);
	mkdirSync(fixture);
	const extensions = fixtureExtensions[category];

	for (const baseName of ['sample', 'my holiday']) {
		for (const extension of extensions) {
			writeFileSync(join(fixture, `${baseName}.${extension}`), '');
		}
	}
	writeFileSync(join(fixture, 'ignored.txt'), '');
	mkdirSync(join(fixture, 'nested'));
	writeFileSync(join(fixture, 'nested', `inside.${extensions[0]}`), '');
	return fixture;
}

function expectCategoryOutputs(
	fixture: string,
	outputExtension: string,
	category: FixtureCategory
): void {
	const outputDirectory = join(fixture, `${basename(fixture)}_${outputExtension}`);
	const outputs = readdirSync(outputDirectory).sort();
	const inputExtensions = fixtureExtensions[category];

	expect(outputs).toHaveLength(2 * inputExtensions.length);
	for (const baseName of ['sample', 'my holiday']) {
		expect(outputs).toContain(`${baseName}.${outputExtension}`);
		// 拡張子ごとの走査順は shell によって異なるため、どれが無印になるかは決め打ちしない。
		// 無印1つ + 残り全てが _ext サフィックス付きであることだけを検証する。
		const suffixedCount = inputExtensions.filter((extension) =>
			outputs.includes(`${baseName}_${extension}.${outputExtension}`)
		).length;
		expect(suffixedCount).toBe(inputExtensions.length - 1);
	}
	expect(outputs).not.toContain(`inside.${outputExtension}`);
}

/** cwebp 経路では②（ffmpeg+cwebp）だけ拡張子1つにつき2回バイナリが呼ばれる */
function expectedInvocationCount(tool: 'cwebp' | 'ffmpeg', category: FixtureCategory): number {
	const extensions = fixtureExtensions[category];
	const perFileCalls = extensions.reduce((total, extension) => {
		if (tool === 'ffmpeg') return total + 1;
		return total + (CWEBP_PREPROCESS_EXTENSIONS.includes(extension) ? 2 : 1);
	}, 0);
	return perFileCalls * 2; // 'sample' と 'my holiday' の2 baseName分
}

describe('generated bash scripts', () => {
	it('CC4-02 passes bash -n syntax validation', () => {
		const ffmpegScript = requireScript(
			buildBatchCommand(
				createOptions('output.avif'),
				inferBatchOptions(PRESETS['image-convert'])
			)
		);
		const cwebpScript = requireScript(
			buildCwebpBatchCommand(
				createOptions('output.webp'),
				inferBatchOptions(PRESETS['image-webp'])
			)
		);

		for (const script of [ffmpegScript.bash, cwebpScript.bash]) {
			const fixture = createFixture();
			const scriptPath = join(fixture, 'syntax.sh');
			writeFileSync(scriptPath, script);
			const result = spawnSync('bash', ['-n', scriptPath], { encoding: 'utf8' });
			expect(result.status, result.stderr).toBe(0);
		}
	});

	it('CC4-03 executes fixtures with fake ffmpeg and cwebp binaries without skips', () => {
		const ffmpegFixture = createFixture();
		const ffmpegScript = requireScript(
			buildBatchCommand(
				createOptions('output.avif'),
				inferBatchOptions(PRESETS['image-convert'])
			)
		);
		const ffmpegCalls = runBashScript(ffmpegFixture, ffmpegScript.bash, 'ffmpeg-batch.sh');

		expect(ffmpegCalls).toHaveLength(6);
		expect(ffmpegCalls.join('\n')).toContain('-i camera.HEIC');
		expect(ffmpegCalls.join('\n')).toContain('-i upper.JPG');
		expect(ffmpegCalls.join('\n')).not.toMatch(/already\.avif|notes\.txt|README|bad\.jp\\$/);
		expectImageOutputs(ffmpegFixture, 'avif');

		const cwebpFixture = createFixture();
		const cwebpScript = requireScript(
			buildCwebpBatchCommand(
				createOptions('output.webp'),
				inferBatchOptions(PRESETS['image-webp'])
			)
		);
		const cwebpCalls = runBashScript(cwebpFixture, cwebpScript.bash, 'cwebp-batch.sh');

		// camera.HEIC / already.avif は② ffmpeg→PNG→cwebp 経路に入り、ffmpeg と cwebp の
		// 2回ずつログされる（5つの直接 cwebp 呼び出し + 2ファイル×2呼び出し = 9, D2）
		expect(cwebpCalls).toHaveLength(9);
		expect(cwebpCalls.join('\n')).not.toMatch(/notes\.txt/);
		expect(cwebpCalls.join('\n')).toContain('-i camera.HEIC');
		expect(cwebpCalls.join('\n')).toContain('-i already.avif');
		const outputDirectory = join(cwebpFixture, `${basename(cwebpFixture)}_webp`);
		expect(existsSync(join(outputDirectory, 'photo.webp'))).toBe(true);
		expect(existsSync(join(outputDirectory, 'photo_png.webp'))).toBe(true);
		expect(existsSync(join(outputDirectory, 'my holiday.webp'))).toBe(true);
		expect(existsSync(join(outputDirectory, 'my holiday_png.webp'))).toBe(true);
		expect(existsSync(join(outputDirectory, 'upper.webp'))).toBe(true);
		expect(existsSync(join(outputDirectory, 'camera.webp'))).toBe(true);
		expect(existsSync(join(outputDirectory, 'already.webp'))).toBe(true);
		// 一時ファイル (.tmp.png) が削除されていること（C5）
		expect(existsSync(join(outputDirectory, 'camera.tmp.png'))).toBe(false);
		expect(existsSync(join(outputDirectory, 'already.tmp.png'))).toBe(false);
	});

	it('CC4-06 keeps generated outputs identical when the same bash script runs twice', () => {
		const scripts = [
			{
				script: requireScript(
					buildBatchCommand(
						createOptions('output.avif'),
						inferBatchOptions(PRESETS['image-convert'])
					)
				).bash,
				outputExtension: 'avif',
				filename: 'ffmpeg-idempotent.sh'
			},
			{
				script: requireScript(
					buildCwebpBatchCommand(
						createOptions('output.webp'),
						inferBatchOptions(PRESETS['image-webp'])
					)
				).bash,
				outputExtension: 'webp',
				filename: 'cwebp-idempotent.sh'
			}
		];

		for (const { script, outputExtension, filename } of scripts) {
			const fixture = createFixture();
			const outputDirectory = join(fixture, `${basename(fixture)}_${outputExtension}`);
			for (const specialName of [
				'space name.jpg',
				'space name.png',
				'cash$money.jpg',
				'cash$money.png',
				'bracket[1].jpg',
				'bracket[1].png'
			]) {
				writeFileSync(join(fixture, specialName), '');
			}

			runBashScript(fixture, script, filename);
			const firstRunOutputs = readdirSync(outputDirectory).sort();

			runBashScript(fixture, script, filename);
			const secondRunOutputs = readdirSync(outputDirectory).sort();

			expect(secondRunOutputs).toEqual(firstRunOutputs);
			expect(secondRunOutputs).toEqual(
				expect.arrayContaining([
					`my holiday.${outputExtension}`,
					`my holiday_png.${outputExtension}`,
					`space name.${outputExtension}`,
					`space name_png.${outputExtension}`,
					`cash$money.${outputExtension}`,
					`cash$money_png.${outputExtension}`,
					`bracket[1].${outputExtension}`,
					`bracket[1]_png.${outputExtension}`
				])
			);
		}
	});
});

if (process.platform === 'win32') {
	const windowsTestTimeout = 15_000;
	const presetCases: {
		id: PresetId;
		fixtureCategory: FixtureCategory;
		tool: 'cwebp' | 'ffmpeg';
	}[] = [
		{ id: 'image-convert', fixtureCategory: 'image', tool: 'ffmpeg' },
		{ id: 'video-convert', fixtureCategory: 'video', tool: 'ffmpeg' },
		{ id: 'video-compress', fixtureCategory: 'video', tool: 'ffmpeg' },
		{ id: 'video-trim', fixtureCategory: 'video', tool: 'ffmpeg' },
		{ id: 'gif-generate', fixtureCategory: 'video', tool: 'ffmpeg' },
		{ id: 'audio-extract', fixtureCategory: 'video', tool: 'ffmpeg' },
		{ id: 'audio-convert', fixtureCategory: 'audio', tool: 'ffmpeg' },
		{ id: 'image-webp', fixtureCategory: 'image', tool: 'cwebp' }
	];
	const testCases = presetCases.flatMap((presetCase) =>
		(['powershell', 'cmd'] as const).map((shell) => ({ ...presetCase, shell }))
	);

	describe('CC4-04 executes generated Windows scripts', () => {
		let root: string;
		let binDirectory: string;

		beforeAll(() => {
			root = mkdtempSync(join(tmpdir(), 'ffmpeg-batch-windows-'));
			binDirectory = join(root, 'bin');
			mkdirSync(binDirectory);

			const fakeSourcePath = join(root, 'FakeMediaTool.cs');
			const fakeExecutablePath = join(root, 'FakeMediaTool.exe');
			const compileScriptPath = join(root, 'compile-fake.ps1');
			writeFileSync(
				fakeSourcePath,
				`using System;
using System.IO;

public static class FakeMediaTool
{
    public static int Main(string[] args)
    {
        File.AppendAllText(
            Environment.GetEnvironmentVariable("FAKE_LOG"),
            string.Join(" ", args) + Environment.NewLine
        );

        int outputFlag = Array.IndexOf(args, "-o");
        string output = outputFlag >= 0 ? args[outputFlag + 1] : args[args.Length - 1];
        string directory = Path.GetDirectoryName(output);
        if (!string.IsNullOrEmpty(directory))
        {
            Directory.CreateDirectory(directory);
        }
        File.WriteAllText(output, "");
        return 0;
    }
}
`
			);
			writeFileSync(
				compileScriptPath,
				`param([string]$SourcePath, [string]$OutputPath)
$source = Get-Content -LiteralPath $SourcePath -Raw
Add-Type -TypeDefinition $source -OutputAssembly $OutputPath -OutputType ConsoleApplication
`
			);
			const compileResult = spawnSync(
				'powershell.exe',
				[
					'-NoProfile',
					'-ExecutionPolicy',
					'Bypass',
					'-File',
					compileScriptPath,
					fakeSourcePath,
					fakeExecutablePath
				],
				{ encoding: 'utf8' }
			);
			expect(compileResult.status, compileResult.stderr).toBe(0);
			copyFileSync(fakeExecutablePath, join(binDirectory, 'ffmpeg.exe'));
			copyFileSync(fakeExecutablePath, join(binDirectory, 'cwebp.exe'));
			copyFileSync(fakeExecutablePath, join(binDirectory, 'gif2webp.exe'));
		}, windowsTestTimeout);

		afterAll(() => {
			rmSync(root, { recursive: true, force: true });
		});

		it.each(testCases)(
			'CC4-04 $id [$shell] executes generated script on Windows',
			({ id, fixtureCategory, tool, shell }) => {
				const preset = PRESETS[id];
				const options = getPresetOptions(id);
				const outputExtension = getValidatedOutputExtension(options.output.filename) as string;
				const script = requireScript(
					tool === 'cwebp'
						? buildCwebpBatchCommand(options, inferBatchOptions(preset))
						: buildBatchCommand(options, inferBatchOptions(preset))
				);
				const fixture = createCategoryFixture(root, `${id}-${shell}`, fixtureCategory);
				const fakeLog = join(root, `${id}-${shell}.log`);
				const scriptPath = join(
					root,
					`${id}-${shell}.${shell === 'powershell' ? 'ps1' : 'cmd'}`
				);
				writeFileSync(scriptPath, script[shell]);
				const command = shell === 'powershell' ? 'powershell.exe' : 'cmd.exe';
				const args =
					shell === 'powershell'
						? ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath]
						: ['/d', '/c', scriptPath];
				const result = spawnSync(command, args, {
					cwd: fixture,
					encoding: 'utf8',
					env: {
						...process.env,
						PATH: `${binDirectory}${delimiter}${process.env.PATH ?? ''}`,
						FAKE_LOG: fakeLog
					}
				});
				const diagnostics = JSON.stringify({
					preset: id,
					shell,
					status: result.status,
					stdout: result.stdout,
					stderr: result.stderr
				});

				expect(result.status, diagnostics).toBe(0);
				expect(existsSync(fakeLog), diagnostics).toBe(true);
				expect(readFileSync(fakeLog, 'utf8').trim().split(/\r?\n/), diagnostics).toHaveLength(
					expectedInvocationCount(tool, fixtureCategory)
				);
				expectCategoryOutputs(fixture, outputExtension, fixtureCategory);
			},
			windowsTestTimeout
		);
	});
}
