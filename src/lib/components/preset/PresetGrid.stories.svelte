<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PresetGrid from './PresetGrid.svelte';
	import { untrack } from 'svelte';
	import { commandStore } from '$lib/stores/command.svelte';
	import { compactStore } from '$lib/stores/compact.svelte';

	const { Story } = defineMeta({
		title: 'Domain/PresetGrid',
		component: PresetGrid,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	{#snippet template()}
		{@const _ = untrack(() => {
			commandStore.selectedPreset = null;
		})}
		<p class="mb-4 text-sm text-muted-foreground">
			通常モード: <code>grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4</code>。
			PresetCard は Card.Root + Subgrid レイアウト、説明文表示。
		</p>
		<PresetGrid />
	{/snippet}
</Story>

<Story name="WithSelection">
	{#snippet template()}
		{@const _ = untrack(() => {
			commandStore.applyPreset('video-convert');
		})}
		<p class="mb-4 text-sm text-muted-foreground">
			通常モード + プリセット選択状態 (<code>video-convert</code>)。
			選択カードに <code>ring-2 ring-primary</code> のスタイルが付く。
		</p>
		<PresetGrid />
	{/snippet}
</Story>

<Story name="Compact">
	{#snippet template()}
		{@const _ = untrack(() => {
			compactStore.isCompact = true;
			commandStore.selectedPreset = null;
		})}
		<p class="mb-4 text-sm text-muted-foreground">
			コンパクトモード: <code>auto-rows-fr gap-2</code>。カード自体も flex 独自レイアウトに切替。
			全カードが同一高さで整列。
		</p>
		<PresetGrid />
	{/snippet}
</Story>

<Story name="CompactWithSelection">
	{#snippet template()}
		{@const _ = untrack(() => {
			compactStore.isCompact = true;
			commandStore.applyPreset('audio-extract');
		})}
		<p class="mb-4 text-sm text-muted-foreground">
			コンパクトモード + プリセット選択状態 (<code>audio-extract</code>)。
		</p>
		<PresetGrid />
	{/snippet}
</Story>
