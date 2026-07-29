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
import { afterEach, describe, expect, it } from 'vitest';
import { buildBatchCommand, buildCwebpBatchCommand } from '../../src/lib/ffmpeg/builder';
import { PRESETS, getValidatedOutputExtension, inferBatchOptions } from '../../src/lib/ffmpeg/presets';
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

	for (const name of ['ffmpeg', 'cwebp']) {
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

const fixtureExtensions: Record<FixtureCategory, readonly [string, string]> = {
	image: ['jpg', 'png'],
	video: ['mp4', 'mov'],
	audio: ['flac', 'wav']
};

function createCategoryFixture(root: string, name: string, category: FixtureCategory): string {
	const fixture = join(root, name);
	mkdirSync(fixture);
	const [firstExtension, secondExtension] = fixtureExtensions[category];

	for (const baseName of ['sample', 'my holiday']) {
		writeFileSync(join(fixture, `${baseName}.${firstExtension}`), '');
		writeFileSync(join(fixture, `${baseName}.${secondExtension}`), '');
	}
	writeFileSync(join(fixture, 'ignored.txt'), '');
	mkdirSync(join(fixture, 'nested'));
	writeFileSync(join(fixture, 'nested', `inside.${firstExtension}`), '');
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

	expect(outputs).toHaveLength(4);
	for (const baseName of ['sample', 'my holiday']) {
		expect(outputs).toContain(`${baseName}.${outputExtension}`);
		expect(
			outputs.some(
				(output) =>
					output === `${baseName}_${inputExtensions[0]}.${outputExtension}` ||
					output === `${baseName}_${inputExtensions[1]}.${outputExtension}`
			)
		).toBe(true);
	}
	expect(outputs).not.toContain(`inside.${outputExtension}`);
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

		expect(cwebpCalls).toHaveLength(5);
		expect(cwebpCalls.join('\n')).not.toMatch(/camera\.HEIC|already\.avif|notes\.txt/);
		const outputDirectory = join(cwebpFixture, `${basename(cwebpFixture)}_webp`);
		expect(existsSync(join(outputDirectory, 'photo.webp'))).toBe(true);
		expect(existsSync(join(outputDirectory, 'photo_png.webp'))).toBe(true);
		expect(existsSync(join(outputDirectory, 'my holiday.webp'))).toBe(true);
		expect(existsSync(join(outputDirectory, 'my holiday_png.webp'))).toBe(true);
		expect(existsSync(join(outputDirectory, 'upper.webp'))).toBe(true);
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
	it('CC4-04 executes all 8 presets in PowerShell and cmd on Windows', () => {
		const root = mkdtempSync(join(tmpdir(), 'ffmpeg-batch-windows-'));
		temporaryDirectories.push(root);
		const binDirectory = join(root, 'bin');
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

		for (const presetCase of presetCases) {
			const preset = PRESETS[presetCase.id];
			const options = getPresetOptions(presetCase.id);
			const outputExtension = getValidatedOutputExtension(options.output.filename) as string;
			const script = requireScript(
				presetCase.tool === 'cwebp'
					? buildCwebpBatchCommand(options, inferBatchOptions(preset))
					: buildBatchCommand(options, inferBatchOptions(preset))
			);

			for (const shell of ['powershell', 'cmd'] as const) {
				const fixture = createCategoryFixture(
					root,
					`${presetCase.id}-${shell}`,
					presetCase.fixtureCategory
				);
				const fakeLog = join(root, `${presetCase.id}-${shell}.log`);
				const scriptPath = join(
					root,
					`${presetCase.id}-${shell}.${shell === 'powershell' ? 'ps1' : 'cmd'}`
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
					preset: presetCase.id,
					shell,
					status: result.status,
					stdout: result.stdout,
					stderr: result.stderr
				});

				expect(result.status, diagnostics).toBe(0);
				expect(existsSync(fakeLog), diagnostics).toBe(true);
				expect(readFileSync(fakeLog, 'utf8').trim().split(/\r?\n/), diagnostics).toHaveLength(4);
				expectCategoryOutputs(fixture, outputExtension, presetCase.fixtureCategory);
			}
		}
	});
}
