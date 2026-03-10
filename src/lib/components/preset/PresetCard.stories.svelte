<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PresetCard from './PresetCard.svelte';
	import { PRESETS } from '$lib/ffmpeg/presets';
	import { compactStore } from '$lib/stores/compact.svelte';

	const { Story } = defineMeta({
		title: 'Domain/PresetCard',
		component: PresetCard,
		tags: ['autodocs']
	});

	const presetList = Object.values(PRESETS);
</script>

<Story name="Default">
	{#snippet template()}
		<div class="w-64">
			<PresetCard
				preset={presetList[0]}
				selected={false}
				onselect={() => {}}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Selected">
	{#snippet template()}
		<div class="w-64">
			<PresetCard
				preset={presetList[0]}
				selected={true}
				onselect={() => {}}
			/>
		</div>
	{/snippet}
</Story>

<Story name="AllPresets">
	{#snippet template()}
		<div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
			{#each presetList as preset}
				<PresetCard
					{preset}
					selected={false}
					onselect={() => {}}
				/>
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="SelectedInGrid">
	{#snippet template()}
		<div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
			{#each presetList as preset, i}
				<PresetCard
					{preset}
					selected={i === 0}
					onselect={() => {}}
				/>
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="SubgridAlignment">
	{#snippet template()}
		<p class="mb-4 text-sm text-muted-foreground">
			CSS Subgrid により、タイトルの行数が異なっても card-content の開始位置が揃います。
		</p>
		<div class="grid grid-cols-4 gap-3">
			{#each presetList.slice(0, 4) as preset}
				<PresetCard
					{preset}
					selected={false}
					onselect={() => {}}
				/>
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="CompactMode">
	{#snippet template()}
		{@const _ = (() => {
			compactStore.isCompact = true;
		})()}
		<p class="mb-4 text-sm text-muted-foreground">
			コンパクトモード: 説明文非表示、パディング半減、アイコン+タイトルのみ。全カードが同一高さ。
		</p>
		<div class="grid grid-cols-2 auto-rows-fr gap-2 md:grid-cols-3 lg:grid-cols-4">
			{#each presetList as preset}
				<PresetCard
					{preset}
					selected={false}
					onselect={() => {}}
				/>
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="CompactModeSelected">
	{#snippet template()}
		{@const _ = (() => {
			compactStore.isCompact = true;
		})()}
		<div class="grid grid-cols-2 auto-rows-fr gap-2 md:grid-cols-3 lg:grid-cols-4">
			{#each presetList as preset, i}
				<PresetCard
					{preset}
					selected={i === 0}
					onselect={() => {}}
				/>
			{/each}
		</div>
	{/snippet}
</Story>
