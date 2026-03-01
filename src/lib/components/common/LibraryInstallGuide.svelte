<!--
  LibraryInstallGuide.svelte — FFmpeg ライブラリ一覧 & インストールガイドモーダル

  FFmpegで使用されるエンコーダーライブラリの一覧（Homebrew同梱状況・公式リンク付き）と
  追加インストール方法をOS別に案内する。
-->
<script lang="ts">
	import { t, locale } from '$lib/i18n';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import PackagePlusIcon from '@lucide/svelte/icons/package-plus';
	import TerminalIcon from '@lucide/svelte/icons/terminal';
	import CheckCircleIcon from '@lucide/svelte/icons/circle-check';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import CircleXIcon from '@lucide/svelte/icons/circle-x';
	import CircleDotIcon from '@lucide/svelte/icons/circle-dot';

	let {
		open = $bindable(false),
		showTrigger = true
	}: {
		open?: boolean;
		showTrigger?: boolean;
	} = $props();

	/**
	 * ライブラリ一覧（使用頻度が高い順）
	 * homebrew: 'included' | 'not-included' | 'builtin' | 'separate'
	 */
	const libraries = [
		{
			codec: 'H.264',
			library: 'libx264',
			use: 'video',
			desc: { ja: '最も広く使われる動画エンコーダー', en: 'Most widely used video encoder' },
			homebrew: 'included' as const,
			url: 'https://www.videolan.org/developers/x264.html'
		},
		{
			codec: 'H.265/HEVC',
			library: 'libx265',
			use: 'video',
			desc: { ja: 'H.264の後継。高圧縮率', en: 'Successor to H.264. Better compression' },
			homebrew: 'included' as const,
			url: 'https://www.x265.org/'
		},
		{
			codec: 'AV1',
			library: 'libsvtav1',
			use: 'video/image',
			desc: { ja: '次世代コーデック。動画・AVIF両対応', en: 'Next-gen codec. Video & AVIF support' },
			homebrew: 'included' as const,
			url: 'https://gitlab.com/AOMediaCodec/SVT-AV1'
		},
		{
			codec: 'MP3',
			library: 'libmp3lame',
			use: 'audio',
			desc: { ja: '音声エンコード（MP3）', en: 'Audio encoding (MP3)' },
			homebrew: 'included' as const,
			url: 'https://lame.sourceforge.io/'
		},
		{
			codec: 'AAC',
			library: 'aac',
			use: 'audio',
			desc: { ja: '音声エンコード（ffmpeg内蔵）', en: 'Audio encoding (ffmpeg built-in)' },
			homebrew: 'builtin' as const,
			url: null
		},
		{
			codec: 'Opus',
			library: 'libopus',
			use: 'audio',
			desc: { ja: '高品質・低遅延の音声コーデック', en: 'High-quality, low-latency audio codec' },
			homebrew: 'included' as const,
			url: 'https://opus-codec.org/'
		},
		{
			codec: 'VP9',
			library: 'libvpx-vp9',
			use: 'video',
			desc: { ja: 'WebM動画エンコード', en: 'WebM video encoding' },
			homebrew: 'included' as const,
			url: 'https://www.webmproject.org/'
		},
		{
			codec: 'VP8',
			library: 'libvpx',
			use: 'video',
			desc: { ja: 'WebM動画エンコード（旧世代）', en: 'WebM video encoding (legacy)' },
			homebrew: 'included' as const,
			url: 'https://www.webmproject.org/'
		},
		{
			codec: 'WebP',
			library: 'cwebp',
			use: 'image',
			desc: { ja: '画像圧縮（Google公式ツール）', en: 'Image compression (Google official tool)' },
			homebrew: 'separate' as const,
			url: 'https://developers.google.com/speed/webp'
		},
		{
			codec: 'Vorbis',
			library: 'libvorbis',
			use: 'audio',
			desc: { ja: 'OGG音声エンコード', en: 'OGG audio encoding' },
			homebrew: 'not-included' as const,
			url: 'https://xiph.org/vorbis/'
		},
		{
			codec: 'FLAC',
			library: 'flac',
			use: 'audio',
			desc: { ja: 'ロスレス音声（ffmpeg内蔵）', en: 'Lossless audio (ffmpeg built-in)' },
			homebrew: 'builtin' as const,
			url: null
		},
		{
			codec: 'AAC (FDK)',
			library: 'libfdk_aac',
			use: 'audio',
			desc: { ja: '高品質AAC（ライセンス制約あり）', en: 'High-quality AAC (license restrictions)' },
			homebrew: 'not-included' as const,
			url: 'https://github.com/mstorsjo/fdk-aac'
		},
		{
			codec: 'AV1 (decode)',
			library: 'libdav1d',
			use: 'video',
			desc: { ja: 'AV1デコード専用（高速）', en: 'AV1 decoding only (fast)' },
			homebrew: 'included' as const,
			url: 'https://code.videolan.org/videolan/dav1d'
		}
	];

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
	<Dialog.Content class="max-h-[90vh] max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>{$t('libraryGuide.title')}</Dialog.Title>
			<Dialog.Description>
				{$t('libraryGuide.description')}
			</Dialog.Description>
		</Dialog.Header>

		<div class="max-h-[70vh] space-y-5 overflow-y-auto py-2">
			<!-- ライブラリ一覧テーブル（最初に表示） -->
			<div class="space-y-2">
				<h4 class="text-sm font-medium">{$t('libraryGuide.tableTitle')}</h4>
				<div class="overflow-x-auto rounded-md border border-border">
					<table class="w-full text-xs">
						<thead>
							<tr class="border-b border-border bg-muted/50">
								<th class="px-2.5 py-2 text-left font-medium">{$t('libraryGuide.tableCodec')}</th>
								<th class="px-2.5 py-2 text-left font-medium">{$t('libraryGuide.tableLibrary')}</th>
								<th class="hidden px-2.5 py-2 text-left font-medium sm:table-cell">{$t('libraryGuide.tableDescription')}</th>
								<th class="px-2.5 py-2 text-center font-medium">{$t('libraryGuide.tableHomebrew')}</th>
								<th class="px-2.5 py-2 text-center font-medium">{$t('libraryGuide.tableLink')}</th>
							</tr>
						</thead>
						<tbody>
							{#each libraries as lib (lib.library)}
								<tr class="border-b border-border last:border-0">
									<td class="px-2.5 py-1.5 font-medium">{lib.codec}</td>
									<td class="px-2.5 py-1.5 font-mono">{lib.library}</td>
									<td class="hidden px-2.5 py-1.5 text-muted-foreground sm:table-cell">{$locale === 'en' ? lib.desc.en : lib.desc.ja}</td>
									<td class="px-2.5 py-1.5 text-center">
										{#if lib.homebrew === 'included'}
											<span class="inline-flex items-center gap-1 text-emerald-500" title={$t('libraryGuide.included')}>
												<CircleCheckIcon size={14} />
											</span>
										{:else if lib.homebrew === 'builtin'}
											<span class="inline-flex items-center gap-1 text-blue-500" title={$t('libraryGuide.builtin')}>
												<CircleDotIcon size={14} />
											</span>
										{:else if lib.homebrew === 'separate'}
											<span class="inline-flex items-center gap-1 text-amber-500" title={$t('libraryGuide.separateInstall')}>
												<DownloadIcon size={14} />
											</span>
										{:else}
											<span class="inline-flex items-center gap-1 text-destructive" title={$t('libraryGuide.notIncluded')}>
												<CircleXIcon size={14} />
											</span>
										{/if}
									</td>
									<td class="px-2.5 py-1.5 text-center">
										{#if lib.url}
											<a
												href={lib.url}
												target="_blank"
												rel="noopener noreferrer"
												class="inline-flex items-center text-primary hover:text-primary/80"
												title={lib.url}
											>
												<ExternalLinkIcon size={14} />
											</a>
										{:else}
											<span class="text-muted-foreground">—</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<!-- 凡例 -->
				<div class="flex flex-wrap gap-3 text-xs text-muted-foreground">
					<span class="inline-flex items-center gap-1">
						<CircleCheckIcon size={12} class="text-emerald-500" />
						{$t('libraryGuide.included')}
					</span>
					<span class="inline-flex items-center gap-1">
						<CircleDotIcon size={12} class="text-blue-500" />
						{$t('libraryGuide.builtin')}
					</span>
					<span class="inline-flex items-center gap-1">
						<DownloadIcon size={12} class="text-amber-500" />
						{$t('libraryGuide.separateInstall')}
					</span>
					<span class="inline-flex items-center gap-1">
						<CircleXIcon size={12} class="text-destructive" />
						{$t('libraryGuide.notIncluded')}
					</span>
				</div>
			</div>

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
						<pre class="whitespace-pre-wrap break-all rounded-md bg-muted px-3 py-2 font-mono text-xs">{$t('libraryGuide.mac.reinstallCmd')}</pre>
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
		</div>
	</Dialog.Content>
</Dialog.Root>
