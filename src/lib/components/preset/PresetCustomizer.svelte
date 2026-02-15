<!--
  PresetCustomizer.svelte — プリセットのカスタマイズフォーム

  選択されたプリセットの編集可能フィールドをフォーム表示。
  値変更でストアをリアルタイム更新 → コマンドが即座に再生成。
-->
<script lang="ts">
	import { t } from '$lib/i18n';
	import { commandStore } from '$lib/stores/command.svelte';
	import { PRESETS } from '$lib/ffmpeg/presets';
	import { AVIF_DEFAULTS, SVT_AV1_DEFAULTS, H264_DEFAULTS, WEBP_DEFAULTS } from '$lib/ffmpeg/codecs';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import { Separator } from '$lib/components/ui/separator';

	const preset = $derived(
		commandStore.selectedPreset ? PRESETS[commandStore.selectedPreset] : null
	);

	const editableFields = $derived(preset?.editableFields ?? []);

	// CRFの範囲はコーデックによって異なる
	const crfRange = $derived.by(() => {
		const codec = commandStore.options.video.codec;
		if (codec === 'libaom-av1') return AVIF_DEFAULTS.crfRange;
		if (codec === 'libsvtav1') return SVT_AV1_DEFAULTS.crfRange;
		return H264_DEFAULTS.crfRange;
	});

	/** ネストしたパスから値を取得 */
	function getOptionValue(path: string): unknown {
		const keys = path.split('.');
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let obj: any = commandStore.options;
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

	function handleSliderChange(path: string, values: number[]) {
		if (values.length > 0) {
			commandStore.updateOption(path, values[0]);
		}
	}
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

					<!-- CRFスライダー -->
					{:else if field === 'video.crf'}
						<Label for={field}>
							{$t('form.crf')}: {getOptionValue(field) ?? 0}
						</Label>
						<Slider
							type="single"
							value={[Number(getOptionValue(field) ?? 30)]}
							min={crfRange.min}
							max={crfRange.max}
							step={1}
							onValueChange={(v: number[]) => handleSliderChange(field, v)}
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
							value={[Number(getOptionValue(field) ?? 75)]}
							min={WEBP_DEFAULTS.qualityRange.min}
							max={WEBP_DEFAULTS.qualityRange.max}
							step={1}
							onValueChange={(v: number[]) => handleSliderChange(field, v)}
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
							value={[Number(getOptionValue(field) ?? 6)]}
							min={SVT_AV1_DEFAULTS.presetRange.min}
							max={SVT_AV1_DEFAULTS.presetRange.max}
							step={1}
							onValueChange={(v: number[]) => handleSliderChange(field, v)}
						/>
						<p class="text-xs text-muted-foreground">
							0 ({$t('form.slowest')}) — 13 ({$t('form.fastest')})
						</p>

					<!-- 音声ビットレート -->
					{:else if field === 'audio.bitrate'}
						<Label for={field}>{$t('form.audioBitrate')}</Label>
						<Input
							id={field}
							value={String(getOptionValue(field) ?? '')}
							placeholder="128k"
							oninput={(e) => handleInputChange(field, (e.target as HTMLInputElement).value)}
						/>

					<!-- スケール -->
					{:else if field === 'filter.scale.width'}
						<Label for={field}>{$t('form.scaleWidth')}</Label>
						<Input
							id={field}
							type="number"
							value={String(getOptionValue(field) ?? '')}
							placeholder="-1"
							oninput={(e) => {
								const v = parseInt((e.target as HTMLInputElement).value);
								handleNumberChange(field, isNaN(v) ? -1 : v);
							}}
						/>
					{:else if field === 'filter.scale.height'}
						<Label for={field}>{$t('form.scaleHeight')}</Label>
						<Input
							id={field}
							type="number"
							value={String(getOptionValue(field) ?? '')}
							placeholder="-1"
							oninput={(e) => {
								const v = parseInt((e.target as HTMLInputElement).value);
								handleNumberChange(field, isNaN(v) ? -1 : v);
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
