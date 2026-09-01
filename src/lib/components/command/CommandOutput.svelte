<!--
  CommandOutput.svelte — 生成されたコマンドの表示・コピーエリア

  機能:
  - 個別コマンド表示（通常モード）
  - 一括処理スクリプト表示（バッチモード）— Bash / PowerShell / cmd タブ切り替え
  - ワンクリックコピー
-->
<script lang="ts">
	import { t } from '$lib/i18n';
	import { commandStore } from '$lib/stores/command.svelte';
	import type { ScriptType } from '$lib/ffmpeg/types';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import InfoIcon from '@lucide/svelte/icons/info';
	import {
		PRESETS,
		CWEBP_DIRECT_EXTENSIONS,
		CWEBP_PREPROCESS_EXTENSIONS,
		CWEBP_GIF_EXTENSIONS,
		getFileExtension,
		getValidatedOutputExtension,
		inferBatchOptions,
		resolveBatchInputExtensions
	} from '$lib/ffmpeg/presets';

	let copied = $state(false);

	/** WebP プリセット時は cwebp を使用 */
	const isCwebpMode = $derived(commandStore.selectedPreset === 'image-webp');

	/**
	 * cwebp モード時、入力形式に応じてどの経路の注記を出すか
	 * （① 直接 cwebp / ② ffmpeg 前処理経路 / ③ gif2webp 経路）
	 * ③ のみのときは cwebp を一切使わないため「cwebp を使用します」の注記を出さない
	 */
	const cwebpRoutes = $derived.by(() => {
		if (!isCwebpMode) return { direct: false, preprocess: false, gif: false };

		if (!commandStore.batchMode) {
			const ext = (getFileExtension(commandStore.options.input.filename) ?? '').toLowerCase();
			return {
				direct: CWEBP_DIRECT_EXTENSIONS.includes(ext),
				preprocess: CWEBP_PREPROCESS_EXTENSIONS.includes(ext),
				gif: CWEBP_GIF_EXTENSIONS.includes(ext)
			};
		}

		if (!commandStore.selectedPreset) return { direct: false, preprocess: false, gif: false };
		const outputExtension = getValidatedOutputExtension(commandStore.options.output.filename);
		if (!outputExtension) return { direct: false, preprocess: false, gif: false };

		const allowedExtensions = new Set(
			resolveBatchInputExtensions(
				inferBatchOptions(PRESETS[commandStore.selectedPreset]),
				outputExtension
			)
		);

		let direct = false;
		let preprocess = false;
		let gif = false;
		for (const file of commandStore.droppedFiles) {
			const ext = getFileExtension(file.name);
			if (!ext || !allowedExtensions.has(ext)) continue;
			if (CWEBP_DIRECT_EXTENSIONS.includes(ext)) direct = true;
			if (CWEBP_PREPROCESS_EXTENSIONS.includes(ext)) preprocess = true;
			if (CWEBP_GIF_EXTENSIONS.includes(ext)) gif = true;
		}
		return { direct, preprocess, gif };
	});

	/** 表示中のコマンド文字列 */
	const displayCommand = $derived(
		commandStore.batchMode
			? commandStore.activeBatchScript ?? ''
			: commandStore.commandString
	);

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(displayCommand);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			// フォールバック: 旧方式
			const textarea = document.createElement('textarea');
			textarea.value = displayCommand;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		}
	}

	function handleScriptTypeChange(value: string) {
		commandStore.activeScriptType = value as ScriptType;
	}
</script>

<div class="w-full space-y-3">
	<!-- ヘッダー -->
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-semibold">
			{$t('command.generated')}
		</h3>
		<Button
			variant={copied ? 'default' : 'outline'}
			size="sm"
			onclick={copyToClipboard}
			disabled={!displayCommand}
		>
			{copied ? `✓ ${$t('common.copied')}` : $t('common.copy')}
		</Button>
	</div>

	<!-- バッチモード: タブ切り替え -->
	{#if commandStore.batchMode}
		<Tabs.Root value={commandStore.activeScriptType} onValueChange={handleScriptTypeChange}>
			<Tabs.List class="grid w-full grid-cols-3">
				<Tabs.Trigger value="bash">Bash</Tabs.Trigger>
				<Tabs.Trigger value="powershell">PowerShell</Tabs.Trigger>
				<Tabs.Trigger value="cmd">cmd</Tabs.Trigger>
			</Tabs.List>
		</Tabs.Root>
	{/if}

	<!-- cwebp 使用時の注記 -->
	{#if isCwebpMode && displayCommand}
		<div class="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
			<InfoIcon size={14} class="mt-0.5 shrink-0 text-primary" />
			<div class="text-xs">
				{#if cwebpRoutes.direct || cwebpRoutes.preprocess}
					<p class="font-medium text-primary">{$t('command.cwebpNote')}</p>
				{/if}
				<p class="mt-1 text-muted-foreground">
					<code class="rounded bg-muted px-1 py-0.5 font-mono">{$t('command.cwebpInstallMac')}</code>
					<span class="mx-1">/</span>
					<code class="rounded bg-muted px-1 py-0.5 font-mono">{$t('command.cwebpInstallLinux')}</code>
				</p>
				{#if cwebpRoutes.preprocess}
					<p class="mt-1 text-muted-foreground">{$t('command.cwebpPreprocessNote')}</p>
				{/if}
				{#if cwebpRoutes.gif}
					<p class="mt-1 text-muted-foreground">{$t('command.cwebpGifNote')}</p>
				{/if}
			</div>
		</div>
	{/if}

	<!-- コマンド表示エリア -->
	<div
		class="relative min-h-[5rem] rounded-md border border-border bg-muted/30 p-4"
	>
		{#if displayCommand}
			<pre class="whitespace-pre-wrap break-all font-mono text-sm leading-relaxed">{displayCommand}</pre>
		{:else}
			<p class="text-sm text-muted-foreground">
				{$t('command.empty')}
			</p>
		{/if}
	</div>
</div>
