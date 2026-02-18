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
	import { t } from '$lib/i18n';
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
