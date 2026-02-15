<!--
  CommandOutput.svelte — 生成されたコマンドの表示・コピーエリア

  機能:
  - 個別コマンド表示（通常モード）
  - 一括処理スクリプト表示（バッチモード）— Bash / PowerShell / cmd タブ切り替え
  - ワンクリックコピー
  - 実行方法ガイドモーダルへのリンク
-->
<script lang="ts">
	import { t } from '$lib/i18n';
	import { commandStore } from '$lib/stores/command.svelte';
	import type { ScriptType } from '$lib/ffmpeg/types';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import PathGuideModal from '$lib/components/common/PathGuideModal.svelte';
	import FfmpegInstallGuide from '$lib/components/common/FfmpegInstallGuide.svelte';

	let copied = $state(false);

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
		<div class="flex items-center gap-2">
			<FfmpegInstallGuide />
			<PathGuideModal />
			<Button
				variant={copied ? 'default' : 'outline'}
				size="sm"
				onclick={copyToClipboard}
				disabled={!displayCommand}
			>
				{copied ? `✓ ${$t('common.copied')}` : $t('common.copy')}
			</Button>
		</div>
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

	<!-- コマンド表示エリア -->
	<div
		class="relative min-h-[80px] rounded-md border border-border bg-muted/30 p-4"
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
