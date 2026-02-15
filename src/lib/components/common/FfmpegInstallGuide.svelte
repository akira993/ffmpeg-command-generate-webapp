<!--
  FfmpegInstallGuide.svelte — FFmpegインストールガイドモーダル

  初めて使うユーザー向けに、OS別のFFmpegインストール手順を案内する。
  「実行方法」モーダルからの導線、および単独ボタンとして使用可能。
-->
<script lang="ts">
	import { t } from '$lib/i18n';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import TerminalIcon from '@lucide/svelte/icons/terminal';
	import CheckCircleIcon from '@lucide/svelte/icons/circle-check';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';

	let open = $state(false);

	/** 外部から開くためのエクスポート */
	export function show() {
		open = true;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button variant="outline" size="sm" {...props} data-install-guide-trigger>
				<DownloadIcon size={14} class="mr-1" />
				{$t('installGuide.buttonLabel')}
			</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content class="max-h-[85vh] max-w-2xl overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>{$t('installGuide.title')}</Dialog.Title>
			<Dialog.Description>
				{$t('installGuide.description')}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-5 py-2">
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
							{$t('installGuide.mac.homebrewTitle')}
						</h4>
						<p class="text-xs text-muted-foreground">{$t('installGuide.mac.homebrewDesc')}</p>
						<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
							/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
						</code>

						<h4 class="flex items-center gap-2 pt-2 text-sm font-semibold">
							<DownloadIcon size={16} />
							{$t('installGuide.mac.installTitle')}
						</h4>
						<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
							brew install ffmpeg
						</code>
					</div>
				</Tabs.Content>

				<!-- Windows -->
				<Tabs.Content value="windows" class="mt-4 space-y-3">
					<div class="space-y-3">
						<h4 class="flex items-center gap-2 text-sm font-semibold">
							<TerminalIcon size={16} />
							{$t('installGuide.windows.wingetTitle')}
						</h4>
						<p class="text-xs text-muted-foreground">{$t('installGuide.windows.wingetDesc')}</p>
						<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
							winget install Gyan.FFmpeg
						</code>

						<h4 class="flex items-center gap-2 pt-2 text-sm font-semibold">
							<TerminalIcon size={16} />
							{$t('installGuide.windows.chocoTitle')}
						</h4>
						<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
							choco install ffmpeg
						</code>

						<h4 class="flex items-center gap-2 pt-2 text-sm font-semibold">
							<DownloadIcon size={16} />
							{$t('installGuide.windows.manualTitle')}
						</h4>
						<p class="text-xs text-muted-foreground">{$t('installGuide.windows.manualDesc')}</p>
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
							Ubuntu / Debian
						</h4>
						<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
							sudo apt update && sudo apt install ffmpeg
						</code>

						<h4 class="flex items-center gap-2 pt-2 text-sm font-semibold">
							<TerminalIcon size={16} />
							Fedora
						</h4>
						<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
							sudo dnf install ffmpeg
						</code>

						<h4 class="flex items-center gap-2 pt-2 text-sm font-semibold">
							<TerminalIcon size={16} />
							Arch Linux
						</h4>
						<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
							sudo pacman -S ffmpeg
						</code>
					</div>
				</Tabs.Content>
			</Tabs.Root>

			<!-- インストール確認 -->
			<div class="rounded-md bg-muted/50 p-3">
				<h4 class="mb-2 flex items-center gap-2 text-sm font-medium">
					<CheckCircleIcon size={16} />
					{$t('installGuide.verifyTitle')}
				</h4>
				<p class="mb-2 text-xs text-muted-foreground">
					{$t('installGuide.verifyDesc')}
				</p>
				<code class="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
					ffmpeg -version
				</code>
			</div>

			<!-- 公式サイトへのリンク -->
			<div class="flex items-center justify-between rounded-md border border-border p-3">
				<p class="text-xs text-muted-foreground">
					{$t('installGuide.officialSite')}
				</p>
				<a
					href="https://ffmpeg.org/download.html"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
				>
					ffmpeg.org
					<ExternalLinkIcon size={12} />
				</a>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
