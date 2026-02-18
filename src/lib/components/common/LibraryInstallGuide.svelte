<!--
  LibraryInstallGuide.svelte — 追加ライブラリインストールガイドモーダル

  FFmpegのデフォルトビルドに含まれない追加コーデックライブラリの
  インストール方法をOS別に案内する。
-->
<script lang="ts">
	import { t } from '$lib/i18n';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import PackagePlusIcon from '@lucide/svelte/icons/package-plus';
	import TerminalIcon from '@lucide/svelte/icons/terminal';
	import CheckCircleIcon from '@lucide/svelte/icons/circle-check';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';

	let {
		open = $bindable(false),
		showTrigger = true
	}: {
		open?: boolean;
		showTrigger?: boolean;
	} = $props();

	/** ライブラリ一覧テーブルデータ */
	const libraries = [
		{ codec: 'H.265/HEVC', library: 'libx265', use: 'video' },
		{ codec: 'VP8', library: 'libvpx', use: 'video' },
		{ codec: 'VP9', library: 'libvpx-vp9', use: 'video' },
		{ codec: 'AV1 (slow)', library: 'libaom-av1', use: 'video' },
		{ codec: 'AV1 (fast)', library: 'libsvtav1', use: 'video' },
		{ codec: 'WebP', library: 'libwebp', use: 'image' },
		{ codec: 'MP3', library: 'libmp3lame', use: 'audio' },
		{ codec: 'Opus', library: 'libopus', use: 'audio' },
		{ codec: 'Vorbis', library: 'libvorbis', use: 'audio' }
	] as const;
</script>

<Dialog.Root bind:open>
	{#if showTrigger}
		<Dialog.Trigger>
			{#snippet child({ props })}
				<Button variant="outline" size="sm" {...props}>
					<PackagePlusIcon size={14} class="mr-1" />
					{$t('libraryGuide.buttonLabel')}
				</Button>
			{/snippet}
		</Dialog.Trigger>
	{/if}
	<Dialog.Content class="max-h-[90vh] max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>{$t('libraryGuide.title')}</Dialog.Title>
			<Dialog.Description>
				{$t('libraryGuide.description')}
			</Dialog.Description>
		</Dialog.Header>

		<div class="max-h-[70vh] space-y-5 overflow-y-auto py-2">
			<!-- OS別タブ -->
			<Tabs.Root value="mac">
				<Tabs.List class="grid w-full grid-cols-3">
					<Tabs.Trigger value="mac">macOS</Tabs.Trigger>
					<Tabs.Trigger value="windows">Windows</Tabs.Trigger>
					<Tabs.Trigger value="linux">Linux</Tabs.Trigger>
				</Tabs.List>

				<!-- macOS -->
				<Tabs.Content value="mac" class="mt-4 space-y-3">
					<div class="space-y-3">
						<h4 class="flex items-center gap-2 text-sm font-semibold">
							<TerminalIcon size={16} />
							{$t('libraryGuide.mac.title')}
						</h4>
						<p class="text-xs text-muted-foreground">{$t('libraryGuide.mac.desc')}</p>

						<h4 class="flex items-center gap-2 pt-2 text-sm font-semibold">
							<DownloadIcon size={16} />
							{$t('libraryGuide.mac.reinstallTitle')}
						</h4>
						<p class="text-xs text-muted-foreground">{$t('libraryGuide.mac.reinstallDesc')}</p>
						<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
							{$t('libraryGuide.mac.reinstallCmd')}
						</code>
					</div>
				</Tabs.Content>

				<!-- Windows -->
				<Tabs.Content value="windows" class="mt-4 space-y-3">
					<div class="space-y-3">
						<h4 class="flex items-center gap-2 text-sm font-semibold">
							<TerminalIcon size={16} />
							{$t('libraryGuide.windows.title')}
						</h4>
						<p class="text-xs text-muted-foreground">{$t('libraryGuide.windows.desc')}</p>

						<h4 class="flex items-center gap-2 pt-2 text-sm font-semibold">
							<DownloadIcon size={16} />
							{$t('libraryGuide.windows.fullBuildTitle')}
						</h4>
						<p class="text-xs text-muted-foreground">{$t('libraryGuide.windows.fullBuildDesc')}</p>
						<a
							href="https://www.gyan.dev/ffmpeg/builds/"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
						>
							gyan.dev/ffmpeg/builds
							<ExternalLinkIcon size={12} />
						</a>
					</div>
				</Tabs.Content>

				<!-- Linux -->
				<Tabs.Content value="linux" class="mt-4 space-y-3">
					<div class="space-y-3">
						<h4 class="flex items-center gap-2 text-sm font-semibold">
							<TerminalIcon size={16} />
							{$t('libraryGuide.linux.title')}
						</h4>
						<p class="text-xs text-muted-foreground">{$t('libraryGuide.linux.desc')}</p>

						<h4 class="flex items-center gap-2 pt-2 text-sm font-semibold">
							<TerminalIcon size={16} />
							{$t('libraryGuide.linux.ubuntuTitle')}
						</h4>
						<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
							{$t('libraryGuide.linux.ubuntuCmd')}
						</code>

						<h4 class="flex items-center gap-2 pt-2 text-sm font-semibold">
							<TerminalIcon size={16} />
							{$t('libraryGuide.linux.fedoraTitle')}
						</h4>
						<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
							{$t('libraryGuide.linux.fedoraCmd')}
						</code>
					</div>
				</Tabs.Content>
			</Tabs.Root>

			<!-- ライブラリ確認方法 -->
			<div class="rounded-md bg-muted/50 p-3">
				<h4 class="mb-2 flex items-center gap-2 text-sm font-medium">
					<CheckCircleIcon size={16} />
					{$t('libraryGuide.verifyTitle')}
				</h4>
				<p class="mb-2 text-xs text-muted-foreground">
					{$t('libraryGuide.verifyDesc')}
				</p>
				<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
					{$t('libraryGuide.verifyCmd')}
				</code>
			</div>

			<!-- ライブラリ一覧テーブル -->
			<div class="space-y-2">
				<h4 class="text-sm font-medium">{$t('libraryGuide.tableTitle')}</h4>
				<div class="overflow-x-auto rounded-md border border-border">
					<table class="w-full text-xs">
						<thead>
							<tr class="border-b border-border bg-muted/50">
								<th class="px-3 py-2 text-left font-medium">{$t('libraryGuide.tableCodec')}</th>
								<th class="px-3 py-2 text-left font-medium">{$t('libraryGuide.tableLibrary')}</th>
								<th class="px-3 py-2 text-left font-medium">{$t('libraryGuide.tableUse')}</th>
							</tr>
						</thead>
						<tbody>
							{#each libraries as lib (lib.library)}
								<tr class="border-b border-border last:border-0">
									<td class="px-3 py-1.5">{lib.codec}</td>
									<td class="px-3 py-1.5 font-mono">{lib.library}</td>
									<td class="px-3 py-1.5 text-muted-foreground">{lib.use}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
