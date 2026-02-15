<!--
  +page.svelte — メインページ

  ページ構成（上から順に）:
  1. DropZone（D&Dエリア）
  2. ModeSwitch（プリセット / アドバンスド切替）
  3. PresetGrid（プリセットモード時）
  4. PresetCustomizer（プリセット選択後に展開）
  5. CommandOutput（コマンド表示・コピー）
-->
<script lang="ts">
	import { t } from '$lib/i18n';
	import { commandStore } from '$lib/stores/command.svelte';
	import DropZone from '$lib/components/common/DropZone.svelte';
	import ModeSwitch from '$lib/components/common/ModeSwitch.svelte';
	import PresetGrid from '$lib/components/preset/PresetGrid.svelte';
	import PresetCustomizer from '$lib/components/preset/PresetCustomizer.svelte';
	import CommandOutput from '$lib/components/command/CommandOutput.svelte';
	import { Separator } from '$lib/components/ui/separator';
</script>

<div class="mx-auto max-w-4xl space-y-6">
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

	<!-- 5. コマンド出力 -->
	<section>
		<CommandOutput />
	</section>
</div>
