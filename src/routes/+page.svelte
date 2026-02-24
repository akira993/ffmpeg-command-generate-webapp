<!--
  +page.svelte — メインページ

  ページ構成（上から順に）:
  1. DropZone（D&Dエリア）
  2. ModeSwitch（プリセット / アドバンスド切替）
  3. PresetGrid（プリセットモード時）
  4. PresetCustomizer（プリセット選択後に展開）
  5. ActionButtons（FFmpeg導入 / 実行方法 / ライブラリ追加）
  6. CommandOutput（コマンド表示・コピー）
  7. モバイル固定バー（ActionButtons）
-->
<script lang="ts">
	import { locale, t } from '$lib/i18n';
	import { commandStore } from '$lib/stores/command.svelte';
	import DropZone from '$lib/components/common/DropZone.svelte';
	import ModeSwitch from '$lib/components/common/ModeSwitch.svelte';
	import PresetGrid from '$lib/components/preset/PresetGrid.svelte';
	import PresetCustomizer from '$lib/components/preset/PresetCustomizer.svelte';
	import CommandOutput from '$lib/components/command/CommandOutput.svelte';
	import ActionButtons from '$lib/components/common/ActionButtons.svelte';
	import FfmpegInstallGuide from '$lib/components/common/FfmpegInstallGuide.svelte';
	import PathGuideModal from '$lib/components/common/PathGuideModal.svelte';
	import LibraryInstallGuide from '$lib/components/common/LibraryInstallGuide.svelte';
	import { Separator } from '$lib/components/ui/separator';

	// モーダル状態管理（一元化）
	let installGuideOpen = $state(false);
	let pathGuideOpen = $state(false);
	let libraryGuideOpen = $state(false);
</script>

<svelte:head>
	{#if $locale === 'ja'}
		<title>FFmpegコマンドジェネレーター — 動画・音声・画像変換コマンドを簡単生成</title>
		<meta name="description" content="FFmpegのコマンドをGUIで簡単生成。動画圧縮（H.264/AV1）、音声抽出、画像変換（AVIF/WebP）、GIF生成など7つのプリセットでワンクリック設定。ドラッグ＆ドロップ対応。" />
		<meta property="og:title" content="FFmpegコマンドジェネレーター" />
		<meta property="og:description" content="GUIで直感的にFFmpegコマンドを生成。動画圧縮・音声抽出・画像変換・GIF生成をワンクリックで。" />
		<meta property="og:image" content="https://www.cmd-gen.com/og-home-ja.png?v=1" />
		<meta property="og:locale" content="ja_JP" />
		<meta property="og:locale:alternate" content="en_US" />
		<meta name="twitter:title" content="FFmpegコマンドジェネレーター" />
		<meta name="twitter:description" content="GUIで直感的にFFmpegコマンドを生成。動画圧縮・音声抽出・画像変換・GIF生成をワンクリックで。" />
		<meta name="twitter:image" content="https://www.cmd-gen.com/og-home-ja.png?v=1" />
	{:else}
		<title>FFmpeg Command Generator — Easily Generate Video, Audio & Image Commands</title>
		<meta name="description" content="Generate FFmpeg commands with an intuitive GUI. One-click presets for video compression (H.264/AV1), audio extraction, image conversion (AVIF/WebP), GIF generation, and more. Drag & drop supported." />
		<meta property="og:title" content="FFmpeg Command Generator" />
		<meta property="og:description" content="Generate FFmpeg commands with an intuitive GUI. Video compression, audio extraction, image conversion & GIF generation in one click." />
		<meta property="og:image" content="https://www.cmd-gen.com/og-home-en.png?v=1" />
		<meta property="og:locale" content="en_US" />
		<meta property="og:locale:alternate" content="ja_JP" />
		<meta name="twitter:title" content="FFmpeg Command Generator" />
		<meta name="twitter:description" content="Generate FFmpeg commands with an intuitive GUI. Video compression, audio extraction, image conversion & GIF generation in one click." />
		<meta name="twitter:image" content="https://www.cmd-gen.com/og-home-en.png?v=1" />
	{/if}
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://www.cmd-gen.com/" />
	<meta property="og:site_name" content="FFmpeg Command Generator" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<link rel="canonical" href="https://www.cmd-gen.com/" />
	<link rel="alternate" hreflang="ja" href="https://www.cmd-gen.com/" />
	<link rel="alternate" hreflang="en" href="https://www.cmd-gen.com/" />
	<link rel="alternate" hreflang="x-default" href="https://www.cmd-gen.com/" />

	<!-- JSON-LD 構造化データ -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "WebApplication",
				"name": "FFmpeg Command Generator",
				"alternateName": "FFmpegコマンドジェネレーター",
				"url": "https://www.cmd-gen.com/",
				"description": "Generate FFmpeg commands with an intuitive GUI. Supports video compression, audio extraction, image conversion, GIF generation, and more.",
				"applicationCategory": "MultimediaApplication",
				"operatingSystem": "Any",
				"offers": {
					"@type": "Offer",
					"price": "0",
					"priceCurrency": "USD"
				},
				"inLanguage": ["ja", "en"],
				"browserRequirements": "Requires a modern web browser",
				"softwareVersion": "1.0",
				"creator": {
					"@type": "Organization",
					"name": "cmd-gen.com",
					"url": "https://www.cmd-gen.com/"
				}
			},
			{
				"@type": "WebSite",
				"name": "FFmpeg Command Generator",
				"alternateName": "FFmpegコマンドジェネレーター",
				"url": "https://www.cmd-gen.com/"
			}
		]
	})}</script>`}
</svelte:head>

<div class="mx-auto max-w-4xl space-y-6 pb-20 sm:pb-0">
	<!-- 1. ドラッグ＆ドロップエリア -->
	<section>
		<DropZone />
	</section>

	<Separator />

	<!-- 2. モード切替 -->
	<section class="flex items-center justify-center">
		<ModeSwitch />
	</section>

	<!-- 3. プリセットモード -->
	{#if commandStore.mode === 'preset'}
		<section>
			<PresetGrid />
		</section>

		<!-- 4. プリセットカスタマイザー -->
		{#if commandStore.selectedPreset}
			<section>
				<PresetCustomizer />
			</section>
		{/if}
	{:else}
		<!-- アドバンスドモード（後日実装） -->
		<section class="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
			<p class="text-sm text-muted-foreground">
				{$t('mode.advanced')} — Coming Soon
			</p>
		</section>
	{/if}

	<Separator />

	<!-- 5. アクションボタン（デスクトップのみ表示） -->
	<section class="hidden sm:block">
		<ActionButtons
			onInstallGuide={() => { installGuideOpen = true; }}
			onPathGuide={() => { pathGuideOpen = true; }}
			onLibraryGuide={() => { libraryGuideOpen = true; }}
		/>
	</section>

	<!-- 6. コマンド出力 -->
	<section>
		<CommandOutput />
	</section>
</div>

<!-- モバイル固定バー -->
<div class="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-2 backdrop-blur sm:hidden">
	<ActionButtons
		variant="mobile"
		onInstallGuide={() => { installGuideOpen = true; }}
		onPathGuide={() => { pathGuideOpen = true; }}
		onLibraryGuide={() => { libraryGuideOpen = true; }}
	/>
</div>

<!-- モーダル群（showTrigger=false で非表示トリガー） -->
<FfmpegInstallGuide bind:open={installGuideOpen} showTrigger={false} />
<PathGuideModal
	bind:open={pathGuideOpen}
	showTrigger={false}
	onOpenInstallGuide={() => { installGuideOpen = true; }}
/>
<LibraryInstallGuide bind:open={libraryGuideOpen} showTrigger={false} />
