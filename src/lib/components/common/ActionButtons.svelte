<!--
  ActionButtons.svelte — アクションボタン群

  FFmpegの導入 / 実行方法 / ライブラリの追加 の3ボタンを表示。
  モーダルは含まず、コールバック経由で親コンポーネントに通知する。
-->
<script lang="ts">
	import { t } from '$lib/i18n';
	import { Button } from '$lib/components/ui/button';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import InfoIcon from '@lucide/svelte/icons/info';
	import PackagePlusIcon from '@lucide/svelte/icons/package-plus';

	let {
		onInstallGuide,
		onPathGuide,
		onLibraryGuide,
		variant = 'default'
	}: {
		onInstallGuide: () => void;
		onPathGuide: () => void;
		onLibraryGuide: () => void;
		variant?: 'default' | 'mobile';
	} = $props();
</script>

{#if variant === 'mobile'}
	<div class="flex items-center justify-center gap-2">
		<Button variant="default" size="sm" class="flex-1" onclick={onInstallGuide}>
			<DownloadIcon size={14} class="mr-1" />
			{$t('actionButtons.installFfmpeg')}
		</Button>
		<Button variant="default" size="sm" class="flex-1" onclick={onPathGuide}>
			<InfoIcon size={14} class="mr-1" />
			{$t('actionButtons.howToRun')}
		</Button>
		<Button variant="default" size="sm" class="flex-1" onclick={onLibraryGuide}>
			<PackagePlusIcon size={14} class="mr-1" />
			{$t('actionButtons.addLibrary')}
		</Button>
	</div>
{:else}
	<div class="flex items-center justify-center gap-2">
		<Button variant="outline" size="sm" onclick={onInstallGuide}>
			<DownloadIcon size={14} class="mr-1" />
			{$t('actionButtons.installFfmpeg')}
		</Button>
		<Button variant="outline" size="sm" onclick={onPathGuide}>
			<InfoIcon size={14} class="mr-1" />
			{$t('actionButtons.howToRun')}
		</Button>
		<Button variant="outline" size="sm" onclick={onLibraryGuide}>
			<PackagePlusIcon size={14} class="mr-1" />
			{$t('actionButtons.addLibrary')}
		</Button>
	</div>
{/if}
