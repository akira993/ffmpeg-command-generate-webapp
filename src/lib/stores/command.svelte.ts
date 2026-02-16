/**
 * アプリケーション状態管理
 *
 * Svelte 5 の runes ($state, $derived) を使用した状態管理。
 * プリセット選択・オプション変更に応じてコマンド文字列をリアクティブに生成する。
 */

import type {
	FFmpegOptions,
	AppMode,
	PresetId,
	FileInfo,
	BatchOptions,
	BatchScript,
	ScriptType
} from '$lib/ffmpeg/types';
import { buildCommand, buildBatchCommand } from '$lib/ffmpeg/builder';
import { PRESETS, inferBatchOptions } from '$lib/ffmpeg/presets';

// ============================================================
// デフォルト値
// ============================================================

function createDefaultOptions(): FFmpegOptions {
	return {
		input: { filename: 'input.mp4' },
		output: { filename: 'output.mp4', overwrite: true },
		video: { noVideo: false },
		audio: { noAudio: false },
		filter: {},
		misc: { stripMetadata: false, copyStreams: false }
	};
}

// ============================================================
// アプリケーション状態クラス
// ============================================================

/**
 * コマンドジェネレーターのグローバル状態
 *
 * Svelte 5 の runes を使用。
 * コンポーネントから `commandStore` をインポートして使用する。
 */
class CommandStore {
	/** 現在のモード（プリセット / アドバンスド） */
	mode = $state<AppMode>('preset');

	/** 選択中のプリセットID */
	selectedPreset = $state<PresetId | null>(null);

	/** FFmpegオプション（全設定値） */
	options = $state<FFmpegOptions>(createDefaultOptions());

	/** 一括処理モード */
	batchMode = $state(false);

	/** D&Dで取得したファイル情報 */
	droppedFiles = $state<FileInfo[]>([]);

	/** 一括処理スクリプトのタブ選択 */
	activeScriptType = $state<ScriptType>('bash');

	/** アスペクト比ロック（デフォルトON） */
	aspectRatioLocked = $state(true);

	/** 元画像/動画のアスペクト比 (width / height) */
	originalAspectRatio = $state<number | null>(null);

	// ============================================================
	// 算出プロパティ（derived）
	// ============================================================

	/** 生成されたコマンド文字列 */
	commandString = $derived(buildCommand(this.options));

	/** 一括処理スクリプト（batchMode時） */
	batchScript = $derived.by((): BatchScript | null => {
		if (!this.batchMode || !this.selectedPreset) return null;
		const preset = PRESETS[this.selectedPreset];
		if (!preset) return null;

		const batchOptions: BatchOptions = inferBatchOptions(preset);

		// D&Dファイルから拡張子を推定
		if (this.droppedFiles.length > 0) {
			const extensions = new Set<string>();
			for (const file of this.droppedFiles) {
				const ext = file.name.split('.').pop()?.toLowerCase();
				if (ext) extensions.add(ext);
			}
			if (extensions.size > 0) {
				batchOptions.inputExtensions = [...extensions];
			}
		}

		return buildBatchCommand(this.options, batchOptions);
	});

	/** 現在表示すべきスクリプト */
	activeBatchScript = $derived.by((): string | null => {
		if (!this.batchScript) return null;
		return this.batchScript[this.activeScriptType];
	});

	/** ドロップされたファイル数 */
	fileCount = $derived(this.droppedFiles.length);

	// ============================================================
	// アクション
	// ============================================================

	/** プリセットを適用 */
	applyPreset(presetId: PresetId): void {
		const preset = PRESETS[presetId];
		if (!preset) return;

		this.selectedPreset = presetId;

		// プリセットのデフォルト値をディープコピーして適用
		this.options = structuredClone(preset.defaults) as FFmpegOptions;

		// D&Dファイルがある場合、ファイル名を反映
		if (this.droppedFiles.length === 1) {
			const file = this.droppedFiles[0];
			this.options.input.filename = file.name;

			// 出力ファイル名を入力ファイル名ベースで生成
			const outputExt = getExtension(preset.defaults.output?.filename ?? '');
			if (outputExt) {
				this.options.output.filename = replaceExtension(file.name, outputExt);
			}
		}
	}

	/** オプションをリセット */
	resetOptions(): void {
		this.options = createDefaultOptions();
		this.selectedPreset = null;
	}

	/** D&Dファイルをセット */
	setDroppedFiles(files: FileInfo[]): void {
		this.droppedFiles = files;

		// 自動モード切替
		if (files.length === 0) {
			this.batchMode = false;
			this.originalAspectRatio = null;
		} else if (files.length === 1) {
			this.batchMode = false;
			const file = files[0];
			// 単一ファイルの場合、入力ファイル名を自動反映
			this.options.input.filename = file.name;
			// プリセットが選択されている場合、出力ファイル名も更新
			if (this.selectedPreset) {
				const preset = PRESETS[this.selectedPreset];
				const outputExt = getExtension(preset.defaults.output?.filename ?? '');
				if (outputExt) {
					this.options.output.filename = replaceExtension(file.name, outputExt);
				}
			}
			// ディメンション情報をスケールに反映
			if (file.width && file.height) {
				this.originalAspectRatio = file.width / file.height;
				if (!this.options.filter.scale) {
					this.options.filter.scale = {};
				}
				this.options.filter.scale.width = file.width;
				this.options.filter.scale.height = file.height;
				this.options = { ...this.options };
			} else {
				this.originalAspectRatio = null;
			}
		} else {
			this.batchMode = true;
			this.originalAspectRatio = null;
		}
	}

	/** ドロップファイルをクリア */
	clearDroppedFiles(): void {
		this.droppedFiles = [];
		this.batchMode = false;
		this.originalAspectRatio = null;
	}

	/** オプションの一部を更新（ネストしたパスに対応） */
	updateOption(path: string, value: unknown): void {
		// ディープコピーでリアクティビティを確実に発火させる
		// Note: $state Proxy は structuredClone 不可のため JSON 経由でコピー
		const newOptions = JSON.parse(JSON.stringify(this.options)) as FFmpegOptions;
		const keys = path.split('.');
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let obj: any = newOptions;

		for (let i = 0; i < keys.length - 1; i++) {
			if (obj[keys[i]] === undefined) {
				obj[keys[i]] = {};
			}
			obj = obj[keys[i]];
		}

		obj[keys[keys.length - 1]] = value;
		this.options = newOptions;
	}
}

// ============================================================
// ユーティリティ
// ============================================================

function getExtension(filename: string): string {
	const parts = filename.split('.');
	return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

function replaceExtension(filename: string, newExt: string): string {
	const parts = filename.split('.');
	if (parts.length > 1) {
		parts[parts.length - 1] = newExt;
		return parts.join('.');
	}
	return `${filename}.${newExt}`;
}

// ============================================================
// シングルトンインスタンス
// ============================================================

export const commandStore = new CommandStore();
