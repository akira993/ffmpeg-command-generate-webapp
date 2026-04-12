<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PresetCard from './PresetCard.svelte';
	import { PRESETS } from '$lib/ffmpeg/presets';
	import { untrack } from 'svelte';
	import { compactStore } from '$lib/stores/compact.svelte';

	const { Story } = defineMeta({
		title: 'Domain/PresetCard',
		component: PresetCard,
		tags: ['autodocs'],
		parameters: {
			// `compactStore` はシングルトンのため、docs view で複数ストーリーが同じ state を
			// 共有するとコンパクト/非コンパクトが衝突する。`inline: false` で各ストーリーを
			// iframe 分離し、グローバル state の leak を防ぐ。
			docs: {
				story: {
					inline: false,
					iframeHeight: '320px'
				}
			}
		}
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
		<div class="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
			{#each presetList as preset, i}
				<PresetCard
					{preset}
					selected={false}
					onselect={() => {}}
					index={i}
				/>
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="SelectedInGrid">
	{#snippet template()}
		<div class="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
			{#each presetList as preset, i}
				<PresetCard
					{preset}
					selected={i === 0}
					onselect={() => {}}
					index={i}
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
			{#each presetList.slice(0, 4) as preset, i}
				<PresetCard
					{preset}
					selected={false}
					onselect={() => {}}
					index={i}
				/>
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="StaggeredEntrance">
	{#snippet template()}
		<p class="mb-4 text-sm text-muted-foreground">
			ページ読み込み時の逐次フリップインアニメーション。カードが上から順にフェードイン＋スライドします (y:1.875rem / duration:600ms / delay:i*100ms)。
		</p>
		<div class="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
			{#each presetList as preset, i}
				<PresetCard
					{preset}
					selected={false}
					onselect={() => {}}
					index={i}
				/>
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="CompactMode">
	{#snippet template()}
		{@const _ = untrack(() => {
			compactStore.isCompact = true;
		})}
		<p class="mb-4 text-sm text-muted-foreground">
			コンパクトモード: Card.Root を使わず独自 flex レイアウト (gap-1.5 / px-3 py-2)、説明文非表示、アイコン+タイトルのみ、入場アニメーションも短縮 (y:0.9375rem / duration:300ms / delay:i*50ms)。auto-rows-fr で全カードが同一高さ。
		</p>
		<div class="grid grid-cols-2 auto-rows-fr gap-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each presetList as preset, i}
				<PresetCard
					{preset}
					selected={false}
					onselect={() => {}}
					index={i}
				/>
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="CompactModeSelected">
	{#snippet template()}
		{@const _ = untrack(() => {
			compactStore.isCompact = true;
		})}
		<div class="grid grid-cols-2 auto-rows-fr gap-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each presetList as preset, i}
				<PresetCard
					{preset}
					selected={i === 0}
					onselect={() => {}}
					index={i}
				/>
			{/each}
		</div>
	{/snippet}
</Story>
