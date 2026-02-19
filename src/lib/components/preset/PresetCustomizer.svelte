<!--
  PresetCustomizer.svelte — プリセットのカスタマイズフォーム

  選択されたプリセットの編集可能フィールドをフォーム表示。
  値変更でストアをリアルタイム更新 → コマンドが即座に再生成。
-->
<script lang="ts">
	import { t } from '$lib/i18n';
	import { commandStore } from '$lib/stores/command.svelte';
	import { PRESETS } from '$lib/ffmpeg/presets';
	import {
		SVT_AV1_DEFAULTS,
		H264_DEFAULTS,
		WEBP_DEFAULTS,
		VIDEO_CODEC_LABELS,
		AUDIO_CODEC_LABELS,
		CODEC_FORMAT_COMPAT,
		NON_DEFAULT_VIDEO_CODECS,
		NON_DEFAULT_AUDIO_CODECS
	} from '$lib/ffmpeg/codecs';
	import type { VideoCodec, AudioCodec } from '$lib/ffmpeg/types';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import { Separator } from '$lib/components/ui/separator';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import LockIcon from '@lucide/svelte/icons/lock';
	import UnlockIcon from '@lucide/svelte/icons/lock-open';

	const preset = $derived(
		commandStore.selectedPreset ? PRESETS[commandStore.selectedPreset] : null
	);

	const editableFields = $derived(preset?.editableFields ?? []);

	// CRFの範囲はコーデックによって異なる
	const crfRange = $derived.by(() => {
		const codec = commandStore.options.video.codec;
		if (codec === 'libsvtav1') return SVT_AV1_DEFAULTS.crfRange;
		return H264_DEFAULTS.crfRange;
	});

	// バッチモード時はスケールを無効化
	const scaleDisabled = $derived(commandStore.batchMode);

	// 音声ビットレートの選択肢
	const AUDIO_BITRATE_OPTIONS = ['64k', '96k', '128k', '160k', '192k', '256k', '320k'];

	// 現在のコーデックに対応するフォーマット
	const availableFormats = $derived.by(() => {
		const videoCodec = commandStore.options.video.codec;
		const audioCodec = commandStore.options.audio.codec;
		const codec = videoCodec ?? audioCodec;
		if (!codec) return [];
		return CODEC_FORMAT_COMPAT[codec] ?? [];
	});

	// リアクティブにオプション全体を追跡し、getOptionValueの再評価を保証
	const currentOptions = $derived(commandStore.options);

	/** ネストしたパスから値を取得 */
	function getOptionValue(path: string): unknown {
		const keys = path.split('.');
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let obj: any = currentOptions;
		for (const key of keys) {
			if (obj === undefined || obj === null) return undefined;
			obj = obj[key];
		}
		return obj;
	}

	function handleInputChange(path: string, value: string) {
		commandStore.updateOption(path, value);
	}

	function handleNumberChange(path: string, value: number) {
		commandStore.updateOption(path, value);
	}

	function handleSliderChange(path: string, value: number) {
		commandStore.updateOption(path, value);
	}

	/** 幅変更時のアスペクト比連動 */
	function handleWidthChange(value: number) {
		commandStore.updateOption('filter.scale.width', value);
		if (commandStore.aspectRatioLocked && commandStore.originalAspectRatio) {
			const newHeight = Math.round(value / commandStore.originalAspectRatio);
			commandStore.updateOption('filter.scale.height', newHeight);
		}
	}

	/** 高さ変更時のアスペクト比連動 */
	function handleHeightChange(value: number) {
		commandStore.updateOption('filter.scale.height', value);
		if (commandStore.aspectRatioLocked && commandStore.originalAspectRatio) {
			const newWidth = Math.round(value * commandStore.originalAspectRatio);
			commandStore.updateOption('filter.scale.width', newWidth);
		}
	}

	/** アスペクト比ロックの切り替え */
	function toggleAspectLock() {
		commandStore.aspectRatioLocked = !commandStore.aspectRatioLocked;
	}

	/** コーデック変更時に出力フォーマットを自動調整 */
	function handleCodecChange(codecField: string, codec: string) {
		commandStore.updateOption(codecField, codec);

		// コーデック変更時、互換性のあるフォーマットに自動調整
		const compatFormats = CODEC_FORMAT_COMPAT[codec];
		if (compatFormats && compatFormats.length > 0) {
			const currentFilename = commandStore.options.output.filename;
			const currentExt = currentFilename.split('.').pop()?.toLowerCase() ?? '';
			if (!compatFormats.includes(currentExt)) {
				// 現在の拡張子が非互換なら、最初の互換フォーマットに変更
				const newExt = compatFormats[0];
				const parts = currentFilename.split('.');
				if (parts.length > 1) {
					parts[parts.length - 1] = newExt;
					commandStore.updateOption('output.filename', parts.join('.'));
				}
			}
		}
	}

	/** 出力フォーマット変更時にファイル名を更新 */
	function handleFormatChange(format: string) {
		const currentFilename = commandStore.options.output.filename;
		const parts = currentFilename.split('.');
		if (parts.length > 1) {
			parts[parts.length - 1] = format;
			commandStore.updateOption('output.filename', parts.join('.'));
		}
	}

	/** 現在の出力フォーマット（リアクティブ） */
	const currentFormat = $derived(
		currentOptions.output.filename.split('.').pop()?.toLowerCase() ?? ''
	);
</script>

{#if preset}
	<div class="space-y-4 rounded-lg border border-border bg-card p-4">
		<h4 class="text-sm font-semibold">{$t('common.settings')}</h4>
		<Separator />

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{#each editableFields as field (field)}
				<div class="space-y-1.5">
					<!-- ファイル名フィールド -->
					{#if field === 'input.filename'}
						<Label for={field}>{$t('form.inputFilename')}</Label>
						<Input
							id={field}
							value={String(getOptionValue(field) ?? '')}
							oninput={(e) => handleInputChange(field, (e.target as HTMLInputElement).value)}
						/>
					{:else if field === 'output.filename'}
						<Label for={field}>{$t('form.outputFilename')}</Label>
						<Input
							id={field}
							value={String(getOptionValue(field) ?? '')}
							oninput={(e) => handleInputChange(field, (e.target as HTMLInputElement).value)}
						/>

					<!-- 出力フォーマット（コンテナ） -->
					{:else if field === 'output.format'}
						<Label for={field}>{$t('form.format')}</Label>
						<Select.Root
							type="single"
							value={currentFormat}
							onValueChange={(v) => { if (v) handleFormatChange(v); }}
						>
							<Select.Trigger class="w-full">
								{currentFormat || '—'}
							</Select.Trigger>
							<Select.Content>
								{#each availableFormats as fmt (fmt)}
									<Select.Item value={fmt}>.{fmt}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>

					<!-- 映像コーデック -->
					{:else if field === 'video.codec'}
						<Label for={field}>{$t('form.videoCodec')}</Label>
						<Select.Root
							type="single"
							value={String(getOptionValue(field) ?? '')}
							onValueChange={(v) => { if (v) handleCodecChange(field, v); }}
						>
							<Select.Trigger class="w-full">
								{VIDEO_CODEC_LABELS[getOptionValue(field) as VideoCodec] ?? String(getOptionValue(field) ?? '—')}
							</Select.Trigger>
							<Select.Content>
								{#each Object.entries(VIDEO_CODEC_LABELS) as [value, label] (value)}
									<Select.Item {value}>{label}{NON_DEFAULT_VIDEO_CODECS.has(value) ? ' *' : ''}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						{#if NON_DEFAULT_VIDEO_CODECS.has(String(getOptionValue(field) ?? ''))}
							<p class="text-xs text-amber-600 dark:text-amber-400">
								{$t('form.codecRequiresLib')}
							</p>
						{/if}

					<!-- 音声コーデック -->
					{:else if field === 'audio.codec'}
						<Label for={field}>{$t('form.audioCodec')}</Label>
						<Select.Root
							type="single"
							value={String(getOptionValue(field) ?? '')}
							onValueChange={(v) => { if (v) handleCodecChange(field, v); }}
						>
							<Select.Trigger class="w-full">
								{AUDIO_CODEC_LABELS[getOptionValue(field) as AudioCodec] ?? String(getOptionValue(field) ?? '—')}
							</Select.Trigger>
							<Select.Content>
								{#each Object.entries(AUDIO_CODEC_LABELS) as [value, label] (value)}
									<Select.Item {value}>{label}{NON_DEFAULT_AUDIO_CODECS.has(value) ? ' *' : ''}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						{#if NON_DEFAULT_AUDIO_CODECS.has(String(getOptionValue(field) ?? ''))}
							<p class="text-xs text-amber-600 dark:text-amber-400">
								{$t('form.codecRequiresLib')}
							</p>
						{/if}

					<!-- CRFスライダー -->
					{:else if field === 'video.crf'}
						<Label for={field}>
							{$t('form.crf')}: {getOptionValue(field) ?? 0}
						</Label>
						<Slider
							type="single"
							value={Number(getOptionValue(field) ?? 30)}
							min={crfRange.min}
							max={crfRange.max}
							step={1}
							onValueChange={(v: number) => handleSliderChange(field, v)}
						/>
						<p class="text-xs text-muted-foreground">
							{crfRange.min} ({$t('form.crfBest')}) — {crfRange.max} ({$t('form.crfWorst')})
						</p>

					<!-- WebP Qualityスライダー -->
					{:else if field === 'video.quality'}
						<Label for={field}>
							{$t('form.quality')}: {getOptionValue(field) ?? 75}
						</Label>
						<Slider
							type="single"
							value={Number(getOptionValue(field) ?? 75)}
							min={WEBP_DEFAULTS.qualityRange.min}
							max={WEBP_DEFAULTS.qualityRange.max}
							step={1}
							onValueChange={(v: number) => handleSliderChange(field, v)}
						/>
						<p class="text-xs text-muted-foreground">
							0 ({$t('form.crfWorst')}) — 100 ({$t('form.crfBest')})
						</p>

					<!-- SVT-AV1 プリセットスライダー -->
					{:else if field === 'video.svtav1Preset'}
						<Label for={field}>
							{$t('form.encoderSpeed')}: {getOptionValue(field) ?? 6}
						</Label>
						<Slider
							type="single"
							value={Number(getOptionValue(field) ?? 6)}
							min={SVT_AV1_DEFAULTS.presetRange.min}
							max={SVT_AV1_DEFAULTS.presetRange.max}
							step={1}
							onValueChange={(v: number) => handleSliderChange(field, v)}
						/>
						<p class="text-xs text-muted-foreground">
							0 ({$t('form.slowest')}) — 13 ({$t('form.fastest')})
						</p>

					<!-- 音声ビットレート（ドロップダウン） -->
					{:else if field === 'audio.bitrate'}
						<Label for={field}>{$t('form.audioBitrate')}</Label>
						<Select.Root
							type="single"
							value={String(getOptionValue(field) ?? '128k')}
							onValueChange={(v) => { if (v) handleInputChange(field, v); }}
						>
							<Select.Trigger class="w-full">
								{String(getOptionValue(field) ?? '128k')}
							</Select.Trigger>
							<Select.Content>
								{#each AUDIO_BITRATE_OPTIONS as rate (rate)}
									<Select.Item value={rate}>{rate}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>

					<!-- スケール（幅） + アスペクト比ロック -->
					{:else if field === 'filter.scale.width'}
						<div class="flex items-end gap-2">
							<div class="flex-1 space-y-1.5">
								<Label for={field}>{$t('form.scaleWidth')}</Label>
								<Input
									id={field}
									type="number"
									value={String(getOptionValue(field) ?? '')}
									placeholder="-1"
									disabled={scaleDisabled}
									oninput={(e) => {
										const v = parseInt((e.target as HTMLInputElement).value);
										handleWidthChange(isNaN(v) ? -1 : v);
									}}
								/>
							</div>
							<Button
								variant="ghost"
								size="sm"
								class="h-9 w-9 p-0"
								onclick={toggleAspectLock}
								disabled={scaleDisabled}
								title={commandStore.aspectRatioLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
							>
								{#if commandStore.aspectRatioLocked}
									<LockIcon size={14} />
								{:else}
									<UnlockIcon size={14} />
								{/if}
							</Button>
						</div>
					{:else if field === 'filter.scale.height'}
						<Label for={field}>{$t('form.scaleHeight')}</Label>
						<Input
							id={field}
							type="number"
							value={String(getOptionValue(field) ?? '')}
							placeholder="-1"
							disabled={scaleDisabled}
							oninput={(e) => {
								const v = parseInt((e.target as HTMLInputElement).value);
								handleHeightChange(isNaN(v) ? -1 : v);
							}}
						/>

					<!-- 時刻 -->
					{:else if field === 'input.startTime' || field === 'misc.endTime'}
						<Label for={field}>
							{field === 'input.startTime' ? $t('form.startTime') : $t('form.endTime')}
						</Label>
						<Input
							id={field}
							value={String(getOptionValue(field) ?? '')}
							placeholder="00:00:00"
							oninput={(e) => handleInputChange(field, (e.target as HTMLInputElement).value)}
						/>

					<!-- 持続時間 -->
					{:else if field === 'misc.duration'}
						<Label for={field}>{$t('form.duration')}</Label>
						<Input
							id={field}
							value={String(getOptionValue(field) ?? '')}
							placeholder="00:00:30"
							oninput={(e) => handleInputChange(field, (e.target as HTMLInputElement).value)}
						/>

					<!-- FPS -->
					{:else if field === 'filter.fps'}
						<Label for={field}>{$t('form.framerate')}</Label>
						<Input
							id={field}
							type="number"
							value={String(getOptionValue(field) ?? '')}
							placeholder="10"
							oninput={(e) => {
								const v = parseInt((e.target as HTMLInputElement).value);
								if (!isNaN(v)) handleNumberChange(field, v);
							}}
						/>

					<!-- 汎用テキスト -->
					{:else}
						<Label for={field}>{field}</Label>
						<Input
							id={field}
							value={String(getOptionValue(field) ?? '')}
							oninput={(e) => handleInputChange(field, (e.target as HTMLInputElement).value)}
						/>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}
